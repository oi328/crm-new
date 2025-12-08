import React from 'react';
import { FaCheck, FaTimes, FaUserEdit, FaTrash, FaFileExport, FaUserTie } from 'react-icons/fa';

function formatDate(d) {
  if (!d) return '-';
  try {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString();
  } catch {
    return String(d);
  }
}

export default function RequestCard({
  request,
  isRTL = false,
  onView,
  onEdit,
  onAssign,
  onApprove,
  onReject,
  onDelete,
  onExport,
}) {
  if (!request) return null;
  const dir = isRTL ? 'rtl' : 'ltr';
  const justify = isRTL ? 'justify-end' : 'justify-start';

  return (
    <div dir={dir} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col gap-3 transition hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">#{request.id}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{request.customerName}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
          {request.type} • {request.priority}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Property / Unit</span>
          <span className="text-gray-800 dark:text-gray-100">{request.propertyUnit || '-'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Status</span>
          <span className="text-gray-800 dark:text-gray-100">{request.status}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Created</span>
          <span className="text-gray-800 dark:text-gray-100">{formatDate(request.createdAt)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Updated</span>
          <span className="text-gray-800 dark:text-gray-100">{formatDate(request.updatedAt)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400">Assigned To</span>
          <span className="text-gray-800 dark:text-gray-100 flex items-center gap-1"><FaUserTie /> {request.assignedTo || '-'}</span>
        </div>
        <div className="flex flex-col col-span-2 md:col-span-3">
          <span className="text-gray-500 dark:text-gray-400">Notes</span>
          <span className="text-gray-800 dark:text-gray-100 line-clamp-2">{request.description || request.notes || '-'}</span>
        </div>
      </div>

      <div className={`flex flex-wrap items-center gap-2 ${justify}`}>
        <button onClick={() => onView?.(request)} className="px-3 py-1 text-sm rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">View</button>
        <button onClick={() => onEdit?.(request)} className="px-3 py-1 text-sm rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"><FaUserEdit /> Edit</button>
        <button onClick={() => onAssign?.(request)} className="px-3 py-1 text-sm rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100">Assign</button>
        <button onClick={() => onApprove?.(request)} className="px-3 py-1 text-sm rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 flex items-center gap-1"><FaCheck /> Approve</button>
        <button onClick={() => onReject?.(request)} className="px-3 py-1 text-sm rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-1"><FaTimes /> Reject</button>
        <button onClick={() => onDelete?.(request)} className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 flex items-center gap-1"><FaTrash /> Delete</button>
        <button onClick={() => onExport?.(request)} className="px-3 py-1 text-sm rounded bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 flex items-center gap-1"><FaFileExport /> Export</button>
      </div>
    </div>
  );
}