import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'

export default function Items() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // UI labels with bilingual fallback
  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > العناصر' : 'Inventory > Items',
    formTitle: isArabic ? 'بيانات العنصر' : 'Item Details',
    itemName: isArabic ? 'اسم العنصر' : 'Item Name',
    linkedProduct: isArabic ? 'المنتج المرتبط' : 'Linked Product',
    sku: isArabic ? 'رمز التخزين (SKU)' : 'SKU',
    barcode: isArabic ? 'الباركود' : 'Barcode',
    costPrice: isArabic ? 'سعر التكلفة' : 'Cost Price',
    sellingPrice: isArabic ? 'سعر البيع' : 'Selling Price',
    stockCount: isArabic ? 'المخزون (الكمية)' : 'Stock Count',
    warehouse: isArabic ? 'المستودع' : 'Warehouse',
    save: isArabic ? 'حفظ العنصر' : 'Save Item',
    listTitle: isArabic ? 'قائمة العناصر' : 'Items List',
    empty: isArabic ? 'لا توجد عناصر بعد' : 'No items yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
    noProducts: isArabic ? 'لا توجد منتجات لاختيارها' : 'No products available',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryItems'
  const PRODUCTS_KEY = 'inventoryProducts'

  // Products options (from localStorage)
  const [products, setProducts] = useState([])

  // Form state
  const [form, setForm] = useState({
    name: '',
    productId: '',
    sku: '',
    barcode: '',
    costPrice: '',
    sellingPrice: '',
    stockCount: '',
    warehouse: ''
  })

  // Items list
  const [items, setItems] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const rawItems = localStorage.getItem(STORAGE_KEY)
      if (rawItems) {
        const parsedItems = JSON.parse(rawItems)
        if (Array.isArray(parsedItems)) setItems(parsedItems)
      }
    } catch (e) {
      console.warn('Failed to load items from localStorage', e)
    }
    try {
      const rawProducts = localStorage.getItem(PRODUCTS_KEY)
      if (rawProducts) {
        const parsedProducts = JSON.parse(rawProducts)
        if (Array.isArray(parsedProducts)) setProducts(parsedProducts)
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage', e)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to save items to localStorage', e)
    }
  }, [items])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return

    const linkedProduct = products.find(p => String(p.id) === String(form.productId))
    const newItem = {
      id: Date.now(),
      name,
      productId: form.productId || '',
      productName: linkedProduct ? linkedProduct.name : '',
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      costPrice: form.costPrice ? Number(form.costPrice) : 0,
      sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : 0,
      stockCount: form.stockCount ? Number(form.stockCount) : 0,
      warehouse: form.warehouse.trim()
    }

    setItems(prev => [newItem, ...prev])
    setForm({
      name: '',
      productId: '',
      sku: '',
      barcode: '',
      costPrice: '',
      sellingPrice: '',
      stockCount: '',
      warehouse: ''
    })
  }

  function onDelete(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function onEdit(item) {
    setForm({
      name: item.name || '',
      productId: item.productId || '',
      sku: item.sku || '',
      barcode: item.barcode || '',
      costPrice: item.costPrice != null ? String(item.costPrice) : '',
      sellingPrice: item.sellingPrice != null ? String(item.sellingPrice) : '',
      stockCount: item.stockCount != null ? String(item.stockCount) : '',
      warehouse: item.warehouse || ''
    })
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  const warehouseOptions = useMemo(() => (
    isArabic ? ['المستودع الرئيسي', 'المستودع الفرعي', 'المخزن الخارجي'] : ['Main Warehouse', 'Secondary Warehouse', 'Outdoor Storage']
  ), [isArabic])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold">{labels.title}</h1>

        {/* Item Form Card */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.formTitle}</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm mb-1">{labels.itemName}</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder={labels.itemName}
                className="input"
                required
              />
            </div>

            {/* Linked Product */}
            <div>
              <label className="block text-sm mb-1">{labels.linkedProduct}</label>
              <select
                name="productId"
                value={form.productId}
                onChange={onChange}
                className="input"
              >
                <option value="">{labels.noProducts}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm mb-1">{labels.sku}</label>
              <input
                name="sku"
                value={form.sku}
                onChange={onChange}
                placeholder={labels.sku}
                className="input"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-sm mb-1">{labels.barcode}</label>
              <input
                name="barcode"
                value={form.barcode}
                onChange={onChange}
                placeholder={labels.barcode}
                className="input"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm mb-1">{labels.costPrice}</label>
              <input
                type="number"
                name="costPrice"
                value={form.costPrice}
                onChange={onChange}
                placeholder={labels.costPrice}
                className="input"
                min="0"
                step="0.01"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm mb-1">{labels.sellingPrice}</label>
              <input
                type="number"
                name="sellingPrice"
                value={form.sellingPrice}
                onChange={onChange}
                placeholder={labels.sellingPrice}
                className="input"
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock Count */}
            <div>
              <label className="block text-sm mb-1">{labels.stockCount}</label>
              <input
                type="number"
                name="stockCount"
                value={form.stockCount}
                onChange={onChange}
                placeholder={labels.stockCount}
                className="input"
                min="0"
                step="1"
              />
            </div>

            {/* Warehouse */}
            <div>
              <label className="block text-sm mb-1">{labels.warehouse}</label>
              <select
                name="warehouse"
                value={form.warehouse}
                onChange={onChange}
                className="input"
              >
                <option value="">{labels.warehouse}</option>
                {warehouseOptions.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Save */}
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">
                {labels.save}
              </button>
            </div>
          </form>
        </div>

        {/* Items List */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {items.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[180px]">{labels.itemName}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.linkedProduct}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.sku}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.barcode}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.costPrice}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.sellingPrice}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.stockCount}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.warehouse}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.id}>
                      <td className="px-3"><span className="font-medium">{it.name}</span></td>
                      <td className="px-3">{it.productName || '-'}</td>
                      <td className="px-3">{it.sku}</td>
                      <td className="px-3">{it.barcode}</td>
                      <td className="px-3 text-center">{(it.costPrice ?? 0).toFixed(2)}</td>
                      <td className="px-3 text-center">{(it.sellingPrice ?? 0).toFixed(2)}</td>
                      <td className="px-3 text-center">{it.stockCount ?? 0}</td>
                      <td className="px-3">{it.warehouse}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm px-2 py-1"
                            title={labels.edit}
                            aria-label={labels.edit}
                            onClick={() => onEdit(it)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="btn-icon-danger"
                            title={labels.delete}
                            aria-label={labels.delete}
                            onClick={() => onDelete(it.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <rect x="5" y="6" width="14" height="14" rx="2" />
                            </svg>
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