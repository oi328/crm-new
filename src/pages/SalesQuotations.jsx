import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../utils/api'
import Layout from '@shared/layouts/Layout'

export default function SalesQuotations() {
  const { t } = useTranslation()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [actionInfo, setActionInfo] = useState('')
  const [convertingIds, setConvertingIds] = useState([])

  // Mock quotations for preview when API is empty/unavailable
  const MOCK_QUOTATIONS = [
    {
      id: 'QUO-1001',
      status: 'Draft',
      subtotal: 25000,
      tax: 3500,
      total: 28500,
      opportunityId: 'OPP-001',
      createdAt: new Date(Date.now() - 36*3600*1000).toISOString(),
    },
    {
      id: 'QUO-1002',
      status: 'Sent',
      subtotal: 78000,
      tax: 10920,
      total: 88920,
      opportunityId: 'OPP-002',
      createdAt: new Date(Date.now() - 12*3600*1000).toISOString(),
    },
    {
      id: 'QUO-1003',
      status: 'Approved',
      subtotal: 12000,
      tax: 1680,
      total: 13680,
      opportunityId: 'OPP-003',
      createdAt: new Date().toISOString(),
    },
  ]

  // Form State
  const [opportunities, setOpportunities] = useState([])
  const [opportunityId, setOpportunityId] = useState('')
  const [items, setItems] = useState([
    { name: '', quantity: 1, unitPrice: 0, discount: 0 },
  ])
  // Attachment (actual file upload -> stored as Data URL for now)
  const [attachmentFile, setAttachmentFile] = useState(null)
  const [attachmentName, setAttachmentName] = useState('')
  const [attachmentDataUrl, setAttachmentDataUrl] = useState('')

  // Settings-driven tax rate (fallback to 14%)
  const [taxRate, setTaxRate] = useState(0.14)
  const [savingTax, setSavingTax] = useState(false)

  const subtotal = useMemo(() => (
    items.reduce((sum, it) => sum + (Number(it.quantity)||0) * (Number(it.unitPrice)||0) - (Number(it.discount)||0), 0)
  ), [items])
  const tax = useMemo(() => (
    Math.round(subtotal * Number(taxRate || 0.14) * 100) / 100
  ), [subtotal, taxRate])
  const total = useMemo(() => (
    Math.round((subtotal + tax) * 100) / 100
  ), [subtotal, tax])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    api.get('/api/customers/quotations')
      .then((res) => {
        if (!mounted) return
        const data = res?.data?.data
        const list = Array.isArray(data?.items) ? data.items : []
        setRows(list.length > 0 ? list : MOCK_QUOTATIONS)
      })
      .catch(() => {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '/'
        if (!mounted) return
        setError(`Failed to load from ${base}/api/customers/quotations`)
        setRows(MOCK_QUOTATIONS)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    api.get('/api/customers/opportunities')
      .then((res) => {
        if (!mounted) return
        const data = res?.data?.data
        const list = Array.isArray(data?.items) ? data.items : []
        setOpportunities(list)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // Load tax rate from settings
  useEffect(() => {
    let mounted = true
    api.get('/api/settings')
      .then((res) => {
        if (!mounted) return
        const tr = res?.data?.data?.settings?.sales?.taxRate
        if (typeof tr === 'number') setTaxRate(tr)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const setItem = (idx, patch) => {
    setItems((prev) => prev.map((row, i) => i === idx ? { ...row, ...patch } : row))
  }
  const addItem = () => setItems((prev) => ([...prev, { name: '', quantity: 1, unitPrice: 0, discount: 0 }]))
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const handleCreate = (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const doCreate = async () => {
      try {
        let attachmentUrl
        if (attachmentDataUrl) {
          const up = await api.post('/api/uploads/base64', { fileName: attachmentName || 'attachment', dataUrl: attachmentDataUrl })
          attachmentUrl = up?.data?.data?.url || up?.data?.url || up?.data?.data?.data?.url
        }
        const payload = {
          opportunityId,
          items: items.map((it) => ({
            name: it.name,
            quantity: Number(it.quantity)||0,
            unitPrice: Number(it.unitPrice)||0,
            discount: Number(it.discount)||0,
          })),
          attachment: attachmentUrl || undefined,
        }
        const res = await api.post('/api/customers/quotations', payload)
        return res
      } catch (e) {
        throw e
      }
    }
    doCreate()
      .then((res) => {
        const item = res?.data?.data?.item
        if (item) {
          setRows((prev) => [item, ...prev])
          setOpportunityId('')
          setItems([{ name: '', quantity: 1, unitPrice: 0, discount: 0 }])
          setAttachmentFile(null)
          setAttachmentName('')
          setAttachmentDataUrl('')
          setSuccess(t('Saved successfully'))
          setTimeout(() => setSuccess(''), 3000)
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Failed to create'
        setError(typeof msg === 'string' ? msg : 'Failed to create')
      })
      .finally(() => setSubmitting(false))
  }

  const handleSendToCustomer = (id) => {
    api.post(`/api/customers/quotations/${id}/send`)
      .then((res) => {
        const item = res?.data?.data?.item
        if (item) {
          setRows((prev) => prev.map((r) => r.id === id ? item : r))
          setActionInfo(t('Sent successfully'))
          setTimeout(() => setActionInfo(''), 3000)
        }
      })
      .catch(() => {})
  }

  const handleConvertToOrder = (id) => {
    if (convertingIds.includes(id)) return
    setConvertingIds((prev) => [...prev, id])
    api.post(`/api/customers/quotations/${id}/convert-to-sales-order`)
      .then((res) => {
        const order = res?.data?.data?.salesOrder
        if (order) {
          setActionInfo(
            (
              <span>
                {t('Converted to Sales Order')}: <span className="font-medium">{order.id || t('New Order')}</span> — 
                <a href="/sales/orders" className="underline text-indigo-700 ml-1">{t('View Sales Orders')}</a>
              </span>
            )
          )
          setTimeout(() => setActionInfo(''), 4000)
        } else {
          setError(t('Conversion failed'))
          setTimeout(() => setError(''), 4000)
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || t('Conversion failed')
        setError(typeof msg === 'string' ? msg : t('Conversion failed'))
        setTimeout(() => setError(''), 4000)
      })
      .finally(() => {
        setConvertingIds((prev) => prev.filter((x) => x !== id))
      })
  }

  const handleAttachmentInput = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) {
      setAttachmentFile(null)
      setAttachmentName('')
      setAttachmentDataUrl('')
      return
    }
    setAttachmentFile(file)
    setAttachmentName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      setAttachmentDataUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const clearAttachment = () => {
    setAttachmentFile(null)
    setAttachmentName('')
    setAttachmentDataUrl('')
  }

  const saveTaxRate = async () => {
    try {
      setSavingTax(true)
      await api.put('/api/settings/sales', { taxRate })
      setActionInfo(t('Tax rate updated'))
      setTimeout(() => setActionInfo(''), 3000)
    } catch (e) {
      setError(t('Failed to update tax rate'))
      setTimeout(() => setError(''), 4000)
    } finally {
      setSavingTax(false)
    }
  }

  return (
    <Layout>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t('Quotations')}</h1>
        <div className="text-sm text-gray-500">{t('Sales')}</div>
      </div>

      {success && (
        <div className="mb-3 p-3 rounded border border-green-300 bg-green-50 text-green-700">{success}</div>
      )}
      {actionInfo && (
        <div className="mb-3 p-3 rounded border border-blue-300 bg-blue-50 text-blue-700">{actionInfo}</div>
      )}

      {/* Create Quotation Form */}
      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">{t('Opportunity')}</label>
            <select
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="w-full border rounded px-2 py-2"
            >
              <option value="">{t('Select')}</option>
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>{o.name || o.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">{t('Attachment')}</label>
            <div className="flex items-center gap-2">
              <input type="file" onChange={handleAttachmentInput} className="flex-1" />
              {attachmentName && (
                <button type="button" onClick={clearAttachment} className="px-3 py-2 rounded bg-gray-200">{t('Remove')}</button>
              )}
            </div>
            {attachmentName && (
              <div className="mt-1 text-xs text-gray-600">{t('Selected file')}: {attachmentName}</div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">{t('Items')}</div>
            <button type="button" onClick={addItem} className="px-3 py-2 rounded bg-indigo-600 text-white">{t('Add Item')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">{t('Product / Service')}</th>
                  <th className="p-2">{t('Quantity')}</th>
                  <th className="p-2">{t('Unit Price')}</th>
                  <th className="p-2">{t('Discount')}</th>
                  <th className="p-2">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2"><input className="w-full border rounded px-2 py-1" value={it.name} onChange={(e) => setItem(idx, { name: e.target.value })} /></td>
                    <td className="p-2"><input type="number" min="1" className="w-full border rounded px-2 py-1" value={it.quantity} onChange={(e) => setItem(idx, { quantity: e.target.value })} /></td>
                    <td className="p-2"><input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" value={it.unitPrice} onChange={(e) => setItem(idx, { unitPrice: e.target.value })} /></td>
                    <td className="p-2"><input type="number" min="0" step="0.01" className="w-full border rounded px-2 py-1" value={it.discount} onChange={(e) => setItem(idx, { discount: e.target.value })} /></td>
                    <td className="p-2">
                      <button type="button" onClick={() => removeItem(idx)} className="px-2 py-1 rounded bg-red-600 text-white">{t('Remove')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-sm text-gray-700">{t('Subtotal')}: <span className="font-medium">{subtotal.toLocaleString()}</span></div>
          <div className="text-sm text-gray-700">{t('Tax')}: <span className="font-medium">{tax.toLocaleString()}</span></div>
          <div className="text-sm text-gray-700">{t('Total')}: <span className="font-medium">{total.toLocaleString()}</span></div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">{t('Tax Rate (%)')}</label>
            <input type="number" min="0" max="100" step="0.01" className="w-24 border rounded px-2 py-1" value={Math.round(Number(taxRate||0)*10000)/100} onChange={(e) => setTaxRate(Number(e.target.value) > 1 ? Number(e.target.value)/100 : Number(e.target.value))} />
            <button type="button" disabled={savingTax} onClick={saveTaxRate} className="px-3 py-2 rounded bg-gray-800 text-white">{savingTax ? t('Saving...') : t('Save')}</button>
          </div>
          <button type="submit" disabled={submitting || !opportunityId || items.length === 0} className="px-4 py-2 rounded bg-green-600 text-white">{t('Create Quotation')}</button>
          {submitting && <span className="text-gray-500">{t('Saving...')}</span>}
        </div>
      </form>

      {error && (
        <div className="mb-3 p-3 rounded border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">{t('Loading...')}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">{t('ID')}</th>
                <th className="p-2">{t('Status')}</th>
                <th className="p-2">{t('Subtotal')}</th>
                <th className="p-2">{t('Tax')}</th>
                <th className="p-2">{t('Total')}</th>
                <th className="p-2">{t('Opportunity')}</th>
                <th className="p-2">{t('Created')}</th>
                <th className="p-2">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={8}>{t('No data')}</td>
                </tr>
              ) : rows.map((q) => (
                <tr key={q.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{q.id}</td>
                  <td className="p-2">{q.status}</td>
                  <td className="p-2">{typeof q.subtotal === 'number' ? q.subtotal.toLocaleString() : q.subtotal}</td>
                  <td className="p-2">{typeof q.tax === 'number' ? q.tax.toLocaleString() : q.tax}</td>
                  <td className="p-2 font-medium">{typeof q.total === 'number' ? q.total.toLocaleString() : q.total}</td>
                  <td className="p-2">{q.opportunityId || '-'}</td>
                  <td className="p-2">{q.createdAt ? new Date(q.createdAt).toLocaleString() : '-'}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={() => handleSendToCustomer(q.id)} className="px-3 py-1 rounded bg-blue-600 text-white" title={t('Send to Customer')}>{t('Send to Customer')}</button>
                      <button
                        onClick={() => handleConvertToOrder(q.id)}
                        disabled={convertingIds.includes(q.id)}
                        className={`px-3 py-1 rounded text-white ${convertingIds.includes(q.id) ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600'}`}
                        title={t('Convert to Sales Order')}
                      >
                        {convertingIds.includes(q.id) ? t('Converting...') : t('Convert to Sales Order')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </Layout>
  )
}