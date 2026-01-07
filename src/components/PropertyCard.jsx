import React from 'react'
import { FaEye, FaEdit, FaShareAlt, FaTrash, FaMapMarkerAlt, FaHome, FaFilePdf } from 'react-icons/fa'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PropertyCard({ p, isRTL, onView, onEdit, onShare, onDelete }) {
  const downloadPaymentPlanPdf = () => {
    const plans = Array.isArray(p.installmentPlans) ? p.installmentPlans : []
    if (plans.length === 0) return
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`${isRTL ? 'خطط التقسيط' : 'Installment Plans'} - ${p.adTitle || p.name || 'Property'}`, 14, 18)
    const head = [
      isRTL ? 'المقدم (%)' : 'Down (%)',
      isRTL ? 'السنوات' : 'Years',
      isRTL ? 'الاستلام' : 'Delivery',
      isRTL ? 'قيمة القسط' : 'Installment',
      isRTL ? 'تكرار القسط' : 'Frequency',
      isRTL ? 'دفعة الاستلام' : 'Receipt',
      isRTL ? 'دفعة إضافية' : 'Extra',
      isRTL ? 'تكرار الإضافية' : 'Extra Freq',
      isRTL ? 'عدد الإضافية' : 'Extra Count',
    ]
    const body = plans.map(pl => [
      String(pl.downPayment ?? ''),
      String(pl.years ?? ''),
      String(pl.deliveryDate ?? ''),
      String(pl.installmentAmount ?? ''),
      String(pl.installmentFrequency ?? ''),
      String(pl.receiptAmount ?? ''),
      String(pl.extraPayment ?? ''),
      String(pl.extraPaymentFrequency ?? ''),
      String(pl.extraPaymentCount ?? ''),
    ])
    autoTable(doc, { head: [head], body, startY: 24, styles: { fontSize: 10 } })
    doc.save(`${(p.adTitle || p.name || 'property').replace(/[\\/:*?"<>|]/g,'_')}_payment_plans.pdf`)
  }
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="p-2 sm:p-3">
        <div className={`flex items-center gap-3 min-w-0 mb-2`}>
          {p.logo && <img src={p.logo} alt={`${p.name} logo`} className="h-6 sm:h-7 w-auto rounded-md border border-gray-200 dark:border-gray-700" />}
          <h3 className="font-semibold text-sm sm:text-base truncate flex-1">{p.adTitle || p.name}</h3>
          
          <div className={`flex items-center gap-1`}>
             <button
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
              title={isRTL ? 'عرض' : 'View'} aria-label={isRTL ? 'عرض' : 'View'} onClick={()=>onView && onView(p)}
              style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <FaEye className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
            </button>
            <button
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
              title={isRTL ? 'تعديل' : 'Edit'} aria-label={isRTL ? 'تعديل' : 'Edit'} onClick={()=>onEdit && onEdit(p)}
              style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <FaEdit className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
            </button>
            <button
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
              title={isRTL ? 'حذف' : 'Delete'} aria-label={isRTL ? 'حذف' : 'Delete'} onClick={()=>onDelete && onDelete(p)}
              style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <FaTrash className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
            </button>
            <button
              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm transition focus:outline-none"
              title={isRTL ? 'خطة الدفع' : 'Payment Plan'} aria-label={isRTL ? 'خطة الدفع' : 'Payment Plan'} onClick={downloadPaymentPlanPdf}
              style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <FaFilePdf className="w-3 h-3 text-[var(--nova-accent)] dark:text-white" />
            </button>
          </div>
        </div>

        <div className="mb-2">
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

      {/* Image */}
      {p.mainImage && (
        <div className="rounded-lg overflow-hidden mx-2 sm:mx-3">
          <img src={p.mainImage} alt={p.name} className="w-full h-32 sm:h-40 md:h-48 object-cover" />
        </div>
      )}

      {/* Compact details aligned with Add Property */}
      <div className="p-2 sm:p-3">
        <div className={`grid grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] sm:text-xs leading-snug ${isRTL ? 'text-end' : 'text-start'}`}>
          <div className={`glass-panel tinted-blue px-1.5 py-1 rounded-md flex items-center gap-1.5 min-w-0`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            <FaMapMarkerAlt className="opacity-70 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{p.city || '-'}</span>
          </div>
          <div className={`glass-panel tinted-indigo px-1.5 py-1 rounded-md flex items-center gap-1.5 min-w-0`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
            <FaHome className="opacity-70 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{p.propertyType || p.type || '-'}</span>
          </div>
          {p.building && <div className="glass-panel tinted-cyan px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'المبنى' : 'Building'}: <span className="font-semibold">{p.building}</span></div>}
          {p.owner && <div className="glass-panel tinted-purple px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'المالك' : 'Owner'}: <span className="font-semibold">{p.owner}</span></div>}
          <div className="glass-panel tinted-emerald px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'غرف النوم' : 'Bedrooms'}: <span className="font-semibold">{p.bedrooms ?? p.rooms ?? '-'}</span></div>
          <div className="glass-panel tinted-violet px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'الحمامات' : 'Bathrooms'}: <span className="font-semibold">{p.bathrooms ?? p.doors ?? '-'}</span></div>
          <div className="glass-panel tinted-amber px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'المساحة' : 'Area'}: <span className="font-semibold">{p.area ?? '-'} {p.areaUnit || 'm²'}</span></div>
          <div className="glass-panel tinted-blue px-1.5 py-1 rounded-md min-w-0" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{isRTL ? 'آخر تحديث' : 'Updated'}: <span className="font-semibold">{p.lastUpdated || '-'}</span></div>
        </div>

        {/* Progress + Price */}
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className={`${isRTL ? 'text-end' : 'text-start'}`}>
            <div className="text-[10px] sm:text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'الغرض' : 'Purpose'}</div>
            <div className="text-xs sm:text-sm font-semibold">
              {p.purpose || '-'}
            </div>
          </div>
          <div className={`${isRTL ? 'text-end' : 'text-start'}`}>
            <div className="text-[10px] sm:text-xs text-[var(--muted-text)] mb-1">{isRTL ? 'السعر' : 'Price'}</div>
            <div className="text-xs sm:text-sm font-semibold">
              {new Intl.NumberFormat('en-EG', { style: 'currency', currency: p.currency || 'EGP', maximumFractionDigits: 0 }).format(p.price||0)}
            </div>
          </div>
        </div>

        {/* Share (match Project card placement) */}
        <div className="mt-2 flex items-center justify-end">
          <button
            className="inline-flex items-center gap-2 text-primary hover:underline"
            title={isRTL ? 'مشاركة' : 'Share'}
            onClick={()=>onShare && onShare(p)}
          >
            <FaShareAlt className={isRTL ? 'scale-x-[-1]' : ''} /> {isRTL ? 'مشاركة' : 'Share'}
          </button>
        </div>

      </div>
    </div>
  )
}
