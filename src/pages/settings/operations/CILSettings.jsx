import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@shared/context/ThemeProvider'
import { useStages } from '@hooks/useStages'

const LS_KEY = 'cil.config'

function safeParse(json) { try { return JSON.parse(json) } catch { return null } }
function defaultConfig() {
  return {
    system: { readOnly: false, strict: false, defaultCurrency: 'USD', environment: 'production' },
    modules: { leads: true, eoi: true, reservation: true, contracts: true, paymentPlans: true },
    rules: [],
    workflows: [],
    validations: [],
    flags: { newDashboard: false, betaSearch: false, roleFlags: { admin: true, manager: false }, envFlags: { production: false, staging: true } },
    governance: { version: 1, history: [] }
  }
}
function loadConfig() { try { const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null; const parsed = raw ? safeParse(raw) : null; return parsed && typeof parsed === 'object' ? parsed : defaultConfig() } catch { return defaultConfig() } }
function persistConfig(cfg) { try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(cfg)) } catch { } }

export default function SettingsCil() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { stages } = useStages()
  const isRTL = String(i18n.language || '').startsWith('ar')
  const isDark = theme === 'dark'

  const [config, setConfig] = useState(defaultConfig())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('system')
  const stageOptions = useMemo(() => {
    const arr = Array.isArray(stages) ? stages : []
    const useArabic = String(i18n.language || '').startsWith('ar')
    return arr.map(s => {
      if (typeof s === 'string') return { key: s, label: s }
      const key = s.name || s.key || s
      const label = useArabic ? (s.nameAr || s.name || s.key || '') : (s.name || s.nameAr || s.key || '')
      return { key, label }
    })
  }, [stages, i18n.language])

  useEffect(() => {
    setConfig(loadConfig())
    setLoading(false)
  }, [])

  const saveAll = () => { const next = { ...config, governance: { ...config.governance, version: Number(config.governance.version || 1) + 1, history: [...(config.governance.history||[]), { ts: Date.now(), version: Number(config.governance.version || 1), summary: 'save' }] } }; setConfig(next); persistConfig(next) }
  const rollbackLast = () => { const v = Number(config.governance.version || 1); if (v <= 1) return; const next = { ...config, governance: { ...config.governance, version: v - 1 } }; setConfig(next); persistConfig(next) }

  if (loading) return (<div className="p-4 text-[var(--muted-text)]">{t('جارِ التحميل')}...</div>)

  return (
    <div className={`px-2 py-4 md:px-6 md:py-6 min-h-screen ${isDark ? 'bg-[#0b1524] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[260px]">
          <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t('طبقة إعدادات CIL')}</h1>
          <p className="mt-1 text-sm opacity-80">
            {t('CIL هي عقل الـ CRM: إدارة السلوك، التحكم في الوحدات، بناء القواعد، من دون تعديل الكود.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={saveAll}>{t('حفظ شامل')}</button>
          <button className="px-3 py-2 rounded bg-gray-300 dark:bg-gray-700" onClick={rollbackLast}>{t('تراجع')}</button>
        </div>
      </div>
      <div className="px-4">
        <div className="rounded-2xl p-2 overflow-x-auto bg-transparent">
          <div className="flex flex-nowrap gap-2 px-2 py-2">
            {['system','modules','rules','workflows','validations','flags','governance'].map(k => (
              <button
                key={k}
                className={`min-w-[140px] px-3 py-2 rounded backdrop-blur-sm border ${activeTab===k
                  ? (isDark ? 'bg-white/20 border-white/30 text-white' : 'bg-black/10 border-black/20 text-black')
                  : (isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black')}
                `}
                onClick={() => setActiveTab(k)}
              >{t(k)}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 space-y-4 bg-white/60 dark:bg-[#0b2b4f]">
        {activeTab === 'system' && (
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 h-8"></div>
            <div className="col-span-12 md:col-span-6">
              <div className="font-semibold">{t('سلوك النظام')}</div>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.system.readOnly} onChange={e => setConfig(c => ({ ...c, system: { ...c.system, readOnly: e.target.checked } }))} />{t('وضع القراءة فقط')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={config.system.strict} onChange={e => setConfig(c => ({ ...c, system: { ...c.system, strict: e.target.checked } }))} />{t('وضع صارم')}</label>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6"><div className="text-xs opacity-70">{t('العملة الافتراضية')}</div><input className="input w-full" value={config.system.defaultCurrency} onChange={e => setConfig(c => ({ ...c, system: { ...c.system, defaultCurrency: e.target.value } }))} /></div>
                  <div className="col-span-6"><div className="text-xs opacity-70">{t('البيئة')}</div><div className="relative"><select className="input w-full pr-10" value={config.system.environment} onChange={e => setConfig(c => ({ ...c, system: { ...c.system, environment: e.target.value } }))}><option value="production">{t('Production')}</option><option value="staging">{t('Staging')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
                </div>
              </div>
            </div>
            <div className="col-span-12 h-8"></div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-4"></div></div>
            <div className="font-semibold">{t('التحكم في الوحدات')}</div>
            {['leads','eoi','reservation','contracts','paymentPlans'].map(k => (
              <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={config.modules[k]} onChange={e => {
                const val = e.target.checked
                let next = { ...config.modules, [k]: val }
                if (k === 'contracts' && val) next.paymentPlans = true
                if (k === 'paymentPlans' && !val) next.contracts = false
                setConfig(c => ({ ...c, modules: next }))
              }} />{t(k)}</label>
            ))}
            <div className="text-xs opacity-70">{t('ملاحظة: العقود تتطلب خطط الدفع')}</div>
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-6"></div></div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-4"></div></div>
            <div className="font-semibold">{t('مُحَرِّك القواعد')}</div>
            <RuleBuilder config={config} setConfig={setConfig} t={t} />
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-6"></div></div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-4"></div></div>
            <div className="font-semibold">{t('منطق سير العمل')}</div>
            <WorkflowEditor config={config} setConfig={setConfig} stages={stageOptions} t={t} />
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-6"></div></div>
          </div>
        )}

        {activeTab === 'validations' && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-4"></div></div>
            <div className="font-semibold">{t('قواعد التحقق')}</div>
            <ValidationEditor config={config} setConfig={setConfig} t={t} />
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-6"></div></div>
          </div>
        )}

        {activeTab === 'flags' && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-4"></div></div>
            <div className="font-semibold">{t('أعلام الميزات')}</div>
            <FeatureFlagsEditor config={config} setConfig={setConfig} t={t} />
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-6"></div></div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-4"></div></div>
            <div className="font-semibold">{t('الحوكمة والأمان')}</div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('الإصدار الحالي')}</div><div className="mt-1">{String(config.governance.version || 1)}</div></div>
              <div className="col-span-12 md:col-span-8"><div className="text-xs opacity-70">{t('سجلّ التغييرات')}</div><div className="mt-1 text-xs">{(config.governance.history||[]).length} {t('عنصر')}</div></div>
            </div>
            <div className="flex items-center gap-2"><button className="btn btn-primary" onClick={saveAll}>{t('ترقية الإصدار')}</button><button className="btn btn-outline" onClick={rollbackLast}>{t('استرجاع الإصدار السابق')}</button></div>
            <div className="grid grid-cols-12 gap-2"><div className="col-span-12 h-6"></div></div>
          </div>
        )}
      </div>

      <div className="px-4">
        <div className="glass-panel rounded-2xl p-4 space-y-3 bg-white/60 dark:bg-[#0b2b4f]">
          <div className="font-semibold">{t('وضع الاختبار')}</div>
          <RuleTester config={config} t={t} />
        </div>
      </div>
    </div>
  )
}

function RuleBuilder({ config, setConfig, t }) {
  const [draft, setDraft] = useState({ name: '', scope: 'contracts', condition: { left: 'Contract.TotalAmount', op: '>', right: '100000' }, action: { type: 'RequireApproval', value: 'manager' }, priority: 1, status: 'active' })
  const addRule = () => {
    if (!String(draft.name || '').trim()) return
    const item = { id: `rule-${Date.now()}`, ...draft, version: 1, history: [] }
    const next = [...(config.rules || []), item]
    setConfig(c => ({ ...c, rules: next }))
    persistConfig({ ...config, rules: next })
    setDraft({ name: '', scope: 'contracts', condition: { left: 'Contract.TotalAmount', op: '>', right: '100000' }, action: { type: 'RequireApproval', value: 'manager' }, priority: 1, status: 'active' })
  }
  const updateField = (path, val) => {
    const d = { ...draft }
    const segs = path.split('.')
    let ref = d
    for (let i = 0; i < segs.length - 1; i++) ref = ref[segs[i]]
    ref[segs[segs.length - 1]] = val
    setDraft(d)
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('اسم القاعدة')}</div><input className="input w-full" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></div>
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('النطاق')}</div><div className="relative"><select className="input w-full pr-10" value={draft.scope} onChange={e => setDraft(d => ({ ...d, scope: e.target.value }))}><option value="contracts">{t('العقود')}</option><option value="leads">{t('العملاء المحتملون')}</option><option value="reservation">{t('الحجوزات')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('الأولوية')}</div><input type="number" className="input w-full" value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: Number(e.target.value || 0) }))} /></div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('شرط')}</div><input className="input w-full" value={draft.condition.left} onChange={e => updateField('condition.left', e.target.value)} /></div>
        <div className="col-span-12 md:col-span-2"><div className="text-xs opacity-70">{t('عامل')}</div><div className="relative"><select className="input w-full pr-10" value={draft.condition.op} onChange={e => updateField('condition.op', e.target.value)}><option value=">">&gt;</option><option value="<">&lt;</option><option value="==">==</option><option value=">=">&gt;=</option><option value="<=">&lt;=</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-6"><div className="text-xs opacity-70">{t('قيمة')}</div><input className="input w-full" value={draft.condition.right} onChange={e => updateField('condition.right', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-6"><div className="text-xs opacity-70">{t('الإجراء')}</div><div className="relative"><select className="input w-full pr-10" value={draft.action.type} onChange={e => updateField('action.type', e.target.value)}><option value="RequireApproval">{t('يتطلب موافقة')}</option><option value="AutoCreatePaymentPlan">{t('إنشاء خطة دفع تلقائيًا')}</option><option value="Notify">{t('إشعار')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-6"><div className="text-xs opacity-70">{t('قيمة الإجراء')}</div><input className="input w-full" value={draft.action.value} onChange={e => updateField('action.value', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('الحالة')}</div><div className="relative"><select className="input w-full pr-10" value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}><option value="active">{t('فعّال')}</option><option value="inactive">{t('موقوف')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
      </div>
      <div className="flex items-center justify-end gap-2"><button className="btn btn-primary" onClick={addRule}>{t('إضافة قاعدة')}</button></div>
      <div className="border rounded p-2">
        <div className="text-xs opacity-70">{t('القواعد الحالية')}</div>
        <div className="space-y-1 mt-1">
          {(config.rules||[]).map(r => (
            <div key={r.id} className="flex items-center justify-between gap-2">
              <div className="text-sm">{r.name}</div>
              <div className="text-xs opacity-70">{r.scope}</div>
              <div className="text-xs">{r.condition.left} {r.condition.op} {r.condition.right}</div>
              <div className="text-xs">{r.action.type}:{r.action.value}</div>
            </div>
          ))}
          {(config.rules||[]).length === 0 && (<div className="text-xs text-[var(--muted-text)]">{t('لا توجد قواعد')}</div>)}
        </div>
      </div>
    </div>
  )
}

function WorkflowEditor({ config, setConfig, stages, t }) {
  const [draft, setDraft] = useState({ from: '', to: '', actions: ['AutoCreatePaymentPlan'] })
  const addWF = () => {
    if (!draft.from || !draft.to) return
    const item = { id: `wf-${Date.now()}`, from: draft.from, to: draft.to, actions: draft.actions }
    const next = [...(config.workflows||[]), item]
    setConfig(c => ({ ...c, workflows: next }))
    persistConfig({ ...config, workflows: next })
    setDraft({ from: '', to: '', actions: ['AutoCreatePaymentPlan'] })
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-5"><div className="text-xs opacity-70">{t('من مرحلة')}</div><div className="relative"><select className="input w-full pr-10" value={draft.from} onChange={e => setDraft(d => ({ ...d, from: e.target.value }))}><option value="">{t('اختر')}</option>{stages.map(s => (<option key={s.key} value={s.key}>{s.label || s.key}</option>))}</select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-5"><div className="text-xs opacity-70">{t('إلى مرحلة')}</div><div className="relative"><select className="input w-full pr-10" value={draft.to} onChange={e => setDraft(d => ({ ...d, to: e.target.value }))}><option value="">{t('اختر')}</option>{stages.map(s => (<option key={s.key} value={s.key}>{s.label || s.key}</option>))}</select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-2"><div className="text-xs opacity-70">{t('إجراء تلقائي')}</div><div className="relative"><select className="input w-full pr-10" value={draft.actions[0]} onChange={e => setDraft(d => ({ ...d, actions: [e.target.value] }))}><option value="AutoCreatePaymentPlan">{t('إنشاء خطة دفع')}</option><option value="Notify">{t('إشعار')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
      </div>
      <div className="flex items-center justify-end gap-2"><button className="btn btn-primary" onClick={addWF}>{t('إضافة')}</button></div>
      <div className="border rounded p-2">
        <div className="text-xs opacity-70">{t('تعريفات سير العمل')}</div>
        <div className="space-y-1 mt-1">
          {(config.workflows||[]).map(w => (<div key={w.id} className="text-xs">{w.from} → {w.to} • {w.actions.join(', ')}</div>))}
          {(config.workflows||[]).length === 0 && (<div className="text-xs text-[var(--muted-text)]">{t('لا توجد تعريفات')}</div>)}
        </div>
      </div>
    </div>
  )
}

function ValidationEditor({ config, setConfig, t }) {
  const [draft, setDraft] = useState({ scope: 'contracts', field: 'DownPayment', op: '<=', value: 'TotalAmount' })
  const addV = () => {
    if (!String(draft.field || '').trim()) return
    const item = { id: `val-${Date.now()}`, ...draft }
    const next = [...(config.validations||[]), item]
    setConfig(c => ({ ...c, validations: next }))
    persistConfig({ ...config, validations: next })
    setDraft({ scope: 'contracts', field: 'DownPayment', op: '<=', value: 'TotalAmount' })
  }
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-3"><div className="text-xs opacity-70">{t('النطاق')}</div><div className="relative"><select className="input w-full pr-10" value={draft.scope} onChange={e => setDraft(d => ({ ...d, scope: e.target.value }))}><option value="contracts">{t('العقود')}</option><option value="leads">{t('العملاء المحتملون')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-3"><div className="text-xs opacity-70">{t('الحقل')}</div><input className="input w-full" value={draft.field} onChange={e => setDraft(d => ({ ...d, field: e.target.value }))} /></div>
        <div className="col-span-12 md:col-span-2"><div className="text-xs opacity-70">{t('عامل')}</div><div className="relative"><select className="input w-full pr-10" value={draft.op} onChange={e => setDraft(d => ({ ...d, op: e.target.value }))}><option value="<=">&lt;=</option><option value=">=">&gt;=</option><option value="==">==</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('قيمة/حقل مقارنة')}</div><input className="input w-full" value={draft.value} onChange={e => setDraft(d => ({ ...d, value: e.target.value }))} /></div>
      </div>
      <div className="flex items-center justify-end gap-2"><button className="btn btn-primary" onClick={addV}>{t('إضافة قاعدة تحقق')}</button></div>
      <div className="border rounded p-2">
        <div className="text-xs opacity-70">{t('مصفوفة التحقق')}</div>
        <div className="space-y-1 mt-1">
          {(config.validations||[]).map(v => (<div key={v.id} className="text-xs">{v.scope}.{v.field} {v.op} {v.value}</div>))}
          {(config.validations||[]).length === 0 && (<div className="text-xs text-[var(--muted-text)]">{t('لا توجد قواعد')}</div>)}
        </div>
      </div>
    </div>
  )
}

function FeatureFlagsEditor({ config, setConfig, t }) {
  const flip = (key, val) => { const next = { ...config.flags, [key]: val }; setConfig(c => ({ ...c, flags: next })); persistConfig({ ...config, flags: next }) }
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2"><input type="checkbox" checked={config.flags.newDashboard} onChange={e => flip('newDashboard', e.target.checked)} />{t('لوحة تحكم جديدة')}</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={config.flags.betaSearch} onChange={e => flip('betaSearch', e.target.checked)} />{t('بحث تجريبي')}</label>
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-6"><div className="text-xs opacity-70">{t('حسب الدور')}</div><div className="mt-1 flex items-center gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={config.flags.roleFlags.admin} onChange={e => flip('roleFlags', { ...config.flags.roleFlags, admin: e.target.checked })} />{t('مشرف')}</label><label className="flex items-center gap-2"><input type="checkbox" checked={config.flags.roleFlags.manager} onChange={e => flip('roleFlags', { ...config.flags.roleFlags, manager: e.target.checked })} />{t('مدير')}</label></div></div>
        <div className="col-span-12 md:col-span-6"><div className="text-xs opacity-70">{t('حسب البيئة')}</div><div className="mt-1 flex items-center gap-3"><label className="flex items-center gap-2"><input type="checkbox" checked={config.flags.envFlags.production} onChange={e => flip('envFlags', { ...config.flags.envFlags, production: e.target.checked })} />{t('Production')}</label><label className="flex items-center gap-2"><input type="checkbox" checked={config.flags.envFlags.staging} onChange={e => flip('envFlags', { ...config.flags.envFlags, staging: e.target.checked })} />{t('Staging')}</label></div></div>
      </div>
    </div>
  )
}

function RuleTester({ config, t }) {
  const [input, setInput] = useState({ scope: 'contracts', Contract_TotalAmount: 150000 })
  const run = () => {
    const scope = input.scope
    const items = (config.rules||[]).filter(r => r.scope === scope && r.status === 'active')
    const fired = items.filter(r => {
      const left = String(r.condition.left || '').replace('.', '_')
      const val = Number(input[left] || 0)
      const right = Number(r.condition.right || 0)
      switch (r.condition.op) { case '>': return val > right; case '<': return val < right; case '==': return val === right; case '>=': return val >= right; case '<=': return val <= right; default: return false }
    })
    return fired.map(f => `${f.action.type}:${f.action.value}`)
  }
  const results = run()
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('النطاق')}</div><div className="relative"><select className="input w-full pr-10" value={input.scope} onChange={e => setInput(i => ({ ...i, scope: e.target.value }))}><option value="contracts">{t('العقود')}</option><option value="leads">{t('العملاء المحتملون')}</option></select><button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onMouseDown={e => { const el = e.currentTarget.previousElementSibling; if (el && typeof el.focus === 'function') el.focus() }}><ChevronDown size={18} /></button></div></div>
        <div className="col-span-12 md:col-span-4"><div className="text-xs opacity-70">{t('Contract.TotalAmount')}</div><input type="number" className="input w-full" value={input.Contract_TotalAmount} onChange={e => setInput(i => ({ ...i, Contract_TotalAmount: Number(e.target.value || 0) }))} /></div>
      </div>
      <div className="border rounded p-2">
        <div className="text-xs opacity-70">{t('نتائج الاختبار')}</div>
        <div className="mt-1 text-xs">{results.join(', ') || t('لا شيء')}</div>
      </div>
    </div>
  )
}
