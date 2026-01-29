import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { Trophy, Filter, ChevronDown, ChevronRight, User, Users, Briefcase, Tag, Calendar, Clock, CheckCircle, ChevronLeft } from 'lucide-react'
import { PieChart } from '@shared/components/PieChart'
import { RiDeleteBinLine, RiEyeLine } from 'react-icons/ri'
import SearchableSelect from '../components/SearchableSelect'
import * as XLSX from 'xlsx'
import { FaCalendarAlt, FaFileExport, FaChevronDown, FaFileExcel, FaFilePdf } from 'react-icons/fa'
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal'
import { useTheme } from '@shared/context/ThemeProvider'

export default function MeetingsReport() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const { theme } = useTheme()

  const [allLeads, setAllLeads] = useState([])
  const [meetings, setMeetings] = useState([])

  useEffect(() => {
    const loadData = () => {
      try {
        const savedLeads = JSON.parse(localStorage.getItem('leadsData') || '[]');
        setAllLeads(savedLeads);

        // Calculate per-lead stats
        const leadStats = {};
        savedLeads.forEach(lead => {
          let arrangedCount = 0;
          let doneCount = 0;
          if (lead.actions && Array.isArray(lead.actions)) {
            lead.actions.forEach(action => {
              const isMeeting = action.nextAction === 'meeting' || 
                                action.actionType === 'meeting' || 
                                action.actionType === 'google_meet';
              if (isMeeting) {
                arrangedCount++;
                if (action.doneMeeting) doneCount++;
              }
            });
          }
          leadStats[lead.id] = { arrangedCount, doneCount };
        });

        const extractedMeetings = [];
        savedLeads.forEach(lead => {
          if (lead.actions && Array.isArray(lead.actions)) {
            lead.actions.forEach(action => {
              // Check if action is related to meeting
              const isMeeting = action.nextAction === 'meeting' || 
                                action.actionType === 'meeting' || 
                                action.actionType === 'google_meet';
              
              if (isMeeting) {
                extractedMeetings.push({
                  id: action.id || Math.random(),
                  leadId: lead.id,
                  leadName: lead.name || lead.fullName || 'Unknown',
                  mobile: lead.mobile || lead.phone || '',
                  status: action.doneMeeting ? 'done' : 'arranged',
                  source: lead.source || '',
                  project: lead.project || action.projectName || '',
                  salesPerson: lead.assignedTo || lead.salesPerson || '',
                  meetingDate: action.date || '',
                  lastActionDate: action.createdAt || '',
                  doneMeeting: action.doneMeeting,
                  leadArrangedCount: leadStats[lead.id]?.arrangedCount || 0,
                  leadDoneCount: leadStats[lead.id]?.doneCount || 0
                });
              }
            });
          }
        });

        // Sort by date desc
        extractedMeetings.sort((a, b) => new Date(b.meetingDate) - new Date(a.meetingDate));
        setMeetings(extractedMeetings);
      } catch (e) {
        console.error('Failed to load leads', e);
      }
    };

    loadData();
    
    // Listen for updates
    const handleStorageChange = (e) => {
      if (e.key === 'leadsData') loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('leadsDataUpdated', loadData);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leadsDataUpdated', loadData);
    };
  }, []);

  const kpiData = useMemo(() => {
    const totalMeetings = meetings.length;
    const totalLeads = allLeads.length;
    const arrangeMeetings = totalMeetings;
    const doneMeetings = meetings.filter(m => m.status === 'done').length;

    return {
      totalMeetings,
      totalLeads,
      arrangeMeetings,
      doneMeetings
    };
  }, [meetings, allLeads]);

  const channelData = useMemo(() => {
    const map = new Map();
    meetings.forEach(m => {
      const source = m.source || 'Unknown';
      map.set(source, (map.get(source) || 0) + 1);
    });
    const colors = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ef4444'];
    return Array.from(map.entries()).map(([label, value], i) => ({
      label,
      value,
      color: colors[i % colors.length]
    }));
  }, [meetings]);

  const bestPerformers = useMemo(() => {
    const map = new Map();
    meetings.forEach(m => {
      if (m.status === 'done') {
        const person = m.salesPerson || 'Unknown';
        map.set(person, (map.get(person) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, score], id) => ({ id, name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [meetings]);

  const [showLeadModal, setShowLeadModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})
  
  // Filter States
  const [salesPersonFilter, setSalesPersonFilter] = useState([])
  const [projectFilter, setProjectFilter] = useState([])
  const [sourceFilter, setSourceFilter] = useState([])
  const [managerFilter, setManagerFilter] = useState([])
  const [meetingDateFilter, setMeetingDateFilter] = useState('')
  const [lastActionDateFilter, setLastActionDateFilter] = useState('')

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter Logic (Basic implementation)
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const matchSales = salesPersonFilter.length === 0 || salesPersonFilter.includes(meeting.salesPerson)
      const matchProject = projectFilter.length === 0 || projectFilter.includes(meeting.project)
      const matchSource = sourceFilter.length === 0 || sourceFilter.includes(meeting.source)
      // Add other filter logic as needed
      return matchSales && matchProject && matchSource
    })
  }, [meetings, salesPersonFilter, projectFilter, sourceFilter])

  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Math.ceil(filteredMeetings.length / entriesPerPage))
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage
    return filteredMeetings.slice(start, start + entriesPerPage)
  }, [filteredMeetings, currentPage, entriesPerPage])

  const projectSegments = useMemo(() => {
    const map = new Map()
    filteredMeetings.forEach(meeting => {
      const key = meeting.project || (isRTL ? 'غير معروف' : 'Unknown')
      map.set(key, (map.get(key) || 0) + 1)
    })
    const baseColors = ['#8b5cf6', '#ec4899', '#10b981', '#f97316', '#3b82f6', '#22c55e']
    return Array.from(map.entries()).map(([label, value], idx) => ({
      label,
      value,
      color: baseColors[idx % baseColors.length]
    }))
  }, [filteredMeetings, isRTL])

  // Mock Options for Selects
  const salesPersonOptions = [
    { value: 'Abdel hamid', label: 'Abdel hamid' },
    { value: 'Mohamed Ahmed', label: 'Mohamed Ahmed' },
    { value: 'Sara Ali', label: 'Sara Ali' },
  ]
  const managerOptions = [
    { value: 'Manager 1', label: 'Manager 1' },
    { value: 'Manager 2', label: 'Manager 2' },
  ]
  const sourceOptions = [
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Website', label: 'Website' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'Referral', label: 'Referral' },
  ]
  const projectOptions = [
    { value: 'Project A', label: 'Project A' },
    { value: 'Project B', label: 'Project B' },
    { value: 'Project C', label: 'Project C' },
  ]

  const handleExport = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(filteredMeetings)
    XLSX.utils.book_append_sheet(wb, ws, 'Meetings')
    XLSX.writeFile(wb, 'Meetings_Report.xlsx')
  }

  const exportToPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = await import('jspdf-autotable')
      const doc = new jsPDF()
      
      const tableColumn = [
        isRTL ? 'الاسم' : "Lead Name", 
        isRTL ? 'رقم الهاتف' : "Mobile Contact", 
        isRTL ? 'حالة الاجتماع' : "Meeting Status", 
        isRTL ? 'المصدر' : "Source", 
        isRTL ? 'المشروع' : "Project", 
        isRTL ? 'مسؤول المبيعات' : "Sales Person",
        isRTL ? 'تاريخ الاجتماع' : "Meeting Date"
      ]
      const tableRows = []

      filteredMeetings.forEach(meeting => {
        const rowData = [
          meeting.leadName,
          meeting.mobile,
          meeting.status,
          meeting.source,
          meeting.project,
          meeting.salesPerson,
          meeting.meetingDate
        ]
        tableRows.push(rowData)
      })

      doc.text(isRTL ? 'تقرير الاجتماعات' : "Meetings Report", 14, 15)
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      })
      doc.save("meetings_report.pdf")
      setShowExportMenu(false)
    } catch (error) {
      console.error("Export PDF Error:", error)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الاجتماع؟' : 'Are you sure you want to delete this meeting?')) {
      setMeetings(prev => prev.filter(m => m.id !== id))
    }
  }

  const clearFilters = () => {
    setSalesPersonFilter([])
    setManagerFilter([])
    setSourceFilter([])
    setProjectFilter([])
    setLastActionDateFilter('')
    setMeetingDateFilter('')
    setCurrentPage(1)
  }

  const renderPieChart = (title, data) => {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0)

    return (
      <div className="group relative bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="text-sm font-semibold mb-2 text-theme-text dark:text-white text-center md:text-left">{title}</div>
        <div className="h-48 flex items-center justify-center">
          <PieChart
            segments={data}
            size={170}
            centerValue={total}
            centerLabel={isRTL ? 'الإجمالي' : 'Total'}
          />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {data.map((segment) => (
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
          {isRTL ? 'تقرير الاجتماعات' : 'Welcome Reports, Meetings'}
        </h1>
        <p className="dark:text-white  text-sm">
          {isRTL ? 'تتبع وتحليل أداء الاجتماعات الخاصة بك' : 'Track and analyze your meetings performance'}
        </p>
      </div>

      <div className="bg-theme-bg backdrop-blur-md rounded-2xl shadow-sm border border-theme-border dark:border-gray-700/50 p-6 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 dark:text-white font-semibold">
            <Filter size={20} className="text-blue-500 dark:text-blue-400" />
            <h3 className="text-theme-text">{isRTL ? 'تصفية' : 'Filter'}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllFilters(prev => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'عرض الكل' : 'Show All')}
              <ChevronDown
                size={12}
                className={`transform transition-transform duration-300 ${showAllFilters ? 'rotate-180' : 'rotate-0'}`}
              />
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <User size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'مسؤول المبيعات' : 'Sales Person'}
              </label>
              <SearchableSelect
                options={salesPersonOptions}
                value={salesPersonFilter}
                onChange={setSalesPersonFilter}
                placeholder={isRTL ? 'اختر' : 'Select'}
                multiple
                isRTL={isRTL}
                icon={<User size={16} />}
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Users size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المدير' : 'Manager'}
              </label>
              <SearchableSelect
                options={managerOptions}
                value={managerFilter}
                onChange={setManagerFilter}
                placeholder={isRTL ? 'اختر' : 'Select'}
                multiple
                isRTL={isRTL}
                icon={<Users size={16} />}
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Tag size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المصدر' : 'Source'}
              </label>
              <SearchableSelect
                options={sourceOptions}
                value={sourceFilter}
                onChange={setSourceFilter}
                placeholder={isRTL ? 'اختر' : 'Select'}
                multiple
                isRTL={isRTL}
                icon={<Tag size={16} />}
              />
            </div>
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Briefcase size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'المشروع' : 'Project'}
              </label>
              <SearchableSelect
                options={projectOptions}
                value={projectFilter}
                onChange={setProjectFilter}
                placeholder={isRTL ? 'اختر' : 'Select'}
                multiple
                isRTL={isRTL}
                icon={<Briefcase size={16} />}
              />
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500 ease-in-out overflow-hidden ${
              showAllFilters ? 'max-h-[1000px] opacity-100 pt-2' : 'max-h-0 opacity-0'
            }`}
          >

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-theme-text dark:text-white">
                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                {isRTL ? 'تاريخ الاجتماع' : 'Meeting Date'}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={meetingDateFilter}
                onChange={(e) => setMeetingDateFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-theme-text dark:text-white font-medium mb-2">{isRTL ? 'إجمالي الاجتماعات' : 'Total of Meetings'}</h3>
          <span className="text-3xl font-bold text-blue-600">{kpiData.totalMeetings}</span>
        </div>
        <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-theme-text dark:text-white font-medium mb-2">{isRTL ? 'إجمالي العملاء' : 'Total of Leads'}</h3>
          <span className="text-3xl font-bold text-purple-600">{kpiData.totalLeads}</span>
        </div>
        <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-theme-text dark:text-white font-medium mb-2">{isRTL ? 'ترتيب اجتماعات' : 'Arrange Meetings'}</h3>
          <span className="text-3xl font-bold text-orange-600">{kpiData.arrangeMeetings}</span>
        </div>
        <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-theme-text dark:text-white font-medium mb-2">{isRTL ? 'اجتماعات تمت' : 'Done Meetings'}</h3>
          <span className="text-3xl font-bold text-green-600">{kpiData.doneMeetings}</span>
        </div>
      </div>

      {/* Charts & Best Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {renderPieChart(isRTL ? 'تحليل الاجتماعات حسب القناة' : 'Meeting by Channel Analysis', channelData)}
        {renderPieChart(isRTL ? 'تحليل الاجتماعات حسب المشروع' : 'Meetings by Project Analysis', projectSegments)}

        {/* The Best */}
        <div className="group relative bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl border border-theme-border dark:border-gray-700/50 p-4 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
              <Trophy size={20} />
            </div>
            <div className="text-sm font-semibold text-theme-text dark:text-white">{isRTL ? 'الأفضل' : 'The Best'}</div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {bestPerformers.length === 0 && (
                <li className="text-xs dark:text-white text-center py-4">{isRTL ? 'لا توجد بيانات' : 'No data'}</li>
              )}
              {bestPerformers.map((performer, index) => {
                let rankColor = 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                let rankIcon = null

                if (index === 0) {
                  rankColor =
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700'
                  rankIcon = <Trophy size={12} />
                } else if (index === 1) {
                  rankColor =
                    'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                } else if (index === 2) {
                  rankColor =
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-700'
                }

                return (
                  <li
                    key={performer.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group/item"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs shadow-sm ${rankColor}`}
                      >
                        {rankIcon || index + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                          {performer.name}
                        </span>
                        <span className="text-[10px] dark:text-white">
                          {index === 0 ? (isRTL ? 'الأفضل أداء' : 'Top Performer') : `${isRTL ? 'الترتيب' : 'Rank'} #${index + 1}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold dark:text-white">{performer.score}</span>
                      <span className="text-[10px] dark:text-white">{isRTL ? 'اجتماعات' : 'Meetings'}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-theme-bg dark:bg-gray-800/30 backdrop-blur-md border border-theme-border dark:border-gray-700/50 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-theme-border dark:border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-theme-text dark:text-white">{isRTL ? 'نظرة عامة على الاجتماعات' : 'Meetings Overview'}</h2>
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
                  <FaFileExcel className="text-green-600" /> {isRTL ? 'تصدير إلى Excel' : 'Export to Excel'}
                </button>
                <button 
                  onClick={exportToPdf}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 dark:text-white"
                >
                  <FaFilePdf className="text-red-600" /> {isRTL ? 'تصدير إلى PDF' : 'Export to PDF'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-theme-bg dark:bg-white/5 text-theme-text dark:text-white">
              <tr>
                <th className="px-4 py-3 border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'اسم العميل' : 'Lead Name'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'رقم الهاتف' : 'Mobile Contact'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50 text-center">{isRTL ? 'ترتيب اجتماعات' : 'Arrange Meetings'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50 text-center">{isRTL ? 'اجتماعات تمت' : 'Done Meetings'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'المصدر' : 'Source'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'المشروع' : 'Project'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'مسؤول المبيعات' : 'Sales Person'}</th>
                <th className="hidden md:table-cell px-4 py-3 border-b border-theme-border dark:border-gray-700/50">{isRTL ? 'تاريخ الاجتماع' : 'Meeting Date'}</th>
                <th className="px-4 py-3 border-b border-theme-border dark:border-gray-700/50 text-center">{isRTL ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border dark:divide-gray-700/50">
              {paginatedMeetings.map((meeting) => (
                <React.Fragment key={meeting.id}>
                  <tr className="hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium dark:text-white flex items-center gap-2">
                      <button 
                        onClick={() => toggleRow(meeting.id)}
                        className="md:hidden p-1 hover:bg-white/10 rounded-full transition-colors"
                      >
                         <ChevronRight 
                           size={16} 
                           className={`transform transition-transform duration-200 ${expandedRows[meeting.id] ? 'rotate-90' : 'rtl:rotate-180'}`}
                         />
                      </button>
                      {meeting.leadName}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 dark:text-white ">{meeting.mobile}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-center">
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {meeting.leadArrangedCount}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-center">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {meeting.leadDoneCount}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 dark:text-white ">{meeting.source}</td>
                    <td className="hidden md:table-cell px-4 py-3 dark:text-white ">{meeting.project}</td>
                    <td className="hidden md:table-cell px-4 py-3 dark:text-white ">{meeting.salesPerson}</td>
                    <td className="hidden md:table-cell px-4 py-3 dark:text-white ">{meeting.meetingDate}</td>
                    <td className="px-4 py-3 flex items-center justify-center gap-2">
                      <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={isRTL ? 'عرض العميل' : 'Preview Lead'}
                        onClick={() => {
                          setSelectedLead(meeting)
                          setShowLeadModal(true)
                        }}
                      >
                        <RiEyeLine size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(meeting.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title={isRTL ? 'حذف' : 'Delete'}
                      >
                        <RiDeleteBinLine size={18} />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Mobile Expanded Row */}
                  {expandedRows[meeting.id] && (
                    <tr className="md:hidden bg-white/5 dark:bg-white/5">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex flex-col gap-1">
                             <span className="text-[var(--muted-text)]">{isRTL ? 'رقم الهاتف' : 'Mobile Contact'}</span>
                             <span className="dark:text-white font-medium">{meeting.mobile}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-[var(--muted-text)]">{isRTL ? 'الحالة' : 'Status'}</span>
                             <div className="flex items-center gap-2">
                               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                 {isRTL ? 'ترتيب: ' : 'Arranged: '} {meeting.leadArrangedCount}
                               </span>
                               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                 {isRTL ? 'تمت: ' : 'Done: '} {meeting.leadDoneCount}
                               </span>
                             </div>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-[var(--muted-text)]">{isRTL ? 'المصدر' : 'Source'}</span>
                             <span className="dark:text-white">{meeting.source}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-[var(--muted-text)]">{isRTL ? 'المشروع' : 'Project'}</span>
                             <span className="dark:text-white">{meeting.project}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-[var(--muted-text)]">{isRTL ? 'مسؤول المبيعات' : 'Sales Person'}</span>
                             <span className="dark:text-white">{meeting.salesPerson}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                             <span className="text-[var(--muted-text)]">{isRTL ? 'تاريخ الاجتماع' : 'Meeting Date'}</span>
                             <span className="dark:text-white">{meeting.meetingDate}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredMeetings.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center dark:text-white ">
                    {isRTL ? 'لا توجد اجتماعات' : 'No meetings found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-theme-bg border-t border-theme-border dark:border-gray-700/60 flex sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-theme-text dark:text-white">
            {isRTL
              ? `إظهار ${Math.min((currentPage - 1) * entriesPerPage + 1, filteredMeetings.length)}-${Math.min(currentPage * entriesPerPage, filteredMeetings.length)} من ${filteredMeetings.length}`
              : `Showing ${Math.min((currentPage - 1) * entriesPerPage + 1, filteredMeetings.length)}-${Math.min(currentPage * entriesPerPage, filteredMeetings.length)} of ${filteredMeetings.length}`}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-sm btn-ghost text-theme-text dark:text-white"
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
                className="btn btn-sm btn-ghost text-theme-text dark:text-white"
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
              <span className="text-[10px] sm:text-xs text-theme-text dark:text-white whitespace-nowrap">
                {isRTL ? 'لكل صفحة:' : 'Per page:'}
              </span>
              <select
                className="input w-24 text-sm py-0 px-2 h-8 bg-theme-bg border-theme-border text-theme-text dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

      {showLeadModal && (
        <EnhancedLeadDetailsModal
          isOpen={showLeadModal}
          onClose={() => {
            setShowLeadModal(false)
            setSelectedLead(null)
          }}
          lead={selectedLead}
          isArabic={i18n.language === 'ar'}
          theme={theme}
        />
      )}
    </div>
  )
}
