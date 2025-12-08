import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppSidebar from '@shared/components/AppSidebar'
import Topbar from '@shared/components/Topbar'

export default function Layout({ children }) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(() => window.matchMedia('(max-width: 768px)').matches)

  // Lock scroll only when mobile sidebar is open
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile && isMobileSidebarOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [isMobileSidebarOpen])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => setIsMobileView(e.matches)
    mq.addEventListener('change', handler)
    setIsMobileView(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] app-glass-neon"
    >

      {/* Topbar */}
      <div className={`${isMobileSidebarOpen && isMobileView ? 'hidden md:block' : ''}`}>
        <Topbar
          onMobileToggle={() => setIsMobileSidebarOpen(v => !v)}
          mobileSidebarOpen={isMobileSidebarOpen}
        />
      </div>

      {/* Layout Wrapper */}
      <div className="flex w-full">
        {/* Sidebar (direct sibling) */}
        <AppSidebar 
          open={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content container (aligned with sidebar) */}
        <div className="content-container flex flex-col  min-h-0">
          <main className="main-pane flex-1 px-0 m-0">
            <div className="w-full">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
