import React, { useMemo } from 'react'
import { FaMapMarkerAlt, FaCity, FaTags } from 'react-icons/fa'
import { useCompanySetup } from './settings/company-setup/store/CompanySetupContext.jsx'

export default function ProjectLanding() {
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
          <h1 className="text-2xl font-bold">Project</h1>
          <p className="mt-2 text-[var(--muted-text)]">Invalid or missing data.</p>
        </div>
      </div>
    )
  }

  const title = payload.name || 'Project'
  const city = payload.city || ''
  const image = payload.image || ''
  const developer = payload.developer || ''
  const description = payload.description || ''
  const priceMin = payload.minPrice || 0
  const priceMax = payload.maxPrice || 0
  const images = Array.isArray(payload.galleryImages) ? payload.galleryImages : (Array.isArray(payload.media) ? payload.media.filter(m => (m.type||'') === 'image').map(m => m.url).filter(Boolean) : [])
  const videos = Array.isArray(payload.videos) ? payload.videos : []
  const masterPlanImages = Array.isArray(payload.masterPlanImages) ? payload.masterPlanImages : []
  const videoUrls = payload.videoUrls || ''
  const mapUrl = payload.mapUrl || ''
  const address = payload.address || ''
  const paymentPlan = Array.isArray(payload.paymentPlan) ? payload.paymentPlan : []
  const minSpace = payload.minSpace || ''
  const maxSpace = payload.maxSpace || ''

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

        {(image || images.length > 0) && (
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img src={image || images[0]} alt={title} className="w-full h-[320px] object-cover" />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2"><FaCity className="opacity-70" /> <span>{developer || '-'}</span></div>
            <div className="flex items-center gap-2"><FaMapMarkerAlt className="opacity-70" /> <span>{city}</span></div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)] mb-1">Price Range</div>
            <div className="text-xl font-bold inline-flex items-center gap-2"><FaTags />
              <span>{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(priceMin||0)}</span>
              <span>—</span>
              <span>{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(priceMax||0)}</span>
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)] mb-1">Category</div>
            <div className="text-lg font-semibold">{payload.category || '-'}</div>
          </div>
        </div>

        {description && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">نظرة عامة</h2>
            <p className="text-sm leading-6">{description}</p>
          </div>
        )}

        {(minSpace || maxSpace) && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <div className="text-sm text-[var(--muted-text)] mb-1">المساحة</div>
            <div className="text-sm">{minSpace ? `من ${minSpace}` : ''} {maxSpace ? `إلى ${maxSpace}` : ''}</div>
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

        {masterPlanImages.length > 0 && (
          <div className="mt-6">
            <div className="text-sm text-[var(--muted-text)] mb-2">المخطط العام</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {masterPlanImages.slice(0,6).map((src, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={src} alt={`${title}-m-${i}`} className="w-full h-24 object-cover" />
                </div>
              ))}
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

        {videoUrls && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">روابط الفيديو</h2>
            <div className="space-y-2">
              {videoUrls.split('\n').map((url, i) => url.trim() && (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm break-all">{url}</a>
              ))}
            </div>
          </div>
        )}

        {(address || mapUrl) && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">الموقع</h2>
            {address && <div className="text-sm mb-2">{address}</div>}
            {mapUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <iframe src={mapUrl} className="w-full h-[320px] border-0" title="project-map" loading="lazy" />
              </div>
            )}
          </div>
        )}

        {paymentPlan.length > 0 && (
          <div className="mt-6 glass-panel rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">خطة الدفع</h2>
            <div className="rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-transparent border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-start p-3">#</th>
                    <th className="text-start p-3">البيان</th>
                    <th className="text-start p-3">التاريخ</th>
                    <th className="text-start p-3">القيمة</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentPlan.map((r, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="p-3">{r.no}</td>
                      <td className="p-3">{r.label}</td>
                      <td className="p-3">{r.dueDate}</td>
                      <td className="p-3 font-semibold">{new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(r.amount)}</td>
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
