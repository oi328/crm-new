import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '@shared/layouts/Layout'
import UMActionButtons from '../components/UMActionButtons'
import AssignmentModal from '../components/AssignmentModal'
import { ClipboardCheck, Handshake, Ticket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '@shared/components/SearchableSelect'

const MOCK_TEAMS = [
  { id: 't-2001', name: 'Support', leader: 'Ahmed Ali', members: 8, role: 'Support', createdAt: '2025-10-01' },
  { id: 't-2002', name: 'Sales', leader: 'Sara Hassan', members: 12, role: 'Sales', createdAt: '2025-09-20' },
  { id: 't-2003', name: 'Technical', leader: 'Omar Tarek', members: 6, role: 'Technical', createdAt: '2025-11-01' },
]

export default function UserManagementTeams() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [q, setQ] = useState('')
  const [leaderFilter, setLeaderFilter] = useState('All')
  const [minMembers, setMinMembers] = useState('')
  const [maxMembers, setMaxMembers] = useState('')
  const [teams, setTeams] = useState(MOCK_TEAMS)
  const [selectedTeamIds, setSelectedTeamIds] = useState([])
  const leads = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('leads') || '[]')
    } catch {
      return []
    }
  }, [])
  // Assignment modal state
  const [showAssign, setShowAssign] = useState(false)
  const [assignContext, setAssignContext] = useState('task') // 'task' | 'lead' | 'ticket' | 'user'
  const [defaultTargetId, setDefaultTargetId] = useState('')

  const leaders = useMemo(() => ['All', ...Array.from(new Set(MOCK_TEAMS.map(t => t.leader)))], [])

  const filtered = useMemo(() => {
    return teams.filter(t => (
      (!q || t.name.toLowerCase().includes(q.toLowerCase())) &&
      (leaderFilter === 'All' || t.leader === leaderFilter) &&
      (!minMembers || t.members >= Number(minMembers)) &&
      (!maxMembers || t.members <= Number(maxMembers))
    ))
  }, [teams, q, leaderFilter, minMembers, maxMembers])

  const allTeamsSelected = filtered.length > 0 && filtered.every(t => selectedTeamIds.includes(t.id))
  const toggleSelectAllTeams = () => {
    if (allTeamsSelected) setSelectedTeamIds([])
    else setSelectedTeamIds(filtered.map(t => t.id))
  }
  const toggleSelectTeam = (id) => {
    setSelectedTeamIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const deleteTeam = (id) => {
    if (!confirm('Delete team?')) return
    setTeams(prev => prev.filter(t => t.id !== id))
  }

  const openAssign = (context, teamId) => {
    setAssignContext(context)
    setDefaultTargetId(teamId || '')
    setShowAssign(true)
  }

  // Labels used in bulk actions (only required buttons)
  const bulkLabels = useMemo(() => ({
    title: isArabic ? 'أكشنات جماعية على المحدد' : 'Bulk actions on selected',
    deleteSelected: 'delete',
    assignTask: isArabic ? 'تعيين تاسك' : 'Assign task',
    assignLead: isArabic ? 'تعيين ليد' : 'Assign lead',
    assignTicket: isArabic ? 'تعيين تيكت' : 'Assign ticket',
    selectTeamsFirst: isArabic ? 'اختر فرق أولًا' : 'Select teams first',
    confirmDelete: isArabic ? (count => `سيتم حذف ${count} فريق(فرق). هل أنت متأكد؟`) : (count => `This will delete ${count} team(s). Are you sure?`),
    deletedMsg: isArabic ? 'تم حذف الفرق المحددة' : 'Selected teams deleted',
  }), [isArabic])

  const handleSubmitAssign = (payload) => {
    console.log('Assignment payload (Teams):', payload)
    alert('تم حفظ التعيين بنجاح')
  }

  return (
    <Layout title="User Management — Teams">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Teams</h1>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost" onClick={() => {
              const headers = ['ID','Name','Leader','Members','Role','Created At']
              const rows = filtered.map(t => [t.id, t.name, t.leader, String(t.members), t.role, t.createdAt])
              const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v || '').replace(/"/g,'""')}"`).join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'teams-export.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}>Export Excel</button>
            <Link to="/user-management/teams/new" className="btn btn-primary">Add New Team</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-xl p-3 mb-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="input-soft" placeholder="Search team name" value={q} onChange={(e)=>setQ(e.target.value)} />
          <SearchableSelect
            className="w-full"
            options={leaders}
            value={leaderFilter}
            onChange={(val)=>setLeaderFilter(val)}
            placeholder="Leader"
          />
          <input className="input-soft" type="number" placeholder="Min members" value={minMembers} onChange={(e)=>setMinMembers(e.target.value)} />
          <input className="input-soft" type="number" placeholder="Max members" value={maxMembers} onChange={(e)=>setMaxMembers(e.target.value)} />
          <div className="md:col-span-4 flex items-center gap-2">
          </div>
        </div>

        {/* Bulk actions bar (only shows when rows selected) */}
        {selectedTeamIds.length > 0 && (
          <div className="glass-panel rounded-xl px-3 py-2 mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--muted-text)]">{bulkLabels.title}:</span>
            <button className="btn btn-ghost" onClick={()=>{
              if (selectedTeamIds.length===0) return alert(bulkLabels.selectTeamsFirst)
              if (!confirm(bulkLabels.confirmDelete(selectedTeamIds.length))) return
              setTeams(prev=>prev.filter(t=>!selectedTeamIds.includes(t.id)))
              alert(bulkLabels.deletedMsg)
            }}>{bulkLabels.deleteSelected}</button>
            <button className="btn btn-ghost" onClick={()=>openAssign('task')}>{bulkLabels.assignTask}</button>
            <button className="btn btn-ghost" onClick={()=>openAssign('lead')}>{bulkLabels.assignLead}</button>
            <button className="btn btn-ghost" onClick={()=>openAssign('ticket')}>{bulkLabels.assignTicket}</button>
          </div>
        )}

        {/* Teams table */}
        <div className="glass-panel rounded-xl overflow-x-auto">
          <table className="nova-table w-full">
            <thead>
              <tr className="thead-soft">
                <th>
                  <input type="checkbox" className="checkbox" checked={allTeamsSelected} onChange={toggleSelectAllTeams} />
                </th>
                <th>Team Name</th>
                <th>Team Leader</th>
                <th>Number of Members</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <input type="checkbox" className="checkbox" checked={selectedTeamIds.includes(t.id)} onChange={() => toggleSelectTeam(t.id)} />
                  </td>
                  <td className="font-medium">
                    <button className="link" onClick={()=>navigate(`/user-management/teams/${t.id}`)}>{t.name}</button>
                  </td>
                  <td>{t.leader}</td>
                  <td>{t.members}</td>
                  <td>{t.role}</td>
                  <td>{t.createdAt}</td>
                  <td>
                    <UMActionButtons
                      onEdit={()=>navigate(`/user-management/teams/${t.id}`)}
                      onToggleActive={()=>{}}
                      onDelete={()=>deleteTeam(t.id)}
                    />
                    {/* Removed per-row assign buttons; bulk actions bar will be used */}
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
            teams={teams.map(t=>({ id: t.id, name: t.name }))}
            users={[
              { id: 'u-1001', fullName: 'Ibrahim Hassan', team: 'Support', role: 'Admin' },
              { id: 'u-1002', fullName: 'Sara Ali', team: 'Sales', role: 'Agent' },
              { id: 'u-1003', fullName: 'Mohamed Salem', team: 'Operations', role: 'Manager' },
            ]}
            leads={leads}
            defaultAssignType={'team'}
            defaultTargetId={defaultTargetId}
          />
        )}
      </div>
    </Layout>
  )
}