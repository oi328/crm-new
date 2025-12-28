import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '@shared/components/SearchableSelect'

// Mock data for demo purposes
const MOCK_DEPT = {
  id: 'd-3001', name: 'Customer Support', manager: 'Ibrahim Hassan', teams: 3, employees: 18,
  kpis: { activeTickets: 12, avgResponseTime: '2h 15m', tasksInProgress: 7, csat: '92%' }
}
const MOCK_TEAMS = [
  { id: 't-2001', name: 'Tier 1', leader: 'Ahmed Ali', members: 8, assignedTasks: 12 },
  { id: 't-2002', name: 'Tier 2', leader: 'Sara Hassan', members: 6, assignedTasks: 8 },
  { id: 't-2003', name: 'Escalations', leader: 'Omar Tarek', members: 4, assignedTasks: 3 },
]
const MOCK_USERS = [
  { id: 'u-1001', name: 'Ibrahim Hassan', role: 'Admin', team: 'Tier 1', status: 'Active' },
  { id: 'u-1002', name: 'Sara Ali', role: 'Agent', team: 'Tier 2', status: 'Inactive' },
  { id: 'u-1003', name: 'Mohamed Salem', role: 'Manager', team: 'Escalations', status: 'Active' },
]
const MOCK_TICKETS = [
  { id: 'tick-5001', type: 'Ticket', priority: 'High', assignedTo: 'Tier 1', status: 'Open', sla: '2025-12-01' },
  { id: 'tick-5002', type: 'Ticket', priority: 'Medium', assignedTo: 'Tier 2', status: 'Pending', sla: '2025-12-03' },
  { id: 'lead-6001', type: 'Lead', priority: 'High', assignedTo: 'Escalations', status: 'Open', sla: '2025-11-30' },
]
const MOCK_TASKS = [
  { id: 'task-7001', title: 'Follow up', assignedTo: 'Tier 1', relatedTo: 'Ticket', status: 'In Progress', deadline: '2025-12-02' },
  { id: 'task-7002', title: 'Onboarding', assignedTo: 'Tier 2', relatedTo: 'General', status: 'Open', deadline: '2025-12-10' },
]

export default function UserManagementDepartmentDetails() {
  const { id } = useParams()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [tab, setTab] = useState('overview')
  const dept = useMemo(() => ({ ...MOCK_DEPT, id }), [id])
  const navigate = useNavigate()

  const closePage = () => {
    navigate('/user-management/departments')
  }

  const deleteDepartment = () => {
    if (!window.confirm(isArabic ? 'حذف القسم؟' : 'Delete department?')) return
    // Mock delete then navigate back to departments list
    alert(isArabic ? 'تم حذف القسم (تجريبي)' : 'Department deleted (mock)')
    navigate('/user-management/departments')
  }

  const editDepartment = () => {
    try {
      // Pass current department data to the form via localStorage (mock prefill)
      localStorage.setItem('editDept', JSON.stringify(dept))
    } catch {}
    navigate(`/user-management/departments/new?mode=edit&id=${encodeURIComponent(id)}`)
  }

  const addTeam = () => {
    navigate(`/user-management/teams/new?departmentId=${encodeURIComponent(id)}`)
  }

  const renderTabIcon = (key) => {
    switch (key) {
      case 'overview':
        // home icon
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        )
      case 'teams':
        // users icon
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      case 'employees':
        // user icon
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
          </svg>
        )
      case 'tickets':
        // file-text icon
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
          </svg>
        )
      case 'tasks':
        // check-square icon
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
        )
      case 'analytics':
        // bar-chart icon
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Layout title={isArabic ? `تفاصيل القسم — ${dept.name}` : `Department Details — ${dept.name}`}>
      <div className="container mx-auto px-4 py-4">
        {/* Top-right actions */}
        <div className="flex justify-end items-center gap-2 mb-2">
          {/* Add Team (next to Delete) */}
          <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'إضافة فريق' : 'Add Team'} aria-label={isArabic ? 'إضافة فريق' : 'Add Team'} onClick={addTeam}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="17" y1="11" x2="23" y2="11"></line>
            </svg>
          </button>
          {/* Delete (first on the right) */}
          <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'حذف' : 'Delete'} aria-label={isArabic ? 'حذف' : 'Delete'} onClick={deleteDepartment}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          {/* Edit */}
          <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'تعديل' : 'Edit'} aria-label={isArabic ? 'تعديل' : 'Edit'} onClick={editDepartment}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </button>
          {/* Close */}
          <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'إغلاق' : 'Close'} aria-label={isArabic ? 'إغلاق' : 'Close'} onClick={closePage}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {/* Header */}
        <div className="glass-panel rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">{dept.name}</h1>
              <div className="text-sm text-[var(--muted-text)]">{isArabic ? 'مدير القسم:' : 'Manager:'} {dept.manager}</div>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-[var(--muted-text)]">{isArabic ? 'إجمالي الموظفين' : 'Total Employees'}</div>
                <div className="text-lg font-bold">{dept.employees}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted-text)]">{isArabic ? 'إجمالي الفرق' : 'Total Teams'}</div>
                <div className="text-lg font-bold">{dept.teams}</div>
              </div>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="kpi-card"><div className="kpi-title">{isArabic ? 'تيكتس نشطة' : 'Active Tickets'}</div><div className="kpi-value">{dept.kpis.activeTickets}</div></div>
            <div className="kpi-card"><div className="kpi-title">{isArabic ? 'متوسط زمن الاستجابة' : 'Avg Response Time'}</div><div className="kpi-value">{dept.kpis.avgResponseTime}</div></div>
            <div className="kpi-card"><div className="kpi-title">{isArabic ? 'مهام قيد التنفيذ' : 'Tasks in Progress'}</div><div className="kpi-value">{dept.kpis.tasksInProgress}</div></div>
            <div className="kpi-card"><div className="kpi-title">CSAT</div><div className="kpi-value">{dept.kpis.csat}</div></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-3">
          {[
            { key: 'overview', label: isArabic ? 'نظرة عامة' : 'Overview' },
            { key: 'teams', label: isArabic ? 'الفرق' : 'Teams' },
            { key: 'employees', label: isArabic ? 'الموظفون' : 'Employees' },
            { key: 'tickets', label: isArabic ? 'التذاكر/الليدز' : 'Tickets / Leads' },
            { key: 'tasks', label: isArabic ? 'المهام' : 'Tasks' },
            { key: 'analytics', label: isArabic ? 'تحليلات وتقارير' : 'Analytics & Reports' },
          ].map(t => (
            <button
              key={t.key}
              className={`pb-2 text-sm ${tab===t.key ? 'border-b-2 border-white text-white' : 'text-[var(--muted-text)]'}`}
              onClick={()=>setTab(t.key)}
            >
              <span className="inline-flex items-center gap-2">
                {renderTabIcon(t.key)}
                <span>{t.label}</span>
              </span>
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-2">{isArabic ? 'معلومات القسم' : 'Department Info'}</h3>
            <p className="text-sm">{isArabic ? 'هيكل القسم: قسم → فرق → مستخدمون' : 'Department tree: Department → Teams → Users'}</p>
          </div>
        )}

        {tab === 'employees' && (
          <div className="glass-panel rounded-xl overflow-x-auto">
            <table className="nova-table w-full">
              <thead>
                <tr className="thead-soft">
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.team}</td>
                    <td>{u.status}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'تعيين فريق' : 'Assign Team'} aria-label={isArabic ? 'تعيين فريق' : 'Assign Team'}>
                          {/* users icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'عرض البروفايل' : 'View Profile'} aria-label={isArabic ? 'عرض البروفايل' : 'View Profile'}>
                          {/* user icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2 p-3">
              <button className="btn btn-primary">{isArabic ? 'إضافة مستخدم للقسم' : 'Add user to department'}</button>
              <button className="btn btn-ghost">{isArabic ? 'نقل مستخدم بين الفرق' : 'Move user between teams'}</button>
            </div>
          </div>
        )}

        {tab === 'tickets' && (
          <div className="glass-panel rounded-xl overflow-x-auto">
            <div className="p-3 flex flex-wrap items-center gap-2">
              <SearchableSelect className="w-40" options={["Tickets","Leads"]} value={"Tickets"} onChange={()=>{}} placeholder="Type" />
              <SearchableSelect className="w-44" options={["All Statuses","Open","Pending","Closed"]} value={"All Statuses"} onChange={()=>{}} placeholder="Status" />
              <SearchableSelect className="w-44" options={["All Priorities","High","Medium","Low"]} value={"All Priorities"} onChange={()=>{}} placeholder="Priority" />
            </div>
            <table className="nova-table w-full">
              <thead>
                <tr className="thead-soft">
                  <th>ID</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>SLA Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TICKETS.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.type}</td>
                    <td>{t.priority}</td>
                    <td>{t.assignedTo}</td>
                    <td>{t.status}</td>
                    <td>{t.sla}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'عرض' : 'View'} aria-label={isArabic ? 'عرض' : 'View'}>
                          {/* eye icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'إعادة تعيين' : 'Reassign'} aria-label={isArabic ? 'إعادة تعيين' : 'Reassign'}>
                          {/* refresh-cw icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'tasks' && (
          <div className="glass-panel rounded-xl overflow-x-auto">
            <table className="nova-table w-full">
              <thead>
                <tr className="thead-soft">
                  <th>Task ID</th>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Related To</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TASKS.map(task => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td>{task.assignedTo}</td>
                    <td>{task.relatedTo}</td>
                    <td>{task.status}</td>
                    <td>{task.deadline}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'إضافة مهمة' : 'Add Task'} aria-label={isArabic ? 'إضافة مهمة' : 'Add Task'}>
                          {/* plus-square icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'إعادة تعيين' : 'Reassign'} aria-label={isArabic ? 'إعادة تعيين' : 'Reassign'}>
                          {/* refresh-cw icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
                            <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'teams' && (
          <div className="glass-panel rounded-xl overflow-x-auto">
            <table className="nova-table w-full">
              <thead>
                <tr className="thead-soft">
                  <th>Team ID</th>
                  <th>Team Name</th>
                  <th>Team Leader</th>
                  <th>No. of Members</th>
                  <th>Assigned Tasks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TEAMS.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.leader}</td>
                    <td>{t.members}</td>
                    <td>{t.assignedTasks}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'عرض' : 'View'} aria-label={isArabic ? 'عرض' : 'View'}>
                          {/* eye icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'تعيين مستخدمين' : 'Assign Users'} aria-label={isArabic ? 'تعيين مستخدمين' : 'Assign Users'}>
                          {/* users-plus icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="17" y1="11" x2="23" y2="11"></line>
                          </svg>
                        </button>
                        <button className="btn btn-ghost btn-square p-1" title={isArabic ? 'تعيين مهام' : 'Assign Tasks'} aria-label={isArabic ? 'تعيين مهام' : 'Assign Tasks'}>
                          {/* clipboard-list icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="2" width="6" height="4" rx="1" ry="1"></rect>
                            <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"></path>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="9" y1="12" x2="15" y2="12"></line>
                            <line x1="9" y1="16" x2="13" y2="16"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2 p-3">
              <button className="btn btn-primary">{isArabic ? 'إضافة فريق للقسم' : 'Add Team to Department'}</button>
              <button className="btn btn-ghost">{isArabic ? 'إزالة فريق' : 'Remove Team'}</button>
            </div>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{isArabic ? 'المغلق من التيكتس' : 'Tickets closed'}</h3>
                <div className="text-sm text-[var(--muted-text)]">{isArabic ? 'مخططات توضيحية Placeholder' : 'Charts placeholder'}</div>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{isArabic ? 'متوسط زمن الحل' : 'Average resolution time'}</h3>
                <div className="text-sm text-[var(--muted-text)]">{isArabic ? 'مخططات Placeholder' : 'Charts placeholder'}</div>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{isArabic ? 'مهام مكتملة' : 'Tasks completed'}</h3>
                <div className="text-sm text-[var(--muted-text)]">{isArabic ? 'أرقام Placeholder' : 'KPIs placeholder'}</div>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-2">{isArabic ? 'توزيع الأحمال حسب الفريق' : 'Workload by team'}</h3>
                <div className="text-sm text-[var(--muted-text)]">{isArabic ? 'مخططات Placeholder' : 'Charts placeholder'}</div>
              </div>
          </div>
        )}
      </div>
    </Layout>
  )
}