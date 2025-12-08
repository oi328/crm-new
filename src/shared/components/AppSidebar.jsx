import React from 'react'
import { useTranslation } from 'react-i18next'
import { Sidebar } from './Sidebar'

export default function AppSidebar({ open = false, onClose, className = '' }) {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <>
      
      <Sidebar
        className={`${className}`}
        isOpen={open}
        onClose={onClose}
      />
    </>
  )
}
