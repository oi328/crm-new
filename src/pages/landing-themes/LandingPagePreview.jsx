import React, { useMemo, useEffect } from 'react'
import Theme1 from './Theme1'
import Theme2 from './Theme2'

export default function LandingPagePreview() {
  const searchStr = (() => {
    if (typeof window === 'undefined') return ''
    const h = window.location.hash || ''
    if (h.includes('?')) return h.split('?')[1]
    return window.location.search || ''
  })()
  
  const params = new URLSearchParams(searchStr)
  
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

  // Handle Scripts Injection
  useEffect(() => {
    if (!payload) return

    // Inject Header Script
    if (payload.headerScript) {
      const headScript = document.createElement('script')
      headScript.text = payload.headerScript
      document.head.appendChild(headScript)
      
      // Cleanup
      return () => {
        if (document.head.contains(headScript)) {
          document.head.removeChild(headScript)
        }
      }
    }
  }, [payload])

  useEffect(() => {
    if (!payload) return

    // Inject Body Script
    if (payload.bodyScript) {
      const bodyScript = document.createElement('script')
      bodyScript.text = payload.bodyScript
      document.body.appendChild(bodyScript)

      // Cleanup
      return () => {
        if (document.body.contains(bodyScript)) {
          document.body.removeChild(bodyScript)
        }
      }
    }
  }, [payload])

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Data Found</h1>
          <p className="text-gray-500">This preview link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  // Theme Selector (Expandable for more themes later)
  const theme = payload.theme || 'theme1'
  
  return (
    <>
      {theme === 'theme1' && <Theme1 data={payload} />}
      {theme === 'theme2' && <Theme2 data={payload} />}
      {/* Add more themes here */}
    </>
  )
}
