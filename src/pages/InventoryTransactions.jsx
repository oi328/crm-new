import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'

export default function InventoryTransactions() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > الحركات' : 'Inventory > Transactions',
    formTitle: isArabic ? 'تسجيل حركة مخزون' : 'Record Stock Transaction',
    date: isArabic ? 'التاريخ' : 'Date',
    type: isArabic ? 'النوع (ادخال/اخراج/نقل)' : 'Type (in/out/transfer)',
    quantity: isArabic ? 'الكمية' : 'Quantity',
    reference: isArabic ? 'المرجع (أمر بيع/شراء)' : 'Reference (Sales/Purchase Order)',
    username: isArabic ? 'اسم المستخدم' : 'User name',
    save: isArabic ? 'حفظ الحركة' : 'Save Transaction',
    listTitle: isArabic ? 'سجل الحركات' : 'Transaction Log',
    empty: isArabic ? 'لا توجد حركات بعد' : 'No transactions yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    type_in: isArabic ? 'ادخال' : 'In',
    type_out: isArabic ? 'اخراج' : 'Out',
    type_transfer: isArabic ? 'نقل' : 'Transfer',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryTransactions'

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: 'in',
    quantity: '',
    reference: '',
    username: ''
  })
  const [transactions, setTransactions] = useState([])

  // Load existing
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setTransactions(parsed)
      }
    } catch (e) { console.warn('Failed to load transactions', e) }
  }, [])

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)) } catch (e) {}
  }, [transactions])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const quantity = Number(form.quantity || 0)
    if (!form.date || !form.type || quantity <= 0) return

    const newTx = {
      id: Date.now(),
      date: form.date,
      type: form.type,
      quantity,
      reference: form.reference || '',
      username: form.username || ''
    }
    setTransactions((t) => [newTx, ...t])
    setForm({ date: new Date().toISOString().slice(0, 10), type: 'in', quantity: '', reference: '', username: '' })
  }

  const removeTx = (id) => setTransactions((t) => t.filter((x) => x.id !== id))

  const typeLabel = (t) => {
    switch (t) {
      case 'in': return labels.type_in
      case 'out': return labels.type_out
      case 'transfer': return labels.type_transfer
      default: return t
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold">{labels.title}</h1>

        {/* Form */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.formTitle}</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm mb-1">{labels.date}</label>
              <input type="date" name="date" value={form.date} onChange={onChange} className="input" />
            </div>
            {/* Type */}
            <div>
              <label className="block text-sm mb-1">{labels.type}</label>
              <select name="type" value={form.type} onChange={onChange} className="input">
                <option value="in">{labels.type_in}</option>
                <option value="out">{labels.type_out}</option>
                <option value="transfer">{labels.type_transfer}</option>
              </select>
            </div>
            {/* Quantity */}
            <div>
              <label className="block text-sm mb-1">{labels.quantity}</label>
              <input type="number" name="quantity" value={form.quantity} onChange={onChange} min="1" step="1" placeholder={labels.quantity} className="input" />
            </div>
            {/* Reference */}
            <div>
              <label className="block text-sm mb-1">{labels.reference}</label>
              <input name="reference" value={form.reference} onChange={onChange} placeholder={labels.reference} className="input" />
            </div>
            {/* Username */}
            <div>
              <label className="block text-sm mb-1">{labels.username}</label>
              <input name="username" value={form.username} onChange={onChange} placeholder={labels.username} className="input" />
            </div>
            {/* Save */}
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{labels.save}</button>
            </div>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[140px]">{labels.date}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.type}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.quantity}</th>
                    <th className="text-start px-3 min-w-[220px]">{labels.reference}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.username}</th>
                    <th className="text-center px-3 min-w-[100px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-3"><span className="font-medium">{tx.date}</span></td>
                      <td className="px-3">{typeLabel(tx.type)}</td>
                      <td className="px-3 text-center">{tx.quantity}</td>
                      <td className="px-3">{tx.reference}</td>
                      <td className="px-3">{tx.username}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTx(tx.id)}>
                            {labels.delete}
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
      </div>
    </Layout>
  )
}