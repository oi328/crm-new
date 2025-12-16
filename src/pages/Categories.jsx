import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Categories() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > التصنيفات' : 'Inventory > Categories',
    formTitle: isArabic ? 'بيانات التصنيف' : 'Category Details',
    name: isArabic ? 'اسم التصنيف' : 'Category Name',
    parent: isArabic ? 'التصنيف الأب' : 'Parent Category',
    description: isArabic ? 'الوصف' : 'Description',
    save: isArabic ? 'حفظ التصنيف' : 'Save Category',
    listTitle: isArabic ? 'كل التصنيفات' : 'All Categories',
    empty: isArabic ? 'لا توجد تصنيفات بعد' : 'No categories yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryCategories'

  const [form, setForm] = useState({
    name: '',
    parent: '',
    description: ''
  })

  const [categories, setCategories] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setCategories(parsed)
      }
    } catch (e) { console.warn('Failed to load categories', e) }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(categories)) } catch (e) { void e }
  }, [categories])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const newCat = {
      id: Date.now(),
      name,
      parent: form.parent || '',
      description: form.description.trim(),
    }
    setCategories(prev => [newCat, ...prev])
    setForm({ name: '', parent: '', description: '' })
  }

  function onDelete(id) { setCategories(prev => prev.filter(c => c.id !== id)) }
  function onEdit(cat) { setForm({ name: cat.name || '', parent: cat.parent || '', description: cat.description || '' }) }

  const parentOptions = useMemo(() => [''].concat(categories.map(c => c.name)), [categories])

  return (
      <div className="space-y-6">
        <div className={`relative inline-flex items-center ${isArabic ? 'flex-row-reverse' : ''} gap-2`}>
          <h1 className={`page-title text-2xl font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.formTitle}</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">{labels.name}</label>
              <input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input" required />
            </div>
            <div>
              <label className="block text-sm mb-1">{labels.parent}</label>
              <select name="parent" value={form.parent} onChange={onChange} className="input">
                {parentOptions.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt || (isArabic ? 'بدون' : 'None')}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">{labels.description}</label>
              <textarea name="description" value={form.description} onChange={onChange} placeholder={labels.description} className="input h-24" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">{labels.save}</button>
            </div>
          </form>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[200px]">{labels.name}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.parent}</th>
                    <th className="text-start px-3 min-w-[220px]">{labels.description}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td className="px-3"><span className="font-medium">{c.name}</span></td>
                      <td className="px-3">{c.parent || (isArabic ? 'بدون' : 'None')}</td>
                      <td className="px-3">{c.description}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-outline btn-sm px-2 py-1" title={labels.edit} aria-label={labels.edit} onClick={() => onEdit(c)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                          </button>
                          <button type="button" className="btn-icon-danger" title={labels.delete} aria-label={labels.delete} onClick={() => onDelete(c.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><rect x="5" y="6" width="14" height="14" rx="2" /></svg>
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
  )
}
