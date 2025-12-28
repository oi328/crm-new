import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '@shared/components/SearchableSelect'
import { getTeamsForDept } from '../../data/orgStructure'

const MOCK_MANAGERS = [
  { id: 'u-1003', fullName: 'Mohamed Salem', role: 'Manager' },
  { id: 'u-1004', fullName: 'Omar Tarek', role: 'Manager' },
  { id: 'u-1005', fullName: 'Mona Farid', role: 'Manager' },
]
const MOCK_TEAMS = [
  { id: 't-2001', name: 'Support' },
  { id: 't-2002', name: 'Sales' },
  { id: 't-2003', name: 'Technical' },
]

// Department-level role options
const ROLE_OPTIONS = [
  { key: 'Manager', labelAr: 'المدير', labelEn: 'Manager' },
  { key: 'Team Leader', labelAr: 'قائد الفريق', labelEn: 'Team Leader' },
  { key: 'Agent', labelAr: 'الموظف', labelEn: 'Agent' },
  { key: 'Viewer', labelAr: 'مراقب', labelEn: 'Viewer' },
]

// Permission groups and actions for a department
const PERMISSIONS_DEPT = [
  { key: 'Department', labelAr: 'القسم', labelEn: 'Department', actions: ['view', 'update', 'delete', 'assignManager'] },
  { key: 'Teams', labelAr: 'الفرق', labelEn: 'Teams', actions: ['view', 'create', 'update', 'delete', 'assignUsers', 'assignTasks'] },
  { key: 'Employees', labelAr: 'الموظفون', labelEn: 'Employees', actions: ['view', 'assign', 'remove'] },
  { key: 'TicketsLeads', labelAr: 'التذاكر/الليدز', labelEn: 'Tickets / Leads', actions: ['view', 'create', 'update', 'delete', 'assign', 'close'] },
  { key: 'Tasks', labelAr: 'المهام', labelEn: 'Tasks', actions: ['view', 'create', 'update', 'delete', 'assign', 'complete'] },
  { key: 'Reports', labelAr: 'التقارير', labelEn: 'Reports', actions: ['view', 'export'] },
]

const ACTION_LABELS_EN = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  assign: 'Assign',
  close: 'Close',
  export: 'Export',
  complete: 'Complete',
  assignManager: 'Assign Manager',
}

const ACTION_LABELS_AR = {
  view: 'عرض',
  create: 'إنشاء',
  update: 'تعديل',
  delete: 'حذف',
  assign: 'تعيين',
  close: 'إغلاق',
  export: 'تصدير',
  complete: 'إكمال',
  assignManager: 'تعيين مدير',
}

export default function UserManagementDepartmentForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = (searchParams.get('mode') || 'create').toLowerCase()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Active')
  const [managerId, setManagerId] = useState('')
  const [selectedTeamIds, setSelectedTeamIds] = useState([])
  const [rolePermissions, setRolePermissions] = useState(() => {
    const initial = {}
    ROLE_OPTIONS.forEach(r => { initial[r.key] = {} })
    return initial
  })

  const toggleTeam = (id) => {
    setSelectedTeamIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { name, code, description, status, managerId, teamIds: selectedTeamIds, permissions: rolePermissions }
    
    alert(mode === 'edit' ? (isArabic ? 'تم تحديث القسم' : 'Department updated') : (isArabic ? 'تم حفظ القسم بنجاح' : 'Department saved'))
    try { localStorage.removeItem('editDept') } catch {}
    navigate('/user-management/departments')
  }

  const isChecked = (roleKey, groupKey, action) => {
    return !!(rolePermissions?.[roleKey]?.[groupKey]?.[action])
  }

  const toggleRolePerm = (roleKey, groupKey, action) => {
    setRolePermissions(prev => {
      const next = { ...prev }
      const roleObj = { ...(next[roleKey] || {}) }
      const groupObj = { ...(roleObj[groupKey] || {}) }
      groupObj[action] = !groupObj[action]
      roleObj[groupKey] = groupObj
      next[roleKey] = roleObj
      return next
    })
  }

  useEffect(() => {
    if (mode === 'edit') {
      try {
        const raw = localStorage.getItem('editDept')
        if (raw) {
          const d = JSON.parse(raw)
          if (d?.name) setName(d.name)
          if (d?.id) setCode(d.id)
          if (d?.manager) setDescription(`${isArabic ? 'مدير:' : 'Manager:'} ${d.manager}`)
          if (d?.status) setStatus(d.status)
        }
      } catch {}
    }
  }, [mode, isArabic])

  // Teams available for the current department name
  const availableTeams = useMemo(() => {
    const teams = name ? getTeamsForDept(name) : []
    return Array.isArray(teams) ? teams : []
  }, [name])

  // Navigate to create team page prefilled with department name
  const goCreateTeam = () => {
    const deptParam = name ? `?departmentName=${encodeURIComponent(name)}` : ''
    navigate(`/user-management/teams/create${deptParam}`)
  }

  return (
    <Layout title={mode==='edit' ? (isArabic ? 'تعديل قسم' : 'Edit Department') : (isArabic ? 'إضافة قسم' : 'Add Department')}>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-3">{mode==='edit' ? (isArabic ? 'تعديل قسم' : 'Edit Department') : (isArabic ? 'إضافة قسم' : 'Add Department')}</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-soft" placeholder={isArabic ? 'اسم القسم' : 'Department Name'} value={name} onChange={e=>setName(e.target.value)} required />
              <input className="input-soft" placeholder={isArabic ? 'كود القسم (اختياري)' : 'Department Code (optional)'} value={code} onChange={e=>setCode(e.target.value)} />
              <textarea className="input-soft md:col-span-2" placeholder={isArabic ? 'الوصف' : 'Description'} value={description} onChange={e=>setDescription(e.target.value)} />
              <SearchableSelect
                className="w-full"
                options={[
                  { value: 'Active', label: isArabic ? 'نشط' : 'Active' },
                  { value: 'Inactive', label: isArabic ? 'غير نشط' : 'Inactive' },
                ]}
                value={status}
                onChange={(val)=>setStatus(val)}
                placeholder={isArabic ? 'اختر الحالة' : 'Select status'}
              />
            </div>
          </div>

          {/* Manager Assignment */}
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">{isArabic ? 'تعيين المدير' : 'Manager Assignment'}</h2>
            <SearchableSelect
              className="w-full"
              options={MOCK_MANAGERS.map(m=>({ value: m.id, label: m.fullName }))}
              value={managerId}
              onChange={(val)=>setManagerId(val)}
              placeholder={isArabic ? 'اختر مديرًا' : 'Select a manager'}
            />
          </div>

          {/* Team Structure Setup */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{isArabic ? 'هيكلة الفرق (اختياري)' : 'Team Structure Setup (Optional)'}</h2>
              <button
                type="button"
                className="btn btn-ghost btn-square p-1"
                title={isArabic ? 'إنشاء فريق' : 'Create Team'}
                aria-label={isArabic ? 'إنشاء فريق' : 'Create Team'}
                onClick={goCreateTeam}
              >
                {/* plus-user icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="16" y1="11" x2="22" y2="11"></line>
                </svg>
              </button>
            </div>
            {availableTeams.length === 0 ? (
              <p className="text-sm text-[var(--muted-text)]">
                {isArabic
                  ? 'لا توجد فرق مرتبطة بهذا الاسم بعد. يمكنك إنشاء فريق جديد.'
                  : 'No teams linked to this department name yet. You can create a new team.'}
            </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {availableTeams.map(teamName => (
                  <label key={teamName} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedTeamIds.includes(teamName)}
                      onChange={()=>toggleTeam(teamName)}
                    />
                    <span>{teamName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Permissions (Optional) */}
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">{isArabic ? 'الصلاحيات (اختياري)' : 'Permissions (Optional)'}</h2>
            <p className="text-sm text-[var(--muted-text)]">{isArabic ? 'إعداد صلاحيات الدور لهذا القسم' : 'Configure role permissions for this department'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {ROLE_OPTIONS.map(role => (
                <div key={role.key} className="glass-panel rounded-lg p-3">
                  <h3 className="font-medium mb-2">{isArabic ? role.labelAr : role.labelEn}</h3>
                  {(role.key === 'Agent' || role.key === 'Viewer' ? PERMISSIONS_DEPT.filter(g => g.key !== 'Department') : PERMISSIONS_DEPT).map(group => (
                    <div key={group.key} className="mb-3">
                      <div className="text-sm font-medium mb-1">{isArabic ? group.labelAr : group.labelEn}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.actions.map(action => (
                          <label key={action} className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={isChecked(role.key, group.key, action)}
                              onChange={() => toggleRolePerm(role.key, group.key, action)}
                            />
                            <span>{isArabic ? ACTION_LABELS_AR[action] : ACTION_LABELS_EN[action]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="btn btn-primary">{isArabic ? 'حفظ' : 'Save'}</button>
            <button type="button" className="btn btn-ghost" onClick={()=>navigate('/user-management/departments')}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
