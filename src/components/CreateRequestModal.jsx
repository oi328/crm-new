import React, { useMemo, useState } from 'react';

const TYPES = ['Inquiry','Maintenance','Booking'];
const PRIORITIES = ['Low','Medium','High'];
const STATUSES = ['Pending','In Progress','Approved','Rejected'];

function DropZone({ onFiles, label }) {
  return (
    <div
      onDrop={(e) => { e.preventDefault(); onFiles(Array.from(e.dataTransfer.files)); }}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-4 text-center text-gray-600 dark:text-gray-300"
    >
      <p>{label}</p>
      <input type="file" multiple onChange={(e) => onFiles(Array.from(e.target.files))} className="mt-2" />
    </div>
  );
}

export default function CreateRequestModal({ open, onClose, onSave, initial = {}, isRTL = false }) {
  const [type, setType] = useState(initial.type || TYPES[0]);
  const [customerName, setCustomerName] = useState(initial.customerName || '');
  const [propertyUnit, setPropertyUnit] = useState(initial.propertyUnit || '');
  const [priority, setPriority] = useState(initial.priority || PRIORITIES[1]);
  const [status, setStatus] = useState(initial.status || STATUSES[0]);
  const [description, setDescription] = useState(initial.description || '');
  const [assignedTo, setAssignedTo] = useState(initial.assignedTo || '');
  const [attachments, setAttachments] = useState([]);
  const [tab, setTab] = useState('basic');
  const dir = isRTL ? 'rtl' : 'ltr';

  const canSave = useMemo(() => customerName && type && priority, [customerName, type, priority]);

  const handleSave = () => {
    if (!canSave) {
      alert('Please fill required fields');
      return;
    }
    const payload = {
      id: initial.id || Math.floor(Math.random() * 100000),
      type, customerName, propertyUnit, priority, status,
      description, assignedTo,
      createdAt: initial.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments,
    };
    onSave?.(payload);
    alert('Request saved');
    onClose?.();
  };

  if (!open) return null;

  return (
    <div dir={dir} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[95vw] max-w-3xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{initial.id ? 'Edit Request' : 'Create Request'}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Close</button>
        </div>

        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {['basic','attachments','notes'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab === t ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'} text-gray-800 dark:text-gray-100`}>{t}</button>
          ))}
        </div>

        {tab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Request Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Assigned Staff</label>
              <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2" placeholder="e.g. John Doe" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">Customer Name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2" placeholder="Customer Name" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">Property / Unit</label>
              <input value={propertyUnit} onChange={(e) => setPropertyUnit(e.target.value)} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2" placeholder="Property or Unit" />
            </div>
          </div>
        )}

        {tab === 'attachments' && (
          <div className="flex flex-col gap-3">
            <DropZone label="Drag & drop attachments or click to upload" onFiles={(fl) => setAttachments((prev) => [...prev, ...fl])} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {attachments.map((f, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded p-2 text-sm flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-200">{f.name}</span>
                  <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-600">Remove</button>
                </div>
              ))}
              {!attachments.length && (
                <div className="text-gray-500 dark:text-gray-400 text-sm">No attachments</div>
              )}
            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">Description / Notes</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2" placeholder="Enter description" />
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button onClick={handleSave} disabled={!canSave} className={`px-3 py-1 rounded border ${canSave ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'}`}>Save</button>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">Cancel</button>
        </div>
      </div>
    </div>
  );
}