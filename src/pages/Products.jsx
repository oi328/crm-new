import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'

export default function Products() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // UI labels with bilingual fallback
  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > المنتجات' : 'Inventory > Products',
    formTitle: isArabic ? 'بيانات المنتج' : 'Product Details',
    name: isArabic ? 'اسم المنتج' : 'Product Name',
    category: isArabic ? 'التصنيف' : 'Category',
    description: isArabic ? 'الوصف' : 'Description',
    uom: isArabic ? 'وحدة القياس' : 'Unit of Measure',
    supplier: isArabic ? 'المورد الافتراضي' : 'Default Supplier',
    price: isArabic ? 'السعر الافتراضي' : 'Default Price',
    save: isArabic ? 'حفظ المنتج' : 'Save Product',
    listTitle: isArabic ? 'قائمة كل المنتجات الرئيسية' : 'All Products',
    empty: isArabic ? 'لا توجد منتجات بعد' : 'No products yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  // Static options (can be replaced later by API data)
  const categoryOptions = useMemo(() => (
    isArabic ? ['إلكترونيات', 'أثاث', 'ملابس'] : ['Electronics', 'Furniture', 'Clothing']
  ), [isArabic])
  const uomOptions = useMemo(() => (
    isArabic ? ['قطعة', 'علبة', 'كيلوغرام'] : ['Piece', 'Box', 'Kg']
  ), [isArabic])
  const supplierOptions = useMemo(() => (
    isArabic ? ['المورد أ', 'المورد ب', 'المورد ج'] : ['Supplier A', 'Supplier B', 'Supplier C']
  ), [isArabic])

  // Local storage key
  const STORAGE_KEY = 'inventoryProducts'

  // Form state
  const [form, setForm] = useState({
    name: '',
    category: categoryOptions[0] || '',
    description: '',
    uom: uomOptions[0] || '',
    supplier: supplierOptions[0] || '',
    price: ''
  })

  // Products list
  const [products, setProducts] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setProducts(parsed)
      }
    } catch (e) {
      console.warn('Failed to load products from localStorage', e)
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch (e) {
      console.warn('Failed to save products to localStorage', e)
    }
  }, [products])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const trimmedName = form.name.trim()
    if (!trimmedName) return

    const newProduct = {
      id: Date.now(),
      name: trimmedName,
      category: form.category,
      description: form.description.trim(),
      uom: form.uom,
      supplier: form.supplier,
      price: form.price ? Number(form.price) : 0,
    }

    setProducts(prev => [newProduct, ...prev])
    setForm({
      name: '',
      category: categoryOptions[0] || '',
      description: '',
      uom: uomOptions[0] || '',
      supplier: supplierOptions[0] || '',
      price: ''
    })
  }

  function onDelete(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function onEdit(product) {
    setForm({
      name: product.name || '',
      category: product.category || (categoryOptions[0] || ''),
      description: product.description || '',
      uom: product.uom || (uomOptions[0] || ''),
      supplier: product.supplier || (supplierOptions[0] || ''),
      price: product.price != null ? String(product.price) : ''
    })
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold">{labels.title}</h1>

        {/* Product Form Card */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.formTitle}</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm mb-1">{labels.name}</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder={labels.name}
                className="input"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm mb-1">{labels.category}</label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="input"
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">{labels.description}</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder={labels.description}
                className="input h-24"
              />
            </div>

            {/* Unit of Measure */}
            <div>
              <label className="block text-sm mb-1">{labels.uom}</label>
              <select
                name="uom"
                value={form.uom}
                onChange={onChange}
                className="input"
              >
                {uomOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Default Supplier */}
            <div>
              <label className="block text-sm mb-1">{labels.supplier}</label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={onChange}
                className="input"
              >
                {supplierOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Default Price */}
            <div>
              <label className="block text-sm mb-1">{labels.price}</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder={labels.price}
                className="input"
                min="0"
                step="0.01"
              />
            </div>

            {/* Save */}
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">
                {labels.save}
              </button>
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {products.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[180px]">{labels.name}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.category}</th>
                    <th className="text-start px-3 min-w-[120px]">{labels.uom}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.supplier}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.price}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="px-3"><span className="font-medium">{p.name}</span></td>
                      <td className="px-3">{p.category}</td>
                      <td className="px-3">{p.uom}</td>
                      <td className="px-3">{p.supplier}</td>
                      <td className="px-3 text-center">{(p.price ?? 0).toFixed(2)}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm px-2 py-1"
                            title={labels.edit}
                            aria-label={labels.edit}
                            onClick={() => onEdit(p)}
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
                            onClick={() => onDelete(p.id)}
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