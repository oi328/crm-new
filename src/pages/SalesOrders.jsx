import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../utils/api'
import Layout from '@shared/layouts/Layout'

export default function SalesOrders() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock sales orders for preview when API is empty/unavailable
  const MOCK_ORDERS = [
    {
      id: 'SO-5001',
      status: 'Draft',
      deliveryDate: new Date(Date.now() + 10*24*3600*1000).toISOString(),
      paymentTerms: 'Net 30',
      shippingMethod: 'Courier',
      attachments: [{ name: 'PO-5001.pdf' }],
      quotationId: 'QUO-1001',
      customerId: 'CUST-001',
      createdAt: new Date(Date.now() - 24*3600*1000).toISOString(),
    },
    {
      id: 'SO-5002',
      status: 'Confirmed',
      deliveryDate: new Date(Date.now() + 5*24*3600*1000).toISOString(),
      paymentTerms: 'Advance 50%',
      shippingMethod: 'Pickup',
      attachments: [],
      quotationId: 'QUO-1002',
      customerId: 'CUST-002',
      createdAt: new Date(Date.now() - 6*3600*1000).toISOString(),
    },
    {
      id: 'SO-5003',
      status: 'Delivered',
      deliveryDate: new Date(Date.now() + 18*24*3600*1000).toISOString(),
      paymentTerms: 'Net 15',
      shippingMethod: 'Freight',
      attachments: [{ name: 'DEL-5003.jpg' }],
      quotationId: 'QUO-1003',
      customerId: 'CUST-003',
      createdAt: new Date().toISOString(),
    },
  ]

  const computeDueDate = (paymentTerms) => {
    const now = Date.now()
    const days = paymentTerms?.toLowerCase().includes('net 30')
      ? 30
      : paymentTerms?.toLowerCase().includes('net 15')
      ? 15
      : paymentTerms?.toLowerCase().includes('advance')
      ? 0
      : 7
    return new Date(now + days*24*3600*1000).toISOString()
  }

  const generateInvoice = async (order) => {
    try {
      const payload = {
        orderId: order.id,
        customerId: order.customerId,
        status: 'Unpaid',
        issueDate: new Date().toISOString(),
        dueDate: computeDueDate(order.paymentTerms),
        paymentTerms: order.paymentTerms,
        currency: 'USD',
        amount: 0,
      }
      await api.post('/api/customers/invoices', payload)
      alert(`${t('Invoice generated for order')} ${order.id}`)
    } catch (e) {
      alert(`${t('Failed to generate invoice. Showing preview only.')}`)
    }
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    api.get('/api/customers/sales-orders')
      .then((res) => {
        if (!mounted) return
        const data = res?.data?.data || []
        const list = Array.isArray(data) ? data : []
        setItems(list.length > 0 ? list : MOCK_ORDERS)
      })
      .catch(() => {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '/'
        if (!mounted) return
        setError(`Failed to load from ${base}/api/customers/sales-orders`)
        setItems(MOCK_ORDERS)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <Layout>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t('Sales Orders')}</h1>
        <div className="flex items-center gap-2">
          <Link to="/sales/orders/new" className="px-3 py-2 rounded-md border bg-[var(--dropdown-bg)] hover:bg-[var(--table-row-hover)]">
            {t('Add Sales Order')}
          </Link>
          <div className="text-sm text-gray-500">{t('Sales')}</div>
        </div>
      </div>

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
                <th className="p-2">{t('Delivery Date')}</th>
                <th className="p-2">{t('Payment Terms')}</th>
                <th className="p-2">{t('Shipping Method')}</th>
                <th className="p-2">{t('Attachments')}</th>
                <th className="p-2">{t('Quotation')}</th>
                <th className="p-2">{t('Customer')}</th>
                <th className="p-2">{t('Created')}</th>
                <th className="p-2">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={10}>{t('No data')}</td>
                </tr>
              ) : items.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{o.id}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : '-'}</td>
                  <td className="p-2">{o.paymentTerms || '-'}</td>
                  <td className="p-2">{o.shippingMethod || '-'}</td>
                  <td className="p-2">{Array.isArray(o.attachments) ? `${o.attachments.length} ${t('file(s)')}` : '-'}</td>
                  <td className="p-2">{o.quotationId || '-'}</td>
                  <td className="p-2">{o.customerId || '-'}</td>
                  <td className="p-2">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                  <td className="p-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => generateInvoice(o)}
                    >
                      {t('Generate Invoice')}
                    </button>
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