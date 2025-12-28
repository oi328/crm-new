import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UMActionButtons from '../../components/UMActionButtons';
import AssignmentModal from '../../components/AssignmentModal';
import { ClipboardCheck, Handshake, Ticket } from 'lucide-react';
import Layout from '@components/Layout';
import SearchableSelect from '@shared/components/SearchableSelect';
import { DEPARTMENTS } from '../../data/orgStructure'
import { useTranslation } from 'react-i18next';
// Removed file-saver dependency; using Blob + link for export

const mockUsers = [
  {
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
  },
  {
    id: 'u-1002',
    avatarUrl: '',
    fullName: 'Sara Ali',
    email: 'sara.ali@example.com',
    phone: '+20 111 222 3333',
    role: 'Agent',
    status: 'Inactive',
    team: 'Sales',
    department: 'Sales',
    lastLogin: '2025-11-15 09:17',
    createdAt: '2025-09-12',
  },
  {
    id: 'u-1003',
    avatarUrl: '',
    fullName: 'Mohamed Salem',
    email: 'msalem@example.com',
    phone: '+20 122 444 5555',
    role: 'Manager',
    status: 'Suspended',
    team: 'Operations',
    department: 'Technical Support',
    lastLogin: '2025-11-10 14:05',
    createdAt: '2025-08-20',
  },
];

const roles = ['Admin', 'Manager', 'Agent', 'Viewer'];
const statuses = ['Active', 'Inactive', 'Suspended'];
const teams = ['Support', 'Sales', 'Operations', 'Finance'];

export default function UserManagementUsers() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [users, setUsers] = useState(mockUsers);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const leads = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('leads') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Assignment modal state
  const [showAssign, setShowAssign] = useState(false);
  const [assignContext, setAssignContext] = useState('task'); // 'task' | 'lead' | 'ticket' | 'user'
  const [defaultAssignType, setDefaultAssignType] = useState('user');
  const [defaultTargetId, setDefaultTargetId] = useState('');

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = [u.fullName, u.email, u.phone]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesRole = roleFilter ? u.role === roleFilter : true;
      const matchesStatus = statusFilter ? u.status === statusFilter : true;
      const matchesTeam = teamFilter ? (u.team || '') === teamFilter : true;
      const matchesDept = deptFilter ? (u.department || '') === deptFilter : true;
      const matchesFrom = dateFrom ? (u.createdAt || '') >= dateFrom : true;
      const matchesTo = dateTo ? (u.createdAt || '') <= dateTo : true;
      return matchesSearch && matchesRole && matchesStatus && matchesTeam && matchesDept && matchesFrom && matchesTo;
    });
  }, [users, search, roleFilter, statusFilter, teamFilter, deptFilter, dateFrom, dateTo]);

  const allUsersSelected = filtered.length > 0 && filtered.every(u => selectedUserIds.includes(u.id));

  const deactivateActivate = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  };

  const deleteUser = (id) => {
    if (!window.confirm('Delete this user?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const changePassword = (id) => {
    alert(`Change password dialog opened for ${id}`);
  };

  const refreshUser = (id) => {
    // Placeholder: simulate refreshing user data
    alert(`Refreshed user ${id}`);
  };

  const assignRotation = (id) => {
    // Placeholder: simulate assigning rotation to user
    alert(`Assigned rotation to user ${id}`);
  };

  const delayRotation = (id) => {
    // Placeholder: simulate delaying rotation schedule for user
    alert(`Delayed rotation for user ${id}`);
  };

  const openAssign = (context, assignType='user', userId='') => {
    setAssignContext(context);
    setDefaultAssignType(assignType);
    setDefaultTargetId(userId);
    setShowAssign(true);
  };

  // Labels used in bulk actions (only required buttons)
  const bulkLabels = useMemo(() => ({
    title: isArabic ? 'أكشنات جماعية على المحدد' : 'Bulk actions on selected',
    deleteSelected: 'delete',
    assignTask: isArabic ? 'تعيين تاسك' : 'Assign task',
    assignLead: isArabic ? 'تعيين ليد' : 'Assign lead',
    assignTicket: isArabic ? 'تعيين تيكت' : 'Assign ticket',
    selectUsersFirst: isArabic ? 'اختر مستخدمين أولًا' : 'Select users first',
    bulkAssignUsersFirst: isArabic ? 'اختر مستخدمين أولًا لتنفيذ التعيين الجماعي' : 'Select users first to perform bulk assignment',
    deletedMsg: isArabic ? 'تم حذف المستخدمين المحددين' : 'Selected users deleted',
    confirmDelete: isArabic ? `سيتم حذف ${selectedUserIds.length} مستخدم(ين). هل أنت متأكد؟` : `This will delete ${selectedUserIds.length} user(s). Are you sure?`,
  }), [isArabic, selectedUserIds.length]);

  // Bulk actions for selected users
  const bulkDeactivateSelectedUsers = () => {
    if (selectedUserIds.length === 0) return alert(bulkLabels.selectUsersFirst);
    setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Inactive' } : u));
    alert(bulkLabels.deactivatedMsg);
  };

  const bulkActivateSelectedUsers = () => {
    if (selectedUserIds.length === 0) return alert(bulkLabels.selectUsersFirst);
    setUsers(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'Active' } : u));
    alert(bulkLabels.activatedMsg);
  };

  const bulkDeleteSelectedUsers = () => {
    if (selectedUserIds.length === 0) return alert(bulkLabels.selectUsersFirst);
    if (!window.confirm(bulkLabels.confirmDelete)) return;
    setUsers(prev => prev.filter(u => !selectedUserIds.includes(u.id)));
    setSelectedUserIds([]);
    alert(bulkLabels.deletedMsg);
  };

  const openBulkAssign = (context) => {
    if (selectedUserIds.length === 0) return alert(bulkLabels.selectUsersFirst);
    setAssignContext(context);
    setDefaultAssignType('user');
    setDefaultTargetId('');
    setShowAssign(true);
  };

  

  const toggleSelectAllUsers = () => {
    if (allUsersSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filtered.map(u => u.id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const exportUsersToCSV = () => {
    const headers = ['ID','Full Name','Email','Phone','Role','Status','Team','Created At'];
    const rows = filtered.map(u => [u.id, u.fullName, u.email, u.phone, u.role, u.status, u.team || '', u.createdAt || '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v || '').replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openBulkAssignToTeam = () => {
    if (selectedUserIds.length === 0) {
      alert(bulkLabels.bulkAssignUsersFirst);
      return;
    }
    setAssignContext('user');
    setDefaultAssignType('team');
    setDefaultTargetId('');
    setShowAssign(true);
  };

  const handleSubmitAssign = (payload) => {
    console.log('Assignment payload (Users):', { ...payload, selectedUserIds });
    alert('تم حفظ التعيين بنجاح');
  };

  return (
    <Layout title="User Management — Users">
      <div className="w-full max-w-none px-0 py-0">
        <div className="glass-panel rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-primary">Users</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="btn btn-ghost cursor-pointer">
              Import Users
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e)=>{
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const text = String(reader.result || '');
                    const lines = text.split(/\r?\n/).filter(Boolean);
                    const header = lines[0].split(',').map(h=>h.trim().replace(/"/g,''));
                    const idx = (name) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());
                    const idIdx = idx('id');
                    const nameIdx = idx('full name');
                    const emailIdx = idx('email');
                    const phoneIdx = idx('phone');
                    const roleIdx = idx('role');
                    const statusIdx = idx('status');
                    const teamIdx = idx('team');
                    const createdIdx = idx('created at');
                    const next = lines.slice(1).map(l => {
                      const cols = l.split(',').map(c=>c.replace(/^\"|\"$/g,''));
                      return {
                        id: cols[idIdx] || `u-${Date.now()}`,
                        fullName: cols[nameIdx] || '',
                        email: cols[emailIdx] || '',
                        phone: cols[phoneIdx] || '',
                        role: cols[roleIdx] || 'Viewer',
                        status: cols[statusIdx] || 'Active',
                        team: cols[teamIdx] || '',
                        createdAt: cols[createdIdx] || '',
                      };
                    }).filter(u => u.fullName && u.email);
                    setUsers(prev => [...prev, ...next]);
                    alert(`Imported ${next.length} users`);
                  } catch(err) {
                    console.error(err);
                    alert('Failed to import CSV');
                  }
                };
                reader.readAsText(file);
              }} />
            </label>
            <button className="btn" onClick={exportUsersToCSV}>Export Excel</button>
            <Link to="/user-management/users/new" className="btn btn-primary">Add New User</Link>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3 mb-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'بحث' : 'Search'}</span></label>
              <input
                type="text"
                className="input-soft w-full"
                placeholder={isArabic ? 'بحث (اسم، إيميل، هاتف)' : 'Search (name, email, phone)'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'الدور' : 'Role'}</span></label>
              <SearchableSelect
                className="w-full"
                options={roles}
                value={roleFilter}
                onChange={(val) => setRoleFilter(val)}
                placeholder={isArabic ? 'اختر الدور' : 'Select role'}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'الحالة' : 'Status'}</span></label>
              <SearchableSelect
                className="w-full"
                options={statuses}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder={isArabic ? 'اختر الحالة' : 'Select status'}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'الفريق' : 'Team'}</span></label>
              <SearchableSelect
                className="w-full"
                options={teams}
                value={teamFilter}
                onChange={(val) => setTeamFilter(val)}
                placeholder={isArabic ? 'اختر الفريق' : 'Select team'}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'القسم' : 'Department'}</span></label>
              <SearchableSelect
                className="w-full"
                options={DEPARTMENTS.map(d=>d.name)}
                value={deptFilter}
                onChange={(val) => setDeptFilter(val)}
                placeholder={isArabic ? 'اختر القسم' : 'Select department'}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'التاريخ من' : 'Date From'}</span></label>
              <input
                type="date"
                className="input-soft w-full"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="label"><span className="label-text">{isArabic ? 'التاريخ إلى' : 'Date To'}</span></label>
              <input
                type="date"
                className="input-soft w-full"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bulk actions bar (only shows when rows selected) */}
        {selectedUserIds.length > 0 && (
          <div className="glass-panel rounded-xl px-3 py-2 mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--muted-text)]">{bulkLabels.title}:</span>
            <button className="btn btn-ghost" onClick={bulkDeleteSelectedUsers}>{bulkLabels.deleteSelected}</button>
            <button className="btn btn-ghost" onClick={()=>openBulkAssign('task')}>{bulkLabels.assignTask}</button>
            <button className="btn btn-ghost" onClick={()=>openBulkAssign('lead')}>{bulkLabels.assignLead}</button>
            <button className="btn btn-ghost" onClick={()=>openBulkAssign('ticket')}>{bulkLabels.assignTicket}</button>
          </div>
        )}

        <div className="glass-panel rounded-xl overflow-x-auto w-full">
          <table className="nova-table w-full">
            <thead>
              <tr className="thead-soft">
                <th>
                  <input type="checkbox" className="checkbox" checked={allUsersSelected} onChange={toggleSelectAllUsers} />
                </th>
                <th>Avatar</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <input type="checkbox" className="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleSelectUser(u.id)} />
                  </td>
                  <td>
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-10">
                        <span>{u.fullName?.[0] || '?'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium">
                    <Link to={`/user-management/users/${u.id}`}>{u.fullName}</Link>
                  </td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge ${u.status === 'Active' ? 'badge-success' : u.status === 'Suspended' ? 'badge-error' : ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <UMActionButtons
                      onEdit={() => navigate(`/user-management/users/${u.id}?edit=1`)}
                      onChangePassword={() => changePassword(u.id)}
                      onToggleActive={() => deactivateActivate(u.id)}
                      onDelete={() => deleteUser(u.id)}
                      onEnable={() => deactivateActivate(u.id)}
                      onRefresh={() => refreshUser(u.id)}
                      onAssignRotation={() => assignRotation(u.id)}
                      onDelayRotation={() => delayRotation(u.id)}
                    />
                    {/* Removed per-row assign buttons; bulk actions bar will be used */}
                  </td>
                  <td>{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>Showing {filtered.length} of {users.length} users</div>
          <div className="join">
            <button className="join-item btn">«</button>
            <button className="join-item btn">1</button>
            <button className="join-item btn">2</button>
            <button className="join-item btn">3</button>
            <button className="join-item btn">»</button>
          </div>
        </div>

        {showAssign && (
          <AssignmentModal
            open={showAssign}
            onClose={()=>setShowAssign(false)}
            onSubmit={handleSubmitAssign}
            context={assignContext}
            teams={teams.map(t=>({ id: t, name: t }))}
            users={users.map(u=>({ id: u.id, fullName: u.fullName, team: u.team, role: u.role }))}
            leads={leads}
            defaultAssignType={defaultAssignType}
            defaultTargetId={defaultTargetId}
          />
        )}
      </div>
    </Layout>
  );
}
