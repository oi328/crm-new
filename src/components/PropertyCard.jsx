import React from 'react'
import { FaEye, FaEdit, FaShareAlt, FaTrash } from 'react-icons/fa'

export default function PropertyCard({ p, isRTL, onView, onEdit, onShare, onDelete }) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className={`relative h-40 sm:h-48 md:h-56 w-full`}>
        <img src={p.mainImage} alt={p.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className={`absolute bottom-2 left-2 right-2 flex ${isRTL ? 'flex-row-reverse' : ''} items-center justify-between`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {p.logo && (
              <img src={p.logo} alt="logo" className="w-10 h-10 rounded-md border border-white/30" />
            )}
            <div className="text-white">
              <div className="text-lg font-semibold drop-shadow">{p.name}</div>
              <div className="text-xs opacity-90">{p.city} • {p.developer}</div>
            </div>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="px-2 py-1 rounded-md text-xs bg-white/20 text-white border border-white/30">{p.status}</span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 text-sm`}>
          <div><span className="text-[var(--muted-text)]">Units:</span> <span className="font-semibold">{p.units}</span></div>
          <div><span className="text-[var(--muted-text)]">Area:</span> <span className="font-semibold">{p.area} sqm</span></div>
          <div><span className="text-[var(--muted-text)]">Price:</span> <span className="font-semibold">EGP {p.price.toLocaleString()}</span></div>
          <div><span className="text-[var(--muted-text)]">Docs:</span> <span className="font-semibold">{p.documents}</span></div>
          <div><span className="text-[var(--muted-text)]">Updated:</span> <span className="font-semibold">{p.lastUpdated}</span></div>
          {p.estimatedRevenue != null && (
            <div><span className="text-[var(--muted-text)]">Est. Revenue:</span> <span className="font-semibold">EGP {p.estimatedRevenue.toLocaleString()}</span></div>
          )}
        </div>

        {p.description && (
          <div className="mt-3 text-sm text-[var(--muted-text)] line-clamp-2">
            {p.description}
          </div>
        )}

        <div className="mt-4">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{width: `${p.progress || 0}%`}} />
          </div>
          <div className="mt-1 text-xs text-[var(--muted-text)]">{p.progress || 0}% {isRTL ? 'نسبة التقدم' : 'Progress'}</div>
        </div>

        <div className={`mt-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2" onClick={()=>onView && onView(p)}><FaEye /> {isRTL ? 'عرض' : 'View'}</button>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2" onClick={()=>onEdit && onEdit(p)}><FaEdit /> {isRTL ? 'تعديل' : 'Edit'}</button>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2" onClick={()=>onShare && onShare(p)}><FaShareAlt /> {isRTL ? 'مشاركة' : 'Share'}</button>
          <button className="btn btn-glass text-xs inline-flex items-center gap-2" onClick={()=>onDelete && onDelete(p)}><FaTrash /> {isRTL ? 'حذف' : 'Delete'}</button>
        </div>
      </div>
    </div>
  )
}