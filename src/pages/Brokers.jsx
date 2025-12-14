import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Brokers() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? 'المخزون > الوسطاء' : 'Inventory > Brokers',
    formTitle: isArabic ? 'بيانات الوسيط' : 'Broker Details',
    name: isArabic ? 'اسم الوسيط' : 'Broker Name',
    company: isArabic ? 'الشركة' : 'Company',
    phone: isArabic ? 'الهاتف' : 'Phone',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    license: isArabic ? 'رقم الترخيص' : 'License No.',
    status: isArabic ? 'الحالة' : 'Status',
    save: isArabic ? 'حفظ الوسيط' : 'Save Broker',
    listTitle: isArabic ? 'كل الوسطاء' : 'All Brokers',
    empty: isArabic ? 'لا توجد سجلات بعد' : 'No records yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryBrokers'

  const [form, setForm] = useState({
    name: '', company: '', phone: '', email: '', license: '', status: isArabic ? 'نشط' : 'Active'
  })
  const [brokers, setBrokers] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setBrokers(parsed)
      }
    } catch (e) { void e }
  }, [])
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(brokers)) } catch (e) { void e } }, [brokers])

  function onChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }
  function onSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    const rec = { id: Date.now(), ...form }
    setBrokers(prev => [rec, ...prev])
    setForm({ name: '', company: '', phone: '', email: '', license: '', status: isArabic ? 'نشط' : 'Active' })
  }
  function onDelete(id) { setBrokers(prev => prev.filter(r => r.id !== id)) }
  function onEdit(rec) { setForm({ name: rec.name||'', company: rec.company||'', phone: rec.phone||'', email: rec.email||'', license: rec.license||'', status: rec.status|| (isArabic?'نشط':'Active') }) }

  const statusOptions = useMemo(() => (isArabic ? ['نشط', 'متوقف'] : ['Active', 'Inactive']), [isArabic])

  return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{labels.title}</h1>
        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.formTitle}</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">{labels.name}</label><input name="name" value={form.name} onChange={onChange} placeholder={labels.name} className="input" required /></div>
            <div><label className="block text-sm mb-1">{labels.company}</label><input name="company" value={form.company} onChange={onChange} placeholder={labels.company} className="input" /></div>
            <div><label className="block text-sm mb-1">{labels.phone}</label><input name="phone" value={form.phone} onChange={onChange} placeholder={labels.phone} className="input" /></div>
            <div><label className="block text-sm mb-1">{labels.email}</label><input type="email" name="email" value={form.email} onChange={onChange} placeholder={labels.email} className="input" /></div>
            <div><label className="block text-sm mb-1">{labels.license}</label><input name="license" value={form.license} onChange={onChange} placeholder={labels.license} className="input" /></div>
            <div>
              <label className="block text-sm mb-1">{labels.status}</label>
              <select name="status" value={form.status} onChange={onChange} className="input">
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2"><button type="submit" className="btn btn-primary">{labels.save}</button></div>
          </form>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {brokers.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[180px]">{labels.name}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.company}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.phone}</th>
                    <th className="text-start px-3 min-w-[200px]">{labels.email}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.license}</th>
                    <th className="text-center px-3 min-w-[120px]">{labels.status}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {brokers.map(r => (
                    <tr key={r.id}>
                      <td className="px-3"><span className="font-medium">{r.name}</span></td>
                      <td className="px-3">{r.company}</td>
                      <td className="px-3">{r.phone}</td>
                      <td className="px-3">{r.email}</td>
                      <td className="px-3">{r.license}</td>
                      <td className="px-3 text-center">{r.status}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-outline btn-sm px-2 py-1" title={labels.edit} aria-label={labels.edit} onClick={() => onEdit(r)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                          </button>
                          <button type="button" className="btn-icon-danger" title={labels.delete} aria-label={labels.delete} onClick={() => onDelete(r.id)}>
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
