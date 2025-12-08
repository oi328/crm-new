import React, { useEffect, useMemo, useState } from 'react'

const Modal = ({ open, title, children, onClose, onConfirm, confirmText = 'Save Template' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn btn-glass" onClick={onClose}>Cancel</button>
        </div>
        <div>{children}</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="btn btn-glass" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}

const EyeIcon = () => (<span role="img" aria-label="preview">👁️</span>)
const EditIcon = () => (<span role="img" aria-label="edit">✏️</span>)
const TrashIcon = () => (<span role="img" aria-label="delete">🗑️</span>)
const CopyIcon = () => (<span role="img" aria-label="duplicate">📄</span>)

export default function SmsTemplates() {
  const [templates, setTemplates] = useState([
    { id: 'tpl-otp', name: 'OTP Verification', type: 'OTP', body: 'Hi {{name}}, your verification code is {{otp}}.', status: 'Active', updatedAt: new Date().toLocaleString() },
    { id: 'tpl-payment', name: 'Payment Confirmation', type: 'Payment', body: 'Dear {{name}}, your payment of {{amount}} on {{date}} was successful.', status: 'Active', updatedAt: new Date().toLocaleString() },
    { id: 'tpl-renewal', name: 'Renewal Reminder', type: 'Renewal', body: 'Hi {{name}}, your plan renewal is due on {{date}}.', status: 'Inactive', updatedAt: new Date().toLocaleString() },
  ])

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 5

  const [toast, setToast] = useState(null) // { type: 'success'|'error', message: string }

  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [tplName, setTplName] = useState('')
  const [tplType, setTplType] = useState('OTP')
  const [tplBody, setTplBody] = useState('')
  const [tplStatus, setTplStatus] = useState('Active')

  const [previewTplId, setPreviewTplId] = useState('tpl-otp')

  const activeCount = useMemo(() => templates.filter(t => t.status === 'Active').length, [templates])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return templates.filter(t => {
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.body.toLowerCase().includes(q)
      const matchesType = typeFilter === 'All' || t.type === typeFilter
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter
      return matchesQuery && matchesType && matchesStatus
    })
  }, [templates, search, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const openAdd = () => {
    setEditing(null)
    setTplName('')
    setTplType('OTP')
    setTplBody('')
    setTplStatus('Active')
    setOpenModal(true)
  }

  const openEdit = (tpl) => {
    setEditing(tpl)
    setTplName(tpl.name)
    setTplType(tpl.type)
    setTplBody(tpl.body)
    setTplStatus(tpl.status)
    setOpenModal(true)
  }

  const saveTemplate = () => {
    const name = tplName.trim()
    const body = tplBody.trim()
    if (!name || !body) {
      setToast({ type: 'error', message: 'Please fill in all required fields.' })
      setTimeout(() => setToast(null), 2500)
      return
    }
    if (editing) {
      setTemplates(prev => prev.map(t => t.id === editing.id ? { ...t, name, type: tplType, body, status: tplStatus, updatedAt: new Date().toLocaleString() } : t))
      setToast({ type: 'success', message: 'Template updated successfully.' })
    } else {
      const id = 'tpl-' + name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2)
      setTemplates(prev => [{ id, name, type: tplType, body, status: tplStatus, updatedAt: new Date().toLocaleString() }, ...prev])
      setToast({ type: 'success', message: 'Template saved successfully.' })
    }
    setTimeout(() => setToast(null), 2500)
    setOpenModal(false)
  }

  const deleteTemplate = (tpl) => {
    setTemplates(prev => prev.filter(t => t.id !== tpl.id))
    setToast({ type: 'success', message: 'Template deleted.' })
    setTimeout(() => setToast(null), 2000)
  }

  const duplicateTemplate = (tpl) => {
    const id = tpl.id + '-copy-' + Math.random().toString(36).slice(2)
    const copy = { ...tpl, id, name: tpl.name + ' (Copy)', updatedAt: new Date().toLocaleString() }
    setTemplates(prev => [copy, ...prev])
    setToast({ type: 'success', message: 'Template duplicated.' })
    setTimeout(() => setToast(null), 2000)
  }

  const previewText = useMemo(() => {
    const source = openModal ? tplBody : (templates.find(t => t.id === previewTplId)?.body || '')
    // Simulate placeholder substitution
    return source
      .replaceAll('{{name}}', 'John Doe')
      .replaceAll('{{amount}}', '$99.00')
      .replaceAll('{{date}}', '2025-01-31')
      .replaceAll('{{otp}}', '482913')
  }, [openModal, tplBody, previewTplId, templates])

  const charCount = (openModal ? tplBody : (templates.find(t => t.id === previewTplId)?.body || '')).length

  return (
    <div className="p-6 bg-[var(--content-bg)] text-[var(--content-text)]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg ${toast.type==='success'?'bg-emerald-600 text-white':'bg-rose-600 text-white'}`}>{toast.message}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            SMS Templates
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[var(--muted-text)]">Active {activeCount} / Total {templates.length}</div>
          <button className="btn btn-primary" onClick={openAdd}>Add New Template</button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="glass-panel rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input-soft" placeholder="Search templates" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="input-soft" value={typeFilter} onChange={e=>{ setTypeFilter(e.target.value); setPage(1) }}>
            <option>All</option>
            <option>OTP</option>
            <option>Payment</option>
            <option>Renewal</option>
            <option>Reminder</option>
            <option>Custom</option>
          </select>
          <select className="input-soft" value={statusFilter} onChange={e=>{ setStatusFilter(e.target.value); setPage(1) }}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Main grid: Table + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Templates Table */}
        <div className="lg:col-span-2">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Templates</h3>
              <div className="text-sm text-[var(--muted-text)]">Page {page} of {totalPages}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left">Template Name</th>
                    <th className="px-4 py-3 text-left">Template Type</th>
                    <th className="px-4 py-3 text-left">Last Updated</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr><td className="px-4 py-4 text-center text-gray-500" colSpan={5}>No templates</td></tr>
                  ) : pageItems.map(t => (
                    <tr key={t.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{t.name}</td>
                      <td className="px-4 py-2">{t.type}</td>
                      <td className="px-4 py-2">{t.updatedAt}</td>
                      <td className={`px-4 py-2 font-medium ${t.status==='Active'?'text-emerald-600':'text-rose-600'}`}>{t.status}</td>
                      <td className="px-4 py-2 flex items-center gap-1">
                        <button className="btn btn-glass btn-sm text-xs scale-90" onClick={()=>setPreviewTplId(t.id)}><EyeIcon /> Preview</button>
                        <button className="btn btn-glass btn-sm text-xs scale-90" onClick={()=>openEdit(t)}><EditIcon /> Edit</button>
                        <button className="btn btn-glass btn-sm text-xs scale-90" onClick={()=>duplicateTemplate(t)}><CopyIcon /> Duplicate</button>
                        <button className="btn btn-danger btn-sm text-xs scale-90" onClick={()=>deleteTemplate(t)}><TrashIcon /> Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-[var(--muted-text)]">Showing {pageItems.length} of {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button className="btn btn-glass btn-sm" disabled={page===1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Prev</button>
                <button className="btn btn-glass btn-sm" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Placeholder Guide + Message Preview */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-3">Placeholder Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-3 py-2 text-left">Placeholder</th>
                    <th className="px-3 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-700"><td className="px-3 py-2">{'{{name}}'}</td><td className="px-3 py-2">Customer Name</td></tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700"><td className="px-3 py-2">{'{{amount}}'}</td><td className="px-3 py-2">Payment Amount</td></tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700"><td className="px-3 py-2">{'{{date}}'}</td><td className="px-3 py-2">Renewal Date</td></tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700"><td className="px-3 py-2">{'{{otp}}'}</td><td className="px-3 py-2">Verification Code</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--muted-text)] mt-2">System replaces placeholders automatically when sending.</p>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Message Preview</h3>
              <div className="text-xs text-[var(--muted-text)]">Characters: {charCount}</div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm">
              <div className="w-full h-48 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 overflow-auto">
                <p className="text-sm leading-6 whitespace-pre-wrap">{previewText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Template Modal */}
      <Modal open={openModal} title={editing ? 'Edit Template' : 'Add New Template'} onClose={()=>setOpenModal(false)} onConfirm={saveTemplate}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Template Name</label>
            <input className="input-soft w-full" value={tplName} onChange={e=>setTplName(e.target.value)} placeholder="e.g., Payment Confirmation" />
          </div>
          <div>
            <label className="block text-sm mb-1">Template Type</label>
            <select className="input-soft w-full" value={tplType} onChange={e=>setTplType(e.target.value)}>
              <option>OTP</option>
              <option>Payment</option>
              <option>Renewal</option>
              <option>Reminder</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Message Body</label>
            <textarea className="input-soft w-full h-32" value={tplBody} onChange={e=>setTplBody(e.target.value)} placeholder="Hi {{name}}, your verification code is {{otp}}." />
            <div className="text-xs text-[var(--muted-text)] mt-1">Supports placeholders like {'{{name}}'}, {'{{amount}}'}, {'{{date}}'}, {'{{otp}}'}.</div>
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select className="input-soft w-full" value={tplStatus} onChange={e=>setTplStatus(e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}