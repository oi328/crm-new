import React, { useMemo } from 'react'
import { FaMapMarkerAlt, FaHome, FaBed, FaBath, FaRulerCombined, FaPhone } from 'react-icons/fa'
import { useCompanySetup } from './settings/company-setup/store/CompanySetupContext.jsx'

export default function PropertyLanding() {
  const searchStr = (() => {
    if (typeof window === 'undefined') return ''
    const h = window.location.hash || ''
    if (h.includes('?')) return h.split('?')[1]
    return window.location.search || ''
  })()
  const params = new URLSearchParams(searchStr)
  const { companySetup } = useCompanySetup()
  const payload = useMemo(() => {
    const raw = params.get('data') || ''
    try {
      const decoded = decodeURIComponent(raw)
      const bin = atob(decoded)
      const bytes = new Uint8Array([...bin].map(c => c.charCodeAt(0)))
      const json = new TextDecoder().decode(bytes)
      return JSON.parse(json)
    } catch { return null }
  }, [params])
  const brandName = params.get('company') || (companySetup && companySetup.companyInfo && companySetup.companyInfo.companyName) || ''
  const brandLogo = (companySetup && companySetup.companyInfo && companySetup.companyInfo.logoUrl) || ''

  if (!payload) {
    return (
      <div className="min-h-screen bg-[var(--content-bg)] text-[var(--content-text)] flex items-center justify-center p-6">
        <div className="max-w-xl w-full glass-panel rounded-2xl p-6 text-center">
          <h1 className="text-2xl font-bold">Property</h1>
          <p className="mt-2 text-[var(--muted-text)]">Invalid or missing data.</p>
        </div>
      </div>
    )
  }

  const title = payload.adTitle || payload.name || 'Property'
  const city = payload.city || ''
  const mainImage = payload.mainImage || ''
  const price = payload.price || 0
  const currency = payload.currency || 'EGP'
  const bedrooms = payload.bedrooms ?? ''
  const bathrooms = payload.bathrooms ?? ''
  const area = payload.area ?? payload.totalArea ?? ''
  const areaUnit = payload.areaUnit || 'm²'
  const description = payload.description || ''
  const phone = payload.ownerMobile || payload.contactPhone || ''
  const images = Array.isArray(payload.images) ? payload.images : (Array.isArray(payload.media) ? payload.media.filter(m => (m.type||'') === 'image').map(m => m.url).filter(Boolean) : [])
  const videos = Array.isArray(payload.videos) ? payload.videos : (Array.isArray(payload.media) ? payload.media.filter(m => (m.type||'') === 'video').map(m => m.url).filter(Boolean) : [])
  const floorPlans = Array.isArray(payload.floorPlans) ? payload.floorPlans : []
  const documents = Array.isArray(payload.documents) ? payload.documents : []
  const videoUrl = payload.videoUrl || ''
  const virtualTourUrl = payload.virtualTourUrl || ''
  const address = payload.address || ''
  const locationUrl = payload.locationUrl || ''
  const installmentPlans = Array.isArray(payload.installmentPlans) ? payload.installmentPlans : []

  return (
    <div className="min-h-screen bg-[var(--content-bg)] text-[var(--content-text)]">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">{(brandName||'')[0]||'C'}</div>
            )}
            <div>
              <div className="text-sm text-[var(--muted-text)]">صفحة الشركة</div>
              <div className="text-lg font-semibold">{brandName || 'Company'}</div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative inline-flex items-center gap-2">
            <h1 className="page-title text-3xl font-semibold">{title}</h1>
            <span aria-hidden className="absolute block h-[2px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: '-4px', bottom: '-6px' }}></span>
          </div>
        </div>

        {(mainImage || images.length > 0) && (
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img src={mainImage || images[0]} alt={title} className="w-full h-[320px] object-cover" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2"><FaMapMarkerAlt className="opacity-70" /> <span>{city}</span></div>
            <div className="flex items-center gap-2"><FaHome className="opacity-70" /> <span>{payload.propertyType || payload.type || '-'}</span></div>
            <div className="flex items-center gap-2"><FaBed className="opacity-70" /> <span>{bedrooms || '-'}</span></div>
            <div className="flex items-center gap-2"><FaBath className="opacity-70" /> <span>{bathrooms || '-'}</span></div>
            <div className="flex items-center gap-2"><FaRulerCombined className="opacity-70" /> <span>{area || '-'} {areaUnit}</span></div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)] mb-1">Price</div>
            <div className="text-xl font-bold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price||0)}</div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)] mb-1">Contact</div>
            {phone ? (
              <a href={`tel:${phone}`} className="btn w-full bg-blue-600 hover:bg-blue-700 text-white border-none inline-flex items-center justify-center gap-2"><FaPhone /> {phone}</a>
            ) : (
              <div className="text-[var(--muted-text)]">No phone available</div>
            )}
          </div>
        </div>

        {(address || locationUrl) && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">الموقع</h2>
            {address && <div className="text-sm mb-2">{address}</div>}
            {locationUrl && (
              <a href={locationUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all">{locationUrl}</a>
            )}
          </div>
        )}

        {description && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">الوصف</h2>
            <p className="text-sm leading-6">{description}</p>
          </div>
        )}

        {images.length > 1 && (
          <div className="mt-6">
            <div className="text-sm text-[var(--muted-text)] mb-2">الصور</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {images.slice(0,8).map((src, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={src} alt={`${title}-${i}`} className="w-full h-24 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {floorPlans.length > 0 && (
          <div className="mt-6">
            <div className="text-sm text-[var(--muted-text)] mb-2">المخططات</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {floorPlans.slice(0,6).map((item, idx) => {
                const url = typeof item === 'string' ? item : ''
                const isPdf = url.toLowerCase().endsWith('.pdf')
                return isPdf ? (
                  <a key={idx} href={url} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm">
                    تحميل مخطط PDF
                  </a>
                ) : (
                  <div key={idx} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={url} alt={`plan-${idx}`} className="w-full h-24 object-cover" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {documents.length > 0 && (
          <div className="mt-6">
            <div className="text-sm text-[var(--muted-text)] mb-2">الملفات</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {documents.slice(0,6).map((doc, idx) => {
                const href = typeof doc === 'string' ? doc : ''
                return (
                  <a key={idx} href={href} target="_blank" rel="noreferrer" className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2 text-sm">
                    <span>ملف {idx+1}</span>
                    <span>تحميل</span>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {(videos && videos.length > 0) && (
          <div className="mt-6">
            <div className="text-sm text-[var(--muted-text)] mb-2">فيديو</div>
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <video src={videos[0]} controls className="w-full h-[280px] object-cover" />
            </div>
          </div>
        )}

        {(videoUrl || virtualTourUrl) && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">روابط الفيديو</h2>
            <div className="space-y-2">
              {videoUrl && <a href={videoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all">{videoUrl}</a>}
              {virtualTourUrl && <a href={virtualTourUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all">{virtualTourUrl}</a>}
            </div>
          </div>
        )}

        {installmentPlans.length > 0 && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">خطط التقسيط</h2>
            <div className="rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-transparent border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-start p-3">المقدم (%)</th>
                    <th className="text-start p-3">السنوات</th>
                    <th className="text-start p-3">الاستلام</th>
                  </tr>
                </thead>
                <tbody>
                  {installmentPlans.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="p-3">{r.downPayment}</td>
                      <td className="p-3">{r.years}</td>
                      <td className="p-3">{r.deliveryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
