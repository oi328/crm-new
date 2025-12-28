import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@shared/layouts/Layout';

const PERMISSIONS = {
  Tickets: ['view', 'create', 'update', 'delete', 'assign', 'close'],
  Customers: ['view', 'create', 'update', 'delete'],
  SLA: ['view', 'create', 'update', 'delete'],
  Reports: ['view', 'export'],
  'User Management': ['view', 'create', 'update', 'delete', 'changeRole'],
  Settings: ['view', 'update'],
  Integrations: ['view', 'configure'],
  'Custom Modules': ['view', 'create', 'update', 'delete'],
};

export default function UserManagementRoleEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roleName, setRoleName] = useState(id || '');
  const [description, setDescription] = useState('');
  const [perms, setPerms] = useState({});
  const [errors, setErrors] = useState({});

  const togglePerm = (group, perm) => {
    setPerms((prev) => {
      const s = new Set(prev[group] || []);
      if (s.has(perm)) s.delete(perm); else s.add(perm);
      return { ...prev, [group]: Array.from(s) };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const eObj = {};
    if (!roleName.trim()) eObj.roleName = 'Role Name is required';
    setErrors(eObj);
    if (Object.keys(eObj).length) return;
    const payload = { roleName, description, permissions: perms };
    console.log('Save Role payload', payload);
    alert('Role saved (mock).');
    navigate('/user-management/roles');
  };

  return (
    <Layout title={`Role — ${roleName || 'New Role'}`}>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">{id ? 'Edit Role' : 'Add Role'}</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="glass-panel rounded-xl p-4">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label"><span className="label-text">Role Name</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                  {errors.roleName && <p className="text-error text-sm mt-1">{errors.roleName}</p>}
                </div>
                <div>
                  <label className="label"><span className="label-text">Description</span></label>
                  <input className="input input-bordered w-full bg-transparent" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <div>
              <h2 className="card-title">Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {Object.entries(PERMISSIONS).map(([group, list]) => (
                  <div key={group} className="glass-panel rounded-lg p-3">
                    <div className="font-medium mb-2">{group}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.map((perm) => {
                        const checked = (perms[group] || []).includes(perm);
                        return (
                          <label key={perm} className="cursor-pointer flex items-center gap-2">
                            <input type="checkbox" className="checkbox" checked={checked} onChange={() => togglePerm(group, perm)} />
                            <span>{perm}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn" onClick={() => navigate('/user-management/roles')}>Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}