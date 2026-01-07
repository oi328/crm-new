import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ChannelPerformanceChart from '../components/ChannelPerformanceChart'
import { PieChart } from '@shared/components/PieChart'
import CreateCampaignModal from '../components/CreateCampaignModal'
import MarketingPerformance from '../components/ReportingOverTimeChart'
import { FaFacebook, FaGoogle, FaMailBulk, FaWhatsapp } from 'react-icons/fa'

function Sparkline({ data = [], color = 'emerald', width = 120, height = 36, padding = 6 }) {
  const w = width
  const h = height
  const p = padding
  if (!Array.isArray(data) || data.length < 2) return <svg width={w} height={h} />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = (w - p * 2) / (data.length - 1)
  const points = data.map((v, i) => {
    const x = p + i * stepX
    const y = h - p - ((v - min) / range) * (h - p * 2)
    return `${x},${y}`
  }).join(' ')
  const stroke =
    color === 'emerald' ? '#10b981' :
    color === 'rose' ? '#ef4444' :
    color === 'blue' ? '#3b82f6' : '#94a3b8'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  )
}

function CountUp({ value = 0, duration = 600 }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    const from = prev.current
    const to = value
    prev.current = to
    const start = performance.now()
    const step = (ts) => {
      const p = Math.min(1, (ts - start) / duration)
      const v = Math.round(from + (to - from) * p)
      setDisplay(v)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])
  return <span>{display}</span>
}

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
  const avgClickRate = 15.4
  const conversionRate = 3.7
  const openSeries = [18.2, 19.5, 21.1, 22.8, 24.2, 25.0]
  const clickSeries = [14.8, 14.9, 15.0, 15.3, 15.1, 15.4]
  const convSeries = [3.2, 3.1, 3.4, 3.5, 3.6, 3.7]
  const [prevOverview, setPrevOverview] = useState(() => {
    try {
      const saved = localStorage.getItem('marketing_overview_prev')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  useEffect(() => {
    try {
      const payload = { avgOpenRate, avgClickRate, conversionRate }
      localStorage.setItem('marketing_overview_prev', JSON.stringify(payload))
      setPrevOverview(payload)
    } catch {}
  }, [avgOpenRate, avgClickRate, conversionRate])
  const pctDelta = (current, prev) => {
    if (typeof prev !== 'number' || prev === 0) return 0
    return Number((((current - prev) / prev) * 100).toFixed(1))
  }

  // تم نقل أقسام الانتجريشن إلى صفحة الانتجريشن

  const campaignsTable = [
    { name: t('Summer Promo'), source: 'SMS', spend: 255, clicks: 425, conversions: 40, roi: '3.2x' },
    { name: t('Winback Series'), source: 'SMS', spend: 205, clicks: 355, conversions: 29, roi: '2.6x' },
    { name: t('Product Launch'), source: 'SMS', spend: 285, clicks: 465, conversions: 33, roi: '3.0x' },
    { name: t('Global Ad'), source: 'SMS', spend: 245, clicks: 415, conversions: 31, roi: '2.7x' }
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


  return (
      <div className={`p-4 md:p-6 min-h-screen`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* العنوان والأزرار */}
        <div className={`flex justify-between items-center gap-4 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`relative inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
            <h1 className="page-title text-2xl md:text-3xl font-bold  dark:text-white flex items-center gap-2 ${isRtl ? 'w-full text-right' : 'text-left'}`} style={{ textAlign: isRtl ? 'right' : 'left', color: theme === 'dark' ? '#ffffff' : '#000000' }}">{t('Marketing Dashboard')}</h1>
          </div>

        </div>
        {/* الصف الأول: Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Overview */}
          <section className="card glass-card p-4 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-3">{t('Overview')}</h3>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <PieChart
                  percentage={80}
                  centerValue={totalActive}
                  centerLabel={`${t('Total Active Campaigns')}:`}
                  centerLabelPosition="below"
                  subLabel={t('Last 30 Days')}
                  size={200}
                  primaryColor="#2dd4bf"
                  secondaryColor="#475569"
                  cutout="72%"
                  spacing={0}
                  borderRadius={12}
                  centerValueClass="text-3xl font-bold"
                  centerLabelClass="text-[11px] text-[var(--muted-text)] mt-1"
                  subLabelClass="text-[10px] text-[var(--muted-text)] mt-0.5 text-center"
                  innerTrack
                  innerTrackRadius="92%"
                  innerTrackCutout="86%"
                  innerTrackColor="#3f4a5a"
                  onClick={() => {
                    const el = document.getElementById('campaigns-last30')
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      el.classList.add('ring','ring-primary','ring-offset-2')
                      setTimeout(()=>{ el.classList.remove('ring','ring-primary','ring-offset-2') }, 1500)
                    }
                  }}
                />
              </div>
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="card glass-card p-3">
                  <div className="text-xs font-medium text-[var(--muted-text)]">{t('Avg. Open Rate')}</div>
                  <div className="text-2xl font-bold"><span><CountUp value={avgOpenRate} /></span>%</div>
                  <div className={`text-xs ${pctDelta(avgOpenRate, prevOverview?.avgOpenRate) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {pctDelta(avgOpenRate, prevOverview?.avgOpenRate) >= 0 ? '▲' : '▼'} {Math.abs(pctDelta(avgOpenRate, prevOverview?.avgOpenRate))}% {t('vs Last Month')}
                  </div>
                  <div className="mt-1"><Sparkline data={openSeries} color="emerald" /></div>
                </div>
                <div className="card glass-card p-3">
                  <div className="text-xs font-medium text-[var(--muted-text)]">{t('Avg. Click Rate')}</div>
                  <div className="text-2xl font-bold"><span><CountUp value={avgClickRate} /></span>%</div>
                  <div className={`text-xs ${pctDelta(avgClickRate, prevOverview?.avgClickRate) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {pctDelta(avgClickRate, prevOverview?.avgClickRate) >= 0 ? '▲' : '▼'} {Math.abs(pctDelta(avgClickRate, prevOverview?.avgClickRate))}% {t('vs Last Month')}
                  </div>
                  <div className="mt-1"><Sparkline data={clickSeries} color={pctDelta(avgClickRate, prevOverview?.avgClickRate) >= 0 ? 'emerald' : 'rose'} /></div>
                </div>
                <div className="card glass-card p-3">
                  <div className="text-xs font-medium text-[var(--muted-text)]">{t('Conversion Rate')}</div>
                  <div className="text-2xl font-bold"><span><CountUp value={conversionRate} /></span>%</div>
                  <div className={`text-xs ${pctDelta(conversionRate, prevOverview?.conversionRate) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {pctDelta(conversionRate, prevOverview?.conversionRate) >= 0 ? '▲' : '▼'} {Math.abs(pctDelta(conversionRate, prevOverview?.conversionRate))}% {t('vs Last Month')}
                  </div>
                  <div className="mt-1"><Sparkline data={convSeries} color="emerald" /></div>
                </div>
              </div>
            </div>
          </section>

          <section className="card glass-card p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">{t('Top Active Campaigns ')}</h3>
            <ChannelPerformanceChart height={180} />
          </section>

          </div>
        

        <div className="border-t border-[var(--panel-border)] my-2 md:my-3" />

        {/* الصف الثاني: Top Active Campaigns Dashboard + Cross-Channel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Left column container: split chart and table into separate cards */}
          <div className="flex flex-col h-full gap-4">
          

          {/* Top Active Table */}
          <section id="campaigns-last30" className="card glass-card p-4 min-h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold mb-3">{t('Campaign Management Last 30 Days')}</h3>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {campaignsTable.map((row, idx) => (
                <div key={idx} className="card glass-card p-4 space-y-3 bg-white/5">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h4 className="font-semibold text-sm">{row.name}</h4>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                      {row.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-text)] text-xs">{t('Spend')}</span>
                      <span className="text-xs font-medium">{row.spend}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-text)] text-xs">{t('Clicks')}</span>
                      <span className="text-xs font-medium">{row.clicks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-text)] text-xs">{t('Conversions')}</span>
                      <span className="text-xs">{row.conversions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-text)] text-xs">ROI</span>
                      <span className="text-xs font-medium text-green-400">{row.roi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 overflow-x-auto">
              <table className="nova-table nova-table--no-cols w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left  dark:text-white">
                    <th className="py-2 px-4">{t('Campaign Name')}</th>
                    <th className="py-2 px-4">{t('Source')}</th>
                    <th className="py-2 px-4">{t('Spend')}</th>
                    <th className="py-2 px-4">{t('Clicks')}</th>
                    <th className="py-2 px-4">{t('Conversions')}</th>
                    <th className="py-2 px-4">ROI</th>
                  </tr>
                </thead>
                <tbody className=" dark:text-white">
                  {campaignsTable.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-4">{row.name}</td>
                      <td className="py-2 px-4">{row.source}</td>
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
              
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {channelsTable.map((row, idx) => (
                  <div key={idx} className="card glass-card p-4 space-y-3 bg-white/5">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <h4 className="font-semibold text-sm">{row.platform}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted-text)] text-xs">{t('Spend')}</span>
                        <span className="text-xs font-medium">{row.spend}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted-text)] text-xs">{t('Impressions')}</span>
                        <span className="text-xs font-medium">{row.impressions}</span>
                      </div>
                      <div className="flex justify-between items-center col-span-2">
                        <span className="text-[var(--muted-text)] text-xs">{t('Conversions')}</span>
                        <span className="text-xs font-medium text-green-400">{row.conversions}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="nova-table nova-table--no-cols w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-left dark:text-white">
                      <th className="py-2 px-4">{t('Platform')}</th>
                      <th className="py-2 px-4">{t('Spend')}</th>
                      <th className="py-2 px-4">{t('Impressions')}</th>
                      <th className="py-2 px-4">{t('Conversions')}</th>
                    </tr>
                  </thead>
                  <tbody className="dark:text-white">
                    {channelsTable.map((row, idx) => (
                      <tr key={idx}>
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



          </div>
        </div>


        {/* الصف الرابع: Reporting Over Time */}
        <div className=" w-full gap-4">
          <section className="card glass-card p-4">
            <MarketingPerformance />
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
