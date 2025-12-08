import React, { useMemo, useState } from 'react'
import Layout from '@shared/layouts/Layout'
import { useTranslation } from 'react-i18next'
import PropertyCard from '../components/PropertyCard'
import PropertiesSummaryPanel from '../components/PropertiesSummaryPanel'
import ImportPropertiesModal from '../components/ImportPropertiesModal'
import CreatePropertyModal from '../components/CreatePropertyModal'
// removed local theme toggle

export default function Properties() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  // theme toggle removed on this page per request

  const SAMPLE_PROPERTIES = useMemo(()=>[
    {
      id: 1, name: 'Nile View Residences', city: 'Cairo', developer: 'Hima Dev', status: 'Available',
      units: 120, area: 120, price: 2500000, documents: 12, lastUpdated: '2025-11-05',
      logo: 'https://dummyimage.com/100x100/000/fff.png&text=NV',
      mainImage: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
      description: 'Prime apartments overlooking the Nile with modern amenities.', progress: 35, estimatedRevenue: 85000000
    },
    {
      id: 2, name: 'Palm Villas', city: 'Giza', developer: 'Hima Dev', status: 'Reserved',
      units: 60, area: 300, price: 6500000, documents: 8, lastUpdated: '2025-11-06',
      logo: 'https://dummyimage.com/100x100/111/fff.png&text=PV',
      mainImage: 'https://images.unsplash.com/photo-1505691728975-327f93beedb3?q=80&w=1200&auto=format&fit=crop',
      description: 'Luxury villas with private gardens and pools.', progress: 60, estimatedRevenue: 120000000
    },
    {
      id: 3, name: 'Smart Offices', city: 'New Cairo', developer: 'TechBuild', status: 'Sold',
      units: 40, area: 95, price: 1800000, documents: 18, lastUpdated: '2025-11-03',
      logo: 'https://dummyimage.com/100x100/333/fff.png&text=SO',
      mainImage: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop',
      description: 'Modern offices with smart building features.', progress: 100, estimatedRevenue: 48000000
    },
    {
      id: 4, name: 'Marina Bay Apartments', city: 'Alexandria', developer: 'SeaSide Dev', status: 'Available',
      units: 200, area: 110, price: 2100000, documents: 10, lastUpdated: '2025-10-29',
      logo: 'https://dummyimage.com/100x100/555/fff.png&text=MB',
      mainImage: 'https://images.unsplash.com/photo-1449844908441-774d237f3b16?q=80&w=1200&auto=format&fit=crop',
      description: 'Sea view apartments with premium facilities.', progress: 45, estimatedRevenue: 150000000
    }
  ], [])

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState([])
  const [cityFilter, setCityFilter] = useState([])
  const [developerFilter, setDeveloperFilter] = useState([])
  const [typeFilter, setTypeFilter] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [areaRange, setAreaRange] = useState([0, 500])
  const [roomsRange, setRoomsRange] = useState([0, 6])
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selected, setSelected] = useState(null)

  const statuses = ['Available','Sold','Reserved']
  const cities = ['Cairo','Giza','New Cairo','Alexandria']
  const developers = ['Hima Dev','TechBuild','SeaSide Dev']
  const types = ['Apartment','Villa','Office']

  const filtered = useMemo(()=>{
    return SAMPLE_PROPERTIES.filter(p => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || [p.name, p.city, p.developer, p.description].some(v=>String(v).toLowerCase().includes(q))
      const matchStatus = statusFilter.length === 0 || statusFilter.includes(p.status)
      const matchCity = cityFilter.length === 0 || cityFilter.includes(p.city)
      const matchDev = developerFilter.length === 0 || developerFilter.includes(p.developer)
      const matchType = typeFilter.length === 0 || typeFilter.includes(p.type || 'Apartment')
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
      const matchArea = p.area >= areaRange[0] && p.area <= areaRange[1]
      const matchRooms = (p.rooms || 3) >= roomsRange[0] && (p.rooms || 3) <= roomsRange[1]
      return matchQ && matchStatus && matchCity && matchDev && matchType && matchPrice && matchArea && matchRooms
    })
  }, [SAMPLE_PROPERTIES, query, statusFilter, cityFilter, developerFilter, typeFilter, priceRange, areaRange, roomsRange])

  const stats = useMemo(()=>{
    return {
      total: SAMPLE_PROPERTIES.length,
      totalUnits: SAMPLE_PROPERTIES.reduce((a,b)=>a + (b.units||0), 0),
      sold: SAMPLE_PROPERTIES.filter(p=>p.status==='Sold').length,
      available: SAMPLE_PROPERTIES.filter(p=>p.status==='Available').length,
      reserved: SAMPLE_PROPERTIES.filter(p=>p.status==='Reserved').length,
    }
  }, [SAMPLE_PROPERTIES])

  const clearFilters = () => {
    setQuery(''); setStatusFilter([]); setCityFilter([]); setDeveloperFilter([]); setTypeFilter([])
    setPriceRange([0,10000000]); setAreaRange([0,500]); setRoomsRange([0,6])
  }

  const toggleSel = (listSetter, list, value) => {
    if (list.includes(value)) listSetter(list.filter(v=>v!==value))
    else listSetter([...list, value])
  }

  const exportCSV = () => {
    const headers = ['name','city','developer','status','units','area','price','documents','lastUpdated','progress']
    const rows = filtered.map(p => headers.map(h => p[h] ?? ''))
    const csv = headers.join(',') + '\n' + rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'properties.csv'
    a.click(); URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    const [{ default: jsPDF }, autotable] = await Promise.all([
      import('jspdf'), import('jspdf-autotable')
    ])
    const doc = new jsPDF()
    const headers = ['Name','City','Dev','Status','Units','Area','Price']
    const rows = filtered.map(p => [p.name,p.city,p.developer,p.status,p.units,p.area,p.price])
    autotable.default(doc, { head: [headers], body: rows })
    doc.save('properties.pdf')
  }

  const perPage = 6
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const paged = useMemo(()=> filtered.slice((page-1)*perPage, page*perPage), [filtered, page])

  return (
    <Layout>
      <div className="p-6 bg-[var(--content-bg)] text-[var(--content-text)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isRTL ? 'لوحة العقارات' : 'Properties Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary" onClick={()=>setShowCreateModal(true)}>{isRTL ? 'إنشاء عقار' : 'Create Property'}</button>
            <button className="btn btn-glass" onClick={()=>setShowImportModal(true)}>{isRTL ? 'استيراد' : 'Import'}</button>
            <button className="btn btn-glass" onClick={exportCSV}>{isRTL ? 'تصدير CSV' : 'Export CSV'}</button>
            <button className="btn btn-glass" onClick={exportPDF}>{isRTL ? 'تصدير PDF' : 'Export PDF'}</button>
          </div>
        </div>

        {/* صف فاضي فوق "الجدول" (نعتبر الملخص كجدول) */}
        <div className="h-4" />

        {/* Summary KPIs */}
        <PropertiesSummaryPanel stats={stats} isRTL={isRTL} onFilter={(f)=>{
          if (f.type==='status') setStatusFilter([f.value])
          else clearFilters()
        }} />

        {/* صف فاضي تحت "الجدول" */}
        <div className="h-4" />

        {/* Filters */}
        <div className="glass-panel rounded-xl p-4 mt-4">
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${isRTL ? 'dir-rtl' : ''}`}>
            <div>
              <label className="label">{isRTL ? 'بحث' : 'Search'}</label>
              <input className="input w-full" placeholder={isRTL ? 'الاسم، المدينة..' : 'Name, city...'} value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
            <div>
              <label className="label">{isRTL ? 'الحالة' : 'Status'}</label>
              <div className="flex flex-wrap gap-2">
                {['Available','Sold','Reserved'].map(s => (
                  <button key={s} className={`chip ${statusFilter.includes(s) ? 'chip-active' : ''}`} onClick={()=>toggleSel(setStatusFilter, statusFilter, s)}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{isRTL ? 'المدينة' : 'City'}</label>
              <div className="flex flex-wrap gap-2">
                {cities.map(c => (
                  <button key={c} className={`chip ${cityFilter.includes(c) ? 'chip-active' : ''}`} onClick={()=>toggleSel(setCityFilter, cityFilter, c)}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{isRTL ? 'المطور' : 'Developer'}</label>
              <div className="flex flex-wrap gap-2">
                {developers.map(d => (
                  <button key={d} className={`chip ${developerFilter.includes(d) ? 'chip-active' : ''}`} onClick={()=>toggleSel(setDeveloperFilter, developerFilter, d)}>{d}</button>
                ))}
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 ${isRTL ? 'dir-rtl' : ''}`}>
            <div>
              <label className="label">{isRTL ? 'النوع' : 'Type'}</label>
              <div className="flex flex-wrap gap-2">
                {types.map(tp => (
                  <button key={tp} className={`chip ${typeFilter.includes(tp) ? 'chip-active' : ''}`} onClick={()=>toggleSel(setTypeFilter, typeFilter, tp)}>{tp}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{isRTL ? 'السعر' : 'Price'}</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="10000000" value={priceRange[0]} onChange={(e)=>setPriceRange([Number(e.target.value), priceRange[1]])} className="flex-1" />
                <input type="range" min="0" max="10000000" value={priceRange[1]} onChange={(e)=>setPriceRange([priceRange[0], Number(e.target.value)])} className="flex-1" />
              </div>
              <div className="text-xs text-[var(--muted-text)]">EGP {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}</div>
            </div>
            <div>
              <label className="label">{isRTL ? 'المساحة' : 'Area (sqm)'}</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="500" value={areaRange[0]} onChange={(e)=>setAreaRange([Number(e.target.value), areaRange[1]])} className="flex-1" />
                <input type="range" min="0" max="500" value={areaRange[1]} onChange={(e)=>setAreaRange([areaRange[0], Number(e.target.value)])} className="flex-1" />
              </div>
              <div className="text-xs text-[var(--muted-text)]">{areaRange[0]} - {areaRange[1]} sqm</div>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 ${isRTL ? 'dir-rtl' : ''}`}>
            <div>
              <label className="label">{isRTL ? 'الغرف' : 'Rooms'}</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="6" value={roomsRange[0]} onChange={(e)=>setRoomsRange([Number(e.target.value), roomsRange[1]])} className="flex-1" />
                <input type="range" min="0" max="6" value={roomsRange[1]} onChange={(e)=>setRoomsRange([roomsRange[0], Number(e.target.value)])} className="flex-1" />
              </div>
              <div className="text-xs text-[var(--muted-text)]">{roomsRange[0]} - {roomsRange[1]}</div>
            </div>
            <div className="md:col-span-2 flex items-center justify-end">
              <button className="btn btn-glass" onClick={clearFilters}>{isRTL ? 'مسح الفلاتر' : 'Clear Filters'}</button>
            </div>
          </div>
        </div>

        {/* 5 صفوف فاضية تحت الفلتر */}
        <div className="h-4" />
        <div className="h-4" />
        <div className="h-4" />
        <div className="h-4" />
        <div className="h-4" />

        {/* Properties List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paged.map(p => (
            <PropertyCard key={p.id} p={p} isRTL={isRTL} onView={setSelected} onEdit={()=>setShowCreateModal(true)} onShare={()=>navigator?.share ? navigator.share({ title: p.name, text: p.description, url: window.location.href }) : alert('Share not supported')} onDelete={()=>alert('Delete clicked')} />
          ))}
        </div>

        {/* صف فاضي تحت الكروت */}
        <div className="h-4" />

        {/* Pagination */}
        <div className={`mt-4 flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button className="btn btn-glass" onClick={()=>setPage(p => Math.max(1, p-1))}>{isRTL ? 'السابق' : 'Prev'}</button>
          <span className="text-sm text-[var(--muted-text)]">{isRTL ? 'صفحة' : 'Page'} {page} / {totalPages}</span>
          <button className="btn btn-glass" onClick={()=>setPage(p => Math.min(totalPages, p+1))}>{isRTL ? 'التالي' : 'Next'}</button>
        </div>

        {/* Modals */}
        {showImportModal && (
          <ImportPropertiesModal onClose={()=>setShowImportModal(false)} isRTL={isRTL} onImported={(rows)=> console.log('Imported rows', rows)} />
        )}
        {showCreateModal && (
          <CreatePropertyModal onClose={()=>setShowCreateModal(false)} isRTL={isRTL} onSave={(payload)=> console.log('New property', payload)} />
        )}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setSelected(null)} />
            <div className="relative z-50 glass-panel rounded-xl p-4 w-[900px] max-w-[95vw]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{isRTL ? 'تفاصيل العقار' : 'Property Details'}</h2>
                <button className="btn btn-glass" onClick={()=>setSelected(null)}>{isRTL ? 'إغلاق' : 'Close'}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'الاسم' : 'Name'}:</span> <span className="font-semibold">{selected.name}</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'المدينة' : 'City'}:</span> <span className="font-semibold">{selected.city}</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'المطور' : 'Developer'}:</span> <span className="font-semibold">{selected.developer}</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'الحالة' : 'Status'}:</span> <span className="font-semibold">{selected.status}</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'الوحدات' : 'Units'}:</span> <span className="font-semibold">{selected.units}</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'المساحة' : 'Area'}:</span> <span className="font-semibold">{selected.area} sqm</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'السعر' : 'Price'}:</span> <span className="font-semibold">EGP {selected.price.toLocaleString()}</span></div>
                  <div><span className="text-[var(--muted-text)]">{isRTL ? 'آخر تحديث' : 'Updated'}:</span> <span className="font-semibold">{selected.lastUpdated}</span></div>
                </div>
                <div className="rounded-lg overflow-hidden h-48 md:h-full">
                  <img src={selected.mainImage} alt={selected.name} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}