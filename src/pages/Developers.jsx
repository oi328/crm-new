import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SearchableSelect from '../components/SearchableSelect'
import { FaFilter, FaSearch, FaChevronDown, FaTimes, FaEdit, FaTrash } from 'react-icons/fa'

export default function Developers() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const labels = useMemo(() => ({
    title: isArabic ? ' المطورون' : ' Developers',
    formTitle: isArabic ? 'بيانات شركة التطوير' : 'Developer Company Details',
    add: isArabic ? 'إضافة شركة' : 'Add Company',
    close: isArabic ? 'إغلاق' : 'Close',
    filter: isArabic ? 'تصفية' : 'Filter',
    search: isArabic ? 'بحث' : 'Search',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    companyName: isArabic ? 'اسم الشركة' : 'Company Name',
    contactPerson: isArabic ? 'الشخص المسؤول' : 'Contact Person',
    phone: isArabic ? 'الهاتف' : 'Phone',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    city: isArabic ? 'المدينة' : 'City',
    status: isArabic ? 'الحالة' : 'Status',
    save: isArabic ? 'حفظ الشركة' : 'Save Company',
    listTitle: isArabic ? 'قائمة شركات التطوير' : 'Developers List',
    empty: isArabic ? 'لا توجد سجلات بعد' : 'No records yet',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryDevelopers'

  const [form, setForm] = useState({ companyName: '', contactPerson: '', phone: '', email: '', city: '', status: isArabic ? 'نشط' : 'Active' })
  const [developers, setDevelopers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    companyName: '',
    contactPerson: '',
    city: '',
    status: '',
    phone: ''
  })

  useEffect(() => { 
    try { 
      const raw = localStorage.getItem(STORAGE_KEY); 
      if (raw) { 
        const parsed = JSON.parse(raw); 
        if (Array.isArray(parsed) && parsed.length > 0) { setDevelopers(parsed); return } 
      } 
      const sample = [
        { id: 1700000201, companyName: 'Nova Developments', contactPerson: 'Khalid', phone: '555-2011', email: 'hello@nova.dev', city: isArabic ? 'الرياض' : 'Riyadh', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000202, companyName: 'Skyline Builders', contactPerson: 'Mariam', phone: '555-2012', email: 'info@skyline.com', city: isArabic ? 'جدة' : 'Jeddah', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000203, companyName: 'Red Sea Constructions', contactPerson: 'Ahmed', phone: '555-2013', email: 'contact@redsea.co', city: isArabic ? 'جدة' : 'Jeddah', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000204, companyName: 'Cairo Urban', contactPerson: 'Layla', phone: '555-2014', email: 'support@cairourban.eg', city: isArabic ? 'القاهرة' : 'Cairo', status: isArabic ? 'متوقف' : 'Inactive' },
        { id: 1700000205, companyName: 'Nile Properties', contactPerson: 'Omar', phone: '555-2015', email: 'sales@nileprop.com', city: isArabic ? 'الخرطوم' : 'Khartoum', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000206, companyName: 'Dubai Hills', contactPerson: 'Fatima', phone: '555-2016', email: 'info@dubaihills.ae', city: isArabic ? 'دبي' : 'Dubai', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000207, companyName: 'Amman Stone', contactPerson: 'Yousef', phone: '555-2017', email: 'yousef@ammanstone.jo', city: isArabic ? 'عمان' : 'Amman', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000208, companyName: 'Beirut Towers', contactPerson: 'Nour', phone: '555-2018', email: 'nour@beiruttowers.lb', city: isArabic ? 'بيروت' : 'Beirut', status: isArabic ? 'متوقف' : 'Inactive' },
        { id: 1700000209, companyName: 'Casablanca Estates', contactPerson: 'Hassan', phone: '555-2019', email: 'hassan@casaestates.ma', city: isArabic ? 'الدار البيضاء' : 'Casablanca', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000210, companyName: 'Doha Heights', contactPerson: 'Aisha', phone: '555-2020', email: 'aisha@dohaheights.qa', city: isArabic ? 'الدوحة' : 'Doha', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000211, companyName: 'Manama Bay', contactPerson: 'Ali', phone: '555-2021', email: 'ali@manamabay.bh', city: isArabic ? 'المنامة' : 'Manama', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000212, companyName: 'Kuwait City Dev', contactPerson: 'Sara', phone: '555-2022', email: 'sara@kuwaitdev.kw', city: isArabic ? 'مدينة الكويت' : 'Kuwait City', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000213, companyName: 'Muscat Hills', contactPerson: 'Said', phone: '555-2023', email: 'said@muscathills.om', city: isArabic ? 'مسقط' : 'Muscat', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000214, companyName: 'Tunis Gardens', contactPerson: 'Monia', phone: '555-2024', email: 'monia@tunisgardens.tn', city: isArabic ? 'تونس' : 'Tunis', status: isArabic ? 'متوقف' : 'Inactive' },
        { id: 1700000215, companyName: 'Algiers Heights', contactPerson: 'Karim', phone: '555-2025', email: 'karim@algiersheights.dz', city: isArabic ? 'الجزائر' : 'Algiers', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000216, companyName: 'Baghdad Gates', contactPerson: 'Zainab', phone: '555-2026', email: 'zainab@baghdadgates.iq', city: isArabic ? 'بغداد' : 'Baghdad', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000217, companyName: 'Damascus Old City', contactPerson: 'Samer', phone: '555-2027', email: 'samer@damascusold.sy', city: isArabic ? 'دمشق' : 'Damascus', status: isArabic ? 'متوقف' : 'Inactive' },
        { id: 1700000218, companyName: 'Tripoli Sea View', contactPerson: 'Libya', phone: '555-2028', email: 'info@tripoli.ly', city: isArabic ? 'طرابلس' : 'Tripoli', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000219, companyName: 'Sanaa Heritage', contactPerson: 'Ahmed', phone: '555-2029', email: 'ahmed@sanaa.ye', city: isArabic ? 'صنعاء' : 'Sanaa', status: isArabic ? 'نشط' : 'Active' },
        { id: 1700000220, companyName: 'Khartoum North', contactPerson: 'Mona', phone: '555-2030', email: 'mona@khartoum.sd', city: isArabic ? 'الخرطوم' : 'Khartoum', status: isArabic ? 'نشط' : 'Active' }
      ]
      setDevelopers(sample)
    } catch {} 
  }, [])
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(developers)) } catch {} }, [developers])

  function onChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }
  function onSubmit(e) {
    e.preventDefault()
    const companyName = form.companyName.trim()
    if (!companyName) return
    const rec = { id: Date.now(), ...form }
    setDevelopers(prev => [rec, ...prev])
    setForm({ companyName: '', contactPerson: '', phone: '', email: '', city: '', status: isArabic ? 'نشط' : 'Active' })
    try { setShowForm(false) } catch {}
  }
  function onDelete(id) { setDevelopers(prev => prev.filter(r => r.id !== id)) }
  function onEdit(rec) { 
    setForm({ companyName: rec.companyName||'', contactPerson: rec.contactPerson||'', phone: rec.phone||'', email: rec.email||'', city: rec.city||'', status: rec.status|| (isArabic?'نشط':'Active') }) 
    setShowForm(true)
    try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
  }

  const statusOptions = useMemo(() => (isArabic ? ['نشط', 'متوقف'] : ['Active', 'Inactive']), [isArabic])
  const companyOptions = useMemo(() => Array.from(new Set(developers.map(d => d.companyName).filter(Boolean))), [developers])
  const contactOptions = useMemo(() => Array.from(new Set(developers.map(d => d.contactPerson).filter(Boolean))), [developers])
  const cityOptions = useMemo(() => Array.from(new Set(developers.map(d => d.city).filter(Boolean))), [developers])

  const filtered = useMemo(() => {
    return developers.filter(d => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const pool = [d.companyName, d.contactPerson, d.phone, d.email].map(x => (x||'').toLowerCase())
        if (!pool.some(v => v.includes(q))) return false
      }
      if (filters.companyName && d.companyName !== filters.companyName) return false
      if (filters.contactPerson && !String(d.contactPerson||'').toLowerCase().includes(String(filters.contactPerson).toLowerCase())) return false
      if (filters.city && d.city !== filters.city) return false
      if (filters.status && d.status !== filters.status) return false
      if (filters.phone && !(d.phone||'').includes(filters.phone)) return false
      return true
    })
  }, [developers, filters])
  function clearFilters() { setFilters({ search: '', companyName: '', contactPerson: '', city: '', status: '', phone: '' }) }

  return (
      <div className="space-y-6 pt-4">
        <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div className="relative inline-block">
            <h1 className={`page-title text-2xl font-semibold ${isArabic ? 'text-right' : 'text-left'}`}>{labels.title}</h1>
            <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
          </div>
          <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none" onClick={() => setShowForm(true)}>{labels.add}</button>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FaFilter className="text-blue-500" /> {labels.filter}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAllFilters(prev => !prev)} className="btn btn-glass btn-compact text-blue-600">
                {showAllFilters ? (isArabic ? 'إخفاء' : 'Hide') : (isArabic ? 'إظهار' : 'Show')} <FaChevronDown className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
                {labels.clearFilters}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
              <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.companyName}</label>
              <SearchableSelect options={companyOptions} value={filters.companyName} onChange={val=>setFilters(prev=>({...prev, companyName: val}))} isRTL={isArabic} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.contactPerson}</label>
              <input className="input w-full" value={filters.contactPerson} onChange={e=>setFilters(prev=>({...prev, contactPerson: e.target.value}))} placeholder={labels.contactPerson} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.city}</label>
              <SearchableSelect options={cityOptions} value={filters.city} onChange={val=>setFilters(prev=>({...prev, city: val}))} isRTL={isArabic} />
            </div>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[300px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
              <select className="input w-full" value={filters.status} onChange={e=>setFilters(prev=>({...prev, status: e.target.value}))}>
                <option value="">{isArabic ? 'الكل' : 'All'}</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-text)]">{labels.phone}</label>
              <input className="input w-full" value={filters.phone} onChange={e=>setFilters(prev=>({...prev, phone: e.target.value}))} placeholder={labels.phone} />
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
          <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="nova-table w-full">
                <thead className="thead-soft">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="text-start px-3 min-w-[200px]">{labels.companyName}</th>
                    <th className="text-start px-3 min-w-[160px]">{labels.contactPerson}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.phone}</th>
                    <th className="text-start px-3 min-w-[200px]">{labels.email}</th>
                    <th className="text-start px-3 min-w-[140px]">{labels.city}</th>
                    <th className="text-center px-3 min-w-[120px]">{labels.status}</th>
                    <th className="text-center px-3 min-w-[110px]">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td className="px-3"><span className="font-medium">{r.companyName}</span></td>
                      <td className="px-3">{r.contactPerson}</td>
                      <td className="px-3">{r.phone}</td>
                      <td className="px-3">{r.email}</td>
                      <td className="px-3">{r.city}</td>
                      <td className="px-3 text-center">{r.status}</td>
                      <td className="px-3 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button type="button" className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={labels.edit} aria-label={labels.edit} onClick={() => onEdit(r)}>
                            <FaEdit size={16} />
                          </button>
                          <button type="button" className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={labels.delete} aria-label={labels.delete} onClick={() => onDelete(r.id)}>
                            <FaTrash size={16} />
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

        {showForm && (
          <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6">
              <div className="card p-4 sm:p-6 mt-4 w-[92vw] sm:w-[80vw] lg:w-[60vw] xl:max-w-3xl">
                <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''} mb-4`}>
                  <h2 className="text-xl font-medium">{labels.formTitle}</h2>
                  <button type="button" className="btn btn-sm btn-circle bg-white text-red-600 hover:bg-red-50 shadow-md" onClick={() => setShowForm(false)} aria-label={labels.close}>
                    <FaTimes size={20} />
                  </button>
                </div>
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm mb-1">{labels.companyName}</label><input name="companyName" value={form.companyName} onChange={onChange} placeholder={labels.companyName} className="input" required /></div>
                  <div><label className="block text-sm mb-1">{labels.contactPerson}</label><input name="contactPerson" value={form.contactPerson} onChange={onChange} placeholder={labels.contactPerson} className="input" /></div>
                  <div><label className="block text-sm mb-1">{labels.phone}</label><input name="phone" value={form.phone} onChange={onChange} placeholder={labels.phone} className="input" /></div>
                  <div><label className="block text-sm mb-1">{labels.email}</label><input type="email" name="email" value={form.email} onChange={onChange} placeholder={labels.email} className="input" /></div>
                  <div><label className="block text-sm mb-1">{labels.city}</label><input name="city" value={form.city} onChange={onChange} placeholder={labels.city} className="input" /></div>
                  <div>
                    <label className="block text-sm mb-1">{labels.status}</label>
                    <select name="status" value={form.status} onChange={onChange} className="input">
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className={`md:col-span-2 flex gap-2 ${isArabic ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                    <button type="submit" className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none">
                      {labels.save}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
