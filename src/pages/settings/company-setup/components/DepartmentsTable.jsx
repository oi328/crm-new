import React, { useMemo, useState } from 'react'

export default function DepartmentsTable({ departments, onAdd, onUpdate, onDelete }) {
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({ name: '', role: 'Sales', users: 0 })

  const filtered = useMemo(() => (
    departments.filter(d => !q || `${d.name} ${d.role}`.toLowerCase().includes(q.toLowerCase()))
  ), [departments, q])

  const startEdit = (d) => { setEditing(d.id); setDraft({ name: d.name, role: d.role, users: d.users }) }
  const cancelEdit = () => { setEditing(null); setDraft({ name: '', role: 'Sales', users: 0 }) }
  const saveEdit = () => { onUpdate && onUpdate(editing, draft); cancelEdit() }

  const addDept = () => {
    if (!draft.name) return
    onAdd && onAdd({ ...draft })
    setDraft({ name: '', role: 'Sales', users: 0 })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 mb-3">
        <input className="input w-full sm:w-64" placeholder="Search departments" value={q} onChange={e => setQ(e.target.value)} />
        <div className="flex flex-wrap items-center gap-2 sm:gap-2">
          <input className="input w-full sm:w-auto" placeholder="Name" value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))} />
          <select className="input w-full sm:w-auto" value={draft.role} onChange={e => setDraft(prev => ({ ...prev, role: e.target.value }))}>
            {['Sales','Ops','Finance'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input className="input w-24 sm:w-24" type="number" value={draft.users} onChange={e => setDraft(prev => ({ ...prev, users: Number(e.target.value || 0) }))} />
          <button className="px-3 py-2 bg-green-600 text-white rounded w-full sm:w-auto" onClick={addDept}>Add</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="company-table nova-table w-full text-xs sm:text-sm min-w-[560px]">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Role</th>
              <th className="py-2">Users</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id}>
                <td className="py-2">
                  {editing === d.id ? (
                  <input className="input w-full" value={draft.name} onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))} />
                  ) : d.name}
                </td>
                <td className="py-2">
                  {editing === d.id ? (
                  <select className="input w-full" value={draft.role} onChange={e => setDraft(prev => ({ ...prev, role: e.target.value }))}>
                    {['Sales','Ops','Finance'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  ) : d.role}
                </td>
                <td className="py-2">
                  {editing === d.id ? (
                  <input className="input w-24" type="number" value={draft.users} onChange={e => setDraft(prev => ({ ...prev, users: Number(e.target.value || 0) }))} />
                  ) : d.users}
                </td>
                <td className="py-2">
                  {editing === d.id ? (
                  <div className="flex gap-2">
                    <button className="px-2 py-1 bg-indigo-600 text-white rounded" onClick={saveEdit}>Save</button>
                    <button className="px-2 py-1 bg-gray-300 rounded" onClick={cancelEdit}>Cancel</button>
                  </div>
                  ) : (
                  <div className="flex gap-2">
                    <button className="px-2 py-1 bg-yellow-500 text-white rounded" onClick={() => startEdit(d)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => onDelete && onDelete(d.id)}>Delete</button>
                  </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}