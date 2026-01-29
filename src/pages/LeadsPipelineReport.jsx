import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { Filter, User, Users, Briefcase, Tag, Calendar, Layers, XCircle, FileText, CheckCircle, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaFileExport, FaChevronDown, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import SearchableSelect from '@shared/components/SearchableSelect'
import { useStages } from '../hooks/useStages'
import * as XLSX from 'xlsx'

export default function LeadsPipelineReport() {
  const { t, i18n } = useTranslation()
  const { stages } = useStages()
  const isRTL = i18n.dir() === 'rtl'

  // Mock Data for Demonstration
  const rawLeads = [
    { id: 1, name: 'Lead A', salesperson: 'Abdelhamid', manager: 'Manager X', stage: 'New', source: 'Facebook', project: 'Project A', assignDate: '2025-01-01', createdAt: '2024-12-25', lastActionAt: '2025-01-02', closedAt: '', status: 'pending', type: 'cold' },
    { id: 2, name: 'Lead B', salesperson: 'Abdelhamid', stage: 'Meeting', source: 'Google', project: 'Project B', assignDate: '2025-01-05', createdAt: '2025-01-01', lastActionAt: '2025-01-06', closedAt: '', status: 'active', type: 'hot' },
    { id: 3, name: 'Lead C', salesperson: 'Sara Ali', manager: 'Manager Y', stage: 'Proposal', source: 'Referral', project: 'Project A', assignDate: '2025-01-10', createdAt: '2025-01-08', lastActionAt: '2025-01-11', closedAt: '', status: 'active', type: 'hot' },
    { id: 4, name: 'Lead D', salesperson: 'Omar Khaled', manager: 'Manager X', stage: 'Closed Won', source: 'Website', project: 'Project C', assignDate: '2025-01-12', createdAt: '2025-01-10', lastActionAt: '2025-01-15', closedAt: '2025-01-15', status: 'closed', type: 'hot' },
    { id: 5, name: 'Lead E', salesperson: 'Abdelhamid', stage: 'Canceled', source: 'Facebook', project: 'Project A', assignDate: '2025-01-15', createdAt: '2025-01-14', lastActionAt: '2025-01-16', closedAt: '', status: 'canceled', type: 'cold' },
    { id: 6, name: 'Lead F', salesperson: 'Sara Ali', stage: 'Follow Up', source: 'Google', project: 'Project B', assignDate: '2025-01-18', createdAt: '2025-01-17', lastActionAt: '2025-01-19', closedAt: '', status: 'active', type: 'warm' },
    { id: 7, name: 'Lead G', salesperson: 'Omar Khaled', stage: 'New', source: 'Referral', project: 'Project A', assignDate: '2025-01-20', createdAt: '2025-01-20', lastActionAt: '', closedAt: '', status: 'pending', type: 'new' },
    { id: 8, name: 'Lead H', salesperson: 'Abdelhamid', stage: 'Proposal', source: 'Website', project: 'Project C', assignDate: '2025-01-22', createdAt: '2025-01-21', lastActionAt: '2025-01-23', closedAt: '', status: 'active', type: 'warm' },
    { id: 9, name: 'Lead I', salesperson: 'Sara Ali', stage: 'Closed Lost', source: 'Facebook', project: 'Project A', assignDate: '2025-01-25', createdAt: '2025-01-24', lastActionAt: '2025-01-26', closedAt: '2025-01-26', status: 'closed', type: 'cold' },
    { id: 10, name: 'Lead J', salesperson: 'Omar Khaled', stage: 'Meeting', source: 'Google', project: 'Project B', assignDate: '2025-01-28', createdAt: '2025-01-27', lastActionAt: '2025-01-29', closedAt: '', status: 'active', type: 'hot' },
    // Add more mock data to make numbers look realistic
    ...Array.from({ length: 50 }).map((_, i) => ({
      id: 11 + i,
      name: `Lead ${i}`,
      salesperson: ['Abdelhamid', 'Sara Ali', 'Omar Khaled'][i % 3],
      manager: ['Manager X', 'Manager Y'][i % 2],
      stage: ['New', 'Meeting', 'Proposal', 'Follow Up', 'Closed Won', 'Canceled'][i % 6],
      source: ['Facebook', 'Google', 'Website', 'Referral'][i % 4],
      project: ['Project A', 'Project B', 'Project C'][i % 3],
      assignDate: '2025-01-01',
      createdAt: '2024-12-20',
      lastActionAt: '2025-01-02',
      closedAt: '',
      status: ['active', 'pending', 'closed', 'canceled'][i % 4],
      type: ['cold', 'hot', 'warm', 'new'][i % 4]
    }))
  ]

  // Filters State
  const [salesPersonFilter, setSalesPersonFilter] = useState('')
  const [managerFilter, setManagerFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [assignDate, setAssignDate] = useState('')
  const [creationDate, setCreationDate] = useState('')
  const [lastActionDate, setLastActionDate] = useState('')
  const [closeDealsDate, setCloseDealsDate] = useState('')
  const [showAllFilters, setShowAllFilters] = useState(false)
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

  // Filter Logic
  const filteredData = useMemo(() => {
    return rawLeads.filter(lead => {
      const matchSales = salesPersonFilter ? lead.salesperson === salesPersonFilter : true
      const matchManager = managerFilter ? lead.manager === managerFilter : true
      const matchStage = stageFilter ? lead.stage === stageFilter : true
      const matchSource = sourceFilter ? lead.source === sourceFilter : true
      const matchProject = projectFilter ? lead.project === projectFilter : true
      const matchDate = assignDate ? lead.assignDate === assignDate : true
      const matchCreationDate = creationDate ? lead.createdAt === creationDate : true
      const matchLastActionDate = lastActionDate ? lead.lastActionAt === lastActionDate : true
      const matchCloseDealsDate = closeDealsDate ? lead.closedAt === closeDealsDate : true
      return matchSales && matchManager && matchStage && matchSource && matchProject && matchDate && matchCreationDate && matchLastActionDate && matchCloseDealsDate
    })
  }, [rawLeads, salesPersonFilter, managerFilter, stageFilter, sourceFilter, projectFilter, assignDate, creationDate, lastActionDate, closeDealsDate])

  // KPI Calculations
  const totalLeads = filteredData.length
  const newLeads = filteredData.filter(l => l.stage === 'New' || l.status === 'pending').length
  const canceledLeads = filteredData.filter(l => l.stage === 'Canceled' || l.status === 'canceled').length
  const meetingsCount = filteredData.filter(l => l.stage === 'Meeting').length
  const proposalsCount = filteredData.filter(l => l.stage === 'Proposal').length
  const followUpCount = filteredData.filter(l => l.stage === 'Follow Up').length
  const closedCount = filteredData.filter(l => l.stage === 'Closed Won').length

  // Aggregation for Table
  const salesPersonStats = useMemo(() => {
    const stats = {}
    filteredData.forEach(lead => {
      if (!stats[lead.salesperson]) {
        stats[lead.salesperson] = {
          name: lead.salesperson,
          total: 0,
          pendingNew: 0,
          pendingCold: 0,
          followUp: 0,
          proposal: 0,
          meeting: 0,
          closed: 0,
          canceled: 0
        }
      }
      stats[lead.salesperson].total += 1
      if (lead.stage === 'New') stats[lead.salesperson].pendingNew += 1
      if (lead.type === 'cold') stats[lead.salesperson].pendingCold += 1
      if (lead.stage === 'Follow Up') stats[lead.salesperson].followUp += 1
      if (lead.stage === 'Proposal') stats[lead.salesperson].proposal += 1
      if (lead.stage === 'Meeting') stats[lead.salesperson].meeting += 1
      if (lead.stage === 'Closed Won') stats[lead.salesperson].closed += 1
      if (lead.stage === 'Canceled') stats[lead.salesperson].canceled += 1
    })
    return Object.values(stats)
  }, [filteredData])

  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(salesPersonStats.length / entriesPerPage))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return salesPersonStats.slice(start, start + entriesPerPage)
  }, [salesPersonStats, currentPage, entriesPerPage])

  const handleExport = () => {
    const rows = filteredData.map(lead => ({
      Name: lead.name,
      Salesperson: lead.salesperson,
      Manager: lead.manager || '',
      Stage: lead.stage,
      Source: lead.source,
      Project: lead.project,
      AssignDate: lead.assignDate,
      CreatedAt: lead.createdAt,
      LastActionAt: lead.lastActionAt,
      ClosedAt: lead.closedAt || '',
      Status: lead.status,
      Type: lead.type
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Pipeline')
    XLSX.writeFile(wb, 'leads_pipeline_report.xlsx')
    setShowExportMenu(false)
  }

  const exportToPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()
      
      const tableColumn = [
        isRTL ? 'الاسم' : "Name", 
        isRTL ? 'مسؤول المبيعات' : "Salesperson", 
        isRTL ? 'المرحلة' : "Stage", 
        isRTL ? 'المشروع' : "Project", 
        isRTL ? 'الحالة' : "Status", 
        isRTL ? 'النوع' : "Type"
      ]
      const tableRows = []

      filteredData.forEach(lead => {
        const rowData = [
          lead.name,
          lead.salesperson,
          lead.stage,
          lead.project,
          lead.status,
          lead.type
        ]
        tableRows.push(rowData)
      })

      doc.text(isRTL ? 'تقرير مسار العملاء' : "Leads Pipeline Report", 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      })
      doc.save("leads_pipeline_report.pdf")
      setShowExportMenu(false)
    } catch (error) {
      console.error("Export PDF Error:", error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen ">
        <div>
          <BackButton to="/reports" />
        </div>      
      {/* Header & Navigation */}
      
        {/* Row 1: Back Button */}


        {/* Row 2: Title and Export Button */}
        <div className="flex flex-wrap gap-4 md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-theme-text dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Layers size={32} />
            </div>
            {isRTL ? 'التقارير، مسار العملاء...' : 'Reports, Leads Pipeline...'}
          </h1>
        </div>
      

      {/* Filters Section */}
      <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 p-4 rounded-2xl shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-theme-text dark:text-white font-semibold">
            <Filter size={20} className="text-blue-500 dark:text-blue-400" />
            <h3>{isRTL ? 'الفلاتر' : 'Filters'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAllFilters(prev => !prev)} 
              className={`flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors`}
            >
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show')}
              <ChevronDown size={12} className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            <button
              onClick={() => {
                setSalesPersonFilter('')
                setManagerFilter('')
                setStageFilter('')
                setSourceFilter('')
                setProjectFilter('')
                setAssignDate('')
                setCreationDate('')
                setLastActionDate('')
                setCloseDealsDate('')
                setShowAllFilters(false)
              }}
              className="px-3 py-1.5 text-sm text-gray-500 dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* First Row - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sales Person */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <User size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'مسؤول المبيعات' : 'Sales Person'}
              </label>
              <SearchableSelect 
                options={[{ value: '', label: isRTL ? 'الكل' : 'All Sales Persons' }, ...Array.from(new Set(rawLeads.map(d => d.salesperson))).map(s => ({ value: s, label: s }))]}
                value={salesPersonFilter}
                onChange={setSalesPersonFilter}
                placeholder={isRTL ? 'اختر' : 'Sales Person'}
                icon={<User size={16} />}
                isRTL={isRTL}
              />
            </div>

            {/* Manager */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Users size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المدير' : 'Manager'}
              </label>
              <SearchableSelect 
                options={[{ value: '', label: isRTL ? 'الكل' : 'All Managers' }, ...Array.from(new Set(rawLeads.map(d => d.manager).filter(Boolean))).map(s => ({ value: s, label: s }))]}
                value={managerFilter}
                onChange={setManagerFilter}
                placeholder={isRTL ? 'اختر' : 'Manager'}
                icon={<Users size={16} />}
                isRTL={isRTL}
              />
            </div>

            {/* Stage */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Layers size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المرحلة' : 'Stage'}
              </label>
              <SearchableSelect 
                options={[{ value: '', label: isRTL ? 'الكل' : 'All Stages' }, ...Array.from(new Set(rawLeads.map(d => d.stage))).map(s => ({ value: s, label: s }))]}
                value={stageFilter}
                onChange={setStageFilter}
                placeholder={isRTL ? 'اختر' : 'Stage Pipeline'}
                icon={<Layers size={16} />}
                isRTL={isRTL}
              />
            </div>

            {/* Source */}
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Tag size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المصدر' : 'Source'}
              </label>
              <SearchableSelect 
                options={[{ value: '', label: isRTL ? 'الكل' : 'All Sources' }, ...Array.from(new Set(rawLeads.map(d => d.source))).map(s => ({ value: s, label: s }))]}
                value={sourceFilter}
                onChange={setSourceFilter}
                placeholder={isRTL ? 'اختر' : 'Source'}
                icon={<Tag size={16} />}
                isRTL={isRTL}
              />
            </div>
          </div>

          {/* Additional Filters (Toggleable) */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showAllFilters ? 'max-h-[800px] opacity-100 pt-3' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Project */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                  <Briefcase size={12} className="text-blue-500 dark:text-blue-400" />
                  {isRTL ? 'المشروع أو المنتج' : 'Project or Product'}
                </label>
                <SearchableSelect 
                  options={[{ value: '', label: isRTL ? 'الكل' : 'All Projects' }, ...Array.from(new Set(rawLeads.map(d => d.project))).map(s => ({ value: s, label: s }))]}
                  value={projectFilter}
                  onChange={setProjectFilter}
                  placeholder={isRTL ? 'اختر' : 'Project or Product'}
                  icon={<Briefcase size={16} />}
                  isRTL={isRTL}
                />
              </div>

              {/* Assign Date */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                  <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                  {isRTL ? 'تاريخ التعيين' : 'Assign Date'}
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm  dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                />
              </div>

              {/* Creation Date */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                  <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                  {isRTL ? 'تاريخ الإنشاء' : 'Creation Date'}
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={creationDate}
                  onChange={(e) => setCreationDate(e.target.value)}
                />
              </div>

              {/* Last Action Date */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                  <Clock size={12} className="text-blue-500 dark:text-blue-400" />
                  {isRTL ? 'تاريخ آخر إجراء' : 'Last Action Date'}
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm  dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={lastActionDate}
                  onChange={(e) => setLastActionDate(e.target.value)}
                />
              </div>

              {/* Close Deals Date */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                  <CheckCircle size={12} className="text-blue-500 dark:text-blue-400" />
                  {isRTL ? 'تاريخ إغلاق الصفقات' : 'Close Deals Date'}
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm  dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={closeDealsDate}
                  onChange={(e) => setCloseDealsDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {[
          {
            title: isRTL ? 'العملاء' : 'Customers',
            value: totalLeads.toLocaleString(),
            sub: isRTL ? '(الكل)' : '(Total)',
            icon: Users,
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            title: isRTL ? 'العملاء المحتملين' : 'Leads',
            value: newLeads,
            sub: isRTL ? '(جديد/معلق)' : '(New/Pending)',
            icon: Filter,
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
          },
          {
            title: isRTL ? 'الاجتماعات' : 'Meetings',
            value: meetingsCount,
            sub: isRTL ? '(مجدولة)' : '(Scheduled)',
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          },

          {
            title: isRTL ? 'العروض' : 'Proposals',
            value: proposalsCount,
            sub: isRTL ? '(مرسلة)' : '(Sent)',
            icon: FileText,
            color: 'text-cyan-600 dark:text-cyan-400',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
          },
          {
            title: isRTL ? 'صفقات مغلقة' : 'Closed Deals',
            value: closedCount,
            sub: isRTL ? '(فوز)' : '(Won)',
            icon: CheckCircle,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            title: isRTL ? 'إلغاء' : 'Cancelation',
            value: canceledLeads.toLocaleString(),
            sub: isRTL ? '(خسارة)' : '(Lost)',
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
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
                  <h3 className="text-theme-text dark:text-white text-sm font-semibold opacity-80">
                    {card.title}
                  </h3>
                </div>

                <div className="flex items-baseline space-x-2 rtl:space-x-reverse pl-1">
                  <span className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                  <span className="text-xs dark:text-white font-medium">
                    {card.sub}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Leads Overview List Table */}
      <div className=" bg-white/10 dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm border border-theme-border dark:border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-theme-border dark:border-gray-700/50 flex items-center justify-between">
           <h3 className="text-lg font-bold text-theme-text dark:text-white">{isRTL ? 'قائمة نظرة عامة على العملاء' : 'Leads overview List:'}</h3>
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
                   onClick={() => {
                     handleExport();
                     setShowExportMenu(false);
                   }}
                   className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                 >
                   <FaFileExcel className="text-green-600" /> {isRTL ? 'تصدير كـ Excel' : 'Export to Excel'}
                 </button>
                 <button 
                   onClick={() => {
                     exportToPdf();
                     setShowExportMenu(false);
                   }}
                   className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                 >
                   <FaFilePdf className="text-red-600" /> {isRTL ? 'تصدير كـ PDF' : 'Export to PDF'}
                 </button>
               </div>
             )}
           </div>
         </div>
        
        {/* Responsive Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs uppercase bg-white/5 dark:bg-white/5 dark:text-white">
              <tr>
                <th className="md:hidden px-6 py-4 border-b border-theme-border dark:border-gray-700/50"></th>
                <th className="px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'مسؤول المبيعات' : 'Sales Person'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'رقم العملاء' : 'Leads No.'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'معلق (جديد)' : 'Pending (New)'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'معلق (بارد)' : 'Pending (Cold)'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'متابعة' : 'Follow up'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'عرض' : 'Proposal'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'اجتماع' : 'Meeting'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'مغلق' : 'Closed'}</th>
                <th className="hidden md:table-cell px-6 py-4 font-medium border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'ملغى' : 'Canceled'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border dark:divide-gray-700/50">
              {salesPersonStats.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {isRTL ? 'لا توجد بيانات' : 'No data'}
                  </td>
                </tr>
              )}
              {salesPersonStats.length > 0 && paginatedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {isRTL ? 'لا توجد نتائج' : 'No results'}
                  </td>
                </tr>
              )}
              {paginatedRows.map((stat, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                    <td className="md:hidden px-6 py-4">
                      <button onClick={() => toggleRow(stat.name)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400">
                        {expandedRows[stat.name] ? <ChevronDown size={16} className="transform rotate-180" /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-bold text-theme-text dark:text-white">{stat.name}</td>
                    <td className="hidden md:table-cell px-6 py-4 font-semibold text-theme-text dark:text-white">{stat.total}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-blue-600 dark:text-blue-400">{stat.pendingNew}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-theme-text dark:text-white">{stat.pendingCold}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-amber-600 dark:text-amber-400">{stat.followUp}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-purple-600 dark:text-purple-400">{stat.proposal}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-indigo-600 dark:text-indigo-400">{stat.meeting}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-green-600 dark:text-green-400 font-bold">{stat.closed}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-red-600 dark:text-red-400">{stat.canceled}</td>
                  </tr>
                  {/* Mobile Expandable Row */}
                  {expandedRows[stat.name] && (
                    <tr className="md:hidden bg-gray-50 dark:bg-white/5">
                      <td colSpan={2} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'رقم العملاء' : 'Leads No.'}</span>
                            <span className="font-semibold text-theme-text dark:text-white">{stat.total}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'معلق (جديد)' : 'Pending (New)'}</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{stat.pendingNew}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'معلق (بارد)' : 'Pending (Cold)'}</span>
                            <span className="font-semibold text-theme-text dark:text-white">{stat.pendingCold}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'متابعة' : 'Follow up'}</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{stat.followUp}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'عرض' : 'Proposal'}</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">{stat.proposal}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'اجتماع' : 'Meeting'}</span>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stat.meeting}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'مغلق' : 'Closed'}</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{stat.closed}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[var(--muted-text)] text-xs">{isRTL ? 'ملغى' : 'Canceled'}</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">{stat.canceled}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 bg-theme-bg/80 border-t border-theme-border dark:border-gray-700/60 flex items-center justify-between gap-3">
            <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              {isRTL
                ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, salesPersonStats.length)}-${Math.min(currentPage * entriesPerPage, salesPersonStats.length)} من ${salesPersonStats.length}`
                : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, salesPersonStats.length)}-${Math.min(currentPage * entriesPerPage, salesPersonStats.length)} of ${salesPersonStats.length}`}
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
                <span className="text-sm whitespace-nowrap text-theme-text dark:text-white">
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
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {isRTL ? 'لكل صفحة:' : 'Per page:'}
                </span>
                <select
                  className="input w-24 text-sm py-0 px-2 h-8 text-theme-text dark:text-white bg-theme-bg dark:bg-gray-700 border-theme-border dark:border-gray-600"
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
    </div>
  )
}
