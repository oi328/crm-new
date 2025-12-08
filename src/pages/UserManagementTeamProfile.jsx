import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '@shared/layouts/Layout'
import { Edit, UserPlus, Trash, X, Eye, UserMinus } from 'lucide-react'

const mockTeam = {
  id: 't-2001',
  name: 'Support',
  leader: 'Ahmed Ali',
  role: 'Support',
  members: [
    { id: 'u1', name: 'Maya', email: 'maya@example.com', role: 'Agent', status: 'Active' },
    { id: 'u2', name: 'Mostafa', email: 'mostafa@example.com', role: 'Agent', status: 'Active' },
    { id: 'u3', name: 'Ola', email: 'ola@example.com', role: 'Agent', status: 'Inactive' },
  ],
  createdAt: '2025-10-01',
  updatedAt: '2025-11-18',
}

const teamTickets = [
  { id: 'T-9001', priority: 'High', status: 'Open', agent: 'Maya', sla: 'Breaching', updatedAt: '2025-11-18 12:05' },
  { id: 'T-9002', priority: 'Medium', status: 'Assigned', agent: 'Mostafa', sla: 'OK', updatedAt: '2025-11-18 09:44' },
  { id: 'T-9003', priority: 'Low', status: 'Closed', agent: 'Ola', sla: 'OK', updatedAt: '2025-11-17 15:10' },
]

export default function UserManagementTeamProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('members')
  const team = useMemo(() => ({ ...mockTeam, id }), [id])
  const [settings, setSettings] = useState({
    assignStrategy: 'Round Robin',
    channels: ['Email', 'WhatsApp', 'Phone'],
    defaultSLA: 'Standard (48h)',
    notifications: true,
  })

  const removeTeam = () => {
    if (!confirm('Remove team (mock)?')) return
    alert('Team removed (mock)')
    navigate('/user-management/teams')
  }

  const addMember = () => navigate(`/user-management/users/new?team=${team.id}`)
  const editTeam = () => navigate(`/user-management/teams/${team.id}?edit=1`)

  return (
    <Layout title={`User Management — Team: ${team.name}`}>      
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{team.name}</h1>
              <div className="text-sm text-[var(--muted-text)]">Leader: {team.leader} • Role: {team.role} • Members: {team.members.length}</div>
              <div className="text-xs text-[var(--muted-text)]">Created: {team.createdAt} • Updated: {team.updatedAt}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-square p-1" title="Edit Team" aria-label="Edit Team" onClick={editTeam}>
                <Edit className="w-7 h-7 text-info" strokeWidth={2} />
              </button>
              <button className="btn btn-ghost btn-square p-1" title="Add Member" aria-label="Add Member" onClick={addMember}>
                <UserPlus className="w-7 h-7 text-primary" strokeWidth={2} />
              </button>
              <button className="btn btn-ghost btn-square p-1" title="Remove Team" aria-label="Remove Team" onClick={removeTeam}>
                <Trash className="w-7 h-7 text-error" strokeWidth={2} />
              </button>
              <button className="btn btn-ghost btn-square p-1" title="Close" aria-label="Close" onClick={()=>navigate('/user-management/teams')}>
                <X className="w-7 h-7 text-error" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-lifted sticky top-0 z-10 bg-base-100/80 backdrop-blur rounded-xl shadow-sm mb-2">
          {[
            { key: 'members', label: 'Members', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8v-1c0-2.761 4.477-5 10-5s10 2.239 10 5v1H5z"/></svg>
            ) },
            { key: 'performance', label: 'Performance', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
            ) },
            { key: 'tickets', label: 'Tickets', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M4 6h16v12H4zM8 10h8v2H8z"/></svg>
            ) },
            { key: 'settings', label: 'Settings', icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z"/></svg>
            ) },
          ].map(tab => (
            <button
              key={tab.key}
              role="tab"
              aria-controls={`panel-${tab.key}`}
              aria-selected={activeTab === tab.key}
              className={`tab px-3 sm:px-5 py-2 text-sm ${activeTab === tab.key ? 'tab-active border-b-2 border-primary text-primary font-semibold' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="inline-flex items-center gap-2">{tab.icon}{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Members */}
        {activeTab==='members' && (
          <div className="glass-panel rounded-xl overflow-x-auto">
            <table className="nova-table w-full">
              <thead>
                <tr className="thead-soft">
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.members.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.role}</td>
                    <td>
                      <span className={`badge ${m.status==='Active' ? 'badge-success' : 'badge-ghost'}`}>{m.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-ghost btn-square p-1" title="View" aria-label="View" onClick={()=>alert('View Profile (mock)')}>
                          <Eye className="w-6 h-6 text-info" strokeWidth={2} />
                        </button>
                        <button className="btn btn-ghost btn-square p-1" title="Remove" aria-label="Remove" onClick={()=>alert('Remove (mock)')}>
                          <UserMinus className="w-6 h-6 text-error" strokeWidth={2} />
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Performance */}
        {activeTab==='performance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel rounded-xl p-4">
              <div className="text-sm text-[var(--muted-text)]">Tickets Assigned</div>
              <div className="text-2xl font-semibold text-dashboard-gradient">124</div>
            </div>
            <div className="glass-panel rounded-xl p-4">
              <div className="text-sm text-[var(--muted-text)]">Tickets Closed</div>
              <div className="text-2xl font-semibold text-dashboard-gradient">109</div>
            </div>
            <div className="glass-panel rounded-xl p-4">
              <div className="text-sm text-[var(--muted-text)]">SLA Achievement %</div>
              <div className="text-2xl font-semibold text-dashboard-gradient">92%</div>
            </div>
            <div className="glass-panel rounded-xl p-4 md:col-span-2">
              <div className="text-sm text-[var(--muted-text)]">Avg Resolution Time</div>
              <div className="text-2xl font-semibold text-dashboard-gradient">3.4 h</div>
            </div>
            <div className="glass-panel rounded-xl p-4">
              <div className="text-sm text-[var(--muted-text)]">CSAT</div>
              <div className="text-2xl font-semibold text-dashboard-gradient">4.7/5</div>
            </div>
          </div>
        )}

        {/* Tickets */}
        {activeTab==='tickets' && (
          <div className="glass-panel rounded-xl overflow-x-auto">
            <table className="nova-table w-full">
              <thead>
                <tr className="thead-soft">
                  <th>Ticket ID</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>SLA Status</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {teamTickets.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--table-row-hover)]">
                    <td>{t.id}</td>
                    <td>{t.priority}</td>
                    <td>{t.status}</td>
                    <td>{t.agent}</td>
                    <td>{t.sla}</td>
                    <td>{t.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Settings */}
        {activeTab==='settings' && (
          <div className="space-y-3">
            <div className="glass-panel rounded-xl p-4">
              <div className="font-medium mb-2">Auto-assign strategy</div>
              <div className="flex items-center gap-2 flex-wrap">
                {['Round Robin','Manual','Weighted'].map(s => (
                  <button key={s} className={`btn btn-ghost btn-sm ${settings.assignStrategy===s ? '!bg-base-200' : ''}`} onClick={()=>setSettings(v=>({ ...v, assignStrategy: s }))}>{s}</button>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-xl p-4">
              <div className="font-medium mb-2">Allowed channels</div>
              <div className="flex items-center gap-2 flex-wrap">
                {['Email','WhatsApp','Phone','Portal'].map(c => {
                  const active = settings.channels.includes(c)
                  return (
                    <button key={c} className={`btn btn-ghost btn-sm ${active ? '!bg-base-200' : ''}`} onClick={()=>{
                      setSettings(v => ({
                        ...v,
                        channels: active ? v.channels.filter(x=>x!==c) : [...v.channels, c]
                      }))
                    }}>{c}</button>
                  )
                })}
              </div>
            </div>
            <div className="glass-panel rounded-xl p-4">
              <div className="font-medium mb-2">Default SLA</div>
              <select className="select select-bordered w-full md:w-1/3 bg-transparent" value={settings.defaultSLA} onChange={(e)=>setSettings(v=>({ ...v, defaultSLA: e.target.value }))}>
                <option>Standard (48h)</option>
                <option>Priority (24h)</option>
                <option>Critical (8h)</option>
              </select>
            </div>
            <div className="glass-panel rounded-xl p-4">
              <div className="font-medium mb-2">Notification Settings</div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={settings.notifications} onChange={(e)=>setSettings(v=>({ ...v, notifications: e.target.checked }))} />
                <span>{settings.notifications ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}