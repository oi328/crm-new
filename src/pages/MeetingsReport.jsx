import React, { useMemo, useState } from 'react'
// Layout removed per app-level layout usage
import { useTranslation } from 'react-i18next'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { PieChart as Donut } from '@shared/components/PieChart'
import * as XLSX from 'xlsx'
import { RiFilterLine, RiBarChart2Line, RiCalendarCheckLine } from 'react-icons/ri'

export default function MeetingsReport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [activeTab, setActiveTab] = useState('Overall')

  // Demo time-series data for meetings over time
  const meetingsOverTime = useMemo(() => {
    const base = 3
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    return days.map((d, i) => ({ day: d, meetings: base + (i % 4) + (i > 3 ? 2 : 0) }))
  }, [])

  const totalMeetings = useMemo(() => meetingsOverTime.reduce((sum, d) => sum + d.meetings, 0), [meetingsOverTime])
  const totalLeads = 28 // simple demo metric to mirror screenshot

  // Demo pie segments for Channels & Projects (as in screenshots)
  const channelSegments = [
    { label: isRTL ? 'واتساب' : 'WhatsApp', value: 35, color: '#3b82f6' },
    { label: isRTL ? 'اتصالات' : 'Calls', value: 15, color: '#8b5cf6' },
  ]
  const projectSegments = [
    { label: isRTL ? 'مشروع أ' : 'Project A', value: 30, color: '#3b82f6' },
    { label: isRTL ? 'مشروع ب' : 'Project B', value: 15, color: '#8b5cf6' },
  ]

  // Leaderboard sample data
  const bestEmployees = [
    { name: 'Alaa Mahamed', score: 7 },
    { name: 'Mariam Salama', score: 6 },
    { name: 'Mohamed Osama', score: 6 },
    { name: 'Eman Anwar', score: 6 },
    { name: 'Mohamed Mostafa', score: 5 },
  ]

  const TabButton = ({ label, icon }) => (
    <button
      className={`px-5 py-2 rounded-md text-sm font-semibold transition-all inline-flex items-center gap-2 ${activeTab === label ? 'bg-primary text-white shadow-lg ring-1 ring-primary/50' : 'btn-glass'}`}
      onClick={() => setActiveTab(label)}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span>{label}</span>
    </button>
  )

  const SectionHeader = ({ title, desc, icon }) => (
    <div className="flex items-center justify-between mb-2">
      <div className={`flex items-center gap-2`}>
        <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className={`${isRTL ? 'text-right' : ''} text-lg font-semibold`}>{title}</h3>
      </div>
      {desc && <div className="text-sm text-[var(--muted-text)]">{desc}</div>}
    </div>
  )

  const MetricCard = ({ title, value, icon }) => (
    <div className="glass-panel rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="inline-flex items-center gap-2">
          {icon && <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">{icon}</span>}
          <span className="text-sm text-[var(--muted-text)]">{title}</span>
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )

  // Overall data list demo
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState({ key: 'name', dir: 'asc' })
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState({ salesman: '', project: '', dateFrom: '', dateTo: '' })
  const [selectedKeys, setSelectedKeys] = useState([])
  // Demo meetings status dataset for Arrange/Done counts
  const meetingsStatusData = useMemo(() => ([
    { date: '2025-11-01', status: 'arranged' },
    { date: '2025-11-02', status: 'arranged' },
    { date: '2025-11-03', status: 'done' },
    { date: '2025-11-04', status: 'arranged' },
    { date: '2025-11-05', status: 'done' },
    { date: '2025-11-06', status: 'done' },
    { date: '2025-11-07', status: 'arranged' },
  ]), [])
  const dateInRange = (d) => {
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null
    const to = filters.dateTo ? new Date(filters.dateTo) : null
    const cur = new Date(d)
    const fromOk = from ? cur >= from : true
    const toOk = to ? cur <= to : true
    return fromOk && toOk
  }
  const arrangedCount = useMemo(() => meetingsStatusData.filter(m => m.status === 'arranged' && dateInRange(m.date)).length, [meetingsStatusData, filters])
  const doneCount = useMemo(() => meetingsStatusData.filter(m => m.status === 'done' && dateInRange(m.date)).length, [meetingsStatusData, filters])
  const exportMeetingsStatus = () => {
    const rows = meetingsStatusData.filter(m => dateInRange(m.date))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'MeetingsStatus')
    XLSX.writeFile(wb, 'meetings_status.xlsx')
  }
  const overallRows = useMemo(() => ([
    { date: '2025-11-01', name: 'Abdullah Saleh', mobile: '1004******', meetings: 1, project: 'Crown Medical Center', salesman: 'Mohamed' },
    { date: '2025-11-01', name: 'دينا', mobile: '1095******', meetings: 1, project: 'Crown Medical Center', salesman: 'Mohamed' },
    { date: '2025-11-02', name: 'Mohamed Zayed', mobile: '1012******', meetings: 1, project: 'Crown Plaza Mall', salesman: 'Mohamed' },
    { date: '2025-11-02', name: 'جمال', mobile: '1094******', meetings: 1, project: 'Crown Plaza Mall', salesman: 'Mina M' },
    { date: '2025-11-03', name: 'ayman Shafie', mobile: '1033******', meetings: 1, project: 'Crown Medical Center', salesman: 'Eman A' },
    { date: '2025-11-03', name: 'Shady', mobile: '1005******', meetings: 1, project: 'Crown Plaza Mall', salesman: 'Eman A' },
    { date: '2025-11-04', name: 'سيف محمد', mobile: '1147128208', meetings: 1, project: 'Crown Plaza Mall', salesman: 'Mohamed' },
    { date: '2025-11-04', name: 'Rawan Ahmed', mobile: '1006******', meetings: 2, project: 'Crown Medical Center', salesman: 'Hossam' },
    { date: '2025-11-05', name: 'Layla Saad', mobile: '1011******', meetings: 1, project: 'Crown Plaza Mall', salesman: 'Khaled' },
    { date: '2025-11-06', name: 'Omar Nabil', mobile: '1009******', meetings: 3, project: 'Crown Medical Center', salesman: 'Nour' },
    { date: '2025-11-06', name: 'Heba Adel', mobile: '1010******', meetings: 1, project: 'Crown Medical Center', salesman: 'Mariam' },
  ]), [])
  const filteredRows = useMemo(() => {
    return overallRows.filter(r => {
      const salesmanOk = filters.salesman ? String(r.salesman).toLowerCase().includes(String(filters.salesman).toLowerCase().trim()) : true
      const projectOk = filters.project ? String(r.project).toLowerCase().includes(String(filters.project).toLowerCase().trim()) : true
      const fromOk = filters.dateFrom ? r.date >= filters.dateFrom : true
      const toOk = filters.dateTo ? r.date <= filters.dateTo : true
      const dateOk = fromOk && toOk
      return salesmanOk && projectOk && dateOk
    })
  }, [overallRows, filters])

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows]
    rows.sort((a, b) => {
      const av = a[sortBy.key]
      const bv = b[sortBy.key]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortBy.dir === 'asc' ? av - bv : bv - av
      }
      return sortBy.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return rows
  }, [filteredRows, sortBy])
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / entriesPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return sortedRows.slice(start, start + entriesPerPage)
  }, [sortedRows, currentPage, entriesPerPage])

  const rowKey = (r) => `${r.name}|${r.mobile}`
  const allSelected = useMemo(() => paginatedRows.length > 0 && paginatedRows.every(r => selectedKeys.includes(rowKey(r))), [paginatedRows, selectedKeys])
  const toggleSelectAll = (checked) => {
    const pageKeys = paginatedRows.map(rowKey)
    if (checked) {
      setSelectedKeys(prev => Array.from(new Set([...prev, ...pageKeys])))
    } else {
      setSelectedKeys(prev => prev.filter(k => !pageKeys.includes(k)))
    }
  }

  const toggleSort = (key) => setSortBy((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  const exportList = () => {
    const ws = XLSX.utils.json_to_sheet(sortedRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Meetings')
    XLSX.writeFile(wb, 'meetings_list.xlsx')
  }

  // Checkin tab sample
  const [range, setRange] = useState('Day')
  const checkinLeaderboard = [
    { name: 'Amany Gamal', score: 1 },
  ]
  const checkins = [
    { salesman: 'Amany Gamal', date: '11-01-2024 06:02 PM', location: '#' },
  ]
  const filteredCheckins = useMemo(() => {
    return checkins.filter(c => {
      const salesmanOk = filters.salesman ? String(c.salesman).toLowerCase().includes(String(filters.salesman).toLowerCase()) : true
      // crude date filter using string compare; for demo only
      const df = filters.dateFrom ? filters.dateFrom : ''
      const dt = filters.dateTo ? filters.dateTo : ''
      const dateStr = c.date?.split(' ')[0] || '' // assume DD-MM-YYYY
      const swapToISO = (d) => d ? d.split('-').reverse().join('-') : '' // to YYYY-MM-DD
      const dateISO = swapToISO(dateStr)
      const fromISO = swapToISO(df)
      const toISO = swapToISO(dt)
      const dateOk = (fromISO ? dateISO >= fromISO : true) && (toISO ? dateISO <= toISO : true)
      return salesmanOk && dateOk
    })
  }, [checkins, filters])

  return (
    <>
      <div className="space-y-4">
        {/* Page title + actions */}
        <div className="flex items-center justify-between relative">
          <h1 className="text-2xl font-semibold">{t('Meetings Report')}</h1>
          <button onClick={() => setShowFilter(s => !s)} className="btn btn-glass inline-flex items-center gap-2">
            <RiFilterLine className="text-base" />
            <span>{t('Filter')}</span>
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 z-20 glass-panel rounded-xl p-4 w-80 shadow-lg">
              <div className="text-sm font-semibold mb-2">{t('Filter Data')}</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="text-xs mb-1 block">{t('Sales Person')}</label>
                  <input value={filters.salesman} onChange={(e)=>setFilters(f=>({...f, salesman: e.target.value}))} className="input w-full text-sm" placeholder={t('Type name')} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs mb-1 block">{t('Project')}</label>
                  <input value={filters.project} onChange={(e)=>setFilters(f=>({...f, project: e.target.value}))} className="input w-full text-sm" placeholder={t('Type project')} />
                </div>
                <div>
                  <label className="text-xs mb-1 block">{t('From Date')}</label>
                  <input type="date" lang={isRTL ? 'ar' : 'en'} dir={isRTL ? 'rtl' : 'ltr'} placeholder={isRTL ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={filters.dateFrom} onChange={(e)=>setFilters(f=>({...f, dateFrom: e.target.value}))} className="input w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs mb-1 block">{t('To Date')}</label>
                  <input type="date" lang={isRTL ? 'ar' : 'en'} dir={isRTL ? 'rtl' : 'ltr'} placeholder={isRTL ? 'اليوم/الشهر/السنة' : 'mm/dd/yyyy'} value={filters.dateTo} onChange={(e)=>setFilters(f=>({...f, dateTo: e.target.value}))} className="input w-full text-sm" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button className="btn btn-glass" onClick={()=>setFilters({ salesman:'', project:'', dateFrom:'', dateTo:'' })}>{t('Clear')}</button>
                <button className="btn bg-primary text-white" onClick={()=>setShowFilter(false)}>{t('Apply')}</button>
              </div>
            </div>
          )}
        </div>
        <div className="text-sm text-[var(--muted-text)]">{t('reports.meetings.desc')}</div>

        {/* Empty row above tabs */}
        <div className="h-3" />
        {/* Tabs */}
        <div className="flex items-center gap-3 mt-2">
          <TabButton label="Overall" icon={<RiBarChart2Line />} />
          <TabButton label="Checkin" icon={<RiCalendarCheckLine />} />
        </div>
        {/* Empty row below tabs */}
        <div className="h-3" />

        {/* Content */}
        {activeTab === 'Overall' && (
          <div className="space-y-4">
            {/* Chart + metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Chart */}
              <div className="glass-panel rounded-xl p-4 lg:col-span-2">
                <SectionHeader title={isRTL ? 'الاجتماعات عبر الزمن' : 'Meeting Over time'} />
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={meetingsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#111827', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#111827', fontWeight: 'bold', marginBottom: '0.25rem' }}
                      />
                      <Line type="monotone" dataKey="meetings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 gap-4">
                <MetricCard title={isRTL ? 'إجمالي الاجتماعات' : 'Total Of Meetings'} value={totalMeetings} icon={'⚡'} />
                <MetricCard title={isRTL ? 'إجمالي العملاء المحتملين' : 'Total Of Leads'} value={totalLeads} icon={'👥'} />
                <MetricCard title={isRTL ? 'عدد ال Arrange Meetings' : 'Arrange Meetings Count'} value={arrangedCount} icon={'📅'} />
                <MetricCard title={isRTL ? 'عدد ال Done Meetings' : 'Done Meetings Count'} value={doneCount} icon={'✅'} />
              </div>
            </div>

            {/* Channels / Projects / Best */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Channels */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{isRTL ? 'القنوات' : 'Channels'}</h3>
                <div className="flex items-center justify-center h-48">
                  <Donut segments={channelSegments} centerValue={channelSegments.reduce((s,v)=>s+v.value,0)} centerLabel={isRTL ? 'الإجمالي' : 'Total'} size={180} />
                </div>
              </div>
              {/* Projects */}
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{isRTL ? 'المشاريع' : 'Projects'}</h3>
                <div className="flex items-center justify-center h-48">
                  <Donut segments={projectSegments} centerValue={projectSegments.reduce((s,v)=>s+v.value,0)} centerLabel={isRTL ? 'الإجمالي' : 'Total'} size={180} />
                </div>
              </div>
              {/* The Best leaderboard */}
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{isRTL ? 'الأفضل' : 'The Best'}</h3>
                  <button className="btn-glass px-2 py-1 rounded-md text-xs">All ▾</button>
                </div>
                <div className="space-y-2">
                  {bestEmployees.map((e, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${idx===0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-transparent'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">{idx+1}</div>
                        <div className="text-sm">{e.name}</div>
                      </div>
                      <div className="text-sm font-semibold">{e.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data list placeholder */}
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{isRTL ? 'قائمة البيانات' : 'Data List'}</h3>
                <button onClick={exportList} className="btn btn-glass">{isRTL ? 'تصدير القائمة' : 'Export List'}</button>
              </div>
              <div className="text-sm text-[var(--muted-text)] mb-3">{isRTL ? 'أدِر أعضاء فريقك وصلاحيات حساباتهم هنا.' : 'Manage your team members and their account permissions here.'}</div>

              {/* Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          aria-label="select all"
                          checked={allSelected}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('name')}>{isRTL ? 'ليد' : 'Lead'} {sortBy.key==='name' ? (sortBy.dir==='asc' ? '↑' : '↓') : ''}</th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('mobile')}>{isRTL ? 'الجوال' : 'Mobile'} {sortBy.key==='mobile' ? (sortBy.dir==='asc' ? '↑' : '↓') : ''}</th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('meetings')}>{isRTL ? 'عدد الاجتماعات' : 'Number Of Meetings'} {sortBy.key==='meetings' ? (sortBy.dir==='asc' ? '↑' : '↓') : ''}</th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('project')}>{isRTL ? 'المشروع' : 'Project'} {sortBy.key==='project' ? (sortBy.dir==='asc' ? '↑' : '↓') : ''}</th>
                      <th className="px-3 py-2 text-left cursor-pointer" onClick={() => toggleSort('salesman')}>{isRTL ? 'المبيعات' : 'Sales Person'} {sortBy.key==='salesman' ? (sortBy.dir==='asc' ? '↑' : '↓') : ''}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="border-t">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              aria-label="select row"
                              checked={selectedKeys.includes(rowKey(row))}
                              onChange={(e) => {
                                const k = rowKey(row)
                                setSelectedKeys(prev => e.target.checked ? Array.from(new Set([...prev, k])) : prev.filter(x => x !== k))
                              }}
                            />
                          </td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.mobile}</td>
                          <td className="px-3 py-2">{row.meetings}</td>
                          <td className="px-3 py-2">{row.project}</td>
                          <td className="px-3 py-2">{row.salesman}</td>
                        </tr>
                        {idx !== paginatedRows.length - 1 && (
                          <tr>
                            <td colSpan={6}><div className="h-2"></div></td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-[var(--muted-text)]">{isRTL ? 'لا توجد بيانات' : 'No data found'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {paginatedRows.length === 0 && (
                  <div className="text-center py-6 text-[var(--muted-text)]">{isRTL ? 'لا توجد بيانات' : 'No data found'}</div>
                )}
                {paginatedRows.map((row, idx) => (
                  <div key={idx} className="card glass-card p-4 space-y-3 bg-white/5 border border-gray-800 rounded-lg">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          aria-label="select row"
                          checked={selectedKeys.includes(rowKey(row))}
                          onChange={(e) => {
                            const k = rowKey(row)
                            setSelectedKeys(prev => e.target.checked ? Array.from(new Set([...prev, k])) : prev.filter(x => x !== k))
                          }}
                        />
                        <h4 className="font-semibold text-sm">{row.name}</h4>
                      </div>
                      <span className="text-xs text-[var(--muted-text)]">{row.mobile}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'عدد الاجتماعات' : 'Number Of Meetings'}</span>
                        <span className="text-xs">{row.meetings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'المشروع' : 'Project'}</span>
                        <span className="text-xs">{row.project}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'المبيعات' : 'Sales Person'}</span>
                        <span className="text-xs">{row.salesman}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination footer */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <label>{isRTL ? 'عرض' : 'Show Entries'}</label>
                  <select value={entriesPerPage} onChange={(e)=>{setEntriesPerPage(Number(e.target.value)); setCurrentPage(1)}} className="input text-sm">
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} className="btn btn-glass">{isRTL ? 'السابق' : 'Previous'}</button>
                  <div className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-sm">{currentPage}</div>
                  <button disabled={currentPage===pageCount} onClick={()=>setCurrentPage(p=>Math.min(pageCount,p+1))} className="btn btn-glass">{isRTL ? 'التالي' : 'Next'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Checkin' && (
          <div className="space-y-4">
            {/* Checkin header + time range */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-lg font-semibold">{isRTL ? 'تسجيل الوصول' : 'Check In'}</h3>
              <div className="text-sm text-[var(--muted-text)] mb-3">{isRTL ? 'أدِر أعضاء فريقك وصلاحياتهم هنا.' : 'Manage your team members and their account permissions here.'}</div>
              <div className="flex items-center gap-3">
                {['Day','Weekly','Monthly','Year'].map((r) => (
                  <button key={r} onClick={()=>setRange(r)} className={`px-3 py-1 rounded-md text-sm ${range===r ? 'bg-primary text-white' : 'btn-glass'}`}>{isRTL ? ({Day:'يومي',Weekly:'أسبوعي',Monthly:'شهري',Year:'سنوي'}[r]) : r}</button>
                ))}
              </div>
              <div className="h-56 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={meetingsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="meetings" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {/* Data List */}
                <div className="glass-panel rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-2">{isRTL ? 'قائمة البيانات' : 'Data List'}</h3>
                  <div className="text-sm text-[var(--muted-text)] mb-3">{isRTL ? 'أدِر أعضاء فريقك وصلاحياتهم هنا.' : 'Manage your team members and their account permissions here.'}</div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left"><input type="checkbox" aria-label="select all" /></th>
                          <th className="px-3 py-2 text-left">{isRTL ? 'مندوب المبيعات' : 'Sales Person'}</th>
                          <th className="px-3 py-2 text-left">{isRTL ? 'تاريخ تسجيل الوصول' : 'Check In Date'}</th>
                          <th className="px-3 py-2 text-left">{isRTL ? 'الموقع' : 'Location'}</th>
                        </tr>
                      </thead>
                      <tbody>
                    {filteredCheckins.map((c, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="border-t">
                          <td className="px-3 py-2"><input type="checkbox" aria-label="select row" /></td>
                          <td className="px-3 py-2">{c.salesman}</td>
                          <td className="px-3 py-2">{c.date}</td>
                          <td className="px-3 py-2"><a href={c.location} className="text-primary">{isRTL ? 'الموقع' : 'Location'}</a></td>
                        </tr>
                        {idx !== filteredCheckins.length - 1 && (
                          <tr>
                            <td colSpan={4} className="py-2" />
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">{isRTL ? 'عرض 1' : 'Show Entries 1'}</div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-glass" disabled>Previous</button>
                      <div className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-sm">1</div>
                      <button className="btn btn-glass" disabled>Next</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{isRTL ? 'الأفضل' : 'The Best'}</h3>
                  <button className="btn-glass px-2 py-1 rounded-md text-xs">All ▾</button>
                </div>
                <div className="space-y-2">
                  {checkinLeaderboard.map((e, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${idx===0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-transparent'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">{idx+1}</div>
                        <div className="text-sm">{e.name}</div>
                      </div>
                      <div className="text-sm font-semibold">{e.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
