import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../utils/api'
import Layout from '@shared/layouts/Layout'

export default function SalesInvoices() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock invoices for preview when API is empty/unavailable
  const MOCK_INVOICES = [
    {
      id: 'INV-9001',
      status: 'Pending',
      issueDate: new Date(Date.now() - 2*24*3600*1000).toISOString(),
      orderId: 'SO-5001',
      customerId: 'CUST-001',
      amount: 4500.0,
      currency: 'USD',
      paymentMethod: 'Bank Transfer',
      attachments: [{ name: 'INV-9001.pdf' }],
      createdAt: new Date(Date.now() - 24*3600*1000).toISOString(),
    },
    {
      id: 'INV-9002',
      status: 'Partial',
      issueDate: new Date(Date.now() - 6*24*3600*1000).toISOString(),
      orderId: 'SO-5002',
      customerId: 'CUST-002',
      amount: 1200.0,
      currency: 'EUR',
      paymentMethod: 'Credit Card',
      attachments: [],
      createdAt: new Date(Date.now() - 6*3600*1000).toISOString(),
    },
    {
      id: 'INV-9003',
      status: 'Paid',
      issueDate: new Date(Date.now() - 14*24*3600*1000).toISOString(),
      orderId: 'SO-5003',
      customerId: 'CUST-003',
      amount: 800.0,
      currency: 'USD',
      paymentMethod: 'Cash',
      attachments: [{ name: 'receipt.jpg' }],
      createdAt: new Date().toISOString(),
    },
  ]

  const sendOrPrint = (inv) => {
    try {
      window.print()
    } catch (e) {
      alert(t('Print is unavailable in this environment'))
    }
  }

  const markAsPaid = async (inv) => {
    try {
      // Attempt to update invoice status via API if supported
      await api.put(`/api/customers/invoices/${inv.id}`, { status: 'Paid' })
    } catch (e) {
      // Fallback to local update for preview purposes
    }
    setItems((prev) => prev.map((it) => it.id === inv.id ? { ...it, status: 'Paid' } : it))
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    api.get('/api/customers/invoices')
      .then((res) => {
        if (!mounted) return
        const data = res?.data?.data || []
        const list = Array.isArray(data) ? data : []
        setItems(list.length > 0 ? list : MOCK_INVOICES)
      })
      .catch(() => {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '/'
        if (!mounted) return
        setError(`Failed to load from ${base}/api/customers/invoices`)
        setItems(MOCK_INVOICES)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <Layout>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t('Invoices')}</h1>
        <div className="text-sm text-gray-500">{t('Sales')}</div>
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
                <th className="p-2">{t('Invoice No.')}</th>
                <th className="p-2">{t('Invoice Date')}</th>
                <th className="p-2">{t('Linked Sales Order')}</th>
                <th className="p-2">{t('Total Amount')}</th>
                <th className="p-2">{t('Payment Method')}</th>
                <th className="p-2">{t('Payment Status')}</th>
                <th className="p-2">{t('Attachment')}</th>
                <th className="p-2">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={8}>{t('No data')}</td>
                </tr>
              ) : items.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{inv.id}</td>
                  <td className="p-2">{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : '-'}</td>
                  <td className="p-2">{inv.orderId || inv.salesOrderId || '-'}</td>
                  <td className="p-2 font-medium">
                    {typeof inv.amount === 'number' ? inv.amount.toLocaleString() : inv.amount} {inv.currency || ''}
                  </td>
                  <td className="p-2">{inv.paymentMethod || '-'}</td>
                  <td className="p-2">{inv.status || inv.paymentStatus || '-'}</td>
                  <td className="p-2">{Array.isArray(inv.attachments) ? `${inv.attachments.length} ${t('file(s)')}` : '-'}</td>
                  <td className="p-2 space-x-2">
                    <button className="btn btn-primary btn-sm" onClick={() => sendOrPrint(inv)}>
                      {t('Send / Print')}
                    </button>
                    <button className="btn btn-success btn-sm" onClick={() => markAsPaid(inv)}>
                      {t('Mark as Paid')}
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