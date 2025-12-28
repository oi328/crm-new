import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FunnelChart from './FunnelChart'

const normalize = (s) => String(s || '').trim().toLowerCase()

const SalesLeads = ({ leads = [] }) => {
  const { t } = useTranslation()

  // Source filter
  const sources = useMemo(() => ['All', ...Array.from(new Set(leads.map(l => l.source).filter(Boolean)))], [leads])
  const [source, setSource] = useState('All')
  const filtered = useMemo(() => source === 'All' ? leads : leads.filter(l => l.source === source), [leads, source])

  // Stage counts for funnel visualization
  const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'closed']
  const stageCounts = useMemo(() => {
    const map = Object.fromEntries(stageOrder.map(s => [s, 0]))
    filtered.forEach(l => {
      const key = normalize(l.stage)
      if (key in map) map[key] = (map[key] || 0) + 1
    })
    return map
  }, [filtered])

  const totalLeads = filtered.length
  const qualified = stageCounts.qualified || 0
  const closed = stageCounts.closed || 0
  const lost = filtered.filter(l => normalize(l.status) === 'lost').length
  const conversionPct = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0
  const qualifiedPct = totalLeads > 0 ? Math.round((qualified / totalLeads) * 100) : 0
  const avgResponseTimeHrs = useMemo(() => {
    // Approximate: time between createdAt and lastContact if available
    const times = filtered.map(l => {
      const c = l.createdAt ? new Date(l.createdAt).getTime() : null
      const lc = l.lastContact ? new Date(l.lastContact).getTime() : null
      if (!c || !lc) return null
      return Math.max(0, (lc - c) / (1000 * 60 * 60))
    }).filter(v => v != null)
    if (times.length === 0) return 0
    const avg = times.reduce((s, v) => s + v, 0) / times.length
    return Math.round(avg)
  }, [filtered])

  // Top-performing source (by closed leads)
  const topSource = useMemo(() => {
    const map = {}
    filtered.forEach(l => {
      const s = l.source || 'Unknown'
      if (!map[s]) map[s] = { total: 0, closed: 0 }
      map[s].total += 1
      if (normalize(l.stage) === 'closed') map[s].closed += 1
    })
    const entries = Object.entries(map)
    if (entries.length === 0) return null
    entries.sort((a, b) => b[1].closed - a[1].closed)
    const [name, stats] = entries[0]
    return { name, stats }
  }, [filtered])

  // Lead details modal
  const [showModal, setShowModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const openLead = (l) => { setSelectedLead(l); setShowModal(true) }

  return (
    <div className="space-y-6 my-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('Sales Leads Overview')}</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">{t('Source')}</label>
          <select value={source} onChange={e => setSource(e.target.value)} className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100">
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Funnel Visualization */}
      <FunnelChart
        stages={[
          { key: 'new', label: t('New'), value: stageCounts.new },
          { key: 'contacted', label: t('Contacted'), value: stageCounts.contacted },
          { key: 'qualified', label: t('Qualified'), value: stageCounts.qualified },
          { key: 'proposal', label: t('Proposal'), value: stageCounts.proposal },
          { key: 'closed', label: t('Closed'), value: stageCounts.closed },
        ]}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Total Leads')}</div>
          <div className="text-2xl font-bold text-green-400">{totalLeads}</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Qualified Leads %')}</div>
          <div className="text-2xl font-bold text-green-400">{qualifiedPct}%</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Average Response Time')}</div>
          <div className="text-2xl font-bold text-green-400">{avgResponseTimeHrs}h</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Conversion Rate')}</div>
          <div className="text-2xl font-bold text-green-400">{conversionPct}%</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Lost Leads')}</div>
          <div className="text-2xl font-bold text-green-400">{lost}</div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-lg border border-gray-800 bg-[#0b1220] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-3 py-2 text-left">{t('Name')}</th>
              <th className="px-3 py-2 text-left">{t('Phone')}</th>
              <th className="px-3 py-2 text-left">{t('Source')}</th>
              <th className="px-3 py-2 text-left">{t('Stage')}</th>
              <th className="px-3 py-2 text-left">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, idx) => (
              <tr key={idx} className="border-t border-gray-800">
                <td className="px-3 py-2">{l.name||'-'}</td>
                <td className="px-3 py-2">{l.phone||'-'}</td>
                <td className="px-3 py-2">{l.source||'-'}</td>
                <td className="px-3 py-2">{l.stage||'-'}</td>
                <td className="px-3 py-2">
                  <button className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition text-xs" onClick={() => openLead(l)}>
                    {t('View Lead Details')}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="px-3 py-3 text-center text-[var(--muted-text)]" colSpan={5}>{t('No leads')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top Source */}
      <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{t('Top-performing Source')}</h3>
          <span className="text-xs text-gray-400">{t('Based on closed leads')}</span>
        </div>
        {topSource ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded-md border border-gray-700 bg-gray-800">{topSource.name}</span>
            <span className="text-[var(--muted-text)]">{t('Closed')}:</span>
            <span className="font-semibold text-green-400">{topSource.stats.closed}</span>
            <span className="text-[var(--muted-text)]">{t('Total')}:</span>
            <span className="font-semibold">{topSource.stats.total}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-400">{t('No source data')}</div>
        )}
      </div>

      {/* Lead Details Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-[#0b1220] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{t('Lead Details')}</h3>
              <button className="px-2 py-1 rounded-md border border-gray-700 hover:bg-gray-800" onClick={() => setShowModal(false)}>{t('Close')}</button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-[var(--muted-text)]">{t('Name')}:</span> <span className="font-semibold">{selectedLead.name}</span></div>
              <div><span className="text-[var(--muted-text)]">{t('Phone')}:</span> <span>{selectedLead.phone}</span></div>
              <div><span className="text-[var(--muted-text)]">{t('Source')}:</span> <span>{selectedLead.source}</span></div>
              <div><span className="text-[var(--muted-text)]">{t('Stage')}:</span> <span>{selectedLead.stage}</span></div>
              {selectedLead.lastContact && (
                <div><span className="text-[var(--muted-text)]">{t('Last Contact')}:</span> <span>{new Date(selectedLead.lastContact).toLocaleString()}</span></div>
              )}
              {selectedLead.createdAt && (
                <div><span className="text-[var(--muted-text)]">{t('Created At')}:</span> <span>{new Date(selectedLead.createdAt).toLocaleString()}</span></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesLeads