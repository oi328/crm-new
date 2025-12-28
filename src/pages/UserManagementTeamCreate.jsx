import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '@shared/layouts/Layout'
import SearchableSelect from '@shared/components/SearchableSelect'
import { DEPARTMENTS } from '../data/orgStructure'

const ROLE_OPTIONS = ['Support', 'Technical', 'Sales', 'Custom']
const USERS = [
  { id: 'u1', name: 'Ahmed Ali', role: 'Manager' },
  { id: 'u2', name: 'Sara Hassan', role: 'Admin' },
  { id: 'u3', name: 'Omar Tarek', role: 'Manager' },
  { id: 'u4', name: 'Nour Samir', role: 'Agent' },
]

export default function UserManagementTeamCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    leaderId: '',
    memberIds: [],
    departmentId: '',
    role: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})

  const leaders = useMemo(() => USERS.filter(u => ['Manager','Admin'].includes(u.role)), [])
  const members = useMemo(() => USERS, [])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter(x => x !== id)
        : [...prev.memberIds, id]
    }))
  }

  useEffect(() => {
    const depId = searchParams.get('departmentId')
    const depName = searchParams.get('departmentName')
    if (depId) {
        update('departmentId', depId)
    } else if (depName) {
        const match = DEPARTMENTS.find(d => d.name.toLowerCase() === depName.toLowerCase())
        if (match) update('departmentId', match.id)
    }
  }, [searchParams])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Team name is required'
    if (!form.leaderId) e.leaderId = 'Team leader is required'
    if (!form.departmentId) e.departmentId = 'Department is required'
    if (!form.role) e.role = 'Role/Type is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = { ...form }
    console.log('Create Team payload', payload)
    alert('Team created (mock). Returning to Teams list.')
    navigate('/user-management/teams')
  }

  return (
    <Layout title="User Management — Add Team">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">Add New Team</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="label"><span className="label-text">Team Name</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={form.name} onChange={(e)=>update('name', e.target.value)} />
                  {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Team Leader</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={leaders.map(u=>({ value: u.id, label: `${u.name} (${u.role})` }))}
                    value={form.leaderId}
                    onChange={(val)=>update('leaderId', val)}
                    
                  />
                  {errors.leaderId && <p className="text-error text-sm mt-1">{errors.leaderId}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Department</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={DEPARTMENTS.map(d=>({ value: d.id, label: d.name }))}
                    value={form.departmentId}
                    onChange={(val)=>update('departmentId', val)}
                  />
                  {errors.departmentId && <p className="text-error text-sm mt-1">{errors.departmentId}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Role / Type</span></label>
                  <SearchableSelect
                    className="w-full"
                    options={ROLE_OPTIONS}
                    value={form.role}
                    onChange={(val)=>update('role', val)}
                    
                  />
                  {errors.role && <p className="text-error text-sm mt-1">{errors.role}</p>}
                </div>
                <div className="md:col-span-1">
                  <label className="label"><span className="label-text">Description / Notes</span></label>
                  <textarea className="textarea textarea-bordered w-full bg-transparent" rows={3} value={form.notes} onChange={(e)=>update('notes', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {members.map(m => (
                  <label key={m.id} className="inline-flex items-center gap-2 p-2 rounded glass-panel">
                    <input type="checkbox" checked={form.memberIds.includes(m.id)} onChange={()=>toggleMember(m.id)} />
                    <span>{m.name} — {m.role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-ghost" onClick={()=>navigate('/user-management/teams')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}