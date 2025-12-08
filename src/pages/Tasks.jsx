import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NewTaskModal from '../components/NewTaskModal'
import TaskDetailsModal from '../components/TaskDetailsModal'

function Chip({ label, active, onClick, tone = 'default', count }) {
  const base = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors';
  const tones = {
    default: 'bg-[var(--dropdown-bg)] text-[var(--content-text)] border-[var(--divider)] hover:bg-[var(--table-row-hover)]',
    green: 'bg-emerald-900/20 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/30',
    red: 'bg-red-900/20 text-red-300 border-red-600/40 hover:bg-red-900/30',
    yellow: 'bg-yellow-900/20 text-yellow-300 border-yellow-600/40 hover:bg-yellow-900/30',
    blue: 'bg-sky-900/20 text-sky-300 border-sky-600/40 hover:bg-sky-900/30'
  }
  const activeRing = active ? ' ring-2 ring-indigo-500/40' : ''
  return (
    <button type="button" onClick={onClick} className={`${base} ${tones[tone]}${activeRing}`}>
      <span className="w-2 h-2 rounded-full" style={{ background: tone === 'green' ? '#10b981' : tone === 'red' ? '#ef4444' : tone === 'yellow' ? '#f59e0b' : tone === 'blue' ? '#0ea5e9' : 'var(--muted-text)' }} />
      {label}
      {typeof count === 'number' ? <span className="px-1.5 py-0.5 rounded border border-current text-[10px] opacity-80">{count}</span> : null}
    </button>
  )
}

function Badge({ label, tone = 'yellow' }) {
  const tones = {
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    blue: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    red: 'bg-red-500/20 text-red-300 border-red-500/40'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${tones[tone]}`}>{label}</span>
  )
}

export default function Tasks() {
  const { t, i18n } = useTranslation()
  const isArabic = (i18n?.language || '').toLowerCase().startsWith('ar')

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    status: { PENDING: true, ACCEPTING: true, FINISHED: true, CANCELLED: false },
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advFilters, setAdvFilters] = useState({
    search: '',
    createdAt: '',
    endDate: '',
    salesman: '',
    assignedTo: '',
    relatedType: '',
    status: '',
    priority: '',
    createdBy: '',
    useCreatedAt: false,
    useEndDate: false,
    overdueOnly: false,
  })
  const updateAdv = (key, val) => setAdvFilters(prev => ({ ...prev, [key]: val }))
  const toggleAdvEnable = (key) => setAdvFilters(prev => ({ ...prev, [key]: !prev[key] }))
  const resetAdv = () => setAdvFilters({ search: '', createdAt: '', endDate: '', salesman: '', assignedTo: '', relatedType: '', status: '', priority: '', createdBy: '', useCreatedAt: false, useEndDate: false, overdueOnly: false })
  const toggleIn = (group, key) => setFilters(prev => ({ ...prev, [group]: { ...prev[group], [key]: !prev[group][key] } }))

  const data = useMemo(() => ([
    { id: 101, name: 'Initial Setup', sub: 'Project structure and configs', assignee: 'Ibrahim', state1: 'Phase 1', state2: 'Init', due: 'Today', salesman: 'Ibrahim', priority: 'high', status: 'PENDING' },
    { id: 102, name: 'Client Meeting', sub: 'Requirements alignment', assignee: 'Ahmed', state1: 'Phase 2', state2: 'Discuss', due: 'Tomorrow', salesman: 'Ahmed', priority: 'medium', status: 'PENDING' },
    { id: 103, name: 'Content Review', sub: 'Marketing copy', assignee: 'Semik', state1: 'Review', state2: 'Draft', due: 'Soon', salesman: 'Semik L', priority: 'low', status: 'PENDING' },
    { id: 104, name: 'Deployment Prep', sub: 'CI/CD and smoke tests', assignee: 'Admin', state1: 'Release', state2: 'Check', due: 'Next week', salesman: 'Admin', priority: 'medium', status: 'PENDING' },
  ]), [])

  // حالة محلية قابلة للتعديل لصفوف الجدول
  const [rows, setRows] = useState(data)
  const setStatus = (id, status) => setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  const startTask = (id) => setStatus(id, 'ACCEPTING')
  const finishTask = (id) => setStatus(id, 'FINISHED')
  const cancelTask = (id) => { if (window.confirm(isArabic ? 'تأكيد إلغاء المهمة؟' : 'Confirm cancel task?')) setStatus(id, 'CANCELLED') }
  const clearTasks = () => setRows([])
  const reseedTasks = () => setRows(data)

  const addTask = (task) => {
    const newRow = {
      id: Date.now(),
      name: task.title,
      sub: task.description || '',
      assignee: task.assignedTo || task.salesman || '—',
      state1: 'New',
      state2: '',
      // ادعم كلا المفتاحين due و endDate
      due: task.due || task.endDate || 'Soon',
      salesman: task.salesman || '—',
      priority: task.priority || 'medium',
      status: 'PENDING',
      attachment: task.attachment || null,
      startDate: task.startDate || '',
      taskType: task.taskType || '',
      createdBy: task.createdBy || 'Admin',
      relatedType: task.relatedType || '',
      relatedRef: task.relatedRef || '',
      tags: task.tags || [],
      progress: typeof task.progress === 'number' ? task.progress : 0,
      reminderBefore: task.reminderBefore || '',
      recurring: task.recurring || 'none',
    }
    setRows(prev => [...prev, newRow])
  }

  const exportTasks = () => {
    try {
      const headers = ['id','name','sub','assignee','state1','state2','due','salesman','priority','status']
      const csvRows = [headers.join(',')]
      rows.forEach(r => {
        const vals = headers.map(h => String(r[h] ?? '').replace(/"/g, '""'))
        csvRows.push(vals.map(v => `"${v}"`).join(','))
      })
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tasks.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed', err)
      alert('Export failed')
    }
  }

  // صفوف ظاهرة حسب أزرار الحالة وخيار الحالة في الفلاتر المتقدمة
  const shownRows = useMemo(() => {
    const active = filters?.status || {}
    const advStatus = advFilters.status
    const advPriority = advFilters.priority
    const advSalesman = advFilters.salesman
    const advAssigned = advFilters.assignedTo
    const advRelatedType = advFilters.relatedType
    const overdueOnly = advFilters.overdueOnly
    const todayStr = new Date().toISOString().slice(0,10)
    return rows.filter(item => {
      const okChip = active[item.status] ?? true
      const okAdvStatus = advStatus ? item.status === advStatus : true
      const okPriority = advPriority ? item.priority === advPriority : true
      const okSalesman = advSalesman ? (item.salesman === advSalesman) : true
      const okAssigned = advAssigned ? (item.assignee === advAssigned) : true
      const okRelated = advRelatedType ? (item.relatedType === advRelatedType) : true
      let okOverdue = true
      if (overdueOnly) {
        // نعتبر المهمة متأخرة فقط إذا كان تاريخ الاستحقاق بصيغة YYYY-MM-DD وأقدم من اليوم
        okOverdue = typeof item.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.due) && item.due < todayStr
      }
      return okChip && okAdvStatus && okPriority && okSalesman && okAssigned && okRelated && okOverdue
    })
  }, [rows, filters, advFilters.status, advFilters.priority, advFilters.salesman, advFilters.assignedTo, advFilters.relatedType, advFilters.overdueOnly])

  // عدّادات الحالات لجميع المهام
  const countsByStatus = useMemo(() => {
    const c = { PENDING: 0, ACCEPTING: 0, FINISHED: 0, CANCELLED: 0 }
    rows.forEach(r => { if (c[r.status] !== undefined) c[r.status]++ })
    return c
  }, [rows])

  // تحكم في عدد الصفوف المعروضة
  const [pageSize, setPageSize] = useState(20)
  const pagedRows = useMemo(() => shownRows.slice(0, pageSize), [shownRows, pageSize])

  // إدارة تحديد الصفوف وأكشنز الجدول
  const [selectedIds, setSelectedIds] = useState({})
  const selectedCount = useMemo(() => Object.values(selectedIds).filter(Boolean).length, [selectedIds])
  const toggleSelect = (id) => setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }))
  const clearSelected = () => setSelectedIds({})
  const allVisibleSelected = useMemo(() => pagedRows.length > 0 && pagedRows.every(r => selectedIds[r.id]), [pagedRows, selectedIds])
  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const copy = { ...selectedIds }
      pagedRows.forEach(r => { delete copy[r.id] })
      setSelectedIds(copy)
    } else {
      const copy = { ...selectedIds }
      pagedRows.forEach(r => { copy[r.id] = true })
      setSelectedIds(copy)
    }
  }
  const deleteSelected = () => {
    const ids = Object.keys(selectedIds).filter(id => selectedIds[id]).map(id => Number(id))
    if (ids.length === 0) { alert(isArabic ? 'لا يوجد عناصر محددة' : 'No selected items'); return }
    if (!window.confirm(isArabic ? 'تأكيد حذف العناصر المحددة؟' : 'Confirm delete selected?')) return
    setRows(prev => prev.filter(r => !ids.includes(r.id)))
    clearSelected()
  }
  const [reassignTo, setReassignTo] = useState('')
  const reassignSelected = () => {
    const ids = Object.keys(selectedIds).filter(id => selectedIds[id]).map(id => Number(id))
    if (ids.length === 0) { alert(isArabic ? 'اختر مهام لإعادة تعيين' : 'Select tasks to reassign'); return }
    if (!reassignTo) { alert(isArabic ? 'الرجاء اختيار مندوب' : 'Please choose a salesman'); return }
    // عدّل فقط السيلزمان بدون تغيير المسند
    setRows(prev => prev.map(r => ids.includes(r.id) ? { ...r, salesman: reassignTo } : r))
    clearSelected()
  }

  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  // إضافة حالة لمودال تفاصيل المهمة
  const [selectedTask, setSelectedTask] = useState(null)
  const openTaskDetails = (task) => setSelectedTask(task)
  const closeTaskDetails = () => setSelectedTask(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const closePanel = () => { setPanelOpen(false); if (window.history && window.history.length > 0) { try { window.history.back() } catch {} } }
  const closePage = () => {
    if (window.history && window.history.length > 1) {
      try { window.history.back() } catch (e) {}
    } else {
      try { window.location.href = import.meta.env.BASE_URL || '/crm-ibrahim/' } catch (e) { window.location.href = '/crm-ibrahim/' }
    }
  }
 
  return (
    <div className="px-4 md:px-6 py-4">
        {/* Page header */}
         <div className="flex items-center justify-between">
           <h1 className="text-lg font-semibold tracking-wide">ALL TASK</h1>
           <button
             type="button"
             onClick={closePage}
             className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] hover:bg-[var(--table-row-hover)]"
             title={isArabic ? 'إغلاق الصفحة' : 'Close page'}
             aria-label={isArabic ? 'إغلاق' : 'Close'}
           >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
               <path d="M18 6L6 18M6 6l12 12" />
             </svg>
             <span className="hidden sm:inline text-sm">{isArabic ? 'إغلاق' : 'Close'}</span>
           </button>
         </div>
         {/* Empty row under header */}
         <div className="h-6"></div>
 
         {/* Controls row: icons only */}
         <div className="flex items-center justify-between">
           <button
             onClick={() => setShowAdvancedFilters(v => !v)}
             className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[var(--dropdown-bg)] text-[var(--content-text)]"
             title={isArabic ? 'إظهار/إخفاء الفلاتر المتقدمة' : 'Toggle advanced filters'}
             aria-label={isArabic ? 'فلتر' : 'Filter'}
           >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                <path d="M3 6h18" />
                <path d="M6 12h12" />
                <path d="M10 18h4" />
             </svg>
           </button>
           <div className="flex items-center gap-2">
             <button
               onClick={() => setShowNewTaskModal(true)}
               className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[var(--dropdown-bg)] text-[var(--content-text)]"
               title={isArabic ? 'مهمة جديدة' : 'New Task'}
             >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                 <path d="M12 4v16M4 12h16" />
               </svg>
               {isArabic ? 'جديد' : 'New'}
             </button>
             <button onClick={exportTasks} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md bg-[var(--dropdown-bg)] text-[var(--content-text)]" title={isArabic ? 'تصدير' : 'Export'}>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                 <path d="M12 5v8m0 0l-3-3m3 3l3-3" />
                 <path d="M5 19h14" />
               </svg>
               {isArabic ? 'تصدير' : 'Export'}
             </button>
           </div>
         </div>

      {/* Top controls */}
       {showAdvancedFilters && (
       <div className="mt-4 rounded-xl border bg-[var(--content-bg)] text-[var(--content-text)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">{isArabic ? 'الفلاتر المتقدمة' : 'Advanced Filters'}</h2>
          <button
            type="button"
            onClick={resetAdv}
            className="text-xs px-2 py-1 rounded-md border bg-[var(--dropdown-bg)]"
          >
            {isArabic ? 'إعادة التعيين' : 'Reset'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
           {/* Search */}
           <div className="flex flex-col">
             <label className="text-xs opacity-70 block mb-1">{isArabic ? 'بحث' : 'Search'}</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-[var(--dropdown-bg)] w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 opacity-70">
                <circle cx="11" cy="11" r="6" /><path d="M21 21l-4.5-4.5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث عن مهمة أو مشروع...' : 'Search task or project...'}
                className="bg-transparent outline-none text-sm flex-1 w-full"
              />
            </div>
          </div>

          {/* Creation Date */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'تاريخ الإنشاء' : 'Creation'}</label>
            <input
              type="date"
              value={advFilters.createdAt}
              onChange={(e) => updateAdv('createdAt', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'تاريخ الانتهاء' : 'End'}</label>
            <input
              type="date"
              value={advFilters.endDate}
              onChange={(e) => updateAdv('endDate', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            />
          </div>

          {/* Salesman */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'المندوب' : 'Salesman'}</label>
            <select
              value={advFilters.salesman}
              onChange={(e) => updateAdv('salesman', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            >
              <option value="">{isArabic ? 'اختيار' : 'Select'}</option>
              <option>Ibrahim</option>
              <option>Admin</option>
              <option>Ahmed</option>
            </select>
          </div>

          {/* Assigned To */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'مسند إلى' : 'Assigned To'}</label>
            <select
              value={advFilters.assignedTo}
              onChange={(e) => updateAdv('assignedTo', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            >
              <option value="">{isArabic ? 'اختيار' : 'Select'}</option>
              <option>Team A</option>
              <option>Team B</option>
              <option>Support</option>
              <option>Sales</option>
              <option>Admin</option>
              <option>Ibrahim</option>
              <option>Ahmed</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'الحالة' : 'Status'}</label>
            <select
              value={advFilters.status}
              onChange={(e) => updateAdv('status', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            >
              <option value="">{isArabic ? 'اختيار' : 'Select'}</option>
              <option>PENDING</option>
              <option>ACCEPTING</option>
              <option>FINISHED</option>
              <option>CANCELLED</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'الأولوية' : 'Priority'}</label>
            <select
              value={advFilters.priority}
              onChange={(e) => updateAdv('priority', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            >
              <option value="">{isArabic ? 'اختيار' : 'Select'}</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Related Module */}
          <div className="flex flex-col">
            <label className="text-xs opacity-70 mb-1">{isArabic ? 'الموديول المرتبط' : 'Related Module'}</label>
            <select
              value={advFilters.relatedType}
              onChange={(e) => updateAdv('relatedType', e.target.value)}
              className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] text-sm w-full"
            >
              <option value="">{isArabic ? 'اختيار' : 'Select'}</option>
              <option>Lead</option>
              <option>Deal</option>
              <option>Contact</option>
              <option>Opportunity</option>
              <option>Ticket</option>
              <option>Project</option>
            </select>
          </div>
        </div>

        {/* Sort control */}
        <div className="mt-4 flex justify-end">
          <label className="text-xs opacity-70 flex items-center gap-2">
            {isArabic ? 'ترتيب حسب' : 'Sort By'}
            <select className="px-2 py-1 rounded-md border bg-transparent text-sm">
              <option>{isArabic ? 'الأحدث' : 'Newest'}</option>
              <option>{isArabic ? 'الأقرب للإنجاز' : 'Due Soon'}</option>
              <option>{isArabic ? 'الأولوية' : 'Priority'}</option>
            </select>
          </label>
          <label className="text-xs opacity-70 flex items-center gap-2 ml-4">
            <input type="checkbox" checked={advFilters.overdueOnly} onChange={() => updateAdv('overdueOnly', !advFilters.overdueOnly)} />
            {isArabic ? 'المتأخرة فقط' : 'Overdue only'}
          </label>
        </div>
      </div>
      )}
 
        {/* Spacer under filters */}
      <div className="w-full h-6" />

      {/* Data toolbar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip label={isArabic ? 'قيد الانتظار' : 'PENDING'} tone="yellow" active={!!filters.status.PENDING} count={countsByStatus.PENDING} onClick={() => toggleIn('status','PENDING')} />
          <Chip label={isArabic ? 'قبول' : 'ACCEPTING'} tone="blue" active={!!filters.status.ACCEPTING} count={countsByStatus.ACCEPTING} onClick={() => toggleIn('status','ACCEPTING')} />
          <Chip label={isArabic ? 'منتهية' : 'FINISHED'} tone="green" active={!!filters.status.FINISHED} count={countsByStatus.FINISHED} onClick={() => toggleIn('status','FINISHED')} />
          <Chip label={isArabic ? 'ملغاة' : 'CANCELLED'} tone="red" active={!!filters.status.CANCELLED} count={countsByStatus.CANCELLED} onClick={() => toggleIn('status','CANCELLED')} />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={clearTasks} className="px-3 py-1.5 rounded-md border text-sm bg-[var(--dropdown-bg)]">{isArabic ? 'مسح البيانات' : 'Clear Data'}</button>
        </div>
      </div>

      {/* شريط أكشنز للمهام المحددة */}
       <div className="mb-2 flex items-center justify-between">
         <div className="text-xs opacity-70">{isArabic ? `المحدّد: ${selectedCount}` : `Selected: ${selectedCount}`}</div>
         <div className="flex items-center gap-2">
           <button type="button" onClick={deleteSelected} className="px-3 py-1.5 rounded-md border text-sm bg-[var(--dropdown-bg)]">{isArabic ? 'مسح المحدد' : 'Delete Selected'}</button>
           <label className="text-xs opacity-70">{isArabic ? 'إعادة تعيين إلى' : 'Reassign to'}</label>
           <select value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className="px-2 py-1 rounded-md border bg-[var(--dropdown-bg)] text-sm">
             <option value="">{isArabic ? 'اختيار' : 'Select'}</option>
             <option>Ibrahim</option>
             <option>Admin</option>
             <option>Ahmed</option>
           </select>
           <button type="button" onClick={reassignSelected} className="px-3 py-1.5 rounded-md border text-sm bg-[var(--dropdown-bg)]">{isArabic ? 'تنفيذ' : 'Apply'}</button>
         </div>
       </div>

       {/* Tasks table with column separators */}
       {/* Mobile stacked list */}
       <div className="mt-2 rounded-xl border overflow-hidden md:hidden">
         <div className="px-4 py-3 bg-[var(--table-header-bg)] border-b">
           <label className="inline-flex items-center gap-2 text-sm">
             <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
             {isArabic ? 'تحديد الكل' : 'Select all'}
           </label>
         </div>
         {pagedRows.length === 0 ? (
           <div className="px-4 py-6 text-center text-sm opacity-70">
             {isArabic ? 'لا توجد مهام الآن' : 'No tasks right now'}
           </div>
         ) : (
           pagedRows.map((item) => (
             <div key={item.id} className="px-4 py-3 border-b hover:bg-[var(--table-row-hover)] cursor-pointer" onClick={() => openTaskDetails(item)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={!!selectedIds[item.id]} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); toggleSelect(item.id) }} />
                    <div className="font-medium truncate">{item.name}</div>
                  </div>
                  <div className="shrink-0">
                    {(() => {
                      const s = item.status;
                      const tone = s === 'PENDING' ? 'yellow' : s === 'ACCEPTING' ? 'blue' : s === 'FINISHED' ? 'green' : s === 'CANCELLED' ? 'red' : 'yellow';
                      const label = isArabic
                        ? (s === 'PENDING' ? 'قيد الانتظار' : s === 'ACCEPTING' ? 'قبول' : s === 'FINISHED' ? 'منتهية' : s === 'CANCELLED' ? 'ملغاة' : s)
                        : s;
                      return <Badge label={label} tone={tone} />;
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="opacity-70">{isArabic ? 'المسند' : 'Assigned'}</div>
                    <div className="truncate">{item.assignee}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="opacity-70">{isArabic ? 'تاريخ الاستحقاق' : 'Due'}</div>
                    <div className="truncate">{item.due}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="opacity-70">{isArabic ? 'المندوب' : 'Salesman'}</div>
                    <div className="truncate">{item.salesman}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="opacity-70">{isArabic ? 'الأولوية' : 'Priority'}</div>
                    <div>
                      {(() => { const tone = item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'yellow' : 'green'; const label = item.priority === 'high' ? (isArabic ? 'عالية' : 'High') : item.priority === 'medium' ? (isArabic ? 'متوسطة' : 'Medium') : (isArabic ? 'منخفضة' : 'Low'); return <Badge label={label} tone={tone} />; })()}
                    </div>
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-[var(--divider)]">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); startTask(item.id) }} className="px-2 py-1 rounded-md border text-xs bg-[var(--dropdown-bg)]" title={isArabic ? 'بدء المهمة' : 'Start Task'}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); finishTask(item.id) }} className="px-2 py-1 rounded-md border text-xs bg-[var(--dropdown-bg)]" title={isArabic ? 'إنهاء المهمة' : 'Finish Task'}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); cancelTask(item.id) }} className="px-2 py-1 rounded-md border text-xs" title={isArabic ? 'إلغاء المهمة' : 'Cancel Task'}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
           ))
         )}
       </div>

       {/* Desktop table */}
      <div className="mt-2 rounded-xl border hidden md:block">
       <table className="w-full table-fixed text-sm">
          <thead className="bg-[var(--table-header-bg)]">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
              </th>
              <th className="px-4 py-3 text-left">{isArabic ? 'المهمة' : 'Task'}</th>
              <th className="px-4 py-3 text-left border-l border-[var(--divider)]">{isArabic ? 'المسند' : 'Assigned'}</th>
              <th className="px-4 py-3 text-left border-l border-[var(--divider)]">{isArabic ? 'الحالة' : 'Status'}</th>
              <th className="px-4 py-3 text-left border-l border-[var(--divider)]">{isArabic ? 'تاريخ الاستحقاق' : 'Due'}</th>
              <th className="px-4 py-3 text-left border-l border-[var(--divider)]">{isArabic ? 'المندوب' : 'Salesman'}</th>
              <th className="px-4 py-3 text-left border-l border-[var(--divider)]">{isArabic ? 'الأولوية' : 'Priority'}</th>
              <th className="px-4 py-3 text-left border-l border-[var(--divider)]">{isArabic ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--content-bg)]">
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-sm opacity-70">
                  {isArabic ? 'لا توجد مهام الآن' : 'No tasks right now'}
                </td>
              </tr>
            ) : (
              pagedRows.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--table-row-hover)] cursor-pointer" onClick={() => openTaskDetails(item)}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={!!selectedIds[item.id]} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); toggleSelect(item.id) }} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    {/* إخفاء الوصف في الجدول */}
                  </td>
                  <td className="px-4 py-3 border-l border-[var(--divider)]">{item.assignee}</td>
                  <td className="px-4 py-3 border-l border-[var(--divider)]">
                  <div className="flex items-center gap-1">
                    {(() => {
                      const s = item.status;
                      const tone = s === 'PENDING' ? 'yellow' : s === 'ACCEPTING' ? 'blue' : s === 'FINISHED' ? 'green' : s === 'CANCELLED' ? 'red' : 'yellow';
                      const label = isArabic
                        ? (s === 'PENDING' ? 'قيد الانتظار' : s === 'ACCEPTING' ? 'قبول' : s === 'FINISHED' ? 'منتهية' : s === 'CANCELLED' ? 'ملغاة' : s)
                        : s;
                      return <Badge label={label} tone={tone} />;
                    })()}
                  </div>
                </td>
                  <td className="px-4 py-3 border-l border-[var(--divider)]">{item.due}</td>
                  <td className="px-4 py-3 border-l border-[var(--divider)]">{item.salesman}</td>
                  <td className="px-4 py-3 border-l border-[var(--divider)]">
                    {(() => { const tone = item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'yellow' : 'green'; const label = item.priority === 'high' ? (isArabic ? 'عالية' : 'High') : item.priority === 'medium' ? (isArabic ? 'متوسطة' : 'Medium') : (isArabic ? 'منخفضة' : 'Low'); return <Badge label={label} tone={tone} />; })()}
                  </td>
                  <td className="px-4 py-3 border-l border-[var(--divider)]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button type="button" onClick={(e) => { e.stopPropagation(); startTask(item.id) }} className="px-2 py-1 rounded-md border text-xs bg-[var(--dropdown-bg)]" title={isArabic ? 'بدء المهمة' : 'Start Task'}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); finishTask(item.id) }} className="px-2 py-1 rounded-md border text-xs bg-[var(--dropdown-bg)]" title={isArabic ? 'إنهاء المهمة' : 'Finish Task'}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); cancelTask(item.id) }} className="px-2 py-1 rounded-md border text-xs" title={isArabic ? 'إلغاء المهمة' : 'Cancel Task'}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">{isArabic ? 'عرض' : 'Show'}</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-2 py-1 rounded-md border bg-[var(--dropdown-bg)] text-sm">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="text-sm opacity-70">{isArabic ? `من ${shownRows.length}` : `of ${shownRows.length}`}</div>
      </div>
      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onSave={(task) => { addTask(task); setShowNewTaskModal(false); }}
      />
      <TaskDetailsModal isOpen={!!selectedTask} onClose={closeTaskDetails} task={selectedTask} />
    </div>
    )
}
