import React, { useCallback, useMemo, useState } from 'react';

export default function ImportRequestsModal({ open, onClose, onImport, isRTL = false, currentUser = 'admin' }) {
  const [files, setFiles] = useState([]);
  const [rows, setRows] = useState([]);
  const [logs, setLogs] = useState([]);
  const dir = isRTL ? 'rtl' : 'ltr';

  const columns = useMemo(
    () => ['id','customerName','propertyUnit','status','priority','type','description','assignedTo','createdAt','updatedAt'],
    []
  );

  const appendLog = useCallback((message, level = 'info') => {
    setLogs((prev) => [{ ts: new Date().toISOString(), level, message, user: currentUser }, ...prev]);
  }, [setLogs, currentUser]);

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const header = lines[0].split(',').map((h) => h.trim());
    const data = lines.slice(1).map((l) => {
      const vals = l.split(',');
      const obj = {};
      header.forEach((h, i) => { obj[h] = vals[i]; });
      return obj;
    });
    return data;
  };

  const handleFiles = async (fileList) => {
    const arr = Array.from(fileList || []);
    setFiles(arr);
    for (const f of arr) {
      try {
        const ext = f.name.toLowerCase().split('.').pop();
        if (ext === 'csv') {
          const text = await f.text();
          const data = parseCSV(text);
          setRows(data);
          appendLog(`CSV parsed: ${f.name} (${data.length} rows)`, 'success');
        } else if (ext === 'xlsx' || ext === 'xls') {
          const XLSX = (await import('xlsx')).default;
          const ab = await f.arrayBuffer();
          const wb = XLSX.read(ab, { type: 'array' });
          const wsName = wb.SheetNames[0];
          const ws = wb.Sheets[wsName];
          const data = XLSX.utils.sheet_to_json(ws);
          setRows(data);
          appendLog(`XLSX parsed: ${f.name} (${data.length} rows)`, 'success');
        } else {
          appendLog(`Unsupported file type: ${f.name}`, 'error');
        }
      } catch (e) {
        console.error(e);
        appendLog(`Failed to parse ${f.name}: ${e.message}`, 'error');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleImport = () => {
    if (!rows.length) {
      appendLog('No rows to import', 'error');
      alert('No rows to import');
      return;
    }
    onImport?.(rows);
    appendLog(`Imported ${rows.length} row(s)`, 'success');
    alert(`Imported ${rows.length} row(s)`);
    onClose?.();
  };

  const downloadTemplate = async (type) => {
    const content = [columns.join(','), ''].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'xlsx' ? 'requests_template.csv' : 'requests_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    appendLog(`Template downloaded (${type})`, 'info');
  };

  if (!open) return null;

  return (
    <div dir={dir} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[95vw] max-w-4xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Import Requests</h2>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Close</button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-6 text-center text-gray-600 dark:text-gray-300"
        >
          <p>Drag & drop CSV/XLSX files here, or click to select</p>
          <input type="file" multiple accept=".csv,.xlsx,.xls" onChange={(e) => handleFiles(e.target.files)} className="mt-3" />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => downloadTemplate('csv')} className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">Download CSV Template</button>
          <button onClick={() => downloadTemplate('xlsx')} className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Download XLSX Template</button>
        </div>

        <div className="overflow-auto max-h-60 border border-gray-200 dark:border-gray-700 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-2 py-1 text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((r, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                  {columns.map((c) => (
                    <td key={c} className="px-2 py-1 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">{r[c]}</td>
                  ))}
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={columns.length} className="px-2 py-6 text-center text-gray-500 dark:text-gray-400">No data preview</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs max-h-28 overflow-auto border border-gray-200 dark:border-gray-700 rounded p-2 w-1/2">
            {logs.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded ${l.level === 'success' ? 'bg-green-50 text-green-700' : l.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{l.level}</span>
                <span className="text-gray-700 dark:text-gray-200">{l.ts}</span>
                <span className="text-gray-600 dark:text-gray-300">{l.user}</span>
                <span className="text-gray-800 dark:text-gray-100">{l.message}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleImport} className="px-3 py-1 rounded bg-green-50 text-green-700 border border-green-200">Import</button>
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}