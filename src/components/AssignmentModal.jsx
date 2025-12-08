import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Central unified assignment modal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: (payload) => void
 * - context: 'task' | 'lead' | 'ticket' | 'user'
 * - teams: Array<{ id: string, name: string }>
 * - users: Array<{ id: string, fullName: string, team?: string, role?: string }>
 * - defaultAssignType?: 'team' | 'user'
 * - defaultTargetId?: string // teamId or userId
 */
export default function AssignmentModal({
  open,
  onClose,
  onSubmit,
  context = 'task',
  teams = [],
  users = [],
  leads = [],
  defaultAssignType = 'team',
  defaultTargetId,
}) {
  const { i18n } = useTranslation()
  const [assignType, setAssignType] = useState(defaultAssignType)
  const [teamId, setTeamId] = useState(defaultAssignType === 'team' ? defaultTargetId || teams[0]?.id : '')
  const [userId, setUserId] = useState(defaultAssignType === 'user' ? defaultTargetId || users[0]?.id : '')
  const [teamIds, setTeamIds] = useState(defaultAssignType === 'team' && defaultTargetId ? [defaultTargetId] : [])
  const [userIds, setUserIds] = useState(defaultAssignType === 'user' && defaultTargetId ? [defaultTargetId] : [])
  const [leadId, setLeadId] = useState(leads[0]?.id || '')
  const [priority, setPriority] = useState('Normal')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const allowMultiAssign = context === 'task'

  const isAr = i18n?.language === 'ar'
  const labels = useMemo(() => ({
    title: isAr ? 'مركز التعيين' : 'Assignment Center',
    close: isAr ? 'إغلاق' : 'Close',
    assignType: isAr ? 'نوع المُستهدف' : 'Assign Type',
    team: isAr ? 'فريق' : 'Team',
    user: isAr ? 'مستخدم' : 'User',
    teams: isAr ? (allowMultiAssign ? 'الفرق' : 'الفريق') : (allowMultiAssign ? 'Teams' : 'Team'),
    users: isAr ? (allowMultiAssign ? 'المستخدمون' : 'المستخدم') : (allowMultiAssign ? 'Users' : 'User'),
    lead: isAr ? 'ليد' : 'Lead',
    noLeads: isAr ? 'لا توجد ليد متاحة' : 'No leads available',
    priority: isAr ? 'الأولوية' : 'Priority',
    priorityOptions: isAr ? ['منخفضة','عادية','مرتفعة','حرِجة'] : ['Low','Normal','High','Critical'],
    deadline: isAr ? 'الموعد النهائي' : 'Deadline',
    notes: isAr ? 'ملاحظات' : 'Notes',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    assign: isAr ? 'تعيين' : 'Assign',
    selectedSuffix: isAr ? 'محدد/ة' : 'selected',
    badgePrefixTeam: isAr ? 'فريق' : 'Team',
    badgePrefixUser: isAr ? 'مستخدم' : 'User',
    contextLabel: {
      task: isAr ? 'تاسك' : 'Task',
      lead: isAr ? 'ليد' : 'Lead',
      ticket: isAr ? 'تيكت' : 'Ticket',
      user: isAr ? 'مستخدم' : 'User',
    }
  }), [isAr, allowMultiAssign])

  const targetName = useMemo(() => {
    if (assignType === 'team') {
      if (allowMultiAssign) {
        const selected = teams.filter(t => teamIds.includes(t.id))
        if (selected.length === 0) return ''
        if (selected.length <= 2) return selected.map(t => t.name).join(', ')
        return `${selected.length} ${labels.selectedSuffix}`
      }
      const t = teams.find(t => t.id === (teamId || defaultTargetId))
      return t?.name || ''
    }
    if (allowMultiAssign) {
      const selected = users.filter(u => userIds.includes(u.id))
      if (selected.length === 0) return ''
      if (selected.length <= 2) return selected.map(u => u.fullName).join(', ')
      return `${selected.length} ${labels.selectedSuffix}`
    }
    const u = users.find(u => u.id === (userId || defaultTargetId))
    return u?.fullName || ''
  }, [assignType, teamId, userId, teams, users, defaultTargetId, allowMultiAssign, teamIds, userIds, labels.selectedSuffix])

  const filteredUsers = useMemo(() => {
    if (!teamId) return users
    return users.filter(u => !u.team || u.team === teamId || u.team === teams.find(t => t.id === teamId)?.name)
  }, [users, teamId, teams])

  const leadName = useMemo(() => {
    if (!leadId) return ''
    const l = leads.find(l => l.id === leadId)
    return l?.name || l?.full_name || ''
  }, [leadId, leads])

  if (!open) return null

  const hasSelection = assignType === 'team'
    ? (allowMultiAssign ? teamIds.length > 0 : !!teamId)
    : (allowMultiAssign ? userIds.length > 0 : !!userId)

  const requiresLead = context === 'lead'
  const canSubmit = hasSelection && (!requiresLead || !!leadId)

  const submit = () => {
    const payload = {
      context,
      assignType,
      teamId: assignType === 'team' && !allowMultiAssign ? teamId : undefined,
      userId: assignType === 'user' && !allowMultiAssign ? userId : undefined,
      teamIds: assignType === 'team' && allowMultiAssign ? teamIds : undefined,
      userIds: assignType === 'user' && allowMultiAssign ? userIds : undefined,
      targetName,
      leadId: context === 'lead' ? leadId : undefined,
      leadName: context === 'lead' ? leadName : undefined,
      priority,
      deadline,
      notes,
    }
    onSubmit?.(payload)
    onClose?.()
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{labels.title}</h3>
            {!!targetName && (
              <span className="badge badge-outline">{assignType==='team' ? labels.badgePrefixTeam : labels.badgePrefixUser}: {targetName}</span>
            )}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>{labels.close}</button>
        </div>

        <div className="mb-2 text-sm opacity-70">
          {isAr ? `السياق: ${labels.contextLabel[context]}` : `Context: ${labels.contextLabel[context]}`}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text">{labels.assignType}</span>
            <select className="select select-bordered bg-transparent" value={assignType} onChange={(e)=>setAssignType(e.target.value)}>
              <option value="team">{labels.team}</option>
              <option value="user">{labels.user}</option>
            </select>
          </label>

          {assignType === 'team' && (
            <label className="form-control">
              <span className="label-text">{labels.teams}</span>
              <select
                className="select select-bordered bg-transparent"
                multiple={allowMultiAssign}
                value={allowMultiAssign ? teamIds : teamId}
                onChange={(e)=>{
                  if (allowMultiAssign) {
                    const values = Array.from(e.target.selectedOptions).map(o=>o.value)
                    setTeamIds(values)
                  } else {
                    setTeamId(e.target.value)
                  }
                }}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
          )}

          {assignType === 'user' && (
            <label className="form-control md:col-span-1">
              <span className="label-text">{labels.users}</span>
              <select
                className="select select-bordered bg-transparent"
                multiple={allowMultiAssign}
                value={allowMultiAssign ? userIds : userId}
                onChange={(e)=>{
                  if (allowMultiAssign) {
                    const values = Array.from(e.target.selectedOptions).map(o=>o.value)
                    setUserIds(values)
                  } else {
                    setUserId(e.target.value)
                  }
                }}
              >
                {filteredUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} {u.team ? `(${u.team})` : ''}</option>
                ))}
              </select>
            </label>
          )}

          {context === 'lead' && (
            <label className="form-control md:col-span-1">
              <span className="label-text">{labels.lead}</span>
              <select className="select select-bordered bg-transparent" value={leadId} onChange={(e)=>setLeadId(e.target.value)}>
                {leads.length === 0 && (<option value="" disabled>{labels.noLeads}</option>)}
                {leads.map(l => (
                  <option key={l.id} value={l.id}>{l.name || l.full_name || `Lead ${l.id}`}</option>
                ))}
              </select>
            </label>
          )}

          {context !== 'user' && (
            <>
              <label className="form-control">
                <span className="label-text">{labels.priority}</span>
                <select className="select select-bordered bg-transparent" value={priority} onChange={(e)=>setPriority(e.target.value)}>
                  {labels.priorityOptions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>

              <label className="form-control">
                <span className="label-text">{labels.deadline}</span>
                <input type="date" className="input input-bordered bg-transparent" value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
              </label>
            </>
          )}

          <label className="form-control md:col-span-2">
            <span className="label-text">{labels.notes}</span>
            <textarea className="textarea textarea-bordered bg-transparent" rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder={`${isAr ? 'السياق' : 'Context'}: ${labels.contextLabel[context]}${targetName ? ` — ${isAr ? 'تعيين إلى' : 'Assigning to'} ${assignType==='team'?labels.team:labels.user}: ${targetName}` : ''}`} />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm opacity-70">
            {assignType==='team'
              ? (allowMultiAssign ? `${(teamIds||[]).length} ${labels.selectedSuffix}` : (teamId ? `${labels.badgePrefixTeam}: ${targetName}` : ''))
              : (allowMultiAssign ? `${(userIds||[]).length} ${labels.selectedSuffix}` : (userId ? `${labels.badgePrefixUser}: ${targetName}` : ''))
            }
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" onClick={onClose}>{labels.cancel}</button>
            <button className="btn btn-primary" onClick={submit} disabled={!canSubmit}>{labels.assign}</button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}