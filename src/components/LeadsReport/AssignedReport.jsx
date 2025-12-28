import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuEye } from 'react-icons/lu'
import { PieChart } from '@shared/components/PieChart'

const normalize = (s) => String(s || '').trim().toLowerCase()

const AssignedReport = ({ leads = [], onExport, filters = {}, setFilters }) => {
  const { t } = useTranslation()

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })
  const filtered = leads.filter(l => {
    const byManager = !filters.manager || (l.manager||'').toLowerCase().includes(filters.manager.toLowerCase())
    const byEmployee = !filters.employee || (l.employee||'').toLowerCase().includes(filters.employee.toLowerCase())
    const byStart = !filters.startDate || new Date(l.date||0) >= new Date(filters.startDate)
    const byEnd = !filters.endDate || new Date(l.date||0) <= new Date(filters.endDate)
    return byManager && byEmployee && byStart && byEnd
  })

  // Aggregations
  const bySalesperson = useMemo(() => {
    const map = {}
    filtered.forEach(l => {
      const sp = l.employee || 'Unassigned'
      if (!map[sp]) map[sp] = { total: 0, closed: 0, inProgress: 0, dept: l.manager || '-' }
      map[sp].total += 1
      const stageKey = normalize(l.stage || l.status)
      if (stageKey === 'closed' || stageKey === 'converted') map[sp].closed += 1
      else map[sp].inProgress += 1
    })
    return map
  }, [filtered])

  const totalAssigned = filtered.length
  const totalClosed = Object.values(bySalesperson).reduce((s, v) => s + v.closed, 0)
  const teamAvgConversion = useMemo(() => {
    const entries = Object.values(bySalesperson)
    if (!entries.length) return 0
    const avg = entries.reduce((s, v) => s + (v.total ? (v.closed / v.total) * 100 : 0), 0) / entries.length
    return Math.round(avg)
  }, [bySalesperson])

  // Sorting
  const [sort, setSort] = useState({ key: 'total', dir: 'desc' })
  const sortRows = (rows) => {
    const { key, dir } = sort
    const factor = dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
      return String(av).localeCompare(String(bv)) * factor
    })
  }

  const rows = useMemo(() => {
    const base = Object.entries(bySalesperson).map(([name, stats]) => ({
      name,
      dept: stats.dept,
      total: stats.total,
      inProgress: stats.inProgress,
      closed: stats.closed,
      conversion: stats.total ? Math.round((stats.closed / stats.total) * 100) : 0,
    }))
    return sortRows(base)
  }, [bySalesperson, sort])

  // Pie chart segments
  const segments = useMemo(() => {
    const total = rows.reduce((s, r) => s + r.total, 0)
    return rows.map(r => ({ label: r.name, value: r.total, color: undefined }))
  }, [rows])

  // UI
  return (
    <div className="space-y-6 my-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('Assigned Leads Report')}</h2>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition" onClick={onExport}>{t('Export')}</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input name="manager" className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100" placeholder={t('Manager')} value={filters.manager||''} onChange={onChange} />
        <input name="employee" className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100" placeholder={t('Salesperson')} value={filters.employee||''} onChange={onChange} />
        <input name="startDate" type="date" className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100" value={filters.startDate||''} onChange={onChange} />
        <input name="endDate" type="date" className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100" value={filters.endDate||''} onChange={onChange} />
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition" onClick={onExport}>{t('Export')}</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Total Assigned Leads')}</div>
          <div className="text-2xl font-bold text-green-400">{totalAssigned}</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Total Closed')}</div>
          <div className="text-2xl font-bold text-green-400">{totalClosed}</div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="text-sm text-gray-400">{t('Team Average Conversion %')}</div>
          <div className="text-2xl font-bold text-green-400">{teamAvgConversion}%</div>
        </div>
      </div>

      {/* Table + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{t('Team Distribution')}</h3>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-800">
                  {[
                    { key: 'name', label: t('Salesperson Name') },
                    { key: 'dept', label: t('Department / Region') },
                    { key: 'total', label: t('Total Leads Assigned') },
                    { key: 'inProgress', label: t('Leads in Progress') },
                    { key: 'closed', label: t('Leads Closed') },
                    { key: 'conversion', label: t('Conversion %') },
                  ].map((col) => (
                    <th key={col.key} className="px-3 py-2">
                      <button
                        className="inline-flex items-center gap-1 text-gray-200 hover:text-white"
                        onClick={() => setSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' }))}
                        title={t('Sort')}
                      >
                        {col.label}
                      </button>
                    </th>
                  ))}
                  <th className="px-3 py-2">{t('Details')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-800 hover:bg-gray-900">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.dept}</td>
                    <td className="px-3 py-2 text-right">{r.total}</td>
                    <td className="px-3 py-2 text-right">{r.inProgress}</td>
                    <td className="px-3 py-2 text-right">{r.closed}</td>
                    <td className="px-3 py-2 text-right">{r.conversion}%</td>
                    <td className="px-3 py-2">
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition text-xs" title={t('View Details')}>
                        <LuEye className="text-gray-200" />
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td className="px-3 py-3 text-center text-[var(--muted-text)]" colSpan={7}>{t('No data')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 md:p-6 rounded-xl border border-gray-800 bg-[#0b1220]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{t('Leads per Salesperson')}</h3>
          </div>
          <div className="flex items-center justify-center">
            <PieChart segments={segments} size={220} cutout={70} centerValue={rows.reduce((s, r) => s + r.total, 0)} centerLabel={t('Leads')} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignedReport
