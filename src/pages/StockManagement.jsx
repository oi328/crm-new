import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'

export default function StockManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // UI labels
  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > إدارة المخزون' : 'Inventory > Stock Management',
    formTitle: isArabic ? 'بيانات إدارة المخزون' : 'Stock Entry',
    itemOrSku: isArabic ? 'العنصر / SKU' : 'Item / SKU',
    selectItem: isArabic ? 'اختر عنصرًا' : 'Select Item',
    manualSku: isArabic ? 'أدخل SKU يدويًا' : 'Enter SKU manually',
    qtyAvailable: isArabic ? 'الكمية المتاحة' : 'Quantity Available',
    qtyReserved: isArabic ? 'الكمية المحجوزة' : 'Reserved Quantity',
    minAlert: isArabic ? 'حدّ التنبيه الأدنى' : 'Minimum Quantity Alert',
    warehouse: isArabic ? 'المستودع' : 'Warehouse location',
    save: isArabic ? 'حفظ السجل' : 'Save Entry',
    listTitle: isArabic ? 'سجلات إدارة المخزون' : 'Stock Records',
    empty: isArabic ? 'لا توجد سجلات بعد' : 'No records yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    effective: isArabic ? 'الصافي المتاح' : 'Effective Available',
    status: isArabic ? 'الحالة' : 'Status',
    lowStock: isArabic ? 'منخفض' : 'Low',
    okStock: isArabic ? 'جيد' : 'OK',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryStock'
  const ITEMS_KEY = 'inventoryItems'

  const [items, setItems] = useState([])
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({
    itemId: '',
    manualSku: '',
    qtyAvailable: '',
    qtyReserved: '',
    minAlert: '',
    warehouse: ''
  })

  // Load
  useEffect(() => {
    try {
      const rawItems = localStorage.getItem(ITEMS_KEY)
      if (rawItems) {
        const parsedItems = JSON.parse(rawItems)
        if (Array.isArray(parsedItems)) setItems(parsedItems)
      }
    } catch (e) { console.warn('Failed to load items', e) }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setRecords(parsed)
      }
    } catch (e) { console.warn('Failed to load stock records', e) }
  }, [])

  // Persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)) } catch (e) {}
  }, [records])

  const warehouseOptions = useMemo(() => (
    isArabic ? ['المستودع الرئيسي', 'المستودع الفرعي', 'المخزن الخارجي'] : ['Main Warehouse', 'Secondary Warehouse', 'Outdoor Storage']
  ), [isArabic])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const selectedItem = items.find((it) => String(it.id) === String(form.itemId))
    const qtyAvailable = Number(form.qtyAvailable || 0)
    const qtyReserved = Number(form.qtyReserved || 0)
    const minAlert = Number(form.minAlert || 0)

    const newRecord = {
      id: Date.now(),
      itemId: form.itemId || null,
      itemName: selectedItem?.name || '',
      sku: form.manualSku || selectedItem?.sku || '',
      qtyAvailable,
      qtyReserved,
      minAlert,
      warehouse: form.warehouse || '',
    }
    setRecords((r) => [newRecord, ...r])
    setForm({ itemId: '', manualSku: '', qtyAvailable: '', qtyReserved: '', minAlert: '', warehouse: '' })
  }

  const removeRecord = (id) => {
    setRecords((r) => r.filter((rec) => rec.id !== id))
  }

  const renderStatus = (rec) => {
    const effective = (rec.qtyAvailable || 0) - (rec.qtyReserved || 0)
    const low = effective <= (rec.minAlert || 0)
    const tone = low ? 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/40' : 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/40'
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${tone}`}>{low ? labels.lowStock : labels.okStock}</span>
    )
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
            {/* Item selection */}
            <div>
              <label className="block text-sm mb-1">{labels.itemOrSku}</label>
              <select name="itemId" value={form.itemId} onChange={onChange} className="input">
                <option value="">{labels.selectItem}</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>{it.name} {it.sku ? `(${it.sku})` : ''}</option>
                ))}
              </select>
            </div>

            {/* Manual SKU */}
            <div>
              <label className="block text-sm mb-1">{labels.manualSku}</label>
              <input name="manualSku" value={form.manualSku} onChange={onChange} placeholder={labels.manualSku} className="input" />
            </div>

            {/* Qty Available */}
            <div>
              <label className="block text-sm mb-1">{labels.qtyAvailable}</label>
              <input type="number" name="qtyAvailable" value={form.qtyAvailable} onChange={onChange} min="0" step="1" placeholder={labels.qtyAvailable} className="input" />
            </div>

            {/* Reserved Qty */}
            <div>
              <label className="block text-sm mb-1">{labels.qtyReserved}</label>
              <input type="number" name="qtyReserved" value={form.qtyReserved} onChange={onChange} min="0" step="1" placeholder={labels.qtyReserved} className="input" />
            </div>

            {/* Min Alert */}
            <div>
              <label className="block text-sm mb-1">{labels.minAlert}</label>
              <input type="number" name="minAlert" value={form.minAlert} onChange={onChange} min="0" step="1" placeholder={labels.minAlert} className="input" />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm mb-1">{labels.warehouse}</label>
              <select name="warehouse" value={form.warehouse} onChange={onChange} className="input">
                <option value="">{labels.warehouse}</option>
                {warehouseOptions.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Save */}
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{labels.save}</button>
            </div>
          </form>
        </div>

        {/* Records List */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {records.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[180px]">{labels.itemOrSku}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.qtyAvailable}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.qtyReserved}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.effective}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.minAlert}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.warehouse}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.status}</th>
                    <th className="text-center px-3 min-w-[100px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const effective = (rec.qtyAvailable || 0) - (rec.qtyReserved || 0)
                    const low = effective <= (rec.minAlert || 0)
                    return (
                      <tr key={rec.id} className={low ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <td className="px-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{rec.itemName || '-'}</span>
                            <span className="text-xs text-[var(--muted-text)]">{rec.sku || '-'}</span>
                          </div>
                        </td>
                        <td className="px-3 text-center">{rec.qtyAvailable ?? 0}</td>
                        <td className="px-3 text-center">{rec.qtyReserved ?? 0}</td>
                        <td className="px-3 text-center">{effective}</td>
                        <td className="px-3 text-center">{rec.minAlert ?? 0}</td>
                        <td className="px-3">{rec.warehouse || '-'}</td>
                        <td className="px-3 text-center">{renderStatus(rec)}</td>
                        <td className="px-3 text-center">
                          <button className="btn btn-danger btn-xs" onClick={() => removeRecord(rec.id)}>{labels.delete}</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}