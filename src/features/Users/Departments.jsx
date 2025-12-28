import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '@shared/layouts/Layout'
import UMActionButtons from '../../components/UMActionButtons'
import AssignmentModal from '../../components/AssignmentModal'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '@shared/components/SearchableSelect'

const MOCK_DEPARTMENTS = [
  { id: 'd-3001', name: 'Customer Support', manager: 'Ibrahim Hassan', teamsCount: 3, employeesCount: 18, createdAt: '2025-08-10', status: 'Active' },
  { id: 'd-3002', name: 'Sales', manager: 'Sara Ali', teamsCount: 4, employeesCount: 25, createdAt: '2025-07-22', status: 'Active' },
  { id: 'd-3003', name: 'Technical Support', manager: 'Mohamed Salem', teamsCount: 2, employeesCount: 10, createdAt: '2025-09-01', status: 'Inactive' },
]

export default function UserManagementDepartments() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [managerFilter, setManagerFilter] = useState('All')
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS)
  const [selectedDeptIds, setSelectedDeptIds] = useState([])

  const managers = useMemo(() => ['All', ...Array.from(new Set(MOCK_DEPARTMENTS.map(d => d.manager)))], [])

  const filtered = useMemo(() => {
    return departments.filter(d => (
      (!q || [d.name, d.manager].join(' ').toLowerCase().includes(q.toLowerCase())) &&
      (statusFilter === 'All' || d.status === statusFilter) &&
      (managerFilter === 'All' || d.manager === managerFilter)
    ))
  }, [departments, q, statusFilter, managerFilter])

  const allSelected = filtered.length > 0 && filtered.every(d => selectedDeptIds.includes(d.id))
  const toggleSelectAll = () => {
    if (allSelected) setSelectedDeptIds([])
    else setSelectedDeptIds(filtered.map(d => d.id))
  }
  const toggleSelect = (id) => {
    setSelectedDeptIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const deleteDepartment = (id) => {
    if (!confirm(isArabic ? 'حذف القسم؟' : 'Delete department?')) return
    setDepartments(prev => prev.filter(d => d.id !== id))
  }

  const [showAssign, setShowAssign] = useState(false)
  const [assignContext, setAssignContext] = useState('task') // 'task' | 'lead' | 'ticket'
  const [defaultTargetId, setDefaultTargetId] = useState('')
  const openAssign = (context, deptId) => {
    setAssignContext(context)
    setDefaultTargetId(deptId || '')
    setShowAssign(true)
  }

  const bulkLabels = useMemo(() => ({
    title: isArabic ? 'أكشنات جماعية على المحدد' : 'Bulk actions on selected',
    deleteSelected: 'delete',
    assignTask: isArabic ? 'تعيين تاسك' : 'Assign task',
    assignLead: isArabic ? 'تعيين ليد' : 'Assign lead',
    assignTicket: isArabic ? 'تعيين تيكت' : 'Assign ticket',
    selectFirst: isArabic ? 'اختر أقسام أولًا' : 'Select departments first',
    confirmDelete: (count) => isArabic ? `سيتم حذف ${count} قسم. هل أنت متأكد؟` : `This will delete ${count} department(s). Are you sure?`,
    deletedMsg: isArabic ? 'تم حذف الأقسام المحددة' : 'Selected departments deleted',
  }), [isArabic])

  const handleSubmitAssign = (payload) => {
    console.log('Assignment payload (Departments):', payload)
    alert(isArabic ? 'تم حفظ التعيين بنجاح' : 'Assignment saved successfully')
  }

  return (
    <Layout title={isArabic ? 'إدارة المستخدمين — الأقسام' : 'User Management — Departments'}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">{isArabic ? 'الأقسام' : 'Departments'}</h1>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" onClick={() => {
              const headers = ['ID','Name','Manager','Teams Count','Employees Count','Created At','Status']
              const rows = filtered.map(d => [d.id, d.name, d.manager, String(d.teamsCount), String(d.employeesCount), d.createdAt, d.status])
              const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v || '').replace(/"/g,'""')}"`).join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'departments-export.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}>{isArabic ? 'تصدير إكسل' : 'Export Excel'}</button>
            <Link to="/user-management/departments/new" className="btn btn-primary">{isArabic ? 'إضافة قسم جديد' : 'Add New Department'}</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-xl p-3 mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">{isArabic ? 'بحث' : 'Search'}</label>
            <input className="input-soft" placeholder={isArabic ? 'بحث بالاسم أو المدير' : 'Search (name, manager)'} value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">{isArabic ? 'الحالة' : 'Status'}</label>
            <SearchableSelect
              className="w-full"
              options={['All','Active','Inactive'].map(s=>({ value: s, label: isArabic && s==='All' ? 'الكل' : s }))}
              value={statusFilter}
              onChange={(val)=>setStatusFilter(val)}
              placeholder={isArabic ? 'اختر الحالة' : 'Select status'}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">{isArabic ? 'المدير' : 'Manager'}</label>
            <SearchableSelect
              className="w-full"
              options={managers}
              value={managerFilter}
              onChange={(val)=>setManagerFilter(val)}
              placeholder={isArabic ? 'اختر مديرًا' : 'Select manager'}
            />
          </div>
        </div>

        {/* Bulk actions bar (shows only when rows selected) */}
        {selectedDeptIds.length > 0 && (
          <div className="glass-panel rounded-xl px-3 py-2 mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--muted-text)]">{bulkLabels.title}:</span>
            <button className="btn btn-ghost" onClick={()=>{
              if (selectedDeptIds.length===0) return alert(bulkLabels.selectFirst)
              if (!confirm(bulkLabels.confirmDelete(selectedDeptIds.length))) return
              setDepartments(prev=>prev.filter(d=>!selectedDeptIds.includes(d.id)))
              setSelectedDeptIds([])
              alert(bulkLabels.deletedMsg)
            }}>{bulkLabels.deleteSelected}</button>
            <button className="btn btn-ghost" onClick={()=>openAssign('task')}>{bulkLabels.assignTask}</button>
            <button className="btn btn-ghost" onClick={()=>openAssign('lead')}>{bulkLabels.assignLead}</button>
            <button className="btn btn-ghost" onClick={()=>openAssign('ticket')}>{bulkLabels.assignTicket}</button>
          </div>
        )}

        {/* Table */}
        <div className="glass-panel rounded-xl overflow-x-auto">
          <table className="nova-table w-full">
            <thead>
              <tr className="thead-soft">
                <th><input type="checkbox" className="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                <th>{isArabic ? 'معرّف القسم' : 'Department ID'}</th>
                <th>{isArabic ? 'اسم القسم' : 'Department Name'}</th>
                <th>{isArabic ? 'مدير القسم' : 'Department Manager'}</th>
                <th>{isArabic ? 'عدد الفرق' : 'Teams Count'}</th>
                <th>{isArabic ? 'عدد الموظفين' : 'Employees Count'}</th>
                <th>{isArabic ? 'تاريخ الإنشاء' : 'Created Date'}</th>
                <th>{isArabic ? 'الحالة' : 'Status'}</th>
                <th>{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><input type="checkbox" className="checkbox" checked={selectedDeptIds.includes(d.id)} onChange={()=>toggleSelect(d.id)} /></td>
                  <td>{d.id}</td>
                  <td className="font-medium">
                    <button className="link" onClick={()=>navigate(`/user-management/departments/${d.id}`)}>{d.name}</button>
                  </td>
                  <td>{d.manager}</td>
                  <td>{d.teamsCount}</td>
                  <td>{d.employeesCount}</td>
                  <td>{d.createdAt}</td>
                  <td>{d.status}</td>
                  <td>
                    <UMActionButtons
                      onEdit={()=>navigate(`/user-management/departments/${d.id}`)}
                      onToggleActive={()=>setDepartments(prev=>prev.map(x=>x.id===d.id?{...x, status: x.status==='Active'?'Inactive':'Active'}:x))}
                      onDelete={()=>deleteDepartment(d.id)}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="btn btn-ghost btn-square p-1"
                        title={isArabic ? 'تعيين مدير' : 'Assign Manager'}
                        aria-label={isArabic ? 'تعيين مدير' : 'Assign Manager'}
                        onClick={()=>alert(isArabic ? 'تعيين مدير للقسم' : 'Assign department manager')}
                      >
                        {/* user-plus icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <line x1="19" y1="8" x2="19" y2="14"></line>
                          <line x1="16" y1="11" x2="22" y2="11"></line>
                        </svg>
                      </button>
                      <button
                        className="btn btn-ghost btn-square p-1"
                        title={isArabic ? 'إسناد فرق' : 'Assign Teams'}
                        aria-label={isArabic ? 'إسناد فرق' : 'Assign Teams'}
                        onClick={()=>alert(isArabic ? 'إسناد فرق للقسم' : 'Assign teams to department')}
                      >
                        {/* users icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAssign && (
          <AssignmentModal
            open={showAssign}
            onClose={()=>setShowAssign(false)}
            onSubmit={handleSubmitAssign}
            context={assignContext}
            departments={departments.map(d=>({ id: d.id, name: d.name }))}
            teams={[]}
            users={[]}
            leads={[]}
            defaultAssignType={'department'}
            defaultTargetId={defaultTargetId}
          />
        )}
      </div>
    </Layout>
  )
}
