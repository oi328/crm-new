import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { signToken, requireAuth } from './lib/auth.js'
import { ok, fail } from './lib/response.js'
import { logAction } from './lib/activity.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8787

app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] }))
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
    "font-src 'self' https://fonts.gstatic.com;",
    "img-src 'self' data: blob: https://i.pravatar.cc https://img.icons8.com;",
    "connect-src 'self';",
    "frame-ancestors 'self';",
    "base-uri 'self';",
    "form-action 'self';"
  ].join(' '))
  next()
})

// Serve uploaded files statically
const ROOT_DIR = path.resolve(process.cwd())
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads')
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
} catch (e) {
  console.warn('⚠️ Failed to ensure uploads directory', e)
}
app.use('/uploads', express.static(UPLOADS_DIR))
// Backups directory under uploads
const BACKUPS_DIR = path.join(UPLOADS_DIR, 'backups')
try {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true })
  }
  const indexPath = path.join(BACKUPS_DIR, 'index.json')
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, JSON.stringify({ items: [] }, null, 2))
  }
} catch (e) {
  console.warn('⚠️ Failed to ensure backups directory', e)
}

// ====== App Settings (in-memory, Dev) ======
// Allow configuring sales tax rate via API rather than hard-coded constant
const SETTINGS = {
  sales: {
    taxRate: Number(process.env.DEFAULT_TAX_RATE || 0.14),
  },
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_ADS_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.')
}
if (!GEMINI_API_KEY) {
  console.warn('⚠️ Missing GEMINI_API_KEY in environment. Gemini suggestions will fallback locally.')
}

// تخزين مبسّط للتوكنات في الذاكرة (Dev فقط)
const TOKENS = { gmail: null, ads: null }

// ====== Simple DEV Auth & Company Info ======
// Hardcoded dev super admin credentials and company profile
const DEV_SUPER_ADMIN = {
  email: 'superadmin@local',
  password: 'admin123',
  name: 'Super Admin',
}

const DEV_COMPANY_PROFILE = {
  user: { id: 'u-super', name: DEV_SUPER_ADMIN.name, email: DEV_SUPER_ADMIN.email, role: 'Super Admin' },
  company: { id: 'c-001', name: 'Tagin Hekaya CRM', country: 'EG' },
  subscription: { status: 'active', end_date: new Date(Date.now() + 30*24*60*60*1000).toISOString() },
  activeModules: [
    'leads', 'campaigns', 'settings', 'reports', 'inventory', 'customers', 'tasks', 'notifications'
  ],
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {}
  if (email === DEV_SUPER_ADMIN.email && password === DEV_SUPER_ADMIN.password) {
    const token = signToken({
      userId: DEV_COMPANY_PROFILE.user.id,
      name: DEV_COMPANY_PROFILE.user.name,
      email: DEV_COMPANY_PROFILE.user.email,
      role: 'Super Admin',
      companyId: DEV_COMPANY_PROFILE.company.id,
    })
    logAction({
      userId: DEV_COMPANY_PROFILE.user.id,
      companyId: DEV_COMPANY_PROFILE.company.id,
      entity: 'auth',
      entityId: DEV_COMPANY_PROFILE.user.id,
      action: 'login',
      changes: { email },
    })
    return ok(res, { token }, 'logged_in')
  }
  return fail(res, 401, 'invalid_credentials')
})

app.get('/api/company-info', (_req, res) => {
  return ok(res, DEV_COMPANY_PROFILE)
})

app.post('/api/oauth/google/exchange', async (req, res) => {
  try {
    const { code, redirectUri, provider } = req.body || {}
    console.log('[oauth-exchange] incoming', {
      provider,
      redirectUri,
      codeLen: String(code || '').length,
      clientId: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.slice(0, 12) + '...' : null
    })
    if (!code || !redirectUri) {
      return res.status(400).json({ error: 'missing_params', message: 'code and redirectUri are required' })
    }

    const body = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })

    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })

    const tokenJson = await tokenResp.json()
    if (!tokenResp.ok) {
      console.error('[oauth-exchange] token error', tokenJson)
      return res.status(400).json({
        error: tokenJson.error || 'token_exchange_failed',
        message: tokenJson.error_description || 'Google returned an error',
        hint: 'تأكد من تطابق redirect_uri حرفيًا، وأن الكود لم يُستخدم من قبل، وأن Client ID/Secret صحيحان',
        details: tokenJson
      })
    }

    let profile = null
    if (provider === 'gmail') {
      try {
        const pr = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
          headers: { Authorization: `Bearer ${tokenJson.access_token}` }
        })
        if (pr.ok) profile = await pr.json()
      } catch (_) {
        // ignore profile fetch errors
      }
    }

    // خزّن التوكنات بحسب المزود
    if (provider === 'gmail' || provider === 'ads') {
      TOKENS[provider] = tokenJson
    }

    return res.json({
      provider,
      token_type: tokenJson.token_type,
      scope: tokenJson.scope,
      expires_in: tokenJson.expires_in,
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
      profile
    })
  } catch (e) {
    console.error('[oauth-exchange] Exchange error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

// قطع الاتصال: إلغاء التوكن ومسحه من الذاكرة
app.post('/api/oauth/google/revoke', async (req, res) => {
  try {
    const { provider } = req.body || {}
    if (!provider || !(provider in TOKENS)) {
      return res.status(400).json({ error: 'invalid_provider' })
    }
    const tokenObj = TOKENS[provider]
    if (!tokenObj) {
      return res.json({ ok: true, message: 'already_disconnected' })
    }
    const tokenToRevoke = tokenObj.refresh_token || tokenObj.access_token
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: tokenToRevoke })
      })
    } catch (_) {}
    TOKENS[provider] = null
    return res.json({ ok: true })
  } catch (e) {
    console.error('[oauth-revoke] error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

// جلب Labels من Gmail لإثبات الاستخدام الفعلي
app.get('/api/gmail/labels', async (_req, res) => {
  try {
    const t = TOKENS.gmail
    if (!t?.access_token) {
      return res.status(400).json({ error: 'not_connected' })
    }
    const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
      headers: { Authorization: `Bearer ${t.access_token}` }
    })
    const j = await r.json()
    if (!r.ok) {
      return res.status(400).json({ error: 'gmail_labels_failed', details: j })
    }
    return res.json({ labels: j.labels || [] })
  } catch (e) {
    console.error('[gmail-labels] error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

// Gemini: Smart icon suggestions based on EN/AR stage name
const LOCAL_ICON_SET = ['🆕','🎯','⏳','✅','❌','📊','⭐','💼','📞','💬','🤝','🔁','🗓️','💰','📥','📤','🏆','🗂️','🔥','🧊']
const PAIRS = [
  { icon: '🆕', keywords: ['new','جديد'] },
  { icon: '🎯', keywords: ['qual','qualified','تأهيل','مؤهل'] },
  { icon: '⏳', keywords: ['progress','in progress','قيد','انتظار'] },
  { icon: '✅', keywords: ['convert','converted','success','تحويل','نجاح'] },
  { icon: '❌', keywords: ['lost','fail','خاسر','فشل'] },
  { icon: '📊', keywords: ['analysis','stat','تحليل','إحصاء'] },
  { icon: '💼', keywords: ['deal','صفقة'] },
  { icon: '🤝', keywords: ['negotiation','تفاوض'] },
  { icon: '🔁', keywords: ['follow','follow up','متابعة'] },
  { icon: '📞', keywords: ['call','اتصال','هاتف'] },
  { icon: '💬', keywords: ['message','chat','رسالة','دردشة'] },
  { icon: '🏆', keywords: ['won','رابح','ربح'] },
  { icon: '🗂️', keywords: ['archive','أرشيف'] },
  { icon: '🗓️', keywords: ['meeting','اجتماع'] },
  { icon: '💰', keywords: ['payment','budget','قيمة','تمويل'] },
  { icon: '🔥', keywords: ['hot','ساخن'] },
  { icon: '🧊', keywords: ['cold','بارد'] },
]

const computeLocalSuggestions = (name, nameAr) => {
  const text = `${name || ''} ${nameAr || ''}`.toLowerCase()
  const picks = []
  for (const { icon, keywords } of PAIRS) {
    if (keywords.some((k) => text.includes(k))) picks.push(icon)
  }
  const uniq = Array.from(new Set(picks))
  const fallback = LOCAL_ICON_SET.filter((ic) => !uniq.includes(ic))
  return [...uniq, ...fallback].slice(0, 10)
}

app.post('/api/gemini/icon-suggestions', async (req, res) => {
  try {
    const { name, nameAr } = req.body || {}
    const text = `${name || ''} ${nameAr || ''}`.trim()
    if (!text) {
      return res.status(400).json({ error: 'missing_name', message: 'name or nameAr is required' })
    }
    // Fallback if no API key
    if (!GEMINI_API_KEY) {
      return res.json({ icons: computeLocalSuggestions(name, nameAr) })
    }

    const prompt = `You are helping pick emoji icons for CRM pipeline stage labels. Given English and/or Arabic stage names, suggest up to 10 suitable emoji characters for UI labels. Prioritize relevant emojis like 🆕 🎯 ⏳ ✅ ❌ 📊 💼 🤝 🔁 📞 💬 🏆 🗂️ 🗓️ 💰 🔥 🧊 based on the text meaning. Respond ONLY with a compact JSON object: {"icons":["emoji1","emoji2",...]}. No extra text.

Input: "${text}"`

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}` , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [ { role: 'user', parts: [ { text: prompt } ] } ]
      })
    })
    const j = await r.json()
    if (!r.ok) {
      console.error('[gemini] API error', j)
      return res.json({ icons: computeLocalSuggestions(name, nameAr), hint: 'fallback_local' })
    }
    const textOut = j?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    // Try to parse JSON safely
    let parsed = null
    try {
      const start = textOut.indexOf('{')
      const end = textOut.lastIndexOf('}')
      const jsonStr = start >= 0 && end >= start ? textOut.slice(start, end + 1) : textOut
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.warn('[gemini] parse error, using local fallback')
      return res.json({ icons: computeLocalSuggestions(name, nameAr), hint: 'fallback_parse' })
    }
    const icons = Array.isArray(parsed?.icons) ? parsed.icons.filter((x) => typeof x === 'string') : []
    if (!icons.length) {
      return res.json({ icons: computeLocalSuggestions(name, nameAr), hint: 'fallback_empty' })
    }
    return res.json({ icons: icons.slice(0, 10) })
  } catch (e) {
    console.error('[gemini] server error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

// Gemini: Generate a single best icon (no local fallback)
app.post('/api/gemini/generate-icon', async (req, res) => {
  try {
    const { name, nameAr } = req.body || {}
    const text = `${name || ''} ${nameAr || ''}`.trim()
    if (!text) {
      return res.status(400).json({ error: 'missing_name', message: 'name or nameAr is required' })
    }
    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: 'gemini_unavailable', message: 'GEMINI_API_KEY missing' })
    }

    const prompt = `You are helping pick ONE emoji icon for a CRM pipeline stage label. Given English and/or Arabic stage names, respond ONLY with JSON of the form {"icon":"EMOJI"}. Choose the single most semantically relevant emoji for the stage meaning (examples: 🆕 🎯 ⏳ ✅ ❌ 📊 💼 🤝 🔁 📞 💬 🏆 🗂️ 🗓️ 💰 🔥 🧊). No explanations, no prose, strictly JSON.`

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [ { role: 'user', parts: [ { text: `${prompt}\n\nInput: "${text}"` } ] } ]
      })
    })
    const j = await r.json()
    if (!r.ok) {
      console.error('[gemini-generate] API error', j)
      return res.status(400).json({ error: 'gemini_error', details: j })
    }
    const textOut = j?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    // Try to parse JSON safely
    let parsed = null
    try {
      const start = textOut.indexOf('{')
      const end = textOut.lastIndexOf('}')
      const jsonStr = start >= 0 && end >= start ? textOut.slice(start, end + 1) : textOut
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.warn('[gemini-generate] parse error', e)
      return res.status(400).json({ error: 'parse_error', raw: textOut })
    }
    let icon = null
    if (typeof parsed?.icon === 'string' && parsed.icon.trim().length > 0) {
      icon = parsed.icon.trim()
    } else if (Array.isArray(parsed?.icons) && parsed.icons.length > 0) {
      icon = parsed.icons[0]
    }
    if (!icon) {
      return res.status(400).json({ error: 'no_ai_icon' })
    }
    return res.json({ icon })
  } catch (e) {
    console.error('[gemini-generate] server error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

// Meta Webhook verification (GET) and event receiver (POST)
app.get('/api/meta/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || process.env.VITE_META_VERIFY_TOKEN
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode === 'subscribe' && challenge && (!VERIFY_TOKEN || token === VERIFY_TOKEN)) {
    return res.status(200).send(challenge)
  }
  return res.status(403).json({ error: 'verification_failed', mode, token_present: Boolean(token) })
})

app.post('/api/meta/webhook', (req, res) => {
  try {
    console.log('[meta-webhook] event', JSON.stringify(req.body))
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('[meta-webhook] error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

// Meta CAPI test echo endpoint (Dev)
app.post('/api/meta/capi/test', (req, res) => {
  try {
    const payload = req.body || {}
    console.log('[meta-capi-test] payload', JSON.stringify(payload))
    return res.json({ ok: true, received: payload, hint: 'dev_echo' })
  } catch (e) {
    console.error('[meta-capi-test] error', e)
    return res.status(500).json({ error: 'server_error', message: e.message })
  }
})

app.get('/healthz', (_req, res) => {
  return ok(res, { ok: true })
})

// ====== Sales Workflow Routers (mounted later) ======
import salesRouters from './sales/routers.js'
app.use('/api', requireAuth, salesRouters)

// ====== Settings API (protected) ======
app.get('/api/settings', requireAuth, (_req, res) => {
  return ok(res, { settings: SETTINGS })
})

// Update sales settings (tax rate). Accept either percentage (e.g., 14) or fraction (e.g., 0.14)
app.put('/api/settings/sales', requireAuth, (req, res) => {
  try {
    let { taxRate } = req.body || {}
    if (taxRate === undefined || taxRate === null || taxRate === '') {
      return fail(res, 400, 'missing_tax_rate')
    }
    taxRate = Number(taxRate)
    if (Number.isNaN(taxRate)) {
      return fail(res, 422, 'invalid_tax_rate')
    }
    // If a large number, assume percentage and convert to fraction
    const normalized = taxRate > 1 ? Math.round((taxRate / 100) * 10000) / 10000 : Math.round(taxRate * 10000) / 10000
    if (normalized < 0 || normalized > 1) {
      return fail(res, 422, 'tax_rate_out_of_range')
    }
    SETTINGS.sales.taxRate = normalized
    // Keep env in sync so modules reading from env stay consistent
    process.env.DEFAULT_TAX_RATE = String(normalized)
    logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'settings', entityId: 'sales', action: 'update', changes: { taxRate: normalized } })
    return ok(res, { settings: SETTINGS })
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})

// ====== Uploads (Base64) ======
// Accept a base64 data URL and persist it to /uploads, returning public URL
app.post('/api/uploads/base64', requireAuth, (req, res) => {
  try {
    const { fileName, dataUrl } = req.body || {}
    if (!dataUrl || typeof dataUrl !== 'string') {
      return fail(res, 400, 'missing_data_url')
    }
    // dataUrl format: data:<mime>;base64,<payload>
    const commaIdx = dataUrl.indexOf(',')
    if (commaIdx === -1) {
      return fail(res, 422, 'invalid_data_url')
    }
    const header = dataUrl.slice(0, commaIdx)
    const payload = dataUrl.slice(commaIdx + 1)
    if (!header.includes(';base64')) {
      return fail(res, 422, 'not_base64_payload')
    }
    const mimeMatch = header.match(/^data:([^;]+);base64$/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
    let ext = ''
    // naive extension mapping
    if (mimeType.includes('png')) ext = '.png'
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg'
    else if (mimeType.includes('pdf')) ext = '.pdf'
    else if (mimeType.includes('gif')) ext = '.gif'
    else if (mimeType.includes('webp')) ext = '.webp'
    else if (mimeType.includes('svg')) ext = '.svg'
    else if (mimeType.includes('plain')) ext = '.txt'

    const safeBase = String(fileName || 'file').replace(/[^a-zA-Z0-9_.-]/g, '') || 'file'
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const finalName = `${safeBase}-${unique}${ext}`
    const outPath = path.join(UPLOADS_DIR, finalName)
    let buf
    try {
      buf = Buffer.from(payload, 'base64')
    } catch (e) {
      return fail(res, 422, 'decode_failed')
    }
    // Limit ~10MB
    if (buf.length > 10 * 1024 * 1024) {
      return fail(res, 413, 'file_too_large')
    }
    fs.writeFileSync(outPath, buf)
    const publicUrl = `/uploads/${finalName}`
    return ok(res, { url: publicUrl, mimeType, size: buf.length })
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})

app.listen(PORT, () => {
  console.log(`✅ OAuth bridge listening on http://localhost:${PORT}`)
})

// ====== Data Management: Import / Export / Backups ======
// Utility: read backups index
function readBackupsIndex() {
  try {
    const p = path.join(BACKUPS_DIR, 'index.json')
    const raw = fs.readFileSync(p, 'utf-8')
    const j = JSON.parse(raw)
    return Array.isArray(j.items) ? j.items : []
  } catch (_) {
    return []
  }
}
// Utility: write backups index
function writeBackupsIndex(items) {
  try {
    const p = path.join(BACKUPS_DIR, 'index.json')
    fs.writeFileSync(p, JSON.stringify({ items }, null, 2))
  } catch (_) {}
}

// POST /api/import
// Accepts JSON payload with rows and mapping; returns summary
app.post('/api/import', requireAuth, (req, res) => {
  try {
    const { module, rows, mapping, updateExisting } = req.body || {}
    if (!module || !Array.isArray(rows) || !rows.length || typeof mapping !== 'object') {
      return fail(res, 400, 'invalid_payload')
    }
    // Basic validation: ensure mapped fields exist in row
    const requiredColumns = Object.keys(mapping)
    const failedRows = []
    let newRecords = 0
    let updatedRecords = 0
    rows.forEach((r, idx) => {
      const missing = requiredColumns.some((col) => !(col in r))
      if (missing) {
        failedRows.push({ index: idx, reason: 'missing_columns' })
        return
      }
      // naive check: if row has id and updateExisting, count as updated
      if (updateExisting && (r.id || r.ID || r.Id)) updatedRecords++
      else newRecords++
    })
    const summary = { module, newRecords, updatedRecords, failedCount: failedRows.length, failedRows }
    logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'data', entityId: module, action: 'import', changes: summary })
    return ok(res, summary)
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})

// POST /api/export
// Generates a CSV/XLSX-like file (CSV for dev) and returns public URL
app.post('/api/export', requireAuth, (req, res) => {
  try {
    const { module, format = 'csv', filters } = req.body || {}
    if (!module) return fail(res, 400, 'missing_module')
    // Mock data per module
    const samples = {
      customers: [ { id: 1, name: 'ACME Co', phone: '+201234567890', email: 'info@acme.test', status: 'Active' } ],
      leads: [ { id: 10, name: 'John Doe', phone: '+201111222233', source: 'Website', status: 'New' } ],
      products: [ { id: 'P-100', name: 'Widget', price: 199.99, stock: 42 } ],
      users: [ { id: 'U-1', name: 'Admin', role: 'Super Admin', email: 'superadmin@local' } ],
      projects: [ { id: 'PR-1', name: 'Green Valley', city: 'Cairo', status: 'Active' } ],
      properties: [ { id: 'PROP-1', type: 'Apartment', area: 120, price: 1500000 } ]
    }
    const rows = samples[module] || []
    // Apply simple filter placeholders
    const filtered = Array.isArray(rows) ? rows.filter(() => true) : []
    const headers = filtered.length ? Object.keys(filtered[0]) : []
    const csv = [headers.join(','), ...filtered.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    const safeModule = String(module).replace(/[^a-zA-Z0-9_.-]/g, '')
    const fname = `export-${safeModule}-${Date.now()}.${format === 'xlsx' ? 'csv' : 'csv'}`
    const outPath = path.join(UPLOADS_DIR, fname)
    fs.writeFileSync(outPath, csv)
    const url = `/uploads/${fname}`
    logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'data', entityId: module, action: 'export', changes: { format, filters, url } })
    return ok(res, { url })
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})

// GET /api/backups
app.get('/api/backups', requireAuth, (_req, res) => {
  const items = readBackupsIndex()
  return ok(res, { items })
})

// POST /api/backups (generate backup file)
app.post('/api/backups', requireAuth, (req, res) => {
  try {
    const { name } = req.body || {}
    const baseName = String(name || 'backup').replace(/[^a-zA-Z0-9_.-]/g, '') || 'backup'
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    const finalName = `${baseName}-${unique}.json`
    const outPath = path.join(BACKUPS_DIR, finalName)
    const payload = {
      createdAt: new Date().toISOString(),
      companyId: req.user.companyId,
      modules: ['customers','leads','projects','properties','users'],
      note: 'Dev backup file (JSON)',
    }
    const buf = Buffer.from(JSON.stringify(payload, null, 2), 'utf-8')
    if (buf.length > 50 * 1024 * 1024) return fail(res, 413, 'backup_too_large')
    fs.writeFileSync(outPath, buf)
    const url = `/uploads/backups/${finalName}`
    const items = readBackupsIndex()
    const item = { id: unique, name: finalName, url, size: buf.length, date: new Date().toISOString() }
    items.unshift(item)
    writeBackupsIndex(items)
    logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'data', entityId: 'backup', action: 'generate', changes: item })
    return ok(res, { item })
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})

// DELETE /api/backups/:id
app.delete('/api/backups/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params
    const items = readBackupsIndex()
    const idx = items.findIndex((x) => x.id === id)
    if (idx === -1) return fail(res, 404, 'backup_not_found')
    const item = items[idx]
    // remove file
    try { fs.unlinkSync(path.join(BACKUPS_DIR, item.name)) } catch (_) {}
    items.splice(idx, 1)
    writeBackupsIndex(items)
    logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'data', entityId: 'backup', action: 'delete', changes: { id } })
    return ok(res, { ok: true })
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})

// POST /api/backups/schedule
app.post('/api/backups/schedule', requireAuth, (req, res) => {
  try {
    const { frequency = 'daily', time = '02:00' } = req.body || {}
    const schedulePath = path.join(BACKUPS_DIR, 'schedule.json')
    const schedule = { frequency, time, updatedAt: new Date().toISOString() }
    fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2))
    logAction({ userId: req.user.userId, companyId: req.user.companyId, entity: 'data', entityId: 'backup', action: 'schedule', changes: schedule })
    return ok(res, schedule)
  } catch (e) {
    return fail(res, 500, 'server_error', { error: e.message })
  }
})
