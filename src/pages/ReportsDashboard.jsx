import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import SearchableSelect from '@shared/components/SearchableSelect'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const fmtEGP = (n) => new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(n)

const ReportsDashboard = () => {
  const { t } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  // Filters state
  const [dateMode, setDateMode] = useState('month') // day | week | month | range
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedManager, setSelectedManager] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All') // All | Success | Failed | Active | Expired | Checked-in | No-show
  const [query, setQuery] = useState('')

  const departments = ['All', 'Sales', 'Operations', 'Marketing', 'Inventory']
  const managers = ['All', 'Ahmed Ali', 'Sara Hassan']

  // Mock data aggregates per module (for demo)
  const [modules] = useState(() => [
    { key: 'campaign_summary', name: 'Campaign Summary Overview', route: '/marketing/reports/campaign-summary', revenue: 210000, leads: 320, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Marketing', manager: 'Sara Hassan', status: 'Active' },
    { key: 'cost_vs_revenue', name: 'Cost vs Revenue', route: '/marketing/reports/cost-vs-revenue', revenue: 420000, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Marketing', manager: 'Sara Hassan', status: 'Active' },
    { key: 'monthly_marketing', name: 'Monthly Marketing Overview', route: '/marketing/reports/monthly-overview', revenue: 180000, leads: 240, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Marketing', manager: 'Sara Hassan', status: 'Active' },
    { key: 'sales_activities', name: 'Sales Activities Report', route: '/reports/sales/activities', revenue: 310000, leads: 0, actions: 1250, importsSuccess: 0, exportsSuccess: 0, dept: 'Sales', manager: 'Ahmed Ali', status: 'Active' },
    { key: 'pipeline', name: 'Leads Pipeline Report', route: '/reports/sales/pipeline', revenue: 530000, leads: 540, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Sales', manager: 'Ahmed Ali', status: 'Active' },
    { key: 'closed_deals', name: 'Closed Deals Report', route: '/reports/sales/closed-deals', revenue: 260000, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Sales', manager: 'Ahmed Ali', status: 'Active' },
    { key: 'reservations', name: 'Reservations Report', route: '/reports/sales/reservations', revenue: 145000, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Sales', manager: 'Ahmed Ali', status: 'Active' },
    { key: 'customers', name: 'Customers Report', route: '/reports/sales/customers', revenue: 195000, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Sales', manager: 'Ahmed Ali', status: 'Active' },
    { key: 'imports', name: 'Imports Report', route: '/reports/sales/imports', revenue: 0, leads: 0, actions: 0, importsSuccess: 38, exportsSuccess: 0, dept: 'Operations', manager: 'Sara Hassan', status: 'Success' },
    { key: 'exports', name: 'Exports Report', route: '/reports/sales/exports', revenue: 0, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 41, dept: 'Operations', manager: 'Sara Hassan', status: 'Success' },
    { key: 'rent', name: 'Rent Report', route: '/reports/sales/rent', revenue: 87000, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Operations', manager: 'Sara Hassan', status: 'Active' },
    { key: 'check_in', name: 'Check-in Report', route: '/reports/sales/check-in', revenue: 0, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Operations', manager: 'Sara Hassan', status: 'Checked-in' },
    { key: 'team_performance', name: 'Team Performance Report', route: '/reports/team', revenue: 0, leads: 0, actions: 0, importsSuccess: 0, exportsSuccess: 0, dept: 'Sales', manager: 'Ahmed Ali', status: 'Active' },
  ])

  // Date range helper (demo: we won’t filter by date on mock aggregates, but wire UI)
  const datePass = () => true

  const filteredModules = useMemo(() => {
    return modules.filter(m =>
      datePass() &&
      (selectedDept === 'All' || m.dept === selectedDept) &&
      (selectedManager === 'All' || m.manager === selectedManager) &&
      (statusFilter === 'All' || m.status === statusFilter) &&
      (!query || m.name.toLowerCase().includes(query.toLowerCase()))
    )
  }, [modules, selectedDept, selectedManager, statusFilter, query])

  // KPIs aggregate
  const kpis = useMemo(() => {
    const totalRevenue = filteredModules.reduce((s, m) => s + (m.revenue || 0), 0)
    const totalLeads = filteredModules.reduce((s, m) => s + (m.leads || 0), 0)
    const totalActions = filteredModules.reduce((s, m) => s + (m.actions || 0), 0)
    const successfulImports = filteredModules.reduce((s, m) => s + (m.importsSuccess || 0), 0)
    const successfulExports = filteredModules.reduce((s, m) => s + (m.exportsSuccess || 0), 0)
    return { totalRevenue, totalLeads, totalActions, successfulImports, successfulExports }
  }, [filteredModules])

  // Charts based on aggregates
  const actionsBar = useMemo(() => ({
    labels: filteredModules.map(m => m.name),
    datasets: [
      { label: isRTL ? 'الإجراءات' : 'Actions', data: filteredModules.map(m => m.actions || 0), backgroundColor: '#4f46e5' },
      { label: isRTL ? 'العملاء المحتملون' : 'Leads', data: filteredModules.map(m => m.leads || 0), backgroundColor: '#10b981' },
    ],
  }), [filteredModules, isRTL])

  const importsExportsPie = useMemo(() => ({
    labels: [isRTL ? 'واردات ناجحة' : 'Successful Imports', isRTL ? 'صادرات ناجحة' : 'Successful Exports'],
    datasets: [{ data: [kpis.successfulImports, kpis.successfulExports], backgroundColor: ['#60a5fa', '#f59e0b'] }],
  }), [kpis, isRTL])

  const revenueTrend = useMemo(() => ({
    labels: filteredModules.map(m => m.name),
    datasets: [{ label: isRTL ? 'الإيراد' : 'Revenue', data: filteredModules.map(m => m.revenue || 0), borderColor: '#4f46e5', backgroundColor: '#4f46e5' }],
  }), [filteredModules, isRTL])

  // Helpers
  const StatusBadge = ({ status }) => {
    const map = {
      Success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
      Active: 'bg-blue-100 text-blue-700 ring-blue-200',
      Expired: 'bg-amber-100 text-amber-700 ring-amber-200',
      'Checked-in': 'bg-indigo-100 text-indigo-700 ring-indigo-200',
      'No-show': 'bg-rose-100 text-rose-700 ring-rose-200',
      Failed: 'bg-rose-100 text-rose-700 ring-rose-200',
    }
    const cls = map[status] || 'bg-gray-100 text-gray-700 ring-gray-200'
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${cls}`}>{status}</span>
  }

  // Export handlers
  const exportExcel = () => {
    const rowsX = filteredModules.map(m => ({
      'Module': m.name,
      'Department': m.dept,
      'Manager': m.manager,
      'Revenue': m.revenue,
      'Leads': m.leads,
      'Actions': m.actions,
      'Successful Imports': m.importsSuccess,
      'Successful Exports': m.exportsSuccess,
      'Status': m.status,
      'Route': m.route,
    }))
    const ws = XLSX.utils.json_to_sheet(rowsX)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reports Dashboard')
    XLSX.writeFile(wb, 'reports_dashboard.xlsx')
  }

  const exportPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4')
    doc.setFontSize(14)
    doc.text(isRTL ? 'لوحة التقارير' : 'Reports Dashboard', 40, 40)
    const head = [[
      isRTL ? 'الوحدة' : 'Module', isRTL ? 'القسم' : 'Department', isRTL ? 'المدير' : 'Manager', isRTL ? 'الإيراد' : 'Revenue', isRTL ? 'العملاء المحتملون' : 'Leads', isRTL ? 'الإجراءات' : 'Actions', isRTL ? 'الواردات الناجحة' : 'Successful Imports', isRTL ? 'الصادرات الناجحة' : 'Successful Exports', isRTL ? 'الحالة' : 'Status',
    ]]
    const body = filteredModules.map(m => [m.name, m.dept, m.manager, fmtEGP(m.revenue || 0), m.leads || 0, m.actions || 0, m.importsSuccess || 0, m.exportsSuccess || 0, m.status])
    doc.autoTable({ head, body, startY: 60 })
    doc.save('reports_dashboard.pdf')
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Header + Actions */}
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">{isRTL ? 'لوحة التقارير' : 'Reports Dashboard'}</h1>
            <div className="flex items-center gap-2">
              <button className="btn btn-glass" onClick={exportPDF}>{isRTL ? 'تنزيل PDF' : 'Download PDF'}</button>
              <button className="btn btn-glass" onClick={exportExcel}>{isRTL ? 'تنزيل Excel' : 'Download Excel'}</button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="label">{isRTL ? 'الوضع الزمني' : 'Period Mode'}</label>
              <SearchableSelect value={dateMode} onChange={(v)=>{ setDateMode(v); setSelectedDate(''); setStartDate(''); setEndDate('') }}>
                <option value="day">{isRTL ? 'يوم' : 'Day'}</option>
                <option value="week">{isRTL ? 'أسبوع' : 'Week'}</option>
                <option value="month">{isRTL ? 'شهر' : 'Month'}</option>
                <option value="range">{isRTL ? 'مدى مخصص' : 'Custom Range'}</option>
              </SearchableSelect>
            </div>
            {dateMode !== 'range' && (
              <div>
                <label className="label">{isRTL ? 'التاريخ' : 'Date'}</label>
                <input type="date" className="input w-full" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)} />
              </div>
            )}
            {dateMode === 'range' && (
              <>
                <div>
                  <label className="label">{isRTL ? 'من' : 'Start'}</label>
                  <input type="date" className="input w-full" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">{isRTL ? 'إلى' : 'End'}</label>
                  <input type="date" className="input w-full" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label className="label">{isRTL ? 'القسم / الفريق' : 'Department / Team'}</label>
              <SearchableSelect value={selectedDept} onChange={(v)=>setSelectedDept(v)}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </SearchableSelect>
            </div>
            <div>
              <label className="label">{isRTL ? 'المدير' : 'Manager'}</label>
              <SearchableSelect value={selectedManager} onChange={(v)=>setSelectedManager(v)}>
                {managers.map(m => <option key={m} value={m}>{m}</option>)}
              </SearchableSelect>
            </div>
            <div>
              <label className="label">{isRTL ? 'الحالة' : 'Status'}</label>
              <SearchableSelect value={statusFilter} onChange={(v)=>setStatusFilter(v)}>
                {['All','Active','Success','Failed','Expired','Checked-in','No-show'].map(s => <option key={s} value={s}>{s}</option>)}
              </SearchableSelect>
            </div>
            <div>
              <label className="label">{isRTL ? 'بحث' : 'Search'}</label>
              <input className="input w-full" placeholder={isRTL ? 'اسم التقرير' : 'Report name'} value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Spacer under filters */}
        <div className="h-4" aria-hidden="true" />

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</div>
            <div className="text-2xl font-semibold text-indigo-600">{fmtEGP(kpis.totalRevenue)}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'إجمالي العملاء المحتملين' : 'Total Leads'}</div>
            <div className="text-2xl font-semibold">{kpis.totalLeads}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'إجمالي الإجراءات' : 'Total Actions'}</div>
            <div className="text-2xl font-semibold">{kpis.totalActions}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'الواردات الناجحة' : 'Successful Imports'}</div>
            <div className="text-2xl font-semibold text-emerald-600">{kpis.successfulImports}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-gray-500">{isRTL ? 'الصادرات الناجحة' : 'Successful Exports'}</div>
            <div className="text-2xl font-semibold text-amber-600">{kpis.successfulExports}</div>
          </div>
        </div>

        {/* Spacer under cards */}
        <div className="h-4" aria-hidden="true" />

        {/* Dashboard charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="glass-panel rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <div className={`${isRTL ? 'text-right' : ''} font-semibold`}>{isRTL ? 'الإجراءات والعمليات عبر التقارير' : 'Actions & Leads Across Reports'}</div>
            </div>
            <Bar data={actionsBar} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <div className={`${isRTL ? 'text-right' : ''} font-semibold`}>{isRTL ? 'الواردات/الصادرات الناجحة' : 'Successful Imports/Exports'}</div>
            </div>
            <Doughnut data={importsExportsPie} options={{ responsive: true }} />
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`${isRTL ? 'border-r-4' : 'border-l-4'} border-primary h-full`}></div>
              <div className={`${isRTL ? 'text-right' : ''} font-semibold`}>{isRTL ? 'اتجاه الإيرادات حسب التقرير' : 'Revenue Trend by Report'}</div>
            </div>
            <Line data={revenueTrend} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {/* Spacer above quick panels */}
        <div className="h-4" aria-hidden="true" />

        {/* Quick access panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredModules.map(m => (
            <div key={m.key} className="glass-panel rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.dept} · {m.manager}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-500">{isRTL ? 'الإيراد' : 'Revenue'}</div>
                  <div className="text-sm font-semibold">{fmtEGP(m.revenue || 0)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{isRTL ? 'العملاء المحتملون' : 'Leads'}</div>
                  <div className="text-sm font-semibold">{m.leads || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">{isRTL ? 'الإجراءات' : 'Actions'}</div>
                  <div className="text-sm font-semibold">{m.actions || 0}</div>
                </div>
              </div>
              <div className="mt-4">
                <Link to={m.route} className="btn btn-primary">
                  {isRTL ? 'فتح التقرير' : 'Open Report'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default ReportsDashboard
