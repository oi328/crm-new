import React, { useMemo, useState } from 'react';
import { Edit, KeyRound, Lock, Unlock, Trash, X } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '@shared/layouts/Layout';
import SearchableSelect from '@shared/components/SearchableSelect';
import { loadDevicesForUser } from '../utils/device'

const mockUser = {
  id: 'u-1001',
  avatarUrl: '',
  fullName: 'Ibrahim Hassan',
  email: 'ibrahim@example.com',
  phone: '+20 100 000 0000',
  role: 'Admin',
  status: 'Active',
  team: 'Support',
  department: 'Customer Support',
  lastLogin: '2025-11-18 10:24',
  createdAt: '2025-10-02',
  updatedAt: '2025-11-18',
  permissions: {
    Tickets: ['view', 'create', 'update', 'delete', 'assign', 'close'],
    Customers: ['view', 'create', 'update', 'delete'],
    Reports: ['view', 'export'],
  },
};

const userActivities = [
  { type: 'Login', description: 'Successful login', ts: '2025-11-18 10:24' },
  { type: 'Ticket Update', description: 'Updated Ticket #4531 status to Resolved', ts: '2025-11-17 16:02' },
  { type: 'Permission Change', description: 'Granted Reports:export', ts: '2025-11-16 09:48' },
];

const ticketsHandled = [
  { id: 'T-4531', priority: 'High', status: 'Resolved', slaMet: true, lastUpdated: '2025-11-17 16:02' },
  { id: 'T-4455', priority: 'Medium', status: 'Open', slaMet: false, lastUpdated: '2025-11-18 08:11' },
];

const sessions = [
  { device: 'Windows PC', browser: 'Chrome', ip: '192.168.1.12', login: '2025-11-18 10:24' },
  { device: 'iPhone', browser: 'Safari', ip: '192.168.1.15', login: '2025-11-16 21:03' },
];

export default function UserManagementUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = new URLSearchParams(location.search).get('edit') === '1';
  const [activeTab, setActiveTab] = useState('account');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const user = useMemo(() => ({ ...mockUser, id }), [id]);
  const devices = useMemo(() => loadDevicesForUser(id), [id])

  const changePassword = () => setShowPwdModal(true);
  const deactivateActivate = () => alert(`${user.status === 'Active' ? 'Deactivated' : 'Activated'} (mock)`);
  const deleteUser = () => { if (window.confirm('Delete this user?')) { alert('Deleted (mock)'); navigate('/user-management/users'); } };

  return (
    <Layout title={`User — ${user.fullName}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-20">
                    <span className="text-2xl">{user.fullName?.[0] || '?'}</span>
                  </div>
                </div>
                <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold flex items-center gap-2">
                    {user.fullName}
                    {user.status === 'Suspended' ? (
                      <span title="Suspended" aria-label="Suspended" className="inline-flex items-center text-error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                          <path d="M12 2a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4zm-2 7V6a2 2 0 0 1 4 0v3h-4z"/>
                        </svg>
                      </span>
                    ) : (
                      <span title="Active" aria-label="Active" className="inline-flex items-center text-success">
                        <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                      </span>
                    )}
                  </h1>
                  <span className="badge badge-outline badge-sm">{user.role}</span>
                  <span className="badge badge-outline badge-sm">{user.team || '—'}</span>
                  <span className="badge badge-outline badge-sm">{user.department || '—'}</span>
                  <span className={`badge badge-sm ${user.status === 'Active' ? 'badge-success' : user.status === 'Suspended' ? 'badge-error' : 'badge-ghost'}`}>{user.status}</span>
                </div>
                <div className="text-sm text-[var(--muted-text)] mb-2">{user.role} — {user.team || '—'} — {user.department || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-square p-1" onClick={() => navigate(`/user-management/users/${id}?edit=1`)} title="Edit" aria-label="Edit">
                <Edit className="w-7 h-7 text-info" strokeWidth={2} />
              </button>
              <button className="btn btn-ghost btn-square p-1" onClick={changePassword} title="Change Password" aria-label="Change Password">
                <KeyRound className="w-7 h-7 text-primary" strokeWidth={2} />
              </button>
              {user.status === 'Active' ? (
                <button className="btn btn-ghost btn-square p-1" onClick={deactivateActivate} title="Suspend" aria-label="Suspend">
                  <Lock className="w-7 h-7 text-warning" strokeWidth={2} />
                </button>
              ) : (
                <button className="btn btn-ghost btn-square p-1" onClick={deactivateActivate} title="Activate" aria-label="Activate">
                  <Unlock className="w-7 h-7 text-success" strokeWidth={2} />
                </button>
              )}
              <button className="btn btn-ghost btn-square p-1" onClick={deleteUser} title="Delete" aria-label="Delete">
                <Trash className="w-7 h-7 text-error" strokeWidth={2} />
              </button>
              <button className="btn btn-ghost btn-square p-1" onClick={() => navigate('/user-management/users')} title="Close" aria-label="Close">
                <X className="w-7 h-7 text-error" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        

        <div className="mt-6">
          <div role="tablist" className="tabs tabs-lifted sticky top-0 z-10 bg-base-100/80 backdrop-blur rounded-xl shadow-sm mb-2">
            <button
              role="tab"
              aria-controls="panel-account"
              aria-selected={activeTab === 'account'}
              className={`tab px-3 sm:px-5 py-2 text-sm ${activeTab === 'account' ? 'tab-active border-b-2 border-primary text-primary font-semibold' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveTab('account')}
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z"/></svg>
                Account Details
              </span>
            </button>
            <button
              role="tab"
              aria-controls="panel-permissions"
              aria-selected={activeTab === 'permissions'}
              className={`tab px-3 sm:px-5 py-2 text-sm ${activeTab === 'permissions' ? 'tab-active border-b-2 border-primary text-primary font-semibold' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveTab('permissions')}
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2z"/></svg>
                Permissions
              </span>
            </button>
            <button
              role="tab"
              aria-controls="panel-activity"
              aria-selected={activeTab === 'activity'}
              className={`tab px-3 sm:px-5 py-2 text-sm ${activeTab === 'activity' ? 'tab-active border-b-2 border-primary text-primary font-semibold' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveTab('activity')}
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 12h4l3 8 4-16 3 8h4"/></svg>
                Activity History
              </span>
            </button>
            <button
              role="tab"
              aria-controls="panel-tickets"
              aria-selected={activeTab === 'tickets'}
              className={`tab px-3 sm:px-5 py-2 text-sm ${activeTab === 'tickets' ? 'tab-active border-b-2 border-primary text-primary font-semibold' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveTab('tickets')}
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M4 6h16v12H4zM8 10h8v2H8z"/></svg>
                Tickets
              </span>
            </button>
            <button
              role="tab"
              aria-controls="panel-security"
              aria-selected={activeTab === 'security'}
              className={`tab px-3 sm:px-5 py-2 text-sm ${activeTab === 'security' ? 'tab-active border-b-2 border-primary text-primary font-semibold' : 'opacity-70 hover:opacity-100'}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z"/></svg>
                Security
              </span>
            </button>
          </div>

          {activeTab === 'account' && (
            <div id="panel-account" className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 transition-opacity duration-200 shadow-sm">
              <h3 className="font-medium mb-2">Account Details</h3>
              {isEdit ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="form-control">
                    <span className="label-text">Full Name</span>
                    <input className="input input-bordered" defaultValue={user.fullName} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Email</span>
                    <input className="input input-bordered" defaultValue={user.email} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Phone</span>
                    <input className="input input-bordered" defaultValue={user.phone} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Role</span>
                    <SearchableSelect
                      options={["Admin","Manager","Agent","Viewer"]}
                      value={user.role}
                      onChange={(val)=>{/* no-op in mock edit */}}
                      placeholder="Select role"
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Team</span>
                    <input className="input input-bordered" defaultValue={user.team || ''} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Department</span>
                    <input className="input input-bordered" defaultValue={user.department || ''} />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Status</span>
                    <SearchableSelect
                      options={["Active","Suspended"]}
                      value={user.status}
                      onChange={(val)=>{/* no-op in mock edit */}}
                      placeholder="Select status"
                    />
                  </label>
                  <div className="flex gap-2 mt-2 md:col-span-2">
                    <button className="btn btn-primary" onClick={() => alert('Saved changes (mock)')}>Save Changes</button>
                    <button className="btn btn-ghost" onClick={() => navigate(`/user-management/users/${id}`)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Full Name</div>
                    <div className="font-medium">{user.fullName}</div>
                  </div>
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Phone</div>
                    <div className="font-medium">{user.phone}</div>
                  </div>
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Role</div>
                    <div className="font-medium">{user.role}</div>
                  </div>
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Team</div>
                    <div className="font-medium">{user.team || '—'}</div>
                  </div>
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Department</div>
                    <div className="font-medium">{user.department || '—'}</div>
                  </div>
                  <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="text-sm text-[var(--muted-text)]">Status</div>
                    <div className="font-medium">
                      <span className={`badge ${user.status === 'Active' ? 'badge-success' : user.status === 'Suspended' ? 'badge-error' : 'badge-ghost'}`}>{user.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="glass-panel rounded-lg p-3">
                  <div className="font-medium mb-1">User Metrics</div>
                  <div>Tickets Handled: 124</div>
                  <div>SLA Success Rate: 92%</div>
                  <div>CSAT: 4.7/5</div>
                </div>
                <div className="md:col-span-2 glass-panel rounded-lg p-3">
                  <div className="font-medium mb-2">Internal Notes</div>
                  <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="Notes visible to admins only" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div id="panel-permissions" className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 transition-opacity duration-200 shadow-sm">
              <h3 className="font-medium mb-2">Role: {user.role}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(user.permissions).map(([group, list]) => (
                  <div key={group} className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                    <div className="font-medium">{group}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {list.map((p) => (
                        <span key={p} className="badge badge-outline">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn mt-3" onClick={() => navigate(`/user-management/roles/${user.role}`)}>Change Role</button>
            </div>
          )}

          {activeTab === 'activity' && (
            <div id="panel-activity" className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 transition-opacity duration-200 shadow-sm">
              <h3 className="font-medium mb-2">Activity Timeline</h3>
              <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-base-300"></div>
                  {userActivities.map((a, idx) => (
                    <div key={idx} className="mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="font-medium">{a.type}</div>
                        <div className="text-xs text-[var(--muted-text)]">{a.ts}</div>
                      </div>
                      <div className="ml-4 text-sm">{a.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div id="panel-tickets" className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 transition-opacity duration-200 shadow-sm">
              <h3 className="font-medium mb-2">Tickets</h3>
              <div className="glass-panel bg-base-200/50 border border-base-300 rounded-lg overflow-x-auto">
                <table className="nova-table w-full">
                  <thead>
                    <tr className="thead-soft">
                      <th>Ticket ID</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>SLA met</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketsHandled.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.priority}</td>
                        <td>{t.status}</td>
                        <td>{t.slaMet ? 'Yes' : 'No'}</td>
                        <td>{t.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div id="panel-security" className="glass-panel bg-base-200/60 border border-base-300 rounded-xl p-4 transition-opacity duration-200 shadow-sm">
              <h3 className="font-medium mb-2">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Two-Factor Authentication</span>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </label>
                </div>
                <div>
                  <div className="font-medium mb-2">Recent Login Devices</div>
                  {devices && devices.length > 0 ? (
                    <ul className="list-disc ml-6 glass-panel bg-base-200/50 border border-base-300 rounded-lg p-3">
                      {devices.map((d) => (
                        <li key={d.deviceId}>{d.device} — {d.browser} — {d.platform} — {d.ip} — {new Date(d.at).toLocaleString()}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-[var(--muted-text)]">No recorded devices yet.</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Active Sessions</div>
                    <button className="btn btn-xs" onClick={() => alert('Terminate all sessions (mock)')}>Terminate all</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {(devices && devices.length > 0 ? devices : sessions).map((d, i) => (
                      <div key={d.deviceId || i} className="flex items-center justify-between glass-panel bg-base-200/50 border border-base-300 rounded-lg p-2">
                        <div>{(d.device || d.deviceName || 'Device')} / {(d.browser || 'Unknown')} / {(d.ip || 'N/A')}</div>
                        <button className="btn btn-xs" onClick={() => alert('Terminate session (mock)')}>Terminate</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPwdModal(false)} />
          <div className="relative w-full sm:w-[90%] sm:max-w-md bg-[var(--content-bg)] text-[var(--content-text)] border border-base-300 shadow-xl rounded-none sm:rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-medium">Change Password</h3>
              <button className="p-2 rounded-md hover:bg-[var(--table-row-hover)]" onClick={() => setShowPwdModal(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-3">
              {pwdError && <div className="text-error text-sm">{pwdError}</div>}
              <label className="form-control">
                <span className="label-text">Current Password</span>
                <input type="password" className="input input-bordered" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text">New Password</span>
                <input type="password" className="input input-bordered" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text">Confirm New Password</span>
                <input type="password" className="input input-bordered" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
              </label>
              <div className="text-xs text-[var(--muted-text)]">Minimum 8 characters, include letters and numbers.</div>
            </div>
            <div className="px-4 py-3 border-t flex gap-2 justify-end">
              <button className="btn btn-ghost" onClick={() => setShowPwdModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const np = (newPwd || '').trim();
                  const cp = (confirmPwd || '').trim();
                  if (np.length < 8) { setPwdError('Password must be at least 8 characters'); return; }
                  if (np !== cp) { setPwdError("Passwords don't match"); return; }
                  setPwdError('');
                  alert('Password changed successfully (mock)');
                  setShowPwdModal(false);
                  setCurPwd(''); setNewPwd(''); setConfirmPwd('');
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}