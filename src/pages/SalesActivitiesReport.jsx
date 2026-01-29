import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { PieChart } from '@shared/components/PieChart'
import { FaFile, FaFilter, FaChevronDown, FaUser, FaUserTie, FaChartLine, FaGlobe, FaBuilding, FaCalendarAlt, FaFileExcel, FaFilePdf, FaFileExport } from 'react-icons/fa'
import { Phone, Activity, DollarSign, Target, Filter, ChevronDown, User, Users, Layers, Tag, Briefcase, Calendar, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import SearchableSelect from '../components/SearchableSelect'
import * as XLSX from 'xlsx'

export default function SalesActivitiesReport() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // Mock Data
  const kpiData = {
    totalCalls: 176,
    totalAction: 1179,
    totalRevenue: 1000000,
    achievementFromTarget: 80
  }

  // Updated Mock Data with more realistic numbers
  const whatsAppData = [
    { name: isRTL ? 'إجراءات واتساب' : 'WhatsApp Actions', value: 770, color: '#22c55e' },
  ]

  const emailsData = [
    { name: isRTL ? 'مرسلة' : 'Sent', value: 580, color: '#ea580c' },
    { name: isRTL ? 'مستلمة' : 'Received', value: 335, color: '#ffedd5' },
  ]

  const googleMeetData = [
    { name: isRTL ? 'إجراءات جوجل ميت' : 'Google Meet Actions', value: 233, color: '#ef4444' },
  ]

  // Define Next Actions as Stages
  const actionDefs = [
      { name: isRTL ? 'متابعة' : 'Follow Up', color: '#0ea5e9' },
      { name: isRTL ? 'اجتماع' : 'Meeting', color: '#8b5cf6' }, // Purple
      { name: isRTL ? 'عرض سعر' : 'Proposal', color: '#06b6d4' }, // Cyan
      { name: isRTL ? 'حجز' : 'Reservation', color: '#db2777' }, // Pink
      { name: isRTL ? 'إغلاق صفقات' : 'Closing Deals', color: '#22c55e' }, // Green
      { name: isRTL ? 'إيجار' : 'Rent', color: '#f97316' }, // Orange
      { name: isRTL ? 'إلغاء' : 'Cancel', color: '#ef4444' } // Red
  ];

  const tableData = useMemo(() => {
    const baseData = [
      { id: 1, salesperson: 'Ahmed Ali', totalLeads: 120, delayed: 5, actions: 340, calls: 50, revenue: 85000, target: 100000 },
      { id: 2, salesperson: 'Sara Hassan', totalLeads: 150, delayed: 2, actions: 410, calls: 65, revenue: 92000, target: 100000 },
      { id: 3, salesperson: 'Omar Mostafa', totalLeads: 90, delayed: 8, actions: 220, calls: 35, revenue: 70000, target: 100000 },
      { id: 4, salesperson: 'Mona Adel', totalLeads: 110, delayed: 4, actions: 300, calls: 45, revenue: 88000, target: 100000 },
      { id: 5, salesperson: 'Khaled Ibrahim', totalLeads: 85, delayed: 10, actions: 180, calls: 25, revenue: 65000, target: 100000 },
      { id: 6, salesperson: 'Nour El-Din', totalLeads: 130, delayed: 3, actions: 360, calls: 55, revenue: 95000, target: 100000 },
      { id: 7, salesperson: 'Layla Mahmoud', totalLeads: 105, delayed: 6, actions: 290, calls: 40, revenue: 80000, target: 100000 },
      { id: 8, salesperson: 'Youssef Kamal', totalLeads: 140, delayed: 1, actions: 390, calls: 60, revenue: 90000, target: 100000 },
    ];

    return baseData.map((row, index) => ({
      ...row,
      actionByStage: actionDefs[index % actionDefs.length].name
    }));
  }, [isRTL]);

  // State for filters
  const [salesPersonFilter, setSalesPersonFilter] = useState([])
  const [managerFilter, setManagerFilter] = useState([])
  const [stageFilter, setStageFilter] = useState([])
  const [sourceFilter, setSourceFilter] = useState([])
  const [projectFilter, setProjectFilter] = useState([])
  
  const [assignDateFilter, setAssignDateFilter] = useState('')
  const [creationDateFilter, setCreationDateFilter] = useState('')
  const [lastActionDateFilter, setLastActionDateFilter] = useState('')
  const [closeDealsDateFilter, setCloseDealsDateFilter] = useState('')
  const [proposalDateFilter, setProposalDateFilter] = useState('')
  const [showAllFilters, setShowAllFilters] = useState(false)

  // Mock Options
  const salesPersonOptions = [
    { value: 'Ahmed Ali', label: 'Ahmed Ali' },
    { value: 'Sara Hassan', label: 'Sara Hassan' },
    { value: 'Omar Mostafa', label: 'Omar Mostafa' },
    { value: 'Mona Adel', label: 'Mona Adel' },
    { value: 'Khaled Ibrahim', label: 'Khaled Ibrahim' },
    { value: 'Nour El-Din', label: 'Nour El-Din' },
    { value: 'Layla Mahmoud', label: 'Layla Mahmoud' },
    { value: 'Youssef Kamal', label: 'Youssef Kamal' },
  ]
  const managerOptions = [{ value: 'Manager 1', label: isRTL ? 'مدير 1' : 'Manager 1' }, { value: 'Manager 2', label: isRTL ? 'مدير 2' : 'Manager 2' }]
  const stageOptions = useMemo(() => actionDefs.map(s => ({ value: s.name, label: s.name, color: s.color })), [isRTL])
  const sourceOptions = [{ value: 'Facebook', label: isRTL ? 'فيسبوك' : 'Facebook' }, { value: 'Website', label: isRTL ? 'الموقع' : 'Website' }]
  const projectOptions = [{ value: 'Project A', label: isRTL ? 'مشروع أ' : 'Project A' }, { value: 'Project B', label: isRTL ? 'مشروع ب' : 'Project B' }]

  const filteredData = useMemo(() => {
     return tableData;
  }, [salesPersonFilter, managerFilter, stageFilter, sourceFilter, projectFilter, assignDateFilter, creationDateFilter, lastActionDateFilter, closeDealsDateFilter, proposalDateFilter, tableData])

  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(filteredData.length / entriesPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return filteredData.slice(start, start + entriesPerPage)
  }, [filteredData, currentPage, entriesPerPage])

  // Aggregate Actions by Stage from filteredData
  const actionsByStageData = useMemo(() => {
    const stageCounts = filteredData.reduce((acc, row) => {
      const stage = row.actionByStage;
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(stageCounts).map(stage => {
      const actionDef = actionDefs.find(s => s.name === stage);
      return {
        name: stage,
        value: stageCounts[stage],
        color: actionDef ? actionDef.color : '#cccccc'
      };
    });
  }, [filteredData]);

  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const exportToPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()
      
      const tableColumn = [
        isRTL ? 'مسؤول المبيعات' : 'Salesperson',
        isRTL ? 'إجمالي العملاء' : 'Total Leads',
        isRTL ? 'المتأخرة' : 'Delayed',
        isRTL ? 'الإجراءات' : 'Actions',
        isRTL ? 'المكالمات' : 'Calls',
        isRTL ? 'الإجراء حسب المرحلة' : 'Action by Stage',
        isRTL ? 'الإيرادات' : 'Revenue',
        isRTL ? 'الهدف' : 'Target'
      ]
      const tableRows = []

      filteredData.forEach(row => {
        const rowData = [
          row.salesperson,
          row.totalLeads,
          row.delayed,
          row.actions,
          row.calls,
          row.actionByStage,
          row.revenue.toLocaleString(),
          row.target.toLocaleString()
        ]
        tableRows.push(rowData)
      })

      doc.text(isRTL ? 'تقرير نشاطات المبيعات' : 'Sales Activities Report', 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      })
      doc.save("sales_activities_report.pdf")
      setShowExportMenu(false)
    } catch (error) {
      console.error("Export PDF Error:", error)
    }
  }

  const handleExport = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(filteredData)
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Activities')
    XLSX.writeFile(wb, 'Sales_Activities_Report.xlsx')
    setShowExportMenu(false)
  }

  const clearFilters = () => {
    setSalesPersonFilter([])
    setManagerFilter([])
    setStageFilter([])
    setSourceFilter([])
    setProjectFilter([])
    setAssignDateFilter('')
    setCreationDateFilter('')
    setLastActionDateFilter('')
    setCloseDealsDateFilter('')
    setProposalDateFilter('')
  }

  const renderPieChart = (title, data) => {
    const segments = data.map(item => ({
      label: item.label || item.name,
      value: item.value,
      color: item.color
    }))
    const total = segments.reduce((sum, item) => sum + (item.value || 0), 0)

    return (
      <div className="group relative bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="text-sm font-semibold mb-2 text-theme-text dark:text-white text-center md:text-left">
          {title}
        </div>
        <div className="h-48 flex items-center justify-center">
          <PieChart
            segments={segments}
            size={170}
            centerValue={total}
            centerLabel={isRTL ? 'الإجمالي' : 'Total'}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {segments.map(segment => (
            <div key={segment.label} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="dark:text-white">
                {segment.label}: {segment.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-hidden min-w-0">
      {/* Back Btn & Header */}
      <div className="mb-6">
        <BackButton to="/reports" />
        <h1 className="text-2xl font-bold  dark:text-white mb-2">{isRTL ? 'تقرير نشاطات المبيعات' : 'Sales Activities Report'}</h1>
        <p className=" dark:text-white text-sm">{isRTL ? 'متابعة نشاطات وأداء فريق المبيعات' : 'Monitor your sales team activities and performance'}</p>
      </div>

      {/* Filter Panel */}
      <div className="bg-theme-bg backdrop-blur-md rounded-2xl shadow-sm border border-theme-border dark:border-gray-700/50 p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 dark:text-white font-semibold">
            <Filter size={20} className="text-blue-500 dark:text-blue-400" />
            <h3 className="text-theme-text">{t('Filter')}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAllFilters(prev => !prev)} 
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')}
              <ChevronDown size={12} className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`} />
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
          {/* First Row (Always Visible) - Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                      <User size={12} className="text-blue-500 dark:text-blue-400" />
                      {isRTL ? 'مسؤول المبيعات' : 'Sales Person'}
                    </label>
              <SearchableSelect options={salesPersonOptions} value={salesPersonFilter} onChange={setSalesPersonFilter} placeholder={isRTL ? 'اختر' : 'Select'} multiple isRTL={isRTL} icon={<User size={16} />} />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Users size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المدير أو الفريق' : 'Manager or team'}
              </label>
              <SearchableSelect options={managerOptions} value={managerFilter} onChange={setManagerFilter} placeholder={isRTL ? 'اختر' : 'Select'} multiple isRTL={isRTL} icon={<Users size={16} />} />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Layers size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'مرحلة البيع' : 'Stage pipeline'}
              </label>
              <SearchableSelect options={stageOptions} value={stageFilter} onChange={setStageFilter} placeholder={isRTL ? 'اختر' : 'Select'} multiple isRTL={isRTL} icon={<Layers size={16} />} />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                <Tag size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المصدر' : 'Source'}
              </label>
              <SearchableSelect options={sourceOptions} value={sourceFilter} onChange={setSourceFilter} placeholder={isRTL ? 'اختر' : 'Select'} multiple isRTL={isRTL} icon={<Tag size={16} />} />
            </div>
          </div>

          {/* Collapsible Section (Dates) */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ease-in-out overflow-hidden ${showAllFilters ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
             <div className="space-y-1">
               <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                 <Briefcase size={12} className="text-blue-500 dark:text-blue-400" />
                 {isRTL ? 'المشروع أو المنتج' : 'Project or product'}
               </label>
              <SearchableSelect options={projectOptions} value={projectFilter} onChange={setProjectFilter} placeholder={isRTL ? 'اختر' : 'Select'} multiple isRTL={isRTL} icon={<Briefcase size={16} />} />
            </div>           
             
             <div className="space-y-1">
               <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                 <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                 {isRTL ? 'تاريخ التعيين' : 'Assign Date'}
               </label>
               <input type="date" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={assignDateFilter} onChange={(e) => setAssignDateFilter(e.target.value)} />
             </div>
             <div className="space-y-1">
               <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                      <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                      {isRTL ? 'الفترة' : 'Duration'}
                    </label>
               <input type="date" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={creationDateFilter} onChange={(e) => setCreationDateFilter(e.target.value)} />
             </div>
             <div className="space-y-1">
               <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                 <Clock size={12} className="text-blue-500 dark:text-blue-400" />
                 {isRTL ? 'تاريخ آخر إجراء' : 'Last Action Date'}
               </label>
               <input type="date" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={lastActionDateFilter} onChange={(e) => setLastActionDateFilter(e.target.value)} />
             </div>
             <div className="space-y-1">
               <label className="flex items-center gap-1 text-xs font-medium dark:text-white">
                 <CheckCircle size={12} className="text-blue-500 dark:text-blue-400" />
                 {isRTL ? 'تاريخ إغلاق الصفقات' : 'Close Deals Date'}
               </label>
               <input type="date" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={closeDealsDateFilter} onChange={(e) => setCloseDealsDateFilter(e.target.value)} />
             </div>
             <div className="space-y-1">
               <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                      <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                      {isRTL ? 'إلى تاريخ' : 'To Date'}
                    </label>
               <input type="date" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={proposalDateFilter} onChange={(e) => setProposalDateFilter(e.target.value)} />
             </div>
          </div>
        </div>
      </div>

      {/* KPI Cards - Moved to top in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: isRTL ? 'إجمالي المكالمات' : 'Total calls',
            value: kpiData.totalCalls,
            icon: Phone,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            title: isRTL ? 'إجمالي الإجراءات' : 'Total Action',
            value: kpiData.totalAction,
            icon: Activity,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          },
          {
            title: isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
            value: kpiData.totalRevenue.toLocaleString(),
            icon: DollarSign,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
          },
          {
            title: isRTL ? 'تحقيق الهدف' : 'Total Achievement From Target',
            value: `${kpiData.achievementFromTarget}%`,
            icon: Target,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          },
        ].map((card, idx) => {
          const Icon = card.icon
          return (
            <div 
              key={idx}
              className="group relative bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-32"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                <Icon size={80} className={card.color} />
              </div>

              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="dark:text-white text-sm font-semibold opacity-80">
                    {card.title}
                  </h3>
                </div>

                <div className="flex items-baseline space-x-2 rtl:space-x-reverse pl-1">
                  <span className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section - Full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           {renderPieChart(isRTL ? 'واتساب' : 'WhatsApp', whatsAppData)}
           {renderPieChart(isRTL ? 'البريد الإلكتروني' : 'Emails', emailsData)}
           {renderPieChart(isRTL ? 'جوجل ميت' : 'Google Meet', googleMeetData)}
           {renderPieChart(isRTL ? 'الإجراءات حسب المرحلة' : 'Actions by Stage', actionsByStageData)}
      </div>

      {/* Table Section */}
      <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-theme-border dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">{isRTL ? 'نظرة عامة على نشاطات المبيعات' : 'Sales Activities Overview'}</h2>
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <FaFileExport /> {isRTL ? 'تصدير' : 'Export'}
              <FaChevronDown className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} size={12} />
            </button>
            
            {showExportMenu && (
              <div className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 w-48`}>
                <button 
                  onClick={handleExport}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFileExcel className="text-green-600" /> {isRTL ? 'تصدير كـ Excel' : 'Export to Excel'}
                </button>
                <button 
                  onClick={exportToPdf}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFilePdf className="text-red-600" /> {isRTL ? 'تصدير كـ PDF' : 'Export to PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-theme-bg dark:bg-white/5 dark:text-white">
              <tr>
                <th className="md:hidden px-4 py-3 border-b border-theme-border dark:border-gray-700/50"></th>
                <th className="px-4 py-3 border-b border-theme-border dark:border-gray-700/50 text-start text-theme-text dark:text-white">{isRTL ? 'مسؤول المبيعات' : 'Salesperson'}</th>
                <th className="hidden md:table-cell px-4 py-3 text-center border-b border-theme-border dark:border-gray-700/50 text-theme-text dark:text-white">{isRTL ? 'إجمالي العملاء' : 'Total Leads'}</th>
                <th className="hidden md:table-cell px-4 py-3 text-center border-b border-theme-border dark:border-gray-700/50 text-theme-text dark:text-white">{isRTL ? 'المتأخرة' : 'Delayed'}</th>
                <th className="hidden md:table-cell px-4 py-3 text-center border-b border-theme-border dark:border-gray-700/50 text-theme-text dark:text-white">{isRTL ? 'الإجراءات' : 'Actions'}</th>
                <th className="hidden md:table-cell px-4 py-3 text-center border-b border-theme-border dark:border-gray-700/50 text-theme-text dark:text-white">{isRTL ? 'المكالمات' : 'Calls'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50 text-start text-theme-text dark:text-white">{isRTL ? 'الإجراء حسب المرحلة' : 'Action by Stage'}</th>
                <th className="px-4 py-3 text-center border-b border-theme-border dark:border-gray-700/50 text-theme-text dark:text-white">{isRTL ? 'الإيرادات' : 'Revenue'}</th>
                <th className="hidden md:table-cell px-4 py-3 text-center border-b border-theme-border dark:border-gray-700/50 text-theme-text dark:text-white">{isRTL ? 'الهدف' : 'Target'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border dark:divide-gray-700/50">
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-[var(--muted-text)]"
                  >
                    {isRTL ? 'لا توجد بيانات' : 'No data'}
                  </td>
                </tr>
              )}
              {filteredData.length > 0 && paginatedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-[var(--muted-text)]"
                  >
                    {isRTL ? 'لا توجد نتائج' : 'No results'}
                  </td>
                </tr>
              )}
              {paginatedRows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-theme-bg/50 dark:hover:bg-white/5 transition-colors">
                    <td className="md:hidden px-4 py-3">
                      <button onClick={() => toggleRow(row.id)} className="p-1 rounded-full hover:bg-theme-bg/50 text-[var(--muted-text)]">
                        {expandedRows[row.id] ? <ChevronDown size={16} className="transform rotate-180" /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-theme-text dark:text-white">{row.salesperson}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-center dark:text-white">{row.totalLeads}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-center text-red-500 font-medium">{row.delayed}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-center dark:text-white">{row.actions}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-center dark:text-white">{row.calls}</td>
                    <td className="hidden md:table-cell px-4 py-3 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: actionDefs.find(a => a.name === row.actionByStage)?.color || '#ccc' }}
                        />
                        {row.actionByStage}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-green-600">{row.revenue.toLocaleString()}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-center font-bold text-blue-600">{row.target.toLocaleString()}</td>
                  </tr>
                  {expandedRows[row.id] && (
                    <tr className="md:hidden bg-white/5 dark:bg-white/5">
                      <td colSpan={3} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[var(--muted-text)]">{isRTL ? 'إجمالي العملاء' : 'Total Leads'}:</span>
                              <span className="dark:text-white">{row.totalLeads}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--muted-text)]">{isRTL ? 'المتأخرة' : 'Delayed'}:</span>
                              <span className="text-red-500">{row.delayed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--muted-text)]">{isRTL ? 'الإجراءات' : 'Actions'}:</span>
                              <span className="dark:text-white">{row.actions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[var(--muted-text)]">{isRTL ? 'المكالمات' : 'Calls'}:</span>
                              <span className="dark:text-white">{row.calls}</span>
                            </div>
                            <div className="col-span-2 flex justify-between">
                              <span className="text-[var(--muted-text)]">{isRTL ? 'الإجراء حسب المرحلة' : 'Action by Stage'}:</span>
                              <span className="dark:text-white flex items-center gap-2">
                                <span 
                                  className="w-2 h-2 rounded-full shrink-0" 
                                  style={{ backgroundColor: actionDefs.find(a => a.name === row.actionByStage)?.color || '#ccc' }}
                                />
                                {row.actionByStage}
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-between">
                              <span className="text-[var(--muted-text)]">{isRTL ? 'الهدف' : 'Target'}:</span>
                              <span className="text-blue-600 font-bold">{row.target.toLocaleString()}</span>
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-theme-bg border-t border-theme-border dark:border-gray-700/60 flex sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-[var(--muted-text)]">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, filteredData.length)}-${Math.min(currentPage * entriesPerPage, filteredData.length)} من ${filteredData.length}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, filteredData.length)}-${Math.min(currentPage * entriesPerPage, filteredData.length)} of ${filteredData.length}`}
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
    </div>
  )
}
