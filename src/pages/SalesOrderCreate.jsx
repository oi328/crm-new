import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Layout from '@shared/layouts/Layout'
import { api } from '../utils/api'

export default function SalesOrderCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    salesOrderId: '',
    orderDate: '',
    status: 'Pending',
    salesperson: '',
    deliveryDate: '',
    customerName: '',
    customerId: '',
    companyName: '',
    contactPerson: '',
    contactInfo: '',
    paymentTerms: 'Net 30',
    quotationId: '',
    shippingAddress: '',
    billingAddress: '',
    shippingMethod: 'Courier',
    trackingNumber: '',
    notes: '',
  })

  const [items, setItems] = useState([
    { product: '', sku: '', quantity: 1, unitPrice: 0, discount: 0 },
  ])

  const addRow = () => setItems(prev => [...prev, { product: '', sku: '', quantity: 1, unitPrice: 0, discount: 0 }])
  const removeRow = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updateRow = (idx, key, value) => setItems(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r))

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const qty = Number(it.quantity) || 0
      const price = Number(it.unitPrice) || 0
      const disc = Number(it.discount) || 0
      return sum + qty * price - disc
    }, 0)
  }, [items])

  const TAX_RATE = 0.14
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100

  const onChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const onSubmit = async (e) => {
    e.preventDefault()
    // Build payload compatible with API schema
    const payload = {
      customerId: form.customerId || undefined,
      quotationId: form.quotationId || `QUO-${Math.floor(Math.random()*9000 + 1000)}`,
      items: items.map(it => ({
        product: it.product,
        sku: it.sku,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        discount: Number(it.discount) || 0,
      })),
      deliveryDate: form.deliveryDate || undefined,
      paymentTerms: form.paymentTerms || '',
      status: form.status,
      notes: form.notes || '',
    }
    try {
      const res = await api.post('/api/customers/sales-orders', payload)
      const newId = res?.data?.data?.item?.id
      alert(t('Sales Order created successfully'))
      navigate('/sales/orders')
    } catch (err) {
      alert(t('Failed to create order. Form will stay for review.'))
    }
  }

  return (
    <Layout>
      <form onSubmit={onSubmit} className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{t('Sales Order')}</h1>
          <div className="flex gap-2">
            <button type="button" className="px-3 py-2 rounded border btn-glass" onClick={() => navigate('/sales/orders')}>{t('Back')}</button>
            <button type="submit" className="px-3 py-2 rounded border bg-green-600 text-white">{t('Save')}</button>
          </div>
        </div>

        {/* General + Customer Details */}
        <div className="card glass-card p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-3">{t('General Information')}</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Sales Order ID')}</label>
                  <input value={form.salesOrderId} onChange={e=>onChange('salesOrderId', e.target.value)} className="input border" placeholder="SO-1001" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Order Date')}</label>
                  <input type="date" value={form.orderDate} onChange={e=>onChange('orderDate', e.target.value)} className="input border" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Status')}</label>
                  <select value={form.status} onChange={e=>onChange('status', e.target.value)} className="input border">
                    <option value="Pending">{t('Pending')}</option>
                    <option value="Processing">{t('Processing')}</option>
                    <option value="Delivered">{t('Delivered')}</option>
                    <option value="Completed">{t('Completed')}</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Salesperson')}</label>
                  <input value={form.salesperson} onChange={e=>onChange('salesperson', e.target.value)} className="input border" placeholder={t('Enter member name')} />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Delivery Date')}</label>
                  <input type="date" value={form.deliveryDate} onChange={e=>onChange('deliveryDate', e.target.value)} className="input border" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">{t('Customer Details')}</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Customer Name')}</label>
                  <input value={form.customerName} onChange={e=>onChange('customerName', e.target.value)} className="input border" placeholder={t('Enter customer name')} />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Customer ID')}</label>
                  <input value={form.customerId} onChange={e=>onChange('customerId', e.target.value)} className="input border" placeholder="Cust-4567" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Company Name')}</label>
                  <input value={form.companyName} onChange={e=>onChange('companyName', e.target.value)} className="input border" placeholder={t('Enter company name')} />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Contact Person')}</label>
                  <input value={form.contactPerson} onChange={e=>onChange('contactPerson', e.target.value)} className="input border" placeholder={t('Enter contact person')} />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-[var(--muted-text)]">{t('Contact Info')}</label>
                  <input value={form.contactInfo} onChange={e=>onChange('contactInfo', e.target.value)} className="input border" placeholder={t('Phone, email, address')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="card glass-card p-4 mb-4">
          <h2 className="text-lg font-medium mb-3">{t('Order Details')}</h2>
          <div className="overflow-x-auto">
            <table className="nova-table w-full text-sm min-w-[700px]">
              <thead>
                <tr>
                  <th>{t('Product / Service')}</th>
                  <th>{t('SKU')}</th>
                  <th>{t('Quantity')}</th>
                  <th>{t('Amount')}</th>
                  <th>{t('Discount')}</th>
                  <th>{t('Subtotal')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const rowSubtotal = (Number(row.quantity)||0) * (Number(row.unitPrice)||0) - (Number(row.discount)||0)
                  return (
                    <tr key={idx}>
                      <td><input className="input border" value={row.product} onChange={e=>updateRow(idx,'product',e.target.value)} placeholder={t('Enter product')} /></td>
                      <td><input className="input border" value={row.sku} onChange={e=>updateRow(idx,'sku',e.target.value)} placeholder="SKU" /></td>
                      <td><input type="number" className="input border" value={row.quantity} onChange={e=>updateRow(idx,'quantity',e.target.value)} /></td>
                      <td><input type="number" className="input border" value={row.unitPrice} onChange={e=>updateRow(idx,'unitPrice',e.target.value)} /></td>
                      <td><input type="number" className="input border" value={row.discount} onChange={e=>updateRow(idx,'discount',e.target.value)} /></td>
                      <td className="px-2">{rowSubtotal.toFixed(2)}</td>
                      <td>
                        <button type="button" className="px-2 py-1 rounded border btn-glass" onClick={() => removeRow(idx)}>{t('Remove')}</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <button type="button" className="px-3 py-2 rounded border btn-glass" onClick={addRow}>{t('Add Row')}</button>
          </div>
          <div className="mt-6 flex flex-col gap-2 items-end">
            <div className="flex gap-8 text-sm">
              <div><span className="text-[var(--muted-text)]">{t('Subtotal')}</span> <span className="ml-2">{subtotal.toFixed(2)}</span></div>
              <div><span className="text-[var(--muted-text)]">{t('Tax')}</span> <span className="ml-2">{tax.toFixed(2)}</span></div>
              <div><span className="text-[var(--muted-text)]">{t('Total')}</span> <span className="ml-2 font-medium">{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Removed Shipping & Billing section as requested */}

      </form>
    </Layout>
  )
}