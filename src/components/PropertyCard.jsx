import React from 'react'
import { FaEye, FaEdit, FaShareAlt, FaTrash, FaMapMarkerAlt, FaHome } from 'react-icons/fa'

export default function PropertyCard({ p, isRTL, onView, onEdit, onShare, onDelete }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header: name + status + actions */}
      <div className="p-2 sm:p-3 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''} min-w-0`}>
          {p.logo && <img src={p.logo} alt={`${p.name} logo`} className="h-6 sm:h-7 w-auto rounded-md border border-gray-200 dark:border-gray-700" />}
          <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} min-w-0`}>
             <h3 className="font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">{p.adTitle || p.name}</h3>
             {/* Status Badge */}
             {p.status && (
               <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                 p.status === 'Available' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                 p.status === 'Reserved' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                 p.status === 'Sold' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
               }`}>
                 {p.status}
               </span>
             )}
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={isRTL ? 'عرض' : 'View'} aria-label={isRTL ? 'عرض' : 'View'} onClick={()=>onView && onView(p)}>
            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={isRTL ? 'تعديل' : 'Edit'} aria-label={isRTL ? 'تعديل' : 'Edit'} onClick={()=>onEdit && onEdit(p)}>
            <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={isRTL ? 'حذف' : 'Delete'} aria-label={isRTL ? 'حذف' : 'Delete'} onClick={()=>onDelete && onDelete(p)}>
            <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      {p.mainImage && (
        <div className="rounded-lg overflow-hidden mx-2 sm:mx-3">
          <img src={p.mainImage} alt={p.name} className="w-full h-32 sm:h-40 md:h-48 object-cover" />
        </div>
      )}

      {/* Compact details aligned with Add Property */}
      <div className="p-2 sm:p-3">
        <div className={`grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 text-xs sm:text-sm ${isRTL ? 'text-end' : 'text-start'}`}>
          <div className={`glass-panel tinted-blue px-1.5 py-1 rounded-md flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}><FaMapMarkerAlt className="opacity-70 w-3 h-3 sm:w-4 sm:h-4" /> {p.city || '-'}</div>
          <div className={`glass-panel tinted-indigo px-1.5 py-1 rounded-md flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}><FaHome className="opacity-70 w-3 h-3 sm:w-4 sm:h-4" /> {p.propertyType || p.type || '-'}</div>
          {p.building && <div className="glass-panel tinted-cyan px-1.5 py-1 rounded-md">{isRTL ? 'المبنى' : 'Building'}: <span className="font-semibold">{p.building}</span></div>}
          {p.owner && <div className="glass-panel tinted-purple px-1.5 py-1 rounded-md">{isRTL ? 'المالك' : 'Owner'}: <span className="font-semibold">{p.owner}</span></div>}
          <div className="glass-panel tinted-emerald px-1.5 py-1 rounded-md">{isRTL ? 'غرف النوم' : 'Bedrooms'}: <span className="font-semibold">{p.bedrooms ?? p.rooms ?? '-'}</span></div>
          <div className="glass-panel tinted-violet px-1.5 py-1 rounded-md">{isRTL ? 'الحمامات' : 'Bathrooms'}: <span className="font-semibold">{p.bathrooms ?? p.doors ?? '-'}</span></div>
          <div className="glass-panel tinted-amber px-1.5 py-1 rounded-md">{isRTL ? 'المساحة' : 'Area'}: <span className="font-semibold">{p.area ?? '-'} {p.areaUnit || 'm²'}</span></div>
          <div className="glass-panel tinted-blue px-1.5 py-1 rounded-md">{isRTL ? 'آخر تحديث' : 'Updated'}: <span className="font-semibold">{p.lastUpdated || '-'}</span></div>
        </div>

        {/* Progress + Price */}
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className={`${isRTL ? 'text-end' : 'text-start'}`}>
            <div className="text-[10px] sm:text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'نسبة التقدم' : 'Progress'}</div>
            <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${p.progress||0}%` }} />
            </div>
          </div>
          <div className={`${isRTL ? 'text-end' : 'text-start'}`}>
            <div className="text-[10px] sm:text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'السعر' : 'Price'}</div>
            <div className="text-xs sm:text-sm font-semibold">
              {new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(p.price||0)}
            </div>
          </div>
        </div>

        {/* Share */}
        <div className="mt-2 flex items-center justify-end">
          <button className={`inline-flex items-center gap-1.5 sm:gap-2 text-primary hover:underline text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`} title={isRTL ? 'مشاركة' : 'Share'} onClick={()=>onShare && onShare(p)}>
            <FaShareAlt className={`${isRTL ? 'scale-x-[-1]' : ''} w-3 h-3 sm:w-4 sm:h-4`} /> {isRTL ? 'مشاركة' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
