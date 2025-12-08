import React, { useMemo, useState } from 'react';
import SearchableSelect from '@shared/components/SearchableSelect';
import Layout from '@shared/layouts/Layout';

const mockAccess = [
  { user: 'Ibrahim', login: '2025-11-18 10:24', logout: '2025-11-18 18:04', ip: '192.168.1.12', location: 'Cairo', device: 'Windows PC', browser: 'Chrome' },
  { user: 'Sara', login: '2025-11-17 09:14', logout: '2025-11-17 17:01', ip: '192.168.1.18', location: 'Giza', device: 'MacBook', browser: 'Safari' },
  { user: 'Mohamed', login: '2025-11-16 08:33', logout: '2025-11-16 16:22', ip: '192.168.1.21', location: 'Alexandria', device: 'iPhone', browser: 'Safari' },
];

const deviceTypes = ['Windows PC', 'MacBook', 'Linux PC', 'iPhone', 'Android'];

export default function UserManagementAccessLogs() {
  const [userFilter, setUserFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');

  const filtered = useMemo(() => {
    return mockAccess.filter((a) => {
      const matchesUser = userFilter ? a.user.toLowerCase().includes(userFilter.toLowerCase()) : true;
      const matchesDevice = deviceFilter ? a.device === deviceFilter : true;
      const matchesFrom = from ? a.login >= from : true;
      const matchesTo = to ? a.login <= to : true;
      return matchesUser && matchesDevice && matchesFrom && matchesTo;
    });
  }, [userFilter, deviceFilter, from, to]);

  return (
    <Layout title="User Management — User Access Logs">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold mb-4">User Access Logs</h1>

        <div className="glass-panel rounded-xl p-3 mb-3 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="input-soft" placeholder="Filter by user" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
          <input type="date" className="input-soft" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="input-soft" value={to} onChange={(e) => setTo(e.target.value)} />
          <SearchableSelect
            className="w-full"
            options={deviceTypes}
            value={deviceFilter}
            onChange={(val)=>setDeviceFilter(val)}
            placeholder="Device Type"
          />
          <button className="btn btn-ghost">Export</button>
        </div>

        <div className="glass-panel rounded-xl overflow-x-auto">
          <table className="nova-table w-full">
            <thead>
              <tr className="thead-soft">
                <th>User</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Device</th>
                <th>Browser</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i}>
                  <td>{a.user}</td>
                  <td>{a.login}</td>
                  <td>{a.logout}</td>
                  <td>{a.ip}</td>
                  <td>{a.location}</td>
                  <td>{a.device}</td>
                  <td>{a.browser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}