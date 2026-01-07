import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Theme1 from './Theme1'
import Theme2 from './Theme2'

export default function LandingPageViewer() {
  const { slug } = useParams()

  const payload = useMemo(() => {
    if (!slug) return null
    try {
      // Try to find the page in localStorage
      // We assume landing pages are stored in a key 'landing_pages_data' as a map: { [slug]: data }
      const stored = localStorage.getItem('landing_pages_data')
      if (!stored) return null
      
      const pages = JSON.parse(stored)
      return pages[slug] || null
    } catch (err) {
      console.error('Failed to load landing page:', err)
      return null
    }
  }, [slug])

  // Handle Scripts Injection (copied from Preview)
  React.useEffect(() => {
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

  React.useEffect(() => {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500">The landing page "{slug}" does not exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Theme Selector
  const theme = payload.theme || 'theme1'
  
  return (
    <>
      {theme === 'theme1' && <Theme1 data={payload} />}
      {theme === 'theme2' && <Theme2 data={payload} />}
      {/* Add more themes here */}
    </>
  )
}
