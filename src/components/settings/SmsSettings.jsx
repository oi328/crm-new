import React, { useEffect, useMemo, useState } from 'react'

const PlaneIcon = () => <span role="img" aria-label="Send">✈️</span>
const PlugIcon = () => <span role="img" aria-label="Gateway">🔌</span>
const TemplateIcon = () => <span role="img" aria-label="Template">📄</span>
const LogsIcon = () => <span role="img" aria-label="Logs">📜</span>
const BalanceIcon = () => <span role="img" aria-label="Balance">💳</span>

const Modal = ({ open, title, children, onClose, onConfirm, confirmText = 'Save' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[1001] w-[92vw] max-w-[640px]">
        <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/20 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button className="btn btn-glass" onClick={onClose}>✖️</button>
          </div>
          <div className="p-5 space-y-4">{children}</div>
          <div className="px-5 py-4 border-t border-white/20 dark:border-gray-700 flex items-center justify-end gap-3">
            <button className="btn btn-glass" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SmsSettings() {
  // Gateway configuration
  const [provider, setProvider] = useState('Twilio')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [senderId, setSenderId] = useState('')
  const [connStatus, setConnStatus] = useState('idle') // idle | success | failed
  const [connMessage, setConnMessage] = useState('')
  const [balance, setBalance] = useState(null) // number | null

  // Templates
  const [templates, setTemplates] = useState([
    { id: 'welcome', name: 'Welcome', description: 'User registration welcome message', body: 'Welcome, {{name}}! Your account has been created.', updatedAt: new Date().toLocaleString() },
    { id: 'payment', name: 'Payment Confirmation', description: 'Payment receipt confirmation', body: 'Hi {{name}}, your payment of {{amount}} was successful.', updatedAt: new Date().toLocaleString() },
  ])
  const [openTemplateModal, setOpenTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [tplName, setTplName] = useState('')
  const [tplBody, setTplBody] = useState('')

  // Notification triggers
  const [triggers, setTriggers] = useState({
    registration: true,
    payment: true,
    renewal: false,
    failedLogin: true,
  })
  const [selectedTriggers, setSelectedTriggers] = useState({
    registration: false,
    payment: false,
    renewal: false,
    failedLogin: false,
  })
  const [selectAll, setSelectAll] = useState(false)

  // Test SMS
  const [testNumber, setTestNumber] = useState('')
  const [testTemplate, setTestTemplate] = useState('welcome')
  const [testAlert, setTestAlert] = useState(null) // { type: 'success'|'failed', message: string }

  // Logs
  const [logs, setLogs] = useState([
    { id: 'l1', recipient: '+201234567890', template: 'Welcome', status: 'Delivered', at: new Date(Date.now()-86400000).toLocaleString() },
  ])
  const [statusFilter, setStatusFilter] = useState('All')
  const [recipientQuery, setRecipientQuery] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('smsSettings')
      if (raw) {
        const s = JSON.parse(raw)
        if (s.provider) setProvider(s.provider)
        if (s.apiKey) setApiKey(s.apiKey)
        if (s.apiSecret) setApiSecret(s.apiSecret)
        if (s.senderId) setSenderId(s.senderId)
        if (s.triggers) setTriggers(s.triggers)
        if (Array.isArray(s.templates)) setTemplates(s.templates)
      }
    } catch {}
  }, [])

  useEffect(() => {
    // Simulate balance availability per provider
    if (['Twilio', 'Nexmo', 'MessageBird'].includes(provider)) {
      setBalance(250)
    } else {
      setBalance(null)
    }
  }, [provider])

  // Listen for header save event
  useEffect(() => {
    const handler = () => saveAll()
    window.addEventListener('save-sms-settings', handler)
    return () => window.removeEventListener('save-sms-settings', handler)
  }, [provider, apiKey, apiSecret, senderId, triggers, templates])

  const saveAll = () => {
    try {
      window.localStorage.setItem('smsSettings', JSON.stringify({ provider, apiKey, apiSecret, senderId, triggers, templates }))
      setTestAlert({ type: 'success', message: 'Settings saved successfully.' })
      setTimeout(() => setTestAlert(null), 2500)
    } catch {
      setTestAlert({ type: 'failed', message: 'Failed to save settings.' })
      setTimeout(() => setTestAlert(null), 2500)
    }
  }

  const testConnection = () => {
    if (provider && apiKey && apiSecret) {
      setConnStatus('success')
      setConnMessage('Connection successful.')
    } else {
      setConnStatus('failed')
      setConnMessage('Missing provider credentials.')
    }
    setTimeout(() => setConnMessage(''), 3000)
  }

  const openAddTemplate = () => {
    setEditingTemplate(null)
    setTplName('')
    setTplBody('')
    setOpenTemplateModal(true)
  }

  const openEditTemplate = (tpl) => {
    setEditingTemplate(tpl)
    setTplName(tpl.name)
    setTplBody(tpl.body)
    setOpenTemplateModal(true)
  }

  const saveTemplateModal = () => {
    if (!tplName.trim() || !tplBody.trim()) return
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name: tplName.trim(), body: tplBody.trim(), description: t.description || tplBody.trim().slice(0, 60), updatedAt: new Date().toLocaleString() } : t))
    } else {
      const id = tplName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2)
      setTemplates(prev => [{ id, name: tplName.trim(), description: tplBody.trim().slice(0, 60), body: tplBody.trim(), updatedAt: new Date().toLocaleString() }, ...prev])
    }
    setOpenTemplateModal(false)
  }

  const deleteTemplate = (tpl) => {
    setTemplates(prev => prev.filter(t => t.id !== tpl.id))
  }

  const toggleTrigger = (key, value) => setTriggers(prev => ({ ...prev, [key]: value }))
  const selectTrigger = (key, value) => setSelectedTriggers(prev => ({ ...prev, [key]: value }))

  const onSelectAll = (checked) => {
    setSelectAll(checked)
    setSelectedTriggers({ registration: checked, payment: checked, renewal: checked, failedLogin: checked })
  }

  const applyBulk = (enable) => {
    const keys = Object.entries(selectedTriggers).filter(([k,v]) => v).map(([k]) => k)
    if (!keys.length) return
    setTriggers(prev => {
      const next = { ...prev }
      keys.forEach(k => { next[k] = enable })
      return next
    })
  }

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (statusFilter !== 'All' && l.status !== statusFilter) return false
      if (recipientQuery && !l.recipient.toLowerCase().includes(recipientQuery.toLowerCase())) return false
      if (dateStart) {
        const startTs = new Date(dateStart).getTime()
        const lTs = new Date(l.at).getTime()
        if (lTs < startTs) return false
      }
      if (dateEnd) {
        const endTs = new Date(dateEnd).getTime()
        const lTs = new Date(l.at).getTime()
        if (lTs > endTs) return false
      }
      return true
    })
  }, [logs, statusFilter, recipientQuery, dateStart, dateEnd])

  const sendTestSms = () => {
    const tpl = templates.find(t => t.id === testTemplate)
    const ok = !!tpl && !!testNumber && connStatus === 'success'
    const status = ok ? 'Delivered' : 'Failed'
    setTestAlert({ type: ok ? 'success' : 'failed', message: ok ? 'Test SMS sent successfully.' : 'Failed to send SMS. Check connection and inputs.' })
    setLogs(prev => [{ id: Math.random().toString(36).slice(2), recipient: testNumber || 'N/A', template: tpl?.name || 'N/A', status, at: new Date().toLocaleString() }, ...prev])
    setTimeout(() => setTestAlert(null), 3500)
  }

  return (
    <div className="">
      {/* Gateway Configuration */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><PlugIcon /><h3 className="text-lg font-semibold">Gateway Configuration</h3></div>
          <button className="btn btn-primary" onClick={testConnection}>Test Connection</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">SMS Provider</label>
            <select className="input-soft w-full" value={provider} onChange={e=>setProvider(e.target.value)}>
              <option>Twilio</option>
              <option>Nexmo</option>
              <option>MessageBird</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Sender ID</label>
            <input className="input-soft w-full" value={senderId} onChange={e=>setSenderId(e.target.value)} placeholder="Company or Number" />
          </div>
          <div>
            <label className="block text-sm mb-1">API Key</label>
            <input className="input-soft w-full" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="API Key" />
          </div>
          <div>
            <label className="block text-sm mb-1">API Secret</label>
            <input className="input-soft w-full" value={apiSecret} onChange={e=>setApiSecret(e.target.value)} placeholder="API Secret" />
          </div>
        </div>
        {connMessage && (
          <div className={`mt-4 text-sm px-3 py-2 rounded-md ${connStatus==='success'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{connMessage}</div>
        )}
      </div>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* SMS Balance */}
      {balance !== null && (
        <>
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2"><BalanceIcon /><h3 className="text-lg font-semibold">SMS Balance</h3></div>
            <div className="text-2xl font-bold">{balance} credits</div>
            <div className="text-xs text-[var(--muted-text)] mt-1">Balance retrieval simulated based on provider.</div>
          </div>
          <div className="h-6 md:h-8" aria-hidden="true" />
        </>
      )}

      {/* Message Templates */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><TemplateIcon /><h3 className="text-lg font-semibold">Message Templates</h3></div>
          <button className="btn btn-primary" onClick={openAddTemplate}>Add New Template</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-3 text-left">Template Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Last Updated</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr><td className="px-4 py-4 text-center text-gray-500" colSpan={4}>No templates</td></tr>
              ) : templates.map(tpl => (
                <tr key={tpl.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{tpl.name}</td>
                  <td className="px-4 py-2">{tpl.description}</td>
                  <td className="px-4 py-2">{tpl.updatedAt}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <button className="btn btn-glass btn-sm" onClick={()=>openEditTemplate(tpl)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>deleteTemplate(tpl)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* Notification Triggers */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Notification Triggers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'registration', label: 'User Registration' },
            { key: 'payment', label: 'Payment Confirmation' },
            { key: 'renewal', label: 'Subscription Renewal' },
            { key: 'failedLogin', label: 'Failed Login Attempt' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border bg-white/90 dark:bg-gray-800/80">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedTriggers[item.key]} onChange={e=>selectTrigger(item.key, e.target.checked)} />
                <span className="text-sm">{item.label}</span>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="hidden" checked={!!triggers[item.key]} onChange={e=>toggleTrigger(item.key, e.target.checked)} />
                <span className={`w-10 h-6 rounded-full p-1 ${triggers[item.key]?'bg-emerald-500':'bg-gray-400'} transition-all`}>
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${triggers[item.key]?'translate-x-4':'translate-x-0'}`} />
                </span>
              </label>
            </div>
          ))}
        </div>
        <div className="h-4 md:h-6" aria-hidden="true" />
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selectAll} onChange={e=>onSelectAll(e.target.checked)} /> Select All</label>
          <button className="btn btn-glass btn-sm" onClick={()=>applyBulk(true)}>Enable Selected</button>
          <button className="btn btn-danger btn-sm" onClick={()=>applyBulk(false)}>Disable Selected</button>
        </div>
      </div>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* Test SMS */}
      <div id="test-sms" className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><PlaneIcon /><h3 className="text-lg font-semibold">Test SMS</h3></div>
          <button className="btn btn-primary" onClick={sendTestSms}>Send Test SMS</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input className="input-soft w-full" value={testNumber} onChange={e=>setTestNumber(e.target.value)} placeholder="e.g., +201234567890" />
          </div>
          <div>
            <label className="block text-sm mb-1">Template</label>
            <select className="input-soft w-full" value={testTemplate} onChange={e=>setTestTemplate(e.target.value)}>
              {templates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
        </div>
        {testAlert && (
          <div className={`mt-4 text-sm px-3 py-2 rounded-md ${testAlert.type==='success'?'bg-emerald-100 text-emerald-700':'bg-rose-100 text-rose-700'}`}>{testAlert.message}</div>
        )}
      </div>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* SMS Logs */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><LogsIcon /><h3 className="text-lg font-semibold">SMS Logs</h3></div>
          <div className="flex items-center gap-2">
            <input className="input-soft" placeholder="Search recipient" value={recipientQuery} onChange={e=>setRecipientQuery(e.target.value)} />
            <select className="input-soft" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Delivered</option>
              <option>Failed</option>
            </select>
            <input type="date" className="input-soft" value={dateStart} onChange={e=>setDateStart(e.target.value)} />
            <input type="date" className="input-soft" value={dateEnd} onChange={e=>setDateEnd(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-3 text-left">Recipient</th>
                <th className="px-4 py-3 text-left">Template Used</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td className="px-4 py-4 text-center text-gray-500" colSpan={4}>No logs found</td></tr>
              ) : filteredLogs.map(l => (
                <tr key={l.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{l.recipient}</td>
                  <td className="px-4 py-2">{l.template}</td>
                  <td className={`px-4 py-2 font-medium ${l.status==='Delivered'?'text-emerald-600':'text-rose-600'}`}>{l.status}</td>
                  <td className="px-4 py-2">{l.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* Save CTA pinned at bottom spacing */}
      <div className="flex items-center justify-end">
        <button className="btn btn-primary" onClick={saveAll}>Save Changes</button>
      </div>

      {/* Template Modal */}
      <Modal
        open={openTemplateModal}
        title={editingTemplate ? 'Edit Template' : 'Add New Template'}
        onClose={()=>setOpenTemplateModal(false)}
        onConfirm={saveTemplateModal}
        confirmText={editingTemplate ? 'Save Template' : 'Save Template'}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Template Name</label>
            <input className="input-soft w-full" value={tplName} onChange={e=>setTplName(e.target.value)} placeholder="e.g., Payment Confirmation" />
          </div>
          <div>
            <label className="block text-sm mb-1">Message Body</label>
            <textarea className="input-soft w-full h-32" value={tplBody} onChange={e=>setTplBody(e.target.value)} placeholder="Hi {{name}}, your order {{orderId}} is confirmed." />
            <div className="text-xs text-[var(--muted-text)] mt-1">Supports placeholders like {'{{variable}}'}</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}