import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function LandingPages() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  const initialRows = [
    { name: 'Landing Page', url: 'https://example.co', source: 'Meta', campaign: 'Conevecal', visitors: 140, leads: 120, conversion: '30.6%' },
    { name: 'Product Demo Page', url: 'https://google', source: 'Google', campaign: 'Spring Sale', visitors: 30, leads: 45, conversion: '14.5%' },
    { name: 'Real Estate Lead', url: 'https://man.ru', source: 'Manual', campaign: 'Somouse', visitors: 20, leads: 30, conversion: '12.5%' },
    { name: 'Webinar Signup', url: 'https://manuee', source: 'Manual', campaign: 'Summer Offer', visitors: 20, leads: 50, conversion: '13.0%' },
    { name: 'Product Pela mcre', url: 'https://example.c', source: 'Meta', campaign: 'Forris', visitors: 10, leads: 30, conversion: 'Paused' },
    { name: 'Running Ages', url: 'https://example.co', source: 'Maca', campaign: 'Google', visitors: 30, leads: 10, conversion: 'Active' },
  ]

  const [rows, setRows] = useState(initialRows)
  const [isFiltersOpen, setFiltersOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  // Filters state
  const [q, setQ] = useState('')
  const [fSource, setFSource] = useState('All')
  const [fCampaign, setFCampaign] = useState('All')
  const [fStatus, setFStatus] = useState('All')

  const sourceOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map(r => r.source)))], [rows])
  const campaignOptions = useMemo(() => ['All', ...Array.from(new Set(rows.map(r => r.campaign)))], [rows])
  const statusOptions = ['All', 'Active', 'Paused', 'Percentage']

  const visibleRows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return rows.filter(r => {
      const matchesQuery = !ql || r.name.toLowerCase().includes(ql) || r.url.toLowerCase().includes(ql)
      const matchesSource = fSource === 'All' || r.source === fSource
      const matchesCampaign = fCampaign === 'All' || r.campaign === fCampaign
      const convStr = String(r.conversion || '').toLowerCase()
      const status = convStr.includes('%') ? 'Percentage' : (convStr === 'active' ? 'Active' : (convStr === 'paused' ? 'Paused' : 'Percentage'))
      const matchesStatus = fStatus === 'All' || status === fStatus
      return matchesQuery && matchesSource && matchesCampaign && matchesStatus
    })
  }, [rows, q, fSource, fCampaign, fStatus])

  // Stats from visible rows
  const totalVisitors = useMemo(() => visibleRows.reduce((sum, r) => sum + (Number(r.visitors) || 0), 0), [visibleRows])
  const totalLeads = useMemo(() => visibleRows.reduce((sum, r) => sum + (Number(r.leads) || 0), 0), [visibleRows])
  const avgConversion = useMemo(() => {
    const pct = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0
    return `${pct.toFixed(1)}%`
  }, [totalVisitors, totalLeads])

  const handleSync = () => {
    if (syncing) return
    setSyncing(true)
    setSyncMsg('')
    setTimeout(() => {
      setRows(prev => prev.map(r => {
        const vDelta = Math.floor(Math.random() * 20) + 5
        const lDelta = Math.floor(Math.random() * 10) - 2
        const visitors = (Number(r.visitors) || 0) + vDelta
        let leads = (Number(r.leads) || 0) + Math.max(0, lDelta)
        if (leads > visitors) leads = Math.floor(visitors * 0.8)
        let conversion = `${visitors > 0 ? ((leads / visitors) * 100).toFixed(1) : '0.0'}%`
        if (r.conversion === 'Paused' || r.conversion === 'Active') conversion = r.conversion
        return { ...r, visitors, leads, conversion }
      }))
      setSyncing(false)
      setSyncMsg(t('Sync complete'))
      setTimeout(() => setSyncMsg(''), 2500)
    }, 1400)
  }

  const resetFilters = () => {
    setQ('')
    setFSource('All')
    setFCampaign('All')
    setFStatus('All')
  }

  return (
      <div className="space-y-4 bg-transparent text-[var(--content-text)] overflow-y-auto">
        {/* Page Title */}
        <h1 className="text-2xl font-bold">{t('Landing Pages')}</h1>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className={`btn btn-primary inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={() => navigate('/marketing/landing-pages/add')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{t('Add Landing Page')}</span>
          </button>
          <button className={`btn inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 12a9 9 0 10-3.28 6.92" />
                <path d="M21 12h-4" />
              </svg>
            )}
            <span>{syncing ? t('Syncing...') : t('Sync Data')}</span>
          </button>
          <button className={`btn inline-flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} onClick={() => setFiltersOpen(v => !v)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 4h18l-7 8v6l-4 2v-8z" />
            </svg>
            <span>{t('Filters')}</span>
          </button>
        </div>
        {/* Spacer row under actions */}
        <div className="spacer-row w-full">
          <div className="h-2"></div>
        </div>

        {/* Sync banner */}
        {syncMsg && (
          <div className={`card glass-card p-3 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{syncMsg}</div>
        )}
        {/* Spacer under sync banner */}
        {syncMsg && (
          <div className="spacer-row w-full">
            <div className="h-2"></div>
          </div>
        )}

        {/* Filters Panel */}
        {isFiltersOpen && (
          <section className="card glass-card p-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${isRTL ? 'text-right' : ''}`}>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)]">{t('Search')}</label>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Type to filter...')} className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)]">{t('Source')}</label>
                <select value={fSource} onChange={e => setFSource(e.target.value)} className="select">
                  {sourceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)]">{t('Campaign')}</label>
                <select value={fCampaign} onChange={e => setFCampaign(e.target.value)} className="select">
                  {campaignOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--muted-text)]">{t('Status')}</label>
                <select value={fStatus} onChange={e => setFStatus(e.target.value)} className="select">
                  {statusOptions.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                </select>
              </div>
            </div>
            <div className={`mt-4 flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button className="btn" onClick={() => setFiltersOpen(false)}>{t('Apply')}</button>
              <button className="btn" onClick={resetFilters}>{t('Reset')}</button>
              <button className="btn" onClick={() => setFiltersOpen(false)}>{t('Close')}</button>
            </div>
          </section>
        )}
        {/* Spacer under filters */}
        {isFiltersOpen && (
          <div className="spacer-row w-full">
            <div className="h-2"></div>
          </div>
        )}

        {/* Stats Card */}
        <section className="card glass-card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card glass-card p-4">
              <div className="text-sm text-[var(--muted-text)] inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="8" cy="9" r="2.5" />
              <circle cx="16" cy="9" r="2.5" />
              <path d="M3 20v-1a5 5 0 015-5h8a5 5 0 015 5v1" />
              </svg>
              <span>{t('Total Visitors')}</span>
              </div>
              <div className="text-3xl font-semibold">{totalVisitors.toLocaleString()}</div>
            </div>
            <div className="card glass-card p-4">
              <div className="text-sm text-[var(--muted-text)] inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="6" y="4" width="12" height="16" rx="2" />
              <path d="M9 12l2 2 4-4" />
              </svg>
              <span>{t('Total Leads')}</span>
              </div>
              <div className="text-3xl font-semibold">{totalLeads.toLocaleString()}</div>
            </div>
            <div className="card glass-card p-4">
              <div className="text-sm text-[var(--muted-text)] inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M3 17h18" />
              </svg>
              <span>{t('Avg. Conversion %')}</span>
              </div>
              <div className="text-3xl font-semibold">{avgConversion}</div>
            </div>
            <div className="card glass-card p-3 flex items-center justify-center">
              <svg viewBox="0 0 120 60" className="w-full h-20">
                <path d="M0 45 L10 40 L20 42 L30 36 L40 38 L50 34 L60 35 L70 30 L80 35 L90 32 L100 28 L110 30 L120 27 L120 60 L0 60 Z" fill="rgba(16,185,129,0.35)" stroke="rgba(16,185,129,0.6)" strokeWidth="1" />
                <path d="M0 50 L10 48 L20 46 L30 47 L40 44 L50 43 L60 44 L70 41 L80 39 L90 38 L100 35 L110 36 L120 37" fill="none" stroke="rgba(59,130,246,0.8)" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </section>
        {/* Spacer under stats */}
        <div className="spacer-row w-full">
          <div className="h-2"></div>
        </div>

        {/* Table */}
        <section className="card glass-card p-4 max-[550px]:p-3">
          <div className="max-[550px]:-mx-3">
            <table className="nova-table w-full table-fixed text-sm">
              <thead>
                <tr className="glass-row text-left text-gray-600 dark:text-gray-300">
                  <th className="py-2 px-4">{t('Page Name')}</th>
                  <th className="py-2 px-4">URL</th>
                  <th className="py-2 px-4">{t('Source')}</th>
                  <th className="py-2 px-4">{t('Linked Campaign')}</th>
                  <th className="py-2 px-4">{t('Visitors')}</th>
                  <th className="py-2 px-4">{t('Leads')}</th>
                  <th className="py-2 px-4">{t('Conversion %')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 dark:text-gray-100">
                {visibleRows.map((r, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="glass-row border-t border-gray-200 dark:border-gray-800">
                      <td className="py-2 px-4">{r.name}</td>
                      <td className="py-2 px-4"><a href={r.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">{r.url}</a></td>
                      <td className="py-2 px-4">{r.source}</td>
                      <td className="py-2 px-4">{r.campaign}</td>
                      <td className="py-2 px-4">{r.visitors}</td>
                      <td className="py-2 px-4">{r.leads}</td>
                      <td className="py-2 px-4">{r.conversion}</td>
                    </tr>
                    {idx < visibleRows.length - 1 && (
                      <tr className="spacer-row">
                        <td colSpan={7}>
                          <div className="h-2"></div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
  )
}
