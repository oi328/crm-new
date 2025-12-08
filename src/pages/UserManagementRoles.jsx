import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UMActionButtons from '../components/UMActionButtons';
import Layout from '@shared/layouts/Layout';

const mockRoles = [
  { name: 'Admin', users: 3, createdAt: '2025-01-01', updatedAt: '2025-11-10' },
  { name: 'Manager', users: 5, createdAt: '2025-02-12', updatedAt: '2025-11-09' },
  { name: 'Agent', users: 12, createdAt: '2025-03-05', updatedAt: '2025-10-30' },
  { name: 'Viewer', users: 4, createdAt: '2025-04-15', updatedAt: '2025-09-22' },
];

export default function UserManagementRoles() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [roles, setRoles] = useState(mockRoles);

  const filtered = useMemo(() => roles.filter(r => r.name.toLowerCase().includes(q.toLowerCase())), [roles, q]);

  const deleteRole = (name) => { if (window.confirm('Delete this role?')) setRoles(prev => prev.filter(r => r.name !== name)); };

  return (
    <Layout title="User Management — Roles & Permissions">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Roles & Permissions</h1>
          <Link to="/user-management/roles/new" className="btn btn-primary">Add New Role</Link>
        </div>

        <div className="glass-panel rounded-xl p-3 mb-3 flex gap-2">
          <input className="input-soft" placeholder="Search roles" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-ghost">Export</button>
        </div>

        <div className="glass-panel rounded-xl overflow-x-auto">
          <table className="nova-table w-full">
            <thead>
              <tr className="thead-soft">
                <th>Role Name</th>
                <th>Number of Users</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.name}>
                  <td className="font-medium">{r.name}</td>
                  <td>{r.users}</td>
                  <td>{r.createdAt}</td>
                  <td>{r.updatedAt}</td>
                  <td>
                    <UMActionButtons
                      onEdit={() => navigate(`/user-management/roles/${r.name}`)}
                      onToggleActive={() => {}}
                      onDelete={() => deleteRole(r.name)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}