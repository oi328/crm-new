import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as XLSX from 'xlsx'
import { Link, useNavigate } from 'react-router-dom'
import { PieChart } from '@shared/components/PieChart'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import SearchableSelect from '@shared/components/SearchableSelect'
import { ArrowLeft, ArrowRight, Filter, User, Users, Tag, Calendar, Home, Layers, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaFileExport, FaChevronDown, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import BackButton from '../components/BackButton'
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal'
import { useTheme } from '@shared/context/ThemeProvider'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function RentReport() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const isRTL = i18n.dir() === 'rtl'

  // Mock Data matching sketch requirements
  const initialRentUnits = [
    {
      id: 1,
      property: 'Villa A1',
      clientName: 'Ahmed Hassan',
      contact: '+20 100 123 4567',
      startDate: '2025-11-01',
      endDate: '2026-10-31',
      rentAmount: 12000,
      salesPerson: 'Abdel Hamid',
      manager: 'Manager 1',
      source: 'Facebook',
      status: 'active', // active, expired, renewed
      unitType: 'Villa',
      renewed: true
    },
    {
      id: 2,
      property: 'Shop 4',
      clientName: 'Mona Said',
      contact: '+20 101 555 0000',
      startDate: '2025-11-10',
      endDate: '2026-11-09',
      rentAmount: 8000,
      salesPerson: 'Mohamed Ahmed',
      manager: 'Manager 2',
      source: 'Website',
      status: 'active',
      unitType: 'Shop',
      renewed: false
    },
    {
      id: 3,
      property: 'Office 302',
      clientName: 'Delta Group',
      contact: '+20 120 222 3333',
      startDate: '2024-09-15',
      endDate: '2025-09-14',
      rentAmount: 15000,
      salesPerson: 'Abdel Hamid',
      manager: 'Manager 1',
      source: 'Referral',
      status: 'expired',
      unitType: 'Office',
      renewed: false
    },
    {
      id: 4,
      property: 'Warehouse B2',
      clientName: 'LogiX Co.',
      contact: '+20 111 777 8888',
      startDate: '2025-08-01',
      endDate: '2026-07-31',
      rentAmount: 22000,
      salesPerson: 'Sara Ali',
      manager: 'Manager 1',
      source: 'Instagram',
      status: 'active',
      unitType: 'Warehouse',
      renewed: false
    },
    {
      id: 5,
      property: 'Apartment 5C',
      clientName: 'Yara Samir',
      contact: '+20 102 987 6543',
      startDate: '2025-12-01',
      endDate: '2026-11-30',
      rentAmount: 9000,
      salesPerson: 'Mohamed Ahmed',
      manager: 'Manager 2',
      source: 'Facebook',
      status: 'renewed',
      unitType: 'Apartment',
      renewed: true
    },
    {
      id: 6,
      property: 'Kiosk K7',
      clientName: 'Snack Hub',
      contact: '+20 103 321 0000',
      startDate: '2024-10-01',
      endDate: '2025-09-30',
      rentAmount: 4000,
      salesPerson: 'Mona Adel',
      manager: 'Manager 2',
      source: 'Google',
      status: 'expired',
      unitType: 'Kiosk',
      renewed: false
    },
    {
      id: 7,
      property: 'Studio S12',
      clientName: 'Design House',
      contact: '+20 104 888 1234',
      startDate: '2025-07-01',
      endDate: '2026-06-30',
      rentAmount: 7000,
      salesPerson: 'Abdel Hamid',
      manager: 'Manager 1',
      source: 'Referral',
      status: 'active',
      unitType: 'Studio',
      renewed: false
    },
    {
      id: 8,
      property: 'Office 101',
      clientName: 'TechMinds',
      contact: '+20 105 444 2222',
      startDate: '2025-06-01',
      endDate: '2026-05-31',
      rentAmount: 13000,
      salesPerson: 'Sara Ali',
      manager: 'Manager 1',
      source: 'Website',
      status: 'renewed',
      unitType: 'Office',
      renewed: true
    }
  ]

  const [rentUnits, setRentUnits] = useState(initialRentUnits)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  // Options for filters
  const salesPersonOptions = useMemo(() => ['all', ...Array.from(new Set(rentUnits.map(p => p.salesPerson)))], [rentUnits])
  const managerOptions = ['all', 'Manager 1', 'Manager 2']
  const sourceOptions = useMemo(() => ['all', ...Array.from(new Set(rentUnits.map(p => p.source)))], [rentUnits])
  const statusOptions = ['all', 'active', 'expired', 'renewed']
  const unitTypeOptions = useMemo(() => ['all', ...Array.from(new Set(rentUnits.map(p => p.unitType)))], [rentUnits])

  // Filter States
  const [salesPersonFilter, setSalesPersonFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [unitTypeFilter, setUnitTypeFilter] = useState('all')
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const filtered = useMemo(() => {
    return rentUnits.filter(p => {
      const bySales = salesPersonFilter === 'all' || p.salesPerson === salesPersonFilter
      const byManager = managerFilter === 'all' || p.manager === managerFilter
      const bySource = sourceFilter === 'all' || p.source === sourceFilter
      const byStatus = statusFilter === 'all' || p.status === statusFilter
      const byUnitType = unitTypeFilter === 'all' || p.unitType === unitTypeFilter
      
      const fromDate = dateFromFilter ? new Date(dateFromFilter) : null
      const toDate = dateToFilter ? new Date(dateToFilter) : null
      const startDate = new Date(p.startDate)
      
      const byDateFrom = !fromDate || startDate >= fromDate
      const byDateTo = !toDate || startDate <= toDate

      return bySales && byManager && bySource && byStatus && byUnitType && byDateFrom && byDateTo
    })
  }, [rentUnits, salesPersonFilter, managerFilter, sourceFilter, statusFilter, unitTypeFilter, dateFromFilter, dateToFilter])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [rentUnits, salesPersonFilter, managerFilter, sourceFilter, statusFilter, unitTypeFilter, dateFromFilter, dateToFilter])

  // KPI Calculations
  const totalRentUnits = filtered.length
  const pageCount = Math.ceil(totalRentUnits / entriesPerPage)
  const paginatedData = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  const activeContractsCount = filtered.filter(p => p.status === 'active' || p.status === 'renewed').length
  const expiredContractsCount = filtered.filter(p => p.status === 'expired').length
  const renewalUnitsCount = filtered.filter(p => p.renewed).length
  const totalRentAmount = filtered.reduce((sum, p) => sum + (p.rentAmount || 0), 0)

  // Chart Data
  // 1. Rent Units by Status (Pie)
  const unitsByStatusData = useMemo(() => {
    const counts = { active: 0, expired: 0, renewed: 0 }
    filtered.forEach(p => {
      if (p.status === 'renewed') counts.renewed++
      else if (p.status === 'expired') counts.expired++
      else counts.active++
    })
    return [
      { label: t('Active'), value: counts.active, color: '#10b981' },
      { label: t('Expired'), value: counts.expired, color: '#ef4444' },
      { label: t('Renewed'), value: counts.renewed, color: '#3b82f6' }
    ]
  }, [filtered, t])

  // 2. Rent Amount Overtime (Bar)
  const rentOverTimeData = useMemo(() => {
    const map = new Map()
    filtered.forEach(p => {
      const month = p.startDate.substring(0, 7) // YYYY-MM
      map.set(month, (map.get(month) || 0) + p.rentAmount)
    })
    const sortedKeys = Array.from(map.keys()).sort()
    return {
      labels: sortedKeys,
      datasets: [
        {
          label: t('Rent Amount'),
          data: sortedKeys.map(k => map.get(k)),
          backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }
      ]
    }
  }, [filtered, t])

  // 3. Expired & Renewed Contracts (Pie)
  const expiredRenewedData = useMemo(() => {
    const counts = { expired: 0, renewed: 0 }
    filtered.forEach(p => {
      if (p.status === 'expired') counts.expired++
      if (p.renewed) counts.renewed++
    })
    return [
      { label: t('Expired'), value: counts.expired, color: '#ef4444' },
      { label: t('Renewed'), value: counts.renewed, color: '#3b82f6' }
    ]
  }, [filtered, t])

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true }
    }
  }

  const handleExportExcel = () => {
    const rows = filtered.map(p => ({
      [t('Property Info')]: p.property,
      [t('Client Name')]: p.clientName,
      [t('Contact Number')]: p.contact,
      [t('Start Date')]: p.startDate,
      [t('End Date')]: p.endDate,
      [t('Rent Amount')]: p.rentAmount,
      [t('Sales Person')]: p.salesPerson
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'RentReport')
    XLSX.writeFile(wb, 'Rent_Report.xlsx')
    setShowExportMenu(false)
  }

  const handleExportPdf = () => {
    window.print()
    setShowExportMenu(false)
  }

  const handleDelete = (id) => {
    setRentUnits(prev => prev.filter(p => p.id !== id))
  }

  const handlePreview = (unit) => {
    setSelectedLead({
      id: unit.id,
      name: unit.clientName,
      phone: unit.contact,
      source: unit.source,
      status: unit.status,
      assignedTo: unit.salesPerson,
      project: unit.property // Mapping property to project for modal context
    })
    setShowLeadModal(true)
  }

  const clearFilters = () => {
    setSalesPersonFilter('all')
    setManagerFilter('all')
    setSourceFilter('all')
    setStatusFilter('all')
    setUnitTypeFilter('all')
    setDateFromFilter('')
    setDateToFilter('')
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
      <div>
        <BackButton to="/reports" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">
          {t('Welcome Reports, Rent')}
        </h1>
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
                {salesPersonOptions.map(s => <option key={s} value={s}>{s === 'all' ? t('All') : s}</option>)}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Users size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Manager')}
              </label>
              <SearchableSelect value={managerFilter} onChange={v => setManagerFilter(v)}>
                {managerOptions.map(m => <option key={m} value={m}>{m === 'all' ? t('All') : m}</option>)}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Tag size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Source')}
              </label>
              <SearchableSelect value={sourceFilter} onChange={v => setSourceFilter(v)}>
                {sourceOptions.map(s => <option key={s} value={s}>{s === 'all' ? t('All') : s}</option>)}
              </SearchableSelect>
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Layers size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Rent Status')}
              </label>
              <SearchableSelect value={statusFilter} onChange={v => setStatusFilter(v)}>
                {statusOptions.map(s => <option key={s} value={s}>{t(s.charAt(0).toUpperCase() + s.slice(1))}</option>)}
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
                {t('Date From')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={dateFromFilter}
                onChange={e => setDateFromFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Date To')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={dateToFilter}
                onChange={e => setDateToFilter(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Home size={12} className="text-blue-500 dark:text-blue-400" />
                {t('Unit Type')}
              </label>
              <SearchableSelect value={unitTypeFilter} onChange={v => setUnitTypeFilter(v)}>
                {unitTypeOptions.map(u => <option key={u} value={u}>{u === 'all' ? t('All') : u}</option>)}
              </SearchableSelect>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: t('Total Rent Units'), value: totalRentUnits, accent: 'bg-blue-500' },
          { label: t('Active Contracts'), value: activeContractsCount, accent: 'bg-emerald-500' },
          { label: t('Expired Contracts'), value: expiredContractsCount, accent: 'bg-red-500' },
          { label: t('Renewal Units'), value: renewalUnitsCount, accent: 'bg-indigo-500' },
          { label: t('Total Rent Amount'), value: `${totalRentAmount.toLocaleString()} EGP`, accent: 'bg-yellow-500' }
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
        {renderPieCard(t('Rent Units by status'), unitsByStatusData)}
        
        <div className="group relative bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-white/50 dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="text-sm font-semibold mb-4 dark:text-white">{t('Rent Amount overtime')}</div>
          <div className="h-64">
            <Bar data={rentOverTimeData} options={barOptions} />
          </div>
        </div>

        {renderPieCard(t('Expired & Renewed contracts'), expiredRenewedData)}
      </div>

      <div className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">{t('Rent Overview')}</h2>
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
                <th className="px-4 py-3">{t('Property Info')}</th>
                <th className="px-4 py-3">{t('Client Name')}</th>
                <th className="px-4 py-3">{t('Contact Number')}</th>
                <th className="px-4 py-3">{t('Start Date')}</th>
                <th className="px-4 py-3">{t('End Date')}</th>
                <th className="px-4 py-3">{t('Rent Amount')}</th>
                <th className="px-4 py-3">{t('Sales Person')}</th>
                <th className="px-4 py-3 text-center">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 dark:divide-gray-700/50">
              {paginatedData.map(unit => (
                <tr key={unit.id} className="hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium dark:text-white">{unit.property}</td>
                  <td className="px-4 py-3 dark:text-white">{unit.clientName}</td>
                  <td className="px-4 py-3 dark:text-white">{unit.contact}</td>
                  <td className="px-4 py-3 dark:text-white">{unit.startDate}</td>
                  <td className="px-4 py-3 dark:text-white">{unit.endDate}</td>
                  <td className="px-4 py-3 dark:text-white">{unit.rentAmount.toLocaleString()} EGP</td>
                  <td className="px-4 py-3 dark:text-white">{unit.salesPerson}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(unit)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title={t('Preview')}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
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
                  <td colSpan={8} className="px-4 py-8 text-center dark:text-white">
                    {t('No rent units found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-[var(--content-bg)]/80 border-t border-white/10 dark:border-gray-700/60 flex items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[var(--muted-text)]">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, totalRentUnits)}-${Math.min(currentPage * entriesPerPage, totalRentUnits)} من ${totalRentUnits}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, totalRentUnits)}-${Math.min(currentPage * entriesPerPage, totalRentUnits)} of ${totalRentUnits}`}
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
