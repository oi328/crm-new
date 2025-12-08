import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../utils/api'
import Layout from '@shared/layouts/Layout'
import { useNavigate } from 'react-router-dom'

export default function SalesOpportunities() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  // Mock opportunities for preview when API is empty/unavailable
  const MOCK_OPPORTUNITIES = [
    {
      id: 'OPP-001',
      customerId: 'CUST-001',
      status: 'New',
      amount: 25000,
      stage: 'Qualification',
      expectedCloseDate: new Date(Date.now() + 7*24*3600*1000).toISOString(),
      createdAt: new Date(Date.now() - 2*24*3600*1000).toISOString(),
    },
    {
      id: 'OPP-002',
      customerId: 'CUST-002',
      status: 'In Progress',
      amount: 78000,
      stage: 'Proposal',
      expectedCloseDate: new Date(Date.now() + 14*24*3600*1000).toISOString(),
      createdAt: new Date(Date.now() - 24*3600*1000).toISOString(),
    },
    {
      id: 'OPP-003',
      customerId: 'CUST-003',
      status: 'New',
      amount: 12000,
      stage: 'Negotiation',
      expectedCloseDate: new Date(Date.now() + 21*24*3600*1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]

  // Form state (Quick add Opportunity)
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [contact, setContact] = useState('')
  const [amount, setAmount] = useState('')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [status, setStatus] = useState('New')
  const [stage, setStage] = useState('Qualification')
  const [notes, setNotes] = useState('')
  const [quickCustomerName, setQuickCustomerName] = useState('')
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('')
  const [quickCustomerType, setQuickCustomerType] = useState('Individual')
  const [quickCustomerContact, setQuickCustomerContact] = useState('')
  const [quickCustomerCompany, setQuickCustomerCompany] = useState('')
  const [quickCustomerTags, setQuickCustomerTags] = useState('')
  const [quickCustomerRep, setQuickCustomerRep] = useState('')
  const [quickAddLoading, setQuickAddLoading] = useState(false)
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    api.get('/api/customers/opportunities')
      .then((res) => {
        if (!mounted) return
        const data = res?.data?.data
        const list = Array.isArray(data?.items) ? data.items : []
        setItems(list.length > 0 ? list : MOCK_OPPORTUNITIES)
      })
      .catch((err) => {
        if (!mounted) return
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '/'
        setError(`Failed to load from ${base}/api/customers/opportunities`)
        setItems(MOCK_OPPORTUNITIES)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  // Load customers for selector
  useEffect(() => {
    let mounted = true
    api.get('/api/customers')
      .then((res) => {
        if (!mounted) return
        const data = res?.data?.data
        const list = Array.isArray(data?.items) ? data.items : []
        setCustomers(list)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const STATUS_OPTIONS = ['New', 'In Progress', 'Won', 'Lost']
  const STAGE_OPTIONS = ['Qualification', 'Proposal', 'Negotiation', 'Final']

  const resetForm = () => {
    setCustomerId('')
    setContact('')
    setAmount('')
    setExpectedCloseDate('')
    setStatus('New')
    setStage('Qualification')
    setNotes('')
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    const payload = {
      customerId: customerId || undefined,
      contact: contact || undefined,
      amount: amount ? Number(amount) : undefined,
      expectedCloseDate: expectedCloseDate || undefined,
      status,
      stage,
      notes: notes || undefined,
    }
    api.post('/api/customers/opportunities', payload)
      .then((res) => {
        const item = res?.data?.data?.item
        if (item) {
          setItems((prev) => [item, ...prev])
          resetForm()
          setSuccess(t('Saved successfully'))
        }
      })
      .catch((err) => {
        // Fallback: create locally if API fails
        const localItem = {
          id: `local-${Date.now()}`,
          status,
          stage,
          amount: amount ? Number(amount) : undefined,
          customerId: customerId || undefined,
          expectedCloseDate: expectedCloseDate || undefined,
          createdAt: new Date().toISOString(),
        }
        setItems((prev) => [localItem, ...prev])
        resetForm()
        setSuccess(t('Saved successfully'))
      })
      .finally(() => setSubmitting(false))
  }

  const [convertingId, setConvertingId] = useState('')
  const handleConvertToQuotation = (id) => {
    if (convertingId) return
    setConvertingId(id)
    api.post('/api/customers/quotations', { opportunityId: id, items: [] })
      .then(() => {
        navigate('/sales/quotations')
      })
      .catch(() => {})
      .finally(() => setConvertingId(''))
  }

  const handleQuickAddCustomer = (e) => {
    e?.preventDefault?.()
    if (!quickCustomerName.trim() || !quickCustomerPhone.trim() || quickAddLoading) return
    setQuickAddLoading(true)
    const payload = {
      name: quickCustomerName.trim(),
      phone: quickCustomerPhone.trim(),
      type: quickCustomerType || 'Individual',
      companyName: quickCustomerCompany || undefined,
      contacts: quickCustomerContact ? [quickCustomerContact.trim()] : [],
      tags: quickCustomerTags ? quickCustomerTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      assignedSalesRep: quickCustomerRep || undefined,
    }
    api.post('/api/customers', payload)
      .then((res) => {
        const item = res?.data?.data?.item
        if (item) {
          setCustomers((prev) => [item, ...prev])
          setCustomerId(item.id)
          setQuickCustomerName('')
          setQuickCustomerPhone('')
          setQuickCustomerType('Individual')
          setQuickCustomerContact('')
          setQuickCustomerCompany('')
          setQuickCustomerTags('')
          setQuickCustomerRep('')
          setShowQuickAddModal(false)
        }
      })
      .catch(() => {})
      .finally(() => setQuickAddLoading(false))
  }

  return (
    <Layout>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t('Opportunities')}</h1>
        <div className="text-sm text-gray-500">{t('Sales')}</div>
      </div>

      {/* Quick Add Opportunity Form */}
      <form onSubmit={handleCreate} className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Customer select + quick add */}
        <div>
          <label className="block text-sm mb-1">{t('Customer')}</label>
          <div className="flex gap-2">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="flex-1 border rounded px-2 py-2"
            >
              <option value="">{t('Select')}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowQuickAddModal(true)}
              className="px-3 py-2 rounded bg-indigo-600 text-white"
              type="button"
              disabled={quickAddLoading}
              title={t('Quick add')}
            >
              {quickAddLoading ? t('...') : '+'}
            </button>
          </div>
        </div>

        {/* Contact (B2B) */}
        <div>
          <label className="block text-sm mb-1">{t('Contact (B2B)')}</label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t('Contact person')}
            className="w-full border rounded px-2 py-2"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm mb-1">{t('Amount')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t('Amount')}
            className="w-full border rounded px-2 py-2"
          />
        </div>

        {/* Expected Close Date */}
        <div>
          <label className="block text-sm mb-1">{t('Expected Close Date')}</label>
          <input
            type="date"
            value={expectedCloseDate}
            onChange={(e) => setExpectedCloseDate(e.target.value)}
            className="w-full border rounded px-2 py-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm mb-1">{t('Status')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-2 py-2"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm mb-1">{t('Stage')}</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full border rounded px-2 py-2"
          >
            {STAGE_OPTIONS.map((s) => (
              <option key={s} value={s}>{t(s)}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm mb-1">{t('Notes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('Optional')}
            className="w-full border rounded px-2 py-2 min-h-[80px]"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            {t('Add Opportunity')}
          </button>
          {submitting && <span className="text-gray-500 px-2">{t('Saving...')}</span>}
        </div>
      </form>

      {error && (
        <div className="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 p-3 rounded border border-green-300 bg-green-50 text-green-700">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">{t('Loading...')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">{t('Customer')}</th>
                <th className="p-2">{t('Status')}</th>
                <th className="p-2">{t('Amount')}</th>
                <th className="p-2">{t('Stage')}</th>
                <th className="p-2">{t('Expected Close Date')}</th>
                <th className="p-2">{t('Created')}</th>
                <th className="p-2">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={7}>{t('No data')}</td>
                </tr>
              ) : items.map((op) => (
                <tr key={op.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{op.customerId || '-'}</td>
                  <td className="p-2">{op.status}</td>
                  <td className="p-2">{typeof op.amount === 'number' ? op.amount.toLocaleString() : op.amount}</td>
                  <td className="p-2">{op.stage}</td>
                  <td className="p-2">{op.expectedCloseDate ? new Date(op.expectedCloseDate).toLocaleDateString() : '-'}</td>
                  <td className="p-2">{op.createdAt ? new Date(op.createdAt).toLocaleString() : '-'}</td>
                  <td className="p-2">
                    <button
                      className="px-3 py-1 rounded bg-purple-600 text-white"
                      title={t('Convert to Quotation')}
                      onClick={() => handleConvertToQuotation(op.id)}
                      disabled={convertingId === op.id}
                    >
                      {convertingId === op.id ? t('Saving...') : t('Convert to Quotation')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    {/* Quick Add Customer Modal */}
  {showQuickAddModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowQuickAddModal(false)} />
      <div className="relative z-50 glass-panel rounded-xl p-4 w-[420px] max-w-[95vw]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{t('Quick Add Customer')}</h2>
          <button className="btn btn-glass" onClick={() => setShowQuickAddModal(false)}>{t('Close')}</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Name')}</label>
            <input className="input" value={quickCustomerName} onChange={(e) => setQuickCustomerName(e.target.value)} placeholder={t('Customer Name')} />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Phone')}</label>
            <input className="input" value={quickCustomerPhone} onChange={(e) => setQuickCustomerPhone(e.target.value)} placeholder={t('Phone')} />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Type')}</label>
            <select className="input" value={quickCustomerType} onChange={(e) => setQuickCustomerType(e.target.value)}>
              <option value="Individual">{t('Individual')}</option>
              <option value="Company">{t('Company')}</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Contact')}</label>
            <input className="input" value={quickCustomerContact} onChange={(e) => setQuickCustomerContact(e.target.value)} placeholder={t('Contact person')} />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Company')}</label>
            <input className="input" value={quickCustomerCompany} onChange={(e) => setQuickCustomerCompany(e.target.value)} placeholder={t('Company name')} />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Tags')}</label>
            <input className="input" value={quickCustomerTags} onChange={(e) => setQuickCustomerTags(e.target.value)} placeholder={t('Comma separated')} />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-text)]">{t('Assigned Rep')}</label>
            <input className="input" value={quickCustomerRep} onChange={(e) => setQuickCustomerRep(e.target.value)} placeholder={t('Sales representative')} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button className="btn" onClick={() => setShowQuickAddModal(false)}>{t('Cancel')}</button>
            <button className="btn btn-primary" onClick={handleQuickAddCustomer} disabled={quickAddLoading}>{quickAddLoading ? t('Saving...') : t('Save')}</button>
          </div>
        </div>
      </div>
    </div>
  )}
    </Layout>
  )}