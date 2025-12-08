import React, { useMemo, useState } from 'react';
import { FaSearch, FaFilter, FaTimes, FaCalendarAlt, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import RequestCard from '../components/RequestCard';
import RequestsSummaryPanel from '../components/RequestsSummaryPanel';
import ImportRequestsModal from '../components/ImportRequestsModal';
import CreateRequestModal from '../components/CreateRequestModal';
import { useTheme } from '@shared/context/ThemeProvider';

const sampleRequests = [
  { id: 1001, customerName: 'Alice Johnson', propertyUnit: 'Palm Residency A-12', status: 'Pending', priority: 'High', type: 'Inquiry', createdAt: '2025-10-02', updatedAt: '2025-10-05', assignedTo: 'John Doe', description: 'Interested in 2BHK, need pricing details.' },
  { id: 1002, customerName: 'Omar Ali', propertyUnit: 'Green Villas V-7', status: 'In Progress', priority: 'Medium', type: 'Maintenance', createdAt: '2025-10-01', updatedAt: '2025-10-06', assignedTo: 'Sara Ahmed', description: 'AC unit not cooling properly.' },
  { id: 1003, customerName: 'Emily Clark', propertyUnit: 'Blue Towers T-22', status: 'Approved', priority: 'Low', type: 'Booking', createdAt: '2025-09-29', updatedAt: '2025-10-03', assignedTo: 'Mark Spencer', description: 'Booking confirmed for 1BR apartment.' },
  { id: 1004, customerName: 'Khaled Mohamed', propertyUnit: 'Sunset Apartments S-9', status: 'Rejected', priority: 'Low', type: 'Inquiry', createdAt: '2025-10-03', updatedAt: '2025-10-04', assignedTo: 'Nadia Karim', description: 'Requested discount not applicable.' },
  { id: 1005, customerName: 'Sara Ibrahim', propertyUnit: 'Palm Residency A-08', status: 'Pending', priority: 'High', type: 'Booking', createdAt: '2025-10-05', updatedAt: '2025-10-05', assignedTo: 'John Doe', description: 'Urgent booking inquiry for 3BR.' },
];

export default function Requests() {
  const { toggleTheme } = useTheme();
  const [isRTL, setIsRTL] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState([]); // Pending, Approved, Rejected, In Progress
  const [types, setTypes] = useState([]); // Inquiry, Maintenance, Booking
  const [priorities, setPriorities] = useState([]); // Low, Medium, High
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const statusOptions = ['Pending','In Progress','Approved','Rejected'];
  const typeOptions = ['Inquiry','Maintenance','Booking'];
  const priorityOptions = ['Low','Medium','High'];

  const toggleInList = (list, setter, value) => {
    const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    setter(next);
  };

  const chips = [
    ...statuses.map((s) => ({ label: s, kind: 'status' })),
    ...types.map((t) => ({ label: t, kind: 'type' })),
    ...priorities.map((p) => ({ label: p, kind: 'priority' })),
    ...(dateFrom ? [{ label: `From ${dateFrom}`, kind: 'from' }] : []),
    ...(dateTo ? [{ label: `To ${dateTo}`, kind: 'to' }] : []),
  ];

  // Modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openImport, setOpenImport] = useState(false);

  const [requests, setRequests] = useState(sampleRequests);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = query.trim().toLowerCase();
      const matchQuery = !q ||
        String(r.id).includes(q) ||
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.propertyUnit || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q);

      const matchStatus = !statuses.length || statuses.includes(r.status);
      const matchType = !types.length || types.includes(r.type);
      const matchPriority = !priorities.length || priorities.includes(r.priority);

      const created = r.createdAt ? new Date(r.createdAt).getTime() : 0;
      const fromOk = !dateFrom || created >= new Date(dateFrom).getTime();
      const toOk = !dateTo || created <= new Date(dateTo).getTime();

      return matchQuery && matchStatus && matchType && matchPriority && fromOk && toOk;
    });
  }, [requests, query, statuses, types, priorities, dateFrom, dateTo]);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);

  const clearFilters = () => {
    setQuery('');
    setStatuses([]);
    setTypes([]);
    setPriorities([]);
    setDateFrom('');
    setDateTo('');
  };

  // KPI clicks
  const handleFilterStatus = (s) => setStatuses([s]);
  const handleFilterPriority = (p) => setPriorities([p]);
  const handleFilterType = (t) => setTypes([t]);

  // Actions
  const handleSaveRequest = (payload) => {
    setRequests((prev) => {
      const exists = prev.find((x) => x.id === payload.id);
      if (exists) return prev.map((x) => (x.id === payload.id ? payload : x));
      return [payload, ...prev];
    });
  };

  const handleImportRequests = (rows) => {
    const mapped = rows.map((r, i) => ({
      id: Number(r.id) || (10000 + i),
      customerName: r.customerName || r.customer || '',
      propertyUnit: r.propertyUnit || r.property || '',
      status: r.status || 'Pending',
      priority: r.priority || 'Medium',
      type: r.type || 'Inquiry',
      description: r.description || '',
      assignedTo: r.assignedTo || '',
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString(),
    }));
    setRequests((prev) => [...mapped, ...prev]);
  };

  const exportFilteredToExcel = async () => {
    const XLSX = (await import('xlsx')).default;
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Requests');
    XLSX.writeFile(wb, 'requests_export.xlsx');
  };

  const exportFilteredToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    const head = [['ID','Customer','Property/Unit','Status','Priority','Type','Created','Updated']];
    const body = filtered.map((r) => [r.id, r.customerName, r.propertyUnit, r.status, r.priority, r.type, r.createdAt, r.updatedAt]);
    autoTable(doc, { head, body });
    doc.save('requests_export.pdf');
  };

  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Requests Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsRTL((v) => !v)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">{isRTL ? 'EN' : 'RTL'}</button>
          <button onClick={toggleTheme} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Theme</button>
          <button onClick={() => setOpenImport(true)} className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Import</button>
          <button onClick={() => setOpenCreate(true)} className="px-3 py-1 rounded bg-green-50 text-green-700 border border-green-200">Create</button>
        </div>
      </div>

      {/* Summary Panel */}
      <RequestsSummaryPanel
        requests={requests}
        onFilterStatus={handleFilterStatus}
        onFilterPriority={handleFilterPriority}
        onFilterType={handleFilterType}
        isRTL={isRTL}
      />

      {/* Spacer above and below summary */}
      <div className="h-4" />
      <div className="h-4" />

      {/* Filters - Elegant UI */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Top row: search + actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالرقم، العميل، الوحدة، الحالة، الوصف"
              className="w-full rounded pl-9 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdvanced((v) => !v)} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <FaFilter /> {showAdvanced ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
            </button>
            <button onClick={exportFilteredToExcel} className="px-3 py-2 rounded bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-2">
              <FaFileExcel /> تصدير Excel
            </button>
            <button onClick={exportFilteredToPDF} className="px-3 py-2 rounded bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-2">
              <FaFilePdf /> تصدير PDF
            </button>
          </div>
        </div>

        {/* Selected chips */}
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
              {c.label}
              <button
                onClick={() => {
                  if (c.kind === 'status') setStatuses((prev) => prev.filter((x) => x !== c.label));
                  if (c.kind === 'type') setTypes((prev) => prev.filter((x) => x !== c.label));
                  if (c.kind === 'priority') setPriorities((prev) => prev.filter((x) => x !== c.label));
                  if (c.kind === 'from') setDateFrom('');
                  if (c.kind === 'to') setDateTo('');
                }}
                className="hover:text-red-600"
                aria-label="Remove filter"
              >
                <FaTimes />
              </button>
            </span>
          ))}
          {!chips.length && (
            <span className="text-xs text-gray-500 dark:text-gray-400">لا توجد فلاتر محددة</span>
          )}
        </div>

        {/* Advanced panel */}
        {showAdvanced && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Status */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">الحالة</span>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((s) => {
                    const active = statuses.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleInList(statuses, setStatuses, s)}
                        className={`px-3 py-1 rounded-full border ${active ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">النوع</span>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => {
                    const active = types.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleInList(types, setTypes, t)}
                        className={`px-3 py-1 rounded-full border ${active ? 'bg-violet-600 text-white border-violet-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">الأولوية</span>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((p) => {
                    const active = priorities.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => toggleInList(priorities, setPriorities, p)}
                        className={`px-3 py-1 rounded-full border ${active ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-xs text-gray-600 dark:text-gray-300">من</label>
                <FaCalendarAlt className="absolute left-3 bottom-3 text-gray-400" />
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded pl-9 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2" />
              </div>
              <div className="relative">
                <label className="text-xs text-gray-600 dark:text-gray-300">إلى</label>
                <FaCalendarAlt className="absolute left-3 bottom-3 text-gray-400" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded pl-9 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end">
              <button onClick={clearFilters} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <FaTimes /> مسح كل الفلاتر
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Multiple spacers below filters */}
      <div className="h-3" />
      <div className="h-3" />
      <div className="h-3" />
      <div className="h-3" />
      <div className="h-3" />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginated.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            isRTL={isRTL}
            onView={() => alert(`View request ${r.id}`)}
            onEdit={() => setOpenCreate(true) || null}
            onAssign={() => alert(`Assign request ${r.id}`)}
            onApprove={() => setRequests((prev) => prev.map((x) => x.id === r.id ? { ...x, status: 'Approved', updatedAt: new Date().toISOString() } : x))}
            onReject={() => setRequests((prev) => prev.map((x) => x.id === r.id ? { ...x, status: 'Rejected', updatedAt: new Date().toISOString() } : x))}
            onDelete={() => setRequests((prev) => prev.filter((x) => x.id !== r.id))}
            onExport={async () => {
              const jsPDF = (await import('jspdf')).default;
              const autoTable = (await import('jspdf-autotable')).default;
              const doc = new jsPDF();
              const head = [['Field','Value']];
              const body = Object.entries(r).map(([k, v]) => [k, String(v)]);
              autoTable(doc, { head, body });
              doc.save(`request_${r.id}.pdf`);
            }}
          />
        ))}
        {!paginated.length && (
          <div className="text-gray-500 dark:text-gray-400">No requests match filters.</div>
        )}
      </div>

      {/* Spacer below cards */}
      <div className="h-4" />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Prev</button>
        <span className="text-gray-700 dark:text-gray-200">Page {page} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Next</button>
      </div>

      {/* Modals */}
      <CreateRequestModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={handleSaveRequest}
        isRTL={isRTL}
      />

      <ImportRequestsModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onImport={handleImportRequests}
        isRTL={isRTL}
      />
    </div>
  );
}
