import React, { useMemo, useState } from 'react'

const ROLE_OPTIONS = [
  { id: 1, name: 'Admin / Super Admin' },
  { id: 2, name: 'Operations Manager' },
  { id: 3, name: 'Sales Director' },
  { id: 4, name: 'Sales Manager' },
  { id: 5, name: 'Team Leader' },
  { id: 6, name: 'Sales Representative' },
  { id: 7, name: 'Customer Service' },
  { id: 8, name: 'Accountant' },
  { id: 9, name: 'Marketing Manager' },
  { id: 10, name: 'Marketing Specialist' },
]

const DEFAULT_USERS = [
  { id: 1, name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'Sales Representative', status: 'Active' },
  { id: 2, name: 'Sara Youssef', email: 'sara@example.com', role: 'Team Leader', status: 'Suspended' },
  { id: 3, name: 'Omar Hassan', email: 'omar@example.com', role: 'Operations Manager', status: 'Active' },
]

const PERMISSIONS = [
  'view clients', 'add client', 'edit client', 'delete client',
  'view invoices', 'add invoice', 'edit invoice', 'delete invoice',
  'view reports', 'manage settings'
]

const UsersAndRoles = () => {
  const [users, setUsers] = useState(DEFAULT_USERS)
  const [showPanel, setShowPanel] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: ROLE_OPTIONS[0].name })
  const [matrix, setMatrix] = useState(() => {
    const roles = ROLE_OPTIONS.map(r => r.name)
    const m = {}
    roles.forEach(role => {
      m[role] = {}
      PERMISSIONS.forEach(p => { m[role][p] = role.includes('Admin') })
    })
    return m
  })

  const addUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) return
    setUsers(prev => [...prev, { id: Date.now(), name: newUser.name, email: newUser.email, role: newUser.role, status: 'Active' }])
    setShowPanel(false)
    setNewUser({ name: '', email: '', password: '', role: ROLE_OPTIONS[0].name })
  }

  const deleteUser = (id) => setUsers(prev => prev.filter(u => u.id !== id))
  const togglePermission = (role, perm) => setMatrix(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }))

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Users</h3>
        <button className="btn btn-primary" onClick={() => setShowPanel(true)}>Add User</button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{u.status}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button className="btn btn-glass">Edit</button>
                    <button className="btn btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role Permissions Matrix */}
      <div className="glass-panel rounded-2xl p-4 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3">Role Permissions Matrix</h3>
        <table className="min-w-[800px] w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Permission</th>
              {ROLE_OPTIONS.map((r, idx) => (
                <th
                  key={r.id}
                  className={`px-3 py-2 text-left whitespace-nowrap ${idx===0 ? '' : 'border-l border-gray-200 dark:border-gray-700'}`}
                >
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map(p => (
              <tr key={p} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2 whitespace-nowrap">{p}</td>
                {ROLE_OPTIONS.map((r, idx) => (
                  <td
                    key={r.id}
                    className={`px-3 py-2 ${idx===0 ? '' : 'border-l border-gray-200 dark:border-gray-700'}`}
                  >
                    <input type="checkbox" checked={!!matrix[r.name]?.[p]} onChange={()=>togglePermission(r.name, p)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-[1001] flex justify-end bg-black/40">
          <div className="w-full sm:w-[440px] h-full bg-white dark:bg-gray-900 shadow-2xl p-0 flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h4 className="text-lg font-semibold">Add User</h4>
              <button className="btn btn-glass" onClick={()=>setShowPanel(false)}>Close</button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto px-6 py-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Name</label>
                  <input value={newUser.name} onChange={e=>setNewUser(prev=>({ ...prev, name: e.target.value }))} className="input-soft w-full" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Email</label>
                  <input type="email" value={newUser.email} onChange={e=>setNewUser(prev=>({ ...prev, email: e.target.value }))} className="input-soft w-full" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Password</label>
                  <input type="password" value={newUser.password} onChange={e=>setNewUser(prev=>({ ...prev, password: e.target.value }))} className="input-soft w-full" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-300">Role</label>
                  <select
                    value={newUser.role}
                    onChange={e=>setNewUser(prev=>({ ...prev, role: e.target.value }))}
                    className="input-soft w-full bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option
                        key={r.id}
                        value={r.name}
                        className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button className="btn btn-primary flex-1" onClick={addUser}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersAndRoles