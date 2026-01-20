import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { PieChart } from '@shared/components/PieChart'
import SearchableSelect from '@shared/components/SearchableSelect'
import { ArrowLeft, ArrowRight, Filter, User, Users, Tag, Briefcase, Calendar, Trophy, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaFileExport, FaChevronDown, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import BackButton from '../components/BackButton'
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal'
import { useTheme } from '@shared/context/ThemeProvider'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ClosedDealsReport() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isRTL = (i18n?.language || '').toLowerCase().startsWith('ar')

  const initialDeals = [
    { id: 1, leadName: 'ABC Pharma', contact: '+20 100 111 1111', value: 48000, dealType: 'New Sale', project: 'Project A', source: 'Facebook', closedDate: '2025-11-02', salesperson: 'Ahmed Ali' },
    { id: 2, leadName: 'Delta Med', contact: '+20 100 222 2222', value: 35000, dealType: 'Upsell', project: 'Project B', source: 'Website', closedDate: '2025-11-04', salesperson: 'Sara Hassan' },
    { id: 3, leadName: 'Green Labs', contact: '+20 100 333 3333', value: 60000, dealType: 'New Sale', project: 'Project A', source: 'Referral', closedDate: '2025-11-05', salesperson: 'Omar Tarek' },
    { id: 4, leadName: 'Sun Health', contact: '+20 100 444 4444', value: 42000, dealType: 'Renewal', project: 'Project C', source: 'Facebook', closedDate: '2025-11-06', salesperson: 'Ahmed Ali' },
    { id: 5, leadName: 'Medix Co.', contact: '+20 100 555 5555', value: 28000, dealType: 'New Sale', project: 'Project B', source: 'Google', closedDate: '2025-11-07', salesperson: 'Sara Hassan' },
    { id: 6, leadName: 'BioCure', contact: '+20 100 666 6666', value: 52000, dealType: 'New Sale', project: 'Project C', source: 'Website', closedDate: '2025-10-30', salesperson: 'Omar Tarek' },
    { id: 7, leadName: 'LifeChem', contact: '+20 100 777 7777', value: 31000, dealType: 'Upsell', project: 'Project A', source: 'Referral', closedDate: '2025-10-28', salesperson: 'Ahmed Ali' },
    { id: 8, leadName: 'Nova Labs', contact: '+20 100 888 8888', value: 65000, dealType: 'Renewal', project: 'Project C', source: 'Google', closedDate: '2025-10-25', salesperson: 'Mona Adel' },
    { id: 9, leadName: 'HealthPro', contact: '+20 100 999 9999', value: 47000, dealType: 'New Sale', project: 'Project A', source: 'Facebook', closedDate: '2025-11-08', salesperson: 'Ahmed Ali' },
    { id: 10, leadName: 'CarePlus', contact: '+20 101 000 0000', value: 33000, dealType: 'New Sale', project: 'Project B', source: 'Website', closedDate: '2025-11-03', salesperson: 'Mona Adel' },
  ]

  const [deals, setDeals] = useState(initialDeals)

  const salesPersonOptions = useMemo(() => {
    const set = new Set(deals.map(d => d.salesperson))
    return ['all', ...Array.from(set)]
  }, [deals])

  const managerOptions = ['all', 'Manager 1', 'Manager 2']

  const sourceOptions = useMemo(() => {
    const set = new Set(deals.map(d => d.source))
    return ['all', ...Array.from(set)]
  }, [deals])

  const projectOptions = useMemo(() => {
    const set = new Set(deals.map(d => d.project))
    return ['all', ...Array.from(set)]
  }, [deals])

  const [salesPersonFilter, setSalesPersonFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [lastActionDateFilter, setLastActionDateFilter] = useState('')
  const [closedDealDateFilter, setClosedDealDateFilter] = useState('')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  const filtered = useMemo(() => {
    return deals.filter(d => {
      const bySales = salesPersonFilter === 'all' || d.salesperson === salesPersonFilter
      const byManager = managerFilter === 'all' || managerFilter === 'Manager 1' || managerFilter === 'Manager 2'
      const bySource = sourceFilter === 'all' || d.source === sourceFilter
      const byProject = projectFilter === 'all' || d.project === projectFilter
      const byLastAction = !lastActionDateFilter ? true : d.closedDate >= lastActionDateFilter
      const byClosedDate = !closedDealDateFilter ? true : d.closedDate === closedDealDateFilter
      return bySales && byManager && bySource && byProject && byLastAction && byClosedDate
    })
  }, [deals, salesPersonFilter, managerFilter, sourceFilter, projectFilter, lastActionDateFilter, closedDealDateFilter])

  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [salesPersonFilter, managerFilter, sourceFilter, projectFilter, lastActionDateFilter, closedDealDateFilter])

  const totalDeals = filtered.length
  const pageCount = Math.ceil(totalDeals / entriesPerPage)
  const paginatedData = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const totalRevenue = filtered.reduce((sum, d) => sum + (d.value || 0), 0)
  const totalLeads = useMemo(() => {
    const set = new Set(filtered.map(d => d.leadName))
    return set.size
  }, [filtered])
  const target = 400000
  const achievedPercent = target ? Math.round((totalRevenue / target) * 100) : 0

  const closedByChannelSegments = useMemo(() => {
    const map = new Map()
    filtered.forEach(d => {
      const key = d.source || t('Unknown')
      map.set(key, (map.get(key) || 0) + 1)
    })
    const baseColors = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ef4444', '#22c55e']
    return Array.from(map.entries()).map(([label, value], idx) => ({
      label,
      value,
      color: baseColors[idx % baseColors.length]
    }))
  }, [filtered, t])

  const closedByProjectSegments = useMemo(() => {
    const map = new Map()
    filtered.forEach(d => {
      const key = d.project || t('Unknown')
      map.set(key, (map.get(key) || 0) + 1)
    })
    const baseColors = ['#8b5cf6', '#ec4899', '#10b981', '#f97316', '#3b82f6', '#22c55e']
    return Array.from(map.entries()).map(([label, value], idx) => ({
      label,
      value,
      color: baseColors[idx % baseColors.length]
    }))
  }, [filtered, t])

  const barData = useMemo(() => {
    const map = new Map()
    filtered.forEach(d => {
      map.set(d.salesperson, (map.get(d.salesperson) || 0) + d.value)
    })
    const labels = Array.from(map.keys())
    const values = Array.from(map.values())
    return {
      labels,
      datasets: [
        {
          label: t('Deal Value'),
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }
      ]
    }
  }, [filtered, t])

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: { legend: { display: false } },
    scales: {
      x: {
        title: {
          display: true,
          text: t('Sales Person')
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('Deal Value')
        }
      }
    }
  }

  const handleExportExcel = () => {
    const rows = filtered.map(d => ({
      [t('Lead Name')]: d.leadName,
      [t('Contact')]: d.contact,
      [t('Source')]: d.source,
      [t('Project')]: d.project,
      [t('Deal Type')]: d.dealType,
      [t('Deal Value')]: d.value,
      [t('Sales Person')]: d.salesperson,
      [t('Closed Deal Date')]: d.closedDate
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'ClosedDeals')
    XLSX.writeFile(wb, 'Closed_Deals_Report.xlsx')
    setShowExportMenu(false)
  }

  const handleExportPdf = () => {
    window.print()
    setShowExportMenu(false)
  }

  const handlePreview = (deal) => {
    setSelectedLead({
      id: deal.id,
      name: deal.leadName,
      phone: deal.contact,
      source: deal.source,
      status: 'qualified',
      assignedTo: deal.salesperson,
      project: deal.project
    })
    setShowLeadModal(true)
  }

  const handleDelete = (id) => {
    setDeals(prev => prev.filter(d => d.id !== id))
  }

  const clearFilters = () => {
    setSalesPersonFilter('all')
    setManagerFilter('all')
    setSourceFilter('all')
    setProjectFilter('all')
    setLastActionDateFilter('')
    setClosedDealDateFilter('')
  }

  const renderPieCard = (title, data) => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
    return (
      <div className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="text-sm font-semibold mb-2 dark:text-white text-center md:text-left">{title}</div>
        <div className="h-48 flex items-center justify-center">
          <PieChart
            segments={data}
            size={170}
            centerValue={total}
            centerLabel={t('Total')}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {data.map(segment => (
            <div key={segment.label} className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
              <span className="dark:text-white">
                {segment.label}: {segment.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-hidden min-w-0 max-w-[1600px] mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="mb-8">
        <BackButton to="/reports" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">
          {t('Welcome Reports, Closed Deals')}
        </h1>
        <p className="dark:text-white text-sm">
          {t('Analyze your closed deals performance and revenue')}
        </p>
      </div>

      <div className="backdrop-blur-md rounded-2xl shadow-sm border border-white/50 dark:border-gray-700/50 p-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 dark:text-white font-semibold">
            <Filter size={20} className="text-blue-500 dark:text-blue-400" />
            <h3>{t('Filter')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllFilters(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')}
              <FaChevronDown
                size={12}
                className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {t('Reset')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <User size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Sales Person')}
              </label>
              <SearchableSelect value={salesPersonFilter} onChange={v => setSalesPersonFilter(v)}>
                {salesPersonOptions.map(s => (
                  <option key={s} value={s}>
                    {s === 'all' ? t('All') : s}
                  </option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Users size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Manager')}
              </label>
              <SearchableSelect value={managerFilter} onChange={v => setManagerFilter(v)}>
                {managerOptions.map(m => (
                  <option key={m} value={m}>
                    {m === 'all' ? t('All') : m}
                  </option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Tag size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Source')}
              </label>
              <SearchableSelect value={sourceFilter} onChange={v => setSourceFilter(v)}>
                {sourceOptions.map(s => (
                  <option key={s} value={s}>
                    {s === 'all' ? t('All') : s}
                  </option>
                ))}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Briefcase size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Project')}
              </label>
              <SearchableSelect value={projectFilter} onChange={v => setProjectFilter(v)}>
                {projectOptions.map(p => (
                  <option key={p} value={p}>
                    {p === 'all' ? t('All') : p}
                  </option>
                ))}
              </SearchableSelect>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ease-in-out overflow-hidden ${
              showAllFilters ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Last Action Date')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={lastActionDateFilter}
                onChange={e => setLastActionDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Closed Deal Date')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={closedDealDateFilter}
                onChange={e => setClosedDealDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('Total Closed Deals'), value: totalDeals, accent: 'bg-emerald-500' },
          { label: t('Total Leads'), value: totalLeads, accent: 'bg-indigo-500' },
          { label: t('Total Revenue'), value: `${totalRevenue.toLocaleString()} EGP`, accent: 'bg-blue-500' },
          { label: t('Achieved of Target'), value: `${achievedPercent}%`, accent: 'bg-orange-500' }
        ].map(card => (
          <div
            key={card.label}
            className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex items-center justify-between"
          >
            <div>
              <div className="text-xs dark:text-white">{card.label}</div>
              <div className="text-lg font-semibold">{card.value}</div>
            </div>
            <div className={`w-8 h-8 rounded-lg ${card.accent}`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderPieCard(t('Closed Deals by Channels'), closedByChannelSegments)}
        {renderPieCard(t('Closed Deals by Project'), closedByProjectSegments)}
        <div className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Trophy size={20} />
            </div>
            <div className="text-sm font-semibold dark:text-white">{t('Deal Value for each Person')}</div>
          </div>
          <div className="flex-1 mt-2 w-full min-h-[220px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">{t('Closed Deals Overview')}</h2>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <FaFileExport />
              {t('Export')}
              <FaChevronDown
                className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`}
                size={12}
              />
            </button>
            {showExportMenu && (
              <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 w-48`}>
                <button
                  onClick={handleExportExcel}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFileExcel className="text-green-600" /> {t('Export to Excel')}
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFilePdf className="text-red-600" /> {t('Export to PDF')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 dark:bg-white/5 dark:text-white">
              <tr>
                <th className="px-4 py-3">{t('Lead Name')}</th>
                <th className="px-4 py-3">{t('Contact')}</th>
                <th className="px-4 py-3">{t('Source')}</th>
                <th className="px-4 py-3">{t('Project')}</th>
                <th className="px-4 py-3">{t('Deal Type')}</th>
                <th className="px-4 py-3 text-center">{t('Deal Value')}</th>
                <th className="px-4 py-3">{t('Sales Person')}</th>
                <th className="px-4 py-3">{t('Closed Deal Date')}</th>
                <th className="px-4 py-3 text-center">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/50">
              {paginatedData.map(deal => (
                <tr key={deal.id} className="hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium dark:text-white">{deal.leadName}</td>
                  <td className="px-4 py-3 dark:text-white">{deal.contact}</td>
                  <td className="px-4 py-3 dark:text-white">{deal.source}</td>
                  <td className="px-4 py-3 dark:text-white">{deal.project}</td>
                  <td className="px-4 py-3 dark:text-white">{deal.dealType}</td>
                  <td className="px-4 py-3 text-center font-semibold dark:text-white">{deal.value.toLocaleString()} EGP</td>
                  <td className="px-4 py-3 dark:text-white">{deal.salesperson}</td>
                  <td className="px-4 py-3 dark:text-white">{deal.closedDate}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(deal)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('Preview')}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title={t('Delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center dark:text-white">
                    {t('No closed deals found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-[var(--content-bg)]/80 border-t border-white/10 dark:border-gray-700/60 flex items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[var(--muted-text)]">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, totalDeals)}-${Math.min(currentPage * entriesPerPage, totalDeals)} من ${totalDeals}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalDeals)}-${Math.min(currentPage * entriesPerPage, totalDeals)} of ${totalDeals}`}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                title={isRTL ? 'السابق' : 'Prev'}
              >
                {isRTL ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
              <span className="text-sm whitespace-nowrap">
                {isRTL
                  ? `الصفحة ${currentPage} من ${pageCount}`
                  : `Page ${currentPage} of ${pageCount}`}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
                disabled={currentPage === pageCount}
                title={isRTL ? 'التالي' : 'Next'}
              >
                {isRTL ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[10px] sm:text-xs text-[var(--muted-text)] whitespace-nowrap">
                {isRTL ? 'لكل صفحة:' : 'Per page:'}
              </span>
              <select
                className="input w-24 text-sm py-0 px-2 h-8"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <EnhancedLeadDetailsModal
        lead={selectedLead}
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        theme={theme}
      />
    </div>
  )
}
