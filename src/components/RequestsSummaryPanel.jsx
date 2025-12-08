import React from 'react';

export default function RequestsSummaryPanel({
  requests = [],
  onFilterStatus,
  onFilterPriority,
  onFilterType,
  isRTL = false,
}) {
  const dir = isRTL ? 'rtl' : 'ltr';

  const total = requests.length;
  const byStatus = requests.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  const byPriority = requests.reduce((acc, r) => { acc[r.priority] = (acc[r.priority] || 0) + 1; return acc; }, {});
  const byType = requests.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
  const completedCount = (byStatus['Approved'] || 0) + (byStatus['Rejected'] || 0);

  const Item = ({ label, value, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-start bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 hover:shadow transition">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">{value}</span>
    </button>
  );

  return (
    <div dir={dir} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <Item label="Total Requests" value={total} />
      <Item label="Pending" value={byStatus['Pending'] || 0} onClick={() => onFilterStatus?.('Pending')} />
      <Item label="In Progress" value={byStatus['In Progress'] || 0} onClick={() => onFilterStatus?.('In Progress')} />
      <Item label="Approved" value={byStatus['Approved'] || 0} onClick={() => onFilterStatus?.('Approved')} />
      <Item label="Rejected" value={byStatus['Rejected'] || 0} onClick={() => onFilterStatus?.('Rejected')} />
      <Item label="Completed" value={completedCount} />
      <Item label="High Priority" value={byPriority['High'] || 0} onClick={() => onFilterPriority?.('High')} />
      <Item label="Medium Priority" value={byPriority['Medium'] || 0} onClick={() => onFilterPriority?.('Medium')} />
      <Item label="Low Priority" value={byPriority['Low'] || 0} onClick={() => onFilterPriority?.('Low')} />
      <Item label="Inquiry" value={byType['Inquiry'] || 0} onClick={() => onFilterType?.('Inquiry')} />
      <Item label="Maintenance" value={byType['Maintenance'] || 0} onClick={() => onFilterType?.('Maintenance')} />
      <Item label="Booking" value={byType['Booking'] || 0} onClick={() => onFilterType?.('Booking')} />
    </div>
  );
}