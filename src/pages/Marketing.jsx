import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ChannelPerformanceChart from '../components/ChannelPerformanceChart'
import { PieChart } from '@shared/components/PieChart'
import CreateCampaignModal from '../components/CreateCampaignModal'
import ReportingOverTimeChart from '../components/ReportingOverTimeChart'
import { FaFacebook, FaGoogle, FaMailBulk, FaWhatsapp } from 'react-icons/fa'

export default function Marketing() {
  const { t, i18n } = useTranslation()
  const isRTL = (i18n.language || '').toLowerCase() === 'ar'

  const [showCreateModal, setShowCreateModal] = useState(false)

  // بيانات العرض لتطابق الصورة المرفقة
  const overviewSegments = [
    { label: t('On Track'), value: 12, color: '#22c55e' },
    { label: t('At Risk'), value: 6, color: '#f59e0b' },
    { label: t('Paused'), value: 3, color: '#ef4444' }
  ]
  const totalActive = 18
  const avgOpenRate = 25
  const avgClickRate = 3.2
  const conversionRate = 3.7

  const apiCards = [
    { id: 'meta-1', title: 'Meta Ads API', account: t('Account Linked') + ': 105', status: t('Linked'), lastSync: '2h', btn: t('Configure') },
    { id: 'meta-2', title: 'Meta Ads API', account: t('Account Linked') + ': 103', status: t('Linked'), lastSync: '2h', btn: t('Configure') },
    { id: 'meta-3', title: 'Meta Ads API', account: t('Account Linked') + ': 102', status: t('Linked'), lastSync: '1h', btn: t('Configure') }
  ]

  const campaignsTable = [
    { name: t('Summer Promo'), status: 'SMS', spend: 255, clicks: 425, conversions: 40, roi: '3.2x' },
    { name: t('Winback Series'), status: 'SMS', spend: 205, clicks: 355, conversions: 29, roi: '2.6x' },
    { name: t('Product Launch'), status: 'SMS', spend: 285, clicks: 465, conversions: 33, roi: '3.0x' },
    { name: t('Global Ad'), status: 'SMS', spend: 245, clicks: 415, conversions: 31, roi: '2.7x' }
  ]

  const channelsTable = [
    { platform: 'Meta Ads', spend: 886, impressions: 6655, conversions: '26%' },
    { platform: 'Google Ads', spend: 906, impressions: 6888, conversions: '29%' },
    { platform: 'Email', spend: 311, impressions: 1777, conversions: '18%' },
    { platform: 'SMS', spend: 255, impressions: 1555, conversions: '33%' }
  ]

  const handleCreateCampaign = (campaign) => {
    console.log('✅ New Campaign Created:', campaign)
    setShowCreateModal(false)
  }

  const [googleConnected, setGoogleConnected] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  // عرض مبسّط لبيانات Gmail (labels) لإثبات الاستخدام الفعلي
  const fetchGmailLabels = async () => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787'
    try {
      const resp = await fetch(`${apiBase}/api/gmail/labels`)
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'labels_failed')
      const names = (data.labels || []).map(l => l.name).join(', ')
      alert(`Gmail Labels: ${names || 'No labels'}`)
    } catch (e) {
      console.error('Fetch Gmail labels failed:', e)
      alert(`فشل جلب Labels من Gmail: ${e.message}`)
    }
  }
  const disconnectGmail = async () => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787'
    try {
      await fetch(`${apiBase}/api/oauth/google/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'gmail' })
      })
    } catch (_) {}
    try {
      localStorage.removeItem('oauth_token_gmail')
      localStorage.removeItem('oauth_redirect_uri_gmail')
    } catch (_) {}
    setGmailConnected(false)
    setIntegrations(prev => prev.map(c => (
      c.id === 'gmail' ? { ...c, status: t('Disconnected'), connected: false } : c
    )))
  }
  const disconnectAds = async () => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787'
    try {
      await fetch(`${apiBase}/api/oauth/google/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'ads' })
      })
    } catch (_) {}
    try {
      localStorage.removeItem('oauth_token_ads')
      localStorage.removeItem('oauth_redirect_uri_ads')
    } catch (_) {}
    setGoogleConnected(false)
    setIntegrations(prev => prev.map(c => (
      c.id === 'google-ads' ? { ...c, status: t('Disconnected'), connected: false } : c
    )))
  }
  const [integrations, setIntegrations] = useState([
    { id: 'meta', name: 'Meta', icon: FaFacebook, bg: 'bg-[#1877F2]', status: t('Connected'), connected: true },
    { id: 'mailchimp', name: 'MailChimp', icon: FaMailBulk, bg: 'bg-amber-500', status: t('Connected'), connected: true },
    { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, bg: 'bg-green-500', status: t('Connected'), connected: true },
    { id: 'gmail', name: 'Gmail', icon: FaGoogle, bg: 'bg-[#DB4437]', status: t('Disconnected'), connected: false },
    { id: 'google-ads', name: 'Google Ads', icon: FaGoogle, bg: 'bg-red-500', status: t('Disconnected'), connected: false }
  ])

  // Build Google OAuth URL and start the flow
  const startGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID
    // استخدم redirect من .env إن وُجد لضمان التطابق التام مع إعدادات Google
    const redirectUriEnv = import.meta.env.VITE_GOOGLE_ADS_REDIRECT_URI
    const redirectUri = redirectUriEnv || `${window.location.origin}/crm-ibrahim/`
    const scope = encodeURIComponent('https://www.googleapis.com/auth/adwords')
    const state = `ads:${Math.random().toString(36).slice(2)}`
    if (!clientId) {
      alert('Google Ads Client ID غير مُعرّف. أضِف VITE_GOOGLE_ADS_CLIENT_ID إلى ملف .env ثم أعد تشغيل السيرفر.')
      return
    }
    // خزّن نفس redirect_uri لاستخدامه لاحقًا في خطوة التبادل
    try {
      localStorage.setItem('oauth_redirect_uri_ads', redirectUri)
    } catch (_) {}
    console.log('[oauth] start Google Ads', { clientId: clientId?.slice(0, 12) + '...', redirectUri })
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true&state=${state}`
    window.location.href = oauthUrl
  }

  // Build Gmail OAuth URL and start the flow
  const startGmailOAuth = () => {
    const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID || import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID
    const redirectUriEnv = import.meta.env.VITE_GMAIL_REDIRECT_URI || import.meta.env.VITE_GOOGLE_ADS_REDIRECT_URI
    const redirectUri = redirectUriEnv || `${window.location.origin}/crm-ibrahim/`
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly')
    const state = `gmail:${Math.random().toString(36).slice(2)}`
    if (!clientId) {
      alert('Gmail Client ID غير مُعرّف. أضِف VITE_GMAIL_CLIENT_ID أو استخدم نفس VITE_GOOGLE_ADS_CLIENT_ID في .env ثم أعد تشغيل السيرفر.')
      return
    }
    // خزّن نفس redirect_uri لاستخدامه لاحقًا في خطوة التبادل
    try {
      localStorage.setItem('oauth_redirect_uri_gmail', redirectUri)
    } catch (_) {}
    console.log('[oauth] start Gmail', { clientId: clientId?.slice(0, 12) + '...', redirectUri })
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&include_granted_scopes=true&state=${state}`
    window.location.href = oauthUrl
  }

  // Detect OAuth code returned to redirectUri and call backend bridge to exchange tokens
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const stateParam = params.get('state') || ''
      if (!code) return

      const baseRedirect = `${window.location.origin}/crm-ibrahim/`
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

      try {
        if (stateParam.startsWith('gmail:') && !gmailConnected) {
          const stored = localStorage.getItem('oauth_redirect_uri_gmail')
          const redirectUri = stored || import.meta.env.VITE_GMAIL_REDIRECT_URI || baseRedirect
          console.log('[oauth] exchange Gmail', { redirectUri, hasStored: !!stored })
          const resp = await fetch(`${apiBase}/api/oauth/google/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri, provider: 'gmail' })
          })
          const data = await resp.json()
          if (!resp.ok) {
            const msg = data?.message || data?.error || 'gmail_exchange_failed'
            const detail = (data?.details && (data.details.error_description || data.details.error)) || ''
            console.error('OAuth exchange failed (gmail):', data)
            alert(`فشل ربط Gmail: ${msg}${detail ? ' – ' + detail : ''}`)
            return
          }
          // خزّن التوكنات مؤقتًا (Dev فقط)
          try { localStorage.setItem('oauth_token_gmail', JSON.stringify(data.token || data)) } catch (_) {}
          setGmailConnected(true)
          setIntegrations(prev => prev.map(c => (
            c.id === 'gmail' ? { ...c, status: t('Connected'), connected: true } : c
          )))
          // Optionally store token securely later (backend), avoid localStorage in production
        } else if (stateParam.startsWith('ads:') && !googleConnected) {
          const stored = localStorage.getItem('oauth_redirect_uri_ads')
          const redirectUri = stored || import.meta.env.VITE_GOOGLE_ADS_REDIRECT_URI || baseRedirect
          console.log('[oauth] exchange Google Ads', { redirectUri, hasStored: !!stored })
          const resp = await fetch(`${apiBase}/api/oauth/google/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri, provider: 'ads' })
          })
          const data = await resp.json()
          if (!resp.ok) {
            const msg = data?.message || data?.error || 'ads_exchange_failed'
            const detail = (data?.details && (data.details.error_description || data.details.error)) || ''
            console.error('OAuth exchange failed (ads):', data)
            alert(`فشل ربط Google Ads: ${msg}${detail ? ' – ' + detail : ''}`)
            return
          }
          // خزّن التوكنات مؤقتًا (Dev فقط)
          try { localStorage.setItem('oauth_token_ads', JSON.stringify(data.token || data)) } catch (_) {}
          setGoogleConnected(true)
          setIntegrations(prev => prev.map(c => (
            c.id === 'google-ads' ? { ...c, status: t('Connected'), connected: true } : c
          )))
        }
      } catch (err) {
        console.error('OAuth exchange failed:', err)
        alert(`فشل ربط ${stateParam.startsWith('gmail:') ? 'Gmail' : 'Google Ads'}: ${err.message}`)
      } finally {
        // Clean URL so code/state params disappear
        const cleanUrl = window.location.origin + '/crm-ibrahim/' + window.location.hash
        window.history.replaceState({}, document.title, cleanUrl)
      }
    }
    run()
  }, [googleConnected, gmailConnected, t])

  return (
      <div className="space-y-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-y-auto">
        {/* العنوان والأزرار */}
        <div className={`flex items-center justify-between gap-3`}>
          <div>
            <h1 className="text-2xl font-bold">{t('Marketing Modules (Enhanced)')}</h1>
            <p className="text-sm text-[var(--muted-text)]">{t('Welcome, Super Admin!')}</p>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              {t('Create Campaign')}
            </button>
          </div>
        </div>

        {/* الصف الأول: Overview + API Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Overview */}
          <section className="card glass-card p-4 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-3">{t('Overview')}</h3>
            <div className="flex items-start gap-6">
              <PieChart
                percentage={80}
                centerValue={totalActive}
                centerLabel={`${t('Total Active Campaigns')}:`}
                centerLabelPosition="above"
                subLabel={t('Last 30 Days')}
                size={200}
                primaryColor="#2dd4bf"
                secondaryColor="#475569"
                cutout="60%"
                spacing={0}
                borderRadius={12}
                centerValueClass="text-4xl font-bold"
                centerLabelClass="text-xs text-[var(--muted-text)] mb-1"
                subLabelClass="text-[10px] text-[var(--muted-text)] mt-0.5"
                innerTrack
                innerTrackRadius="92%"
                innerTrackCutout="86%"
                innerTrackColor="#3f4a5a"
              />
              <div className="flex-1">
                {/* أعلى: شارات صغيرة كما في الصورة */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="px-3 py-1 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs text-[var(--muted-text)]">{t('Avg Open Rate')}</div>
                  <div className="px-3 py-1 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] text-xs text-[var(--muted-text)]">{t('Avg Click Rate')}</div>
                </div>
                {/* صفوف القيم المزدوجة كما في الصورة */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[var(--muted-text)]">{t('Avg Open Rate')}</span>
                    <div className="flex items-baseline gap-8">
                      <span className="text-xl font-bold">{avgOpenRate}%</span>
                      <span className="text-xl font-bold">{avgClickRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[var(--muted-text)]">{t('Conversion Rate')}</span>
                    <div className="flex items-baseline gap-8">
                      <span className="text-xl font-bold">{conversionRate}%</span>
                      <span className="text-xl font-bold">{conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* API Cards (configuration) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {apiCards.map(card => (
              <section key={card.id} className="card glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">{card.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">{card.status}</span>
                </div>
                <div className="text-xs text-[var(--muted-text)] mb-3">{card.account} • {t('Last Sync')}: {card.lastSync}</div>
                <button className="btn btn-secondary w-full h-9 text-sm">{card.btn}</button>
              </section>
            ))}

            {/* Channels gallery card */}
            <section className="card glass-card p-3">
              {/* صفوف صور مع توزيع المسافة بين العناصر */}
              <div className="space-y-3">
                <div className="flex items-center justify-around">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1877F2]">
                    {FaFacebook && <FaFacebook className="text-white w-4 h-4" />}
                  </span>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500">
                    {FaGoogle && <FaGoogle className="text-white w-4 h-4" />}
                  </span>
                </div>
                <div className="flex items-center justify-around">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500">
                    {FaMailBulk && <FaMailBulk className="text-white w-4 h-4" />}
                  </span>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-500">
                    {FaWhatsapp && <FaWhatsapp className="text-white w-4 h-4" />}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* فاصل بصري بين الأوفرڤيو والتوب أكتيف */}
        <div className="border-t border-[var(--panel-border)] my-2 md:my-3" />

        {/* الصف الثاني: Top Active Campaigns Dashboard + Cross-Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left column container: split chart and table into separate cards */}
          <div className="flex flex-col h-full gap-4">
          {/* Top Active Chart */}
          <section className="card glass-card p-4">
            <h3 className="text-lg font-semibold mb-3">{t('Top Active Campaigns Dashboard')}</h3>
            <ChannelPerformanceChart height={180} />
          </section>

          {/* Top Active Table */}
          <section className="card glass-card p-4 h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold mb-3">{t('Campaign Management Last 30 Days')}</h3>
            <div className="flex-1">
              <table className="nova-table w-full table-fixed text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300">
                    <th className="py-2 px-4">{t('Campaign Name')}</th>
                    <th className="py-2 px-4">{t('Status')}</th>
                    <th className="py-2 px-4">{t('Spend')}</th>
                    <th className="py-2 px-4">{t('Clicks')}</th>
                    <th className="py-2 px-4">{t('Conversions')}</th>
                    <th className="py-2 px-4">ROI</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-100">
                  {campaignsTable.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="py-2 px-4">{row.name}</td>
                      <td className="py-2 px-4">{row.status}</td>
                      <td className="py-2 px-4">{row.spend}</td>
                      <td className="py-2 px-4">{row.clicks}</td>
                      <td className="py-2 px-4">{row.conversions}</td>
                      <td className="py-2 px-4">{row.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          </div>

          {/* Right column container to match left height */}
          <div className="flex flex-col h-full gap-4">
            {/* Cross-Channel Performance */}
            <section className="card glass-card p-4 flex-1 min-h-0">
              <h3 className="text-lg font-semibold mb-3">{t('Cross-Channel Performance')}</h3>
              <div>
                <table className="nova-table w-full table-fixed text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 dark:text-gray-300">
                      <th className="py-2 px-4">{t('Platform')}</th>
                      <th className="py-2 px-4">{t('Spend')}</th>
                      <th className="py-2 px-4">{t('Impressions')}</th>
                      <th className="py-2 px-4">{t('Conversions')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800 dark:text-gray-100">
                    {channelsTable.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-200 dark:border-gray-800">
                        <td className="py-2 px-4">{row.platform}</td>
                        <td className="py-2 px-4">{row.spend}</td>
                        <td className="py-2 px-4">{row.impressions}</td>
                        <td className="py-2 px-4">{row.conversions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Automation & Rules (moved here) */}
            <section className="card glass-card p-4">
              <h3 className="text-lg font-semibold mb-3">{t('Automation & Rules')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] text-sm text-[var(--muted-text)]">
                  {t('Pause Google Ads campaign if CPA exceeds 3x')}
                </div>
                <button className="btn btn-outline">
                  + {t('Create Automation Rule')}
                </button>
              </div>
            </section>

            {/* Cross-Channel Actions (separated) */}
            <section className="card glass-card p-4">
              <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-2">
                  <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ {t('Create New Campaign')}</button>
                  <button className="btn btn-secondary">{t('Edit')}</button>
                  <button className="btn btn-outline">{t('View')}</button>
                </div>
                <div className="text-xs text-[var(--muted-text)]">Increase Google budget exceeds 10% • {t('Create Automation Rule')}</div>
              </div>
            </section>
          </div>
        </div>


        {/* الصف الرابع: Reporting Over Time + Integration Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="card glass-card p-4">
            <ReportingOverTimeChart />
          </section>
          <section className="card glass-card p-4">
            <h3 className="text-lg font-semibold mb-3">{t('Integration Status')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {integrations.map((chip) => (
                <div key={chip.id} className="flex items-center gap-3 p-3 rounded border border-[var(--panel-border)] bg-[var(--panel-bg)]">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${chip.bg}`}>
                    {chip.icon && chip.icon({ className: 'text-white w-4 h-4' })}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{chip.name}</div>
                    <div className="text-xs text-[var(--muted-text)]">{chip.status}</div>
                  </div>
                  {/* Status light */}
                  <span className={`w-2 h-2 rounded-full ${chip.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {/* Connect button for Google Ads when disconnected */}
                  {chip.id === 'google-ads' && !chip.connected && (
                    <button className="btn btn-primary btn-sm" onClick={startGoogleOAuth}>{t('Connect')}</button>
                  )}
                  {/* Disconnect button for Google Ads when connected */}
                  {chip.id === 'google-ads' && chip.connected && (
                    <button className="btn btn-outline btn-sm" onClick={disconnectAds}>{t('Disconnect')}</button>
                  )}
                  {/* Connect button for Gmail when disconnected */}
                  {chip.id === 'gmail' && !chip.connected && (
                    <button className="btn btn-primary btn-sm" onClick={startGmailOAuth}>{t('Connect')}</button>
                  )}
                  {/* Fetch + Disconnect buttons for Gmail when connected */}
                  {chip.id === 'gmail' && chip.connected && (
                    <div className="flex items-center gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={fetchGmailLabels}>{t('Fetch')}</button>
                      <button className="btn btn-outline btn-sm" onClick={disconnectGmail}>{t('Disconnect')}</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
        <CreateCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateCampaign}
        />
      </div>
  )
}
