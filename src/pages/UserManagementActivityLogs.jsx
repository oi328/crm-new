import React, { useMemo, useState } from 'react';
import SearchableSelect from '@shared/components/SearchableSelect';
import Layout from '@shared/layouts/Layout';

const mockLogs = [
  { type: 'Created', user: 'Ibrahim', target: 'Ticket #4531', description: 'Created new ticket', ts: '2025-11-18 10:24', ip: '192.168.1.12', module: 'Tickets' },
  { type: 'Updated', user: 'Sara', target: 'Customer #100', description: 'Updated address', ts: '2025-11-17 12:05', ip: '192.168.1.18', module: 'Customers' },
  { type: 'Login', user: 'Ibrahim', target: '-', description: 'Successful login', ts: '2025-11-17 08:12', ip: '192.168.1.12', module: 'User Management' },
  { type: 'Failed Login', user: 'Unknown', target: '-', description: 'Failed login attempt', ts: '2025-11-16 23:51', ip: '192.168.1.99', module: 'User Management' },
];

const actionTypes = ['Created', 'Updated', 'Deleted', 'Login', 'Failed Login', 'Permission Change'];
const modules = ['Tickets', 'Customers', 'SLA', 'Reports', 'User Management', 'Settings', 'Integrations', 'Custom Modules'];

export default function UserManagementActivityLogs() {
  const [userFilter, setUserFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return mockLogs.filter((l) => {
      const matchesUser = userFilter ? l.user.toLowerCase().includes(userFilter.toLowerCase()) : true;
      const matchesType = typeFilter ? l.type === typeFilter : true;
      const matchesModule = moduleFilter ? l.module === moduleFilter : true;
      const matchesSearch = q ? `${l.description} ${l.target}`.toLowerCase().includes(q.toLowerCase()) : true;
      const matchesFrom = from ? l.ts >= from : true;
      const matchesTo = to ? l.ts <= to : true;
      return matchesUser && matchesType && matchesModule && matchesSearch && matchesFrom && matchesTo;
    });
  }, [userFilter, typeFilter, moduleFilter, from, to, q]);

  return (
    <Layout title="User Management — Activity Logs">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">Activity Logs</h1>

        <div className="glass-panel rounded-xl p-3 mb-3 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="input-soft" placeholder="Filter by user" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
          <SearchableSelect
            className="w-full"
            options={actionTypes}
            value={typeFilter}
            onChange={(val)=>setTypeFilter(val)}
            placeholder="Action Type"
          />
          <SearchableSelect
            className="w-full"
            options={modules}
            value={moduleFilter}
            onChange={(val)=>setModuleFilter(val)}
            placeholder="Module"
          />
          <input type="date" className="input-soft" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="input-soft" value={to} onChange={(e) => setTo(e.target.value)} />
          <input className="input-soft" placeholder="Search description/target" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="flex gap-2 mb-3">
          <button className="btn btn-ghost">Export PDF</button>
          <button className="btn btn-ghost">Export Excel</button>
        </div>

        <div className="glass-panel rounded-xl overflow-x-auto">
          <table className="nova-table w-full">
            <thead>
              <tr className="thead-soft">
                <th>Action Type</th>
                <th>Performed By</th>
                <th>Target</th>
                <th>Description</th>
                <th>Timestamp</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={i}>
                  <td>{l.type}</td>
                  <td>{l.user}</td>
                  <td>{l.target}</td>
                  <td>{l.description}</td>
                  <td>{l.ts}</td>
                  <td>{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}