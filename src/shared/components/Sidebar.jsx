import { useState, useEffect, useMemo, useRef } from 'react'
 import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '@shared/context/ThemeProvider'
import { useAppState } from '@shared/context/AppStateProvider'
import { useTranslation } from 'react-i18next';
import { useStages } from '@hooks/useStages';
import { RiCloseLine } from 'react-icons/ri'

// دالة ترجع أيقونة مناسبة لكل عنصر
const getIcon = (key) => {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    className: 'w-5 h-5',
    style: { display: 'block' } // Ensure consistent block display
  }

  switch (key) {
    case 'Dashboard':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="4" rx="1" />
          <rect x="14" y="11" width="6" height="9" rx="1" />
          <rect x="4" y="13" width="6" height="7" rx="1" />
        </svg>
      )
    case 'Lead Management':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="8" r="3" />
          <path d="M6 21v-2a6 6 0 0112 0v2" />
        </svg>
      )
    case 'Inventory':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 7l9-4 9 4v10l-9 4-9-4V7" />
          <path d="M3 7l9 4 9-4" />
        </svg>
      )
    case 'Marketing Modules':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 10v4l12 4V6L3 10z" />
          <path d="M19 8v8" />
          <circle cx="7" cy="12" r="2" />
        </svg>
      )
    case 'Customers':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="8" cy="9" r="2.5" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3 20v-1a5 5 0 015-5h8a5 5 0 015 5v1" />
        </svg>
      )
    case 'Reports':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 20V10" />
          <path d="M10 20V6" />
          <path d="M15 20V13" />
          <path d="M20 20V4" />
        </svg>
      )
    case 'User Management':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="8" r="3" />
          <path d="M4 20v-1a7 7 0 0116 0v1" />
        </svg>
      )
    case 'Support':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M21 12a9 9 0 10-18 0 3 3 0 003 3h1v3l4-3h6a3 3 0 003-3z" />
        </svg>
      )
    case 'Settings':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" />
          <path d="M19.4 15a7.5 7.5 0 000-6l-2 .7-1-1.7 1.3-1.6a9 9 0 00-6 0L12 7 10.3 5.4a9 9 0 00-6 0L5.6 7 4.6 8.7l-2-.7a7.5 7.5 0 000 6l2-.7 1 1.7-1.3 1.6a9 9 0 006 0L12 17l1.7 1.6a9 9 0 006 0L18.4 17l1-1.7 2 .7z" />
        </svg>
      )
    case 'Recycle Bin':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          <path d="M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      )
    case 'Contact us':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2" />
          <path d="M4 8l8 6 8-6" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
  }
}

// أيقونات العناصر الفرعية تحت قسم Inventory
const getInventoryItemIcon = (key) => {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    className: 'w-4 h-4',
    style: { display: 'block' }
  }

  switch (key) {
    case 'Families':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
          <circle cx="2" cy="6" r="1" />
          <circle cx="2" cy="12" r="1" />
          <circle cx="2" cy="18" r="1" />
        </svg>
      )
    case 'Overview':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    case 'Groups':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="9" height="9" rx="1" />
          <rect x="13" y="2" width="9" height="9" rx="1" />
          <rect x="2" y="13" width="9" height="9" rx="1" />
          <rect x="13" y="13" width="9" height="9" rx="1" />
        </svg>
      )
    case 'Categories':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 7h14" />
          <path d="M4 12h14" />
          <path d="M4 17h10" />
          <rect x="2" y="5" width="2" height="2" rx="0.5" />
          <rect x="2" y="10" width="2" height="2" rx="0.5" />
          <rect x="2" y="15" width="2" height="2" rx="0.5" />
        </svg>
      )
    case 'Brands':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    case 'Developers':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="5" width="6" height="14" rx="1" />
          <rect x="12" y="9" width="8" height="10" rx="1" />
          <path d="M6 7h2M6 10h2M6 13h2M6 16h2" />
          <path d="M14 11h2M14 14h2M14 17h2" />
        </svg>
      )
    case 'Brokers':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="8" r="2.5" />
          <path d="M2 20v-1a6 6 0 016-6" />
          <circle cx="17" cy="8" r="2.5" />
          <path d="M22 20v-1a6 6 0 00-6-6" />
          <path d="M8 14l4 3 4-3" />
        </svg>
      )
    case 'Products':
      // Box/package icon
      return (
        <svg {...common} aria-hidden="true">
          <path d="M12 3l7 4-7 4-7-4 7-4" />
          <path d="M5 7v7l7 4 7-4V7" />
        </svg>
      )
    case 'Items':
      // List/bullets icon
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 6h12" />
          <path d="M6 12h12" />
          <path d="M6 18h12" />
          <circle cx="3" cy="6" r="1" />
          <circle cx="3" cy="12" r="1" />
          <circle cx="3" cy="18" r="1" />
        </svg>
      )
    case 'Warehouse':
      // Warehouse shelves icon
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 7l9-4 9 4v10l-9 4-9-4V7" />
          <path d="M7 10h10" />
          <path d="M7 14h10" />
          <path d="M7 18h10" />
        </svg>
      )
    case 'Price Books':
      // Book/Price tag icon
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'Suppliers':
      // Truck/cart icon for suppliers/vendors
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="7" width="12" height="7" rx="1" />
          <path d="M15 10h3l2 3v1h-5v-4" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      )
    case 'Stock Management':
      // Clipboard/list icon for stock management
      return (
        <svg {...common} aria-hidden="true">
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      )
    case 'Transactions':
      // Bidirectional arrows icon for inventory transactions
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 8h10" />
          <path d="M13 6l2 2-2 2" />
          <path d="M19 16h-10" />
          <path d="M11 14l-2 2 2 2" />
        </svg>
      )
    case 'Projects':
      // Folder icon
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      )
    case 'Properties':
      // Home/house icon
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 10l9-7 9 7" />
          <path d="M5 10v9h14v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      )
    case 'Requests':
    case 'Requests (General)':
    case 'Requests (Real Estate)':
      // Inbox/document icon
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M7 10h10" />
          <path d="M7 7h10" />
        </svg>
      )
    case 'Buyer Requests':
      // User with arrow down (receive)
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="9" cy="8" r="2.5" />
          <path d="M3 20v-1a6 6 0 016-6" />
          <path d="M16 7v6" />
          <path d="M13 10l3 3 3-3" />
        </svg>
      )
    case 'Seller Requests':
      // User with arrow up (send)
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="9" cy="8" r="2.5" />
          <path d="M3 20v-1a6 6 0 016-6" />
          <path d="M16 13V7" />
          <path d="M13 10l3-3 3 3" />
        </svg>
      )
    case 'Dev Companies':
      // Office building icon
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="5" width="6" height="14" rx="1" />
          <rect x="12" y="9" width="8" height="10" rx="1" />
          <path d="M6 7h2M6 10h2M6 13h2M6 16h2" />
          <path d="M14 11h2M14 14h2M14 17h2" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      )
  }
}

// أيقونات عناصر التسويق
const getMarketingItemIcon = (key) => {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    className: 'w-4 h-4',
    style: { display: 'block' }
  }

  switch (key) {
    case 'Dashboard':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="4" rx="1" />
          <rect x="14" y="11" width="6" height="9" rx="1" />
          <rect x="4" y="13" width="6" height="7" rx="1" />
        </svg>
      )
    case 'Campaigns':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 5h10l6 4v6l-6 4H4V5z" />
          <circle cx="8" cy="12" r="2" />
        </svg>
      )
    case 'Landing Pages':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M4 9h16" />
          <path d="M8 13h8" />
        </svg>
      )
    case 'Meta Integration':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 12c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5z" />
          <path d="M7 12c1-3 3-5 4-5 2 0 4 4 6 5" />
        </svg>
      )
    case 'Leads Performance':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 18V6" />
          <path d="M8 18V10" />
          <path d="M12 18V8" />
          <path d="M16 18V13" />
          <path d="M20 18V5" />
        </svg>
      )
    case 'Reports':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M5 20V10" />
          <path d="M10 20V6" />
          <path d="M15 20V13" />
          <path d="M20 20V4" />
        </svg>
      )
    default:
      return (
        <svg {...common} aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      )
  }
}

export const Sidebar = ({ isOpen, onClose = () => {}, className, collapsed, setCollapsed }) => {
  const { activeModules, user } = useAppState()
  const { theme } = useTheme()
  const { t, i18n } = useTranslation();
  
  // Handle Collapsed State (Prop or Local)
  const [localCollapsed, setLocalCollapsed] = useState(false)
  const isCollapsed = collapsed !== undefined ? collapsed : localCollapsed
  const toggleCollapsed = () => {
    if (setCollapsed) setCollapsed(!isCollapsed)
    else setLocalCollapsed(!localCollapsed)
  }

  const location = useLocation();
  const navigate = useNavigate();
  const isLight = theme === 'light'
  const langCode = (i18n.language || '').toLowerCase();
  const isRTL = (typeof i18n.dir === 'function' ? i18n.dir(langCode) === 'rtl' : langCode.startsWith('ar'))
    || (typeof document !== 'undefined' && document.documentElement.dir === 'rtl');
  const navRef = useRef(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const isInventoryActive = location.pathname.startsWith('/inventory');
  const [leadMgmtOpen, setLeadMgmtOpen] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('leadMgmtOpen');
        if (saved === 'true') return true;
        if (saved === 'false') return false;
      }
    } catch {}
    return false; // مقفولة افتراضيًا
  })
  const isLeadMgmtActive = location.pathname.startsWith('/leads') || location.pathname.startsWith('/recycle');
  // أغلق قائمة الليد تلقائيًا عند الانتقال لأي مسار خارج الليد/الريسايكل
  useEffect(() => {
    if (!isLeadMgmtActive) {
      setLeadMgmtOpen(false);
      try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('leadMgmtOpen', 'false') } } catch {}
    }
  }, [location.pathname, isLeadMgmtActive])
  // افتح قسم إدارة العملاء تلقائيًا عند التواجد في مسارات الليد/الريسايكل
  useEffect(() => {
    if (isLeadMgmtActive) {
      setLeadMgmtOpen(true)
      try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('leadMgmtOpen', 'true') } } catch {}
    }
  }, [isLeadMgmtActive])
  const [stagesOpen, setStagesOpen] = useState(true)
  const isMarketingActive = location.pathname.startsWith('/marketing')
  const isMarketingReportsActive = location.pathname.startsWith('/marketing/reports')
const isRecycleActive = location.pathname.startsWith('/recycle')

// Sidebar expandable sections: open states
const [customersOpen, setCustomersOpen] = useState(false)
const [reportsOpen, setReportsOpen] = useState(false)
const [salesReportsOpen, setSalesReportsOpen] = useState(false)
const [usersOpen, setUsersOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Settings subsections open states
const [profileCompanyOpen, setProfileCompanyOpen] = useState(false)
const [systemSettingsOpen, setSystemSettingsOpen] = useState(false)
const [companySetupOpen, setCompanySetupOpen] = useState(false)
const [notificationsOpen, setNotificationsOpen] = useState(false)
const [billingOpen, setBillingOpen] = useState(false)
const [dataMgmtOpen, setDataMgmtOpen] = useState(false)

  // Accordion helpers
  const openOnly = (section) => {
    setProfileCompanyOpen(section === 'profileCompany')
    setSystemSettingsOpen(section === 'systemSettings')
    setCompanySetupOpen(section === 'companySetup')
    setNotificationsOpen(section === 'notifications')
    setBillingOpen(section === 'billing')
    setDataMgmtOpen(section === 'dataMgmt')
  }

  const handleAccordionToggle = (section) => {
    const isOpen = (
      (section === 'profileCompany' && profileCompanyOpen) ||
      (section === 'systemSettings' && systemSettingsOpen) ||
      (section === 'companySetup' && companySetupOpen) ||
      (section === 'notifications' && notificationsOpen) ||
      (section === 'billing' && billingOpen) ||
      (section === 'dataMgmt' && dataMgmtOpen)
    )
    if (isOpen) {
      openOnly('') // close all
    } else {
      openOnly(section)
    }
  }

  const onSidebarItemClick = (e) => {
    try {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    } catch {}
  }

// Active flags for top-level sections
// إبقاء قائمة Customers مفتوحة عند التنقل في مسارات العملاء والمبيعات الفرعية
const isCustomersActive = location.pathname.startsWith('/customers') || location.pathname.startsWith('/sales')
  const isSettingsActive = location.pathname.startsWith('/settings')
  const isIntegrationsActive = location.pathname.startsWith('/settings/integrations')
  const isOperationsActive = location.pathname.startsWith('/settings/operations')
  const isProfileCompanyActive = location.pathname.startsWith('/settings/profile')
  const isSystemSettingsActive = location.pathname.startsWith('/settings/system')
  const isCompanySetupActive = location.pathname.startsWith('/settings/company-setup')
  const isNotificationsTemplatesActive = location.pathname.startsWith('/settings/notifications')
  const isBillingActiveFlag = location.pathname.startsWith('/settings/billing')
  const isDataMgmtActiveFlag = location.pathname.startsWith('/settings/data')
  const roleLower = String(user?.role || '').toLowerCase()
  const isAdminOwnerUser = roleLower.includes('admin') || roleLower.includes('super admin') || roleLower.includes('owner')
const _isReportsActive = location.pathname.startsWith('/reports') || location.pathname.startsWith('/marketing/reports')
const isUsersActive = location.pathname.startsWith('/user-management')
  const isSupportActive = location.pathname.startsWith('/support')
  const isCoreReportsActive = location.pathname.startsWith('/reports')
  const isSalesReportsActive = location.pathname.startsWith('/reports/sales')
  
    // Restore missing Marketing submenu state with persistence and route-aware default
   const [marketingOpen, setMarketingOpen] = useState(() => {
     try {
       if (typeof window !== 'undefined' && window.localStorage) {
         const saved = window.localStorage.getItem('marketingOpen')
         if (saved === 'true') return true
         if (saved === 'false') return false
     }
    } catch {}
    return false
  })
   
   // Auto-close Marketing submenu when navigating away from marketing routes
  useEffect(() => {
    if (!isMarketingActive) {
      setMarketingOpen(false)
      try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('marketingOpen', 'false') } } catch {}
    }
  }, [location.pathname, isMarketingActive])

  // Ensure Marketing-only mode: close other module menus when on marketing routes
  useEffect(() => {
    if (isMarketingActive) {
      setLeadMgmtOpen(false)
      setInventoryOpen(false)
      setCustomersOpen(false)
      setReportsOpen(false)
      setUsersOpen(false)
      setSupportOpen(false)
      setSettingsOpen(false)
      try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('leadMgmtOpen', 'false') } } catch {}
    }
  }, [isMarketingActive])

  // Auto-open matching Settings subsection when navigating within it
useEffect(() => { if (isProfileCompanyActive) { openOnly('profileCompany') } else { setProfileCompanyOpen(false) } }, [isProfileCompanyActive])
useEffect(() => { if (isSystemSettingsActive) { openOnly('systemSettings') } else { setSystemSettingsOpen(false) } }, [isSystemSettingsActive])
useEffect(() => { if (isCompanySetupActive) { openOnly('companySetup') } else { setCompanySetupOpen(false) } }, [isCompanySetupActive])
useEffect(() => { if (isNotificationsTemplatesActive) { openOnly('notifications') } else { setNotificationsOpen(false) } }, [isNotificationsTemplatesActive])
useEffect(() => { if (isBillingActiveFlag) { openOnly('billing') } else { setBillingOpen(false) } }, [isBillingActiveFlag])
useEffect(() => { if (isDataMgmtActiveFlag) { openOnly('dataMgmt') } else { setDataMgmtOpen(false) } }, [isDataMgmtActiveFlag])

  const isSectionViewOpen = leadMgmtOpen || inventoryOpen || marketingOpen || customersOpen || reportsOpen || settingsOpen || usersOpen || supportOpen

  // Ensure Reports-only mode on core reports routes: close other module menus
  useEffect(() => {
    if (isCoreReportsActive) {
      setLeadMgmtOpen(false)
      setInventoryOpen(false)
      setCustomersOpen(false)
      setUsersOpen(false)
      setSupportOpen(false)
      setSettingsOpen(false)
      setMarketingOpen(false)
      setMarketingReportsOpen(false)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('leadMgmtOpen', 'false')
          window.localStorage.setItem('marketingOpen', 'false')
          window.localStorage.setItem('marketingReportsOpen', 'false')
        }
      } catch {}
    }
  }, [isCoreReportsActive])

  // Auto-open Settings submenu when on any /settings route; close when leaving
  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true)
    } else {
      setSettingsOpen(false)
    }
  }, [isSettingsActive])

  // Keep Inventory submenu in sync with /inventory routes
  useEffect(() => {
    setInventoryOpen(!!isInventoryActive)
  }, [isInventoryActive])

  // Keep Customers submenu in sync with /customers routes
  useEffect(() => {
    setCustomersOpen(!!isCustomersActive)
  }, [isCustomersActive])

  // Keep Support submenu in sync with /support routes
  useEffect(() => {
    setSupportOpen(!!isSupportActive)
  }, [isSupportActive])

  useEffect(() => {
    if (isSupportActive) {
      setLeadMgmtOpen(false)
      setInventoryOpen(false)
      setMarketingOpen(false)
      setCustomersOpen(false)
      setReportsOpen(false)
      setUsersOpen(false)
      setSettingsOpen(false)
    }
  }, [isSupportActive])

  // Keep User Management submenu in sync with /user-management routes
  useEffect(() => {
    setUsersOpen(!!isUsersActive)
  }, [isUsersActive])

  // Auto-open Reports submenu when on core reports routes, close when leaving
  useEffect(() => {
    if (isCoreReportsActive) {
      setReportsOpen(true)
    } else {
      setReportsOpen(false)
    }
  }, [isCoreReportsActive])

  // Keep Sales Report list open while on any of its child routes
  useEffect(() => {
    if (isSalesReportsActive) {
      setSalesReportsOpen(true)
    } else {
      setSalesReportsOpen(false)
    }
  }, [isSalesReportsActive])

  // Nested submenu state for Marketing Reports
  const [marketingReportsOpen, setMarketingReportsOpen] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('marketingReportsOpen')
        if (saved === 'true') return true
        if (saved === 'false') return false
      }
    } catch {}
    return false
  })
  useEffect(() => {
    if (!isMarketingReportsActive) {
      try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('marketingReportsOpen', String(marketingReportsOpen)) } } catch {}
    }
  }, [isMarketingReportsActive, marketingReportsOpen])
   
   const { stages } = useStages()
   const _safeStages = Array.isArray(stages) ? stages.map(s => typeof s === 'string' ? { name: s, nameAr: '', color: '#3B82F6', icon: '📊' } : s) : []
   const currentStageParam = (() => { try { return new URLSearchParams(location.search || '').get('stage') || null } catch { return null } })()
 
   // Leads data for counts and percentages (shared with Dashboard)
   const [refreshTrigger, setRefreshTrigger] = useState(0)
   const allLeads = useMemo(() => {
     try {
       const saved = localStorage.getItem('leadsData')
       if (!saved) return []
       const parsed = JSON.parse(saved)
       return Array.isArray(parsed) ? parsed : []
     } catch {
       return []
     }
   }, [refreshTrigger])
  const deletedLeads = useMemo(() => {
    try {
      const saved = localStorage.getItem('deletedLeads')
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [refreshTrigger])
  const _currentLeadsDataset = isRecycleActive ? deletedLeads : allLeads
   useEffect(() => {
     const handleStorageChange = () => setRefreshTrigger(prev => prev + 1)
     window.addEventListener('storage', handleStorageChange)
     window.addEventListener('leadsDataUpdated', handleStorageChange)
      window.addEventListener('deletedLeadsUpdated', handleStorageChange)
      setRefreshTrigger(prev => prev + 1)
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('leadsDataUpdated', handleStorageChange)
        window.removeEventListener('deletedLeadsUpdated', handleStorageChange)
      }
   }, [])

  // Helpers for color styles (hex and named presets)
  const _isHexColor = (c) => typeof c === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)
  const hexToRgb = (hex) => {
    try {
      let h = hex.replace('#', '')
      if (h.length === 3) h = h.split('').map((x) => x + x).join('')
      const bigint = parseInt(h, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return { r, g, b }
    } catch {
      return { r: 0, g: 0, b: 0 }
    }
  }
  const _withAlpha = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  const _COLOR_STYLES = {
    blue: { container: 'border-blue-400 dark:border-blue-500 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600', iconBg: 'bg-blue-600 dark:bg-blue-500' },
    green: { container: 'border-green-400 dark:border-green-500 bg-gradient-to-br from-green-100 via-green-200 to-green-300 dark:from-green-800 dark:via-green-700 dark:to-green-600', iconBg: 'bg-green-600 dark:bg-green-500' },
    yellow: { container: 'border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-300 dark:from-yellow-800 dark:via-yellow-700 dark:to-yellow-600', iconBg: 'bg-yellow-600 dark:bg-yellow-500' },
    red: { container: 'border-red-400 dark:border-red-500 bg-gradient-to-br from-red-100 via-red-200 to-red-300 dark:from-red-800 dark:via-red-700 dark:to-red-600', iconBg: 'bg-red-600 dark:bg-red-500' },
    purple: { container: 'border-purple-400 dark:border-purple-500 bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 dark:from-purple-800 dark:via-purple-700 dark:to-purple-600', iconBg: 'bg-purple-600 dark:bg-purple-500' },
    orange: { container: 'border-orange-400 dark:border-orange-500 bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 dark:from-orange-800 dark:via-orange-700 dark:to-orange-600', iconBg: 'bg-orange-600 dark:bg-orange-500' },
  }
  const [inventoryMode, setInventoryMode] = useState(() => {
    try {
      return typeof window !== 'undefined' ? (window.localStorage.getItem('inventoryMode') || 'Advanced') : 'Advanced'
    } catch { return 'Advanced' }
  })

  // Listen for inventory mode changes from settings
  useEffect(() => {
    const handleInventoryModeChange = () => {
      const newMode = window.localStorage.getItem('inventoryMode') || 'Advanced';
      setInventoryMode(newMode);
    };

    window.addEventListener('storage', handleInventoryModeChange);
    window.addEventListener('inventoryModeUpdated', handleInventoryModeChange);
    
    return () => {
      window.removeEventListener('storage', handleInventoryModeChange);
      window.removeEventListener('inventoryModeUpdated', handleInventoryModeChange);
    };
  }, []);

  // Expose toggle function for testing or settings page
  useEffect(() => {
    window.toggleInventoryMode = () => {
        setInventoryMode(prev => {
            const next = prev === 'Advanced' ? 'Simple' : 'Advanced';
            window.localStorage.setItem('inventoryMode', next);
            window.dispatchEvent(new Event('inventoryModeUpdated'));
            return next;
        });
    }
  }, []);

  const asideTone = isLight ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-gray-900 border-gray-800 text-gray-100'
  const baseLink = isLight
    ? 'group flex items-center gap-3 px-4 py-2.5 rounded-md text-gray-700 hover:bg-blue-50 transition overflow-hidden'
    : 'group flex items-center gap-3 px-4 py-2.5 rounded-md text-gray-200 hover:bg-gray-800 transition overflow-hidden'
  const iconContainer = 'flex-shrink-0 nova-icon flex items-center justify-center'
  const activeLink = isLight
    ? `bg-blue-100 text-blue-700 ${isRTL ? 'active-link-indicator' : 'border-l-4'} border-blue-500 font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]`
    : `bg-gray-800 text-blue-400 ${isRTL ? 'active-link-indicator' : 'border-l-4'} border-blue-500 font-bold`
  const iconTone = isLight ? 'text-gray-500 group-hover:text-blue-600' : 'text-gray-400 group-hover:text-blue-400'
  const backLabel = langCode.startsWith('ar') ? 'رجوع' : 'Back'

  const _items = [
    { to: '/', key: 'Dashboard' },
    { to: '/leads', key: 'Lead Management' },
    // Inventory & Marketing will be rendered as sections below
    { to: '/customers', key: 'Customers' },
    { to: '/reports', key: 'Reports' },
    { to: '/users', key: 'User Management' },
    { to: '/support', key: 'Support' },
    { to: '/settings', key: 'Settings' },
    // Contact us is rendered separately at the bottom
  ]

  const inventoryChildren = useMemo(() => {
    const isSimple = (inventoryMode || '').toLowerCase() === 'simple';
    return [
      { 
        key: 'General Inventory', 
        isSection: true,
        children: [
          ...(isSimple ? [] : [{ to: '/inventory/families', key: 'Families' }]),
          { to: '/inventory/categories', key: 'Categories' },
          ...(isSimple ? [] : [{ to: '/inventory/groups', key: 'Groups' }]),
          { to: '/inventory/brands', key: 'Brands' },
          { to: '/inventory/items', key: 'Items' },
          { to: '/inventory/price-books', key: 'Price Books' },
          { to: '/inventory/suppliers', key: 'Suppliers' },
          { to: '/inventory/requests', key: 'Requests (General)' },
        ]
      },
      { 
        key: 'Real Estate Inventory', 
        isSection: true,
        children: [
          { to: '/inventory/projects', key: 'Projects' },
          { to: '/inventory/buildings', key: 'Buildings' },
          { to: '/inventory/properties', key: 'Properties' },
          { to: '/inventory/real-estate-price-books', key: 'Price Books' },
          { to: '/inventory/developers', key: 'Developers' },
          { to: '/inventory/brokers', key: 'Brokers' },
          { to: '/inventory/real-estate-requests', key: 'Requests (Real Estate)' },
        ]
      },
    ]
  }, [inventoryMode]);

  const marketingChildren = [
    { to: '/marketing', key: 'Dashboard' },
    { to: '/marketing/campaigns', key: 'Campaigns' },
    { to: '/marketing/landing-pages', key: 'Landing Pages' },
    { to: '/marketing/meta-integration', key: 'Meta Integration' },
  ]

  const [integrationOpen, setIntegrationOpen] = useState(false)
  const [operationsOpen, setOperationsOpen] = useState(false)

  // Auto-open integrations/operations submenus when navigating within their routes
  useEffect(() => {
    setIntegrationOpen(!!isIntegrationsActive)
  }, [isIntegrationsActive])
  useEffect(() => {
    setOperationsOpen(!!isOperationsActive)
  }, [isOperationsActive])

  return (
    <aside 
      id="app-sidebar"
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`nova-sidebar group fixed inset-y-0 z-[130] md:z-[100] ${isCollapsed ? 'px-0' : 'px-4'} py-4 ${asideTone} flex flex-col h-full relative ${isCollapsed ? 'overflow-visible' : 'overflow-x-hidden overflow-y-hidden'} transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0' : 'w-[280px]'
      } ${
        isRTL ? 'right-0' : 'left-0'
      } ${isCollapsed ? '' : (isRTL ? 'border-l' : 'border-r')} ${isOpen ? 'sidebar-open' : ''} ${className || ''}`}
    >
      <button
        type="button"
        aria-label={isRTL ? 'إغلاق القائمة' : 'Close sidebar'}
        onClick={onClose}
        className={`md:hidden absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-[140] h-10 w-10 grid place-items-center rounded-full border backdrop-blur-sm shadow-lg transition ${isLight ? 'bg-black/10 hover:bg-black/20 border-black/20' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
      >
        <RiCloseLine className={`${isLight ? 'text-gray-900' : 'text-white'} text-2xl`} />
      </button>
      
      {/* Styles for collapsed state */}
      {isCollapsed && (
        <style>{`
          .link-label { display: none !important; }
          .nova-badge { display: none !important; }
          .close-btn span { display: none !important; }
        `}</style>
      )}



      {/* Logo and company name */}
        <button
          type="button"
          aria-label={t('Dashboard')}
          onClick={() => navigate('/dashboard')}
          className={`logo-brand flex items-center gap-2 mb-1 mt-0 cursor-pointer ${isCollapsed ? 'hidden' : ''}`}
        >
          {/* Inlined Logo SVG for dynamic coloring */}
          <svg width="36" height="36" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" className="flex-shrink-0">
            <defs>
              <linearGradient id="brandGradientSidebar" x1="12" y1="12" x2="116" y2="116" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={isLight ? '#0b2b4f' : '#ffffff'}/>
                <stop offset="45%" stopColor={isLight ? '#4f46e5' : '#c7d2fe'}/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect x="12" y="12" width="104" height="104" rx="18" stroke="url(#brandGradientSidebar)" strokeWidth="10" />
            <path d="M44 32 h24 c14 0 22 8 22 20 c0 8 -5 14 -12 16 c8 2 14 8 14 18 c0 12 -10 20 -24 20 H44 V32 Z" stroke="url(#brandGradientSidebar)" strokeWidth="10"/>
            <path d="M24 64 H64" stroke="url(#brandGradientSidebar)" strokeWidth="10"/>
            <path d="M64 64 l10 -6 l-4 6 l4 6 z" fill="url(#brandGradientSidebar)"/>
          </svg>
          <div className={`flex flex-col leading-tight min-w-0 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <span className={`sidebar-label whitespace-nowrap hidden md:block ${isLight ? 'text-[9px] text-[#0b2b4f]' : 'text-[8px] text-white'} opacity-90`}>Make everything...</span>
            <span className={`sidebar-label font-bold text-sm truncate bg-clip-text text-transparent bg-gradient-to-r ${isLight ? 'from-[#0b2b4f] via-[#4f46e5] to-[#7c3aed]' : 'from-[#ffffff] via-[#c7d2fe] to-[#7c3aed]'} drop-shadow-sm`}>Be Souhola</span>
          </div>
        </button>
      {/* Spacer below brand to push menu down */}
        <div className={`sidebar-brand-spacer h-2 ${isCollapsed ? 'hidden' : ''}`}></div>
      
        <nav ref={navRef} className={`flex-1 pt-2 md:pt-3 overflow-y-auto overflow-x-hidden mt-0 pb-3 ${inventoryOpen ? 'inventory-open' : ''} ${isCollapsed ? 'hidden' : ''}`}>
        {/* Dashboard */}
        {!isSectionViewOpen && !isMarketingActive && !isCoreReportsActive && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `${baseLink} !py-4 ${isActive ? activeLink : ''}`}
          >
            <span className="nova-icon-label">
              <span className={`${iconContainer} ${iconTone}`}>
                {getIcon('Dashboard')}
              </span>
              <span className="link-label">{t('Dashboard')}</span>
            </span>
            <span className="ml-auto nova-badge link-label">1</span>
          </NavLink>
        )}

        {/* Lead Management (gated by activeModules) */}
        {!isMarketingActive && !isCoreReportsActive && (!isSectionViewOpen || leadMgmtOpen) && activeModules.includes('leads') && (
          <div className="w-full">
          {leadMgmtOpen && (
            <div className={`sticky top-0 z-10 section-header flex items-center mb-2 ${isLight ? 'bg-gray-100' : 'bg-gray-900'} px-2 py-1`}>
              <span className="text-sm font-bold link-label">{t('Lead Management')}</span>
              <button type="button" onClick={() => setLeadMgmtOpen(false)} className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span>{backLabel}</span>
              </button>
            </div>
          )}
          {!leadMgmtOpen && (
            <NavLink
              to="/leads"
              end
              onClick={() => setLeadMgmtOpen(true)}
              className={() => `${baseLink} w-full justify-between`}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>{getIcon('Lead Management')}</span>
                <span className="link-label text-[16px]">{t('Lead Management')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: leadMgmtOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </NavLink>
          )}

          <div
            className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
            style={{ maxHeight: leadMgmtOpen ? '800px' : '0', overflow: 'hidden', opacity: leadMgmtOpen ? 1 : 0 }}
          >
            <NavLink
              to="/leads"
              end
              className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>{getIcon('Lead Management')}</span>
                <span className="text-[15px] link-label">{t('Leads')}</span>
              </span>
            </NavLink>
            <NavLink
              to="/leads/new"
              className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>{getIcon('Lead Management')}</span>
                <span className="text-[15px] link-label">{t('Add New Lead')}</span>
              </span>
            </NavLink>
            <NavLink
              to="/recycle"
              className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>{getIcon('Recycle Bin')}</span>
                <span className="text-[15px] link-label">{t('Recycle Bin')}</span>
              </span>
            </NavLink>

            <div className={`${isRTL ? '!pr-0' : '!pl-0'}`}>
              <button
                type="button"
                onClick={() => setStagesOpen(v => !v)}
                className={`${baseLink} w-full justify-between ${isRTL ? '!pr-0' : '!pl-0'}`}
              >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>🗂️</span>
                  <span className="text-[15px] link-label">{t('Stages')}</span>
                </span>
                <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: stagesOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div className="space-y-0.5" style={{ maxHeight: stagesOpen ? '600px' : '0', overflow: 'hidden', opacity: stagesOpen ? 1 : 0 }}>
                {[
                  { key: 'new lead', icon: '🆕' },
                  { key: 'duplicate', icon: '🔄' },
                  { key: 'pending', icon: '⏳' },
                  { key: 'cold calls', icon: '📞' },
                  { key: 'follow up', icon: '🔁' },
                ].map((s, idx) => {
                  const targetBase = location.pathname.startsWith('/recycle') ? '/recycle' : '/leads'
                  const toUrl = `${targetBase}?stage=${encodeURIComponent(s.key)}`
                  const isActiveStage = currentStageParam === s.key
                  const highlight = isActiveStage ? `glass-neon border ${isLight ? 'border-blue-200' : 'border-blue-900'}` : ''
                  return (
                    <NavLink
                      key={`fixed-stage-${idx}-${s.key}`}
                      to={toUrl}
                      className={() => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${highlight}`}
                    >
                      <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>{s.icon}</span><span className="text-[15px] link-label">{t(s.key)}</span></span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Inventory section with full-view submenu */}
        {!isMarketingActive && !isCoreReportsActive && (!isSectionViewOpen || inventoryOpen) && (
        <div className="w-full">
          {inventoryOpen ? (
            <div className={`sticky top-0 z-10 section-header flex items-center mb-2 ${isLight ? 'bg-gray-100' : 'bg-gray-900'} px-2 py-1`}>
              <span className="text-sm font-bold link-label text-[16px]">{t('Inventory')}</span>
              <button
                type="button"
                onClick={() => {
                  setInventoryOpen(false)
                  setCustomersOpen(false)
                  setSettingsOpen(false)
                  setReportsOpen(false)
                }}
                className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span>{backLabel}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setInventoryOpen(true)
                setCustomersOpen(false)
                setSettingsOpen(false)
                setReportsOpen(false)
              }}
              className={`${baseLink} w-full justify-between ${isInventoryActive ? 'active-parent' : ''}`}
              aria-expanded={inventoryOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>{getIcon('Inventory')}</span>
                <span className="link-label text-[16px]">{t('Inventory')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: inventoryOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          )}

          <div
            className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
            style={{ maxHeight: inventoryOpen ? '1000px' : '0', overflow: 'hidden', opacity: inventoryOpen ? 1 : 0 }}
          >
            {/** extra indent for all sub items */}
            {/** note: keeping baseLink styles while adding side-specific padding */}
            {/** subLinkIndent applied below per direction */}
            {inventoryChildren.map(child => {
              if (child.isSection) {
                return (
                  <div key={child.key} className="mt-2 mb-1">
                    <div className={`px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t(child.key)}
                    </div>
                    {child.children.map(subChild => (
                      <NavLink
                        key={subChild.to}
                        to={subChild.to}
                        className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-4' : '!pl-4'} ${isActive ? activeLink : ''}`}
                      >
                        <span className="nova-icon-label">
                          <span className={`${iconContainer} ${iconTone}`}>
                            {getInventoryItemIcon(subChild.key)}
                          </span>
                          <span className="text-[15px] link-label">{t(subChild.key)}</span>
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )
              }
              return (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
            >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>
                    {getInventoryItemIcon(child.key)}
                  </span>
                  <span className="text-[15px] link-label">{t(child.key)}</span>
                </span>
              </NavLink>
            )})}
          </div>
        </div>
        )}
 
        {/* Marketing section with subsections (gated by activeModules) */}
        {!isCoreReportsActive && (!isSectionViewOpen || marketingOpen) && activeModules.includes('campaigns') && (
        <div className="w-full">
          {(isMarketingActive || marketingOpen) && (
            <div className={`sticky top-0 z-10 section-header flex items-center mb-2 ${isLight ? 'bg-gray-100' : 'bg-gray-900'} px-2 py-1`}>
              <span className="text-sm font-bold link-label">{t('Marketing Modules')}</span>
              <button
                type="button"
                onClick={() => {
                  setMarketingOpen(false);
                  try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('marketingOpen', 'false') } } catch {}
                }}
                className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span>{backLabel}</span>
              </button>
            </div>
          )}
          {!marketingOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMarketingOpen(v => {
                  const next = !v;
                  try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('marketingOpen', String(next)); } } catch {}
                  return next;
                })
              }}
              className={`${baseLink} w-full justify-between ${isMarketingActive ? 'active-parent' : ''}`}
              aria-expanded={marketingOpen}
            >
              <span className="nova-icon-label min-w-0">
                <span className={`${iconContainer} ${iconTone}`}>{getIcon('Marketing Modules')}</span>
                <span className="text-[15px] link-label whitespace-nowrap truncate">{t('Marketing Modules')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: marketingOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
          )}

          <div
            className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
            style={{ maxHeight: marketingOpen ? '360px' : '0', overflow: 'hidden', opacity: marketingOpen ? 1 : 0 }}
          >
            {marketingChildren.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                end={child.to === '/marketing'}
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>
                    {getMarketingItemIcon(child.key)}
                  </span>
                  <span className="text-[15px] link-label">{t(child.key)}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </div>
        )}
 
        {/* Customers section with full-view submenu */}
        {!isMarketingActive && !isCoreReportsActive && (!isSectionViewOpen || customersOpen) && (
          <div className="w-full">
            {customersOpen ? (
              <div className={`sticky top-0 z-10 section-header flex items-center mb-2 glass-header glass-neon px-2 py-1`}>
                <span className="text-sm font-bold link-label">{t('Customers')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomersOpen(false)
                    setInventoryOpen(false)
                    setSettingsOpen(false)
                    setReportsOpen(false)
                  }}
                  className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>{backLabel}</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/customers"
                onClick={() => {
                  setCustomersOpen(true)
                  setInventoryOpen(false)
                  setSettingsOpen(false)
                  setReportsOpen(false)
                }}
                className={({ isActive }) => `${baseLink} w-full justify-between ${isActive ? `glass-neon border ${isLight ? 'border-blue-200' : 'border-blue-900'} active-parent` : ''}`}
              >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>{getIcon('Customers')}</span>
                  <span className="link-label">{t('Customers')}</span>
                </span>
                <span className="ml-auto nova-badge link-label">12</span>
                <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: customersOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </NavLink>
            )}
            <div
              className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all glass-neon`}
              style={{ maxHeight: customersOpen ? '800px' : '0', overflow: 'hidden', opacity: customersOpen ? 1 : 0 }}
            >
              <NavLink
                to="/customers"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>{getIcon('Customers')}</span><span className="text-[15px] link-label">{t('Customers')}</span></span>
              </NavLink>
              {/* Sales workflow pages under Customers (Sales Customers removed per request) */}
              <NavLink
                to="/sales/opportunities"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💼</span><span className="text-[15px] link-label">{t('Opportunities')}</span></span>
              </NavLink>
              <NavLink
                to="/sales/quotations"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🧾</span><span className="text-[15px] link-label">{t('Quotations')}</span></span>
              </NavLink>
              <NavLink
                to="/sales/orders"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📦</span><span className="text-[15px] link-label">{t('Sales Orders')}</span></span>
              </NavLink>
              <NavLink
                to="/sales/invoices"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💳</span><span className="text-[15px] link-label">{t('Invoices')}</span></span>
              </NavLink>
              {/* Customer Tickets removed per request */}
            </div>
          </div>
        )}

        {!isMarketingActive && !isCoreReportsActive && (!isSectionViewOpen || supportOpen) && (
          <div className="w-full">
            {supportOpen && (
              <div className={`${isLight ? 'bg-gray-100' : 'bg-gray-900'} sticky top-0 z-10 section-header flex items-center mb-2 px-2 py-1`}>
                <span className="text-sm font-bold link-label">{t('Support')}</span>
                <button type="button" onClick={() => setSupportOpen(false)} className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
                  <span>{backLabel}</span>
                </button>
              </div>
            )}
            {!supportOpen && (
              <button type="button" onClick={() => { setSupportOpen(true); setLeadMgmtOpen(false); setInventoryOpen(false); setMarketingOpen(false); setCustomersOpen(false); setReportsOpen(false); setUsersOpen(false); setSettingsOpen(false); }} className={`${baseLink} w-full justify-between ${isSupportActive ? 'active-parent' : ''}`} aria-expanded={supportOpen}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>{getIcon('Support')}</span><span className="link-label">{t('Support')}</span></span>
                <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: supportOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M6 9l6 6 6-6" /></svg>
                </span>
              </button>
            )}
            <div className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`} style={{ maxHeight: supportOpen ? '800px' : '0', overflow: 'hidden', opacity: supportOpen ? 1 : 0 }}>
              <NavLink to="/support" end className={({ isActive }) => `${baseLink} !py-3 ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🛟</span><span className="text-[15px] link-label">{t('Dashboard')}</span></span>
              </NavLink>
              <NavLink to="/support/tickets" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🎫</span><span className="text-[15px] link-label">{t('Tickets')}</span></span>
              </NavLink>
              <NavLink to="/support/customers" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>👥</span><span className="text-[15px] link-label">{t('Customers')}</span></span>
              </NavLink>
              <NavLink to="/support/sla" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>⏱️</span><span className="text-[15px] link-label">{t('SLA')}</span></span>
              </NavLink>
              <NavLink to="/support/reports" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📊</span><span className="text-[15px] link-label">{t('Reports')}</span></span>
              </NavLink>
              <NavLink to="/support/feedbacks" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>⭐</span><span className="text-[15px] link-label">{t('Feedbacks')}</span></span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Reports section with submenu */}
        {!isMarketingActive && (!isSectionViewOpen || reportsOpen) && (
          <div className="w-full">
            {reportsOpen && (
              <div className={`sticky top-0 z-10 section-header flex items-center mb-2 ${isLight ? 'bg-gray-100' : 'bg-gray-900'} px-2 py-1`}>
                <span className="text-sm font-bold link-label">{t('Reports')}</span>
                <button
                  type="button"
                  onClick={() => setReportsOpen(false)}
                  className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>{backLabel}</span>
                </button>
              </div>
            )}
            {!reportsOpen && (
              <button
                type="button"
                onClick={() => setReportsOpen(v => !v)}
                className={`${baseLink} w-full justify-between`}
                aria-expanded={reportsOpen}
              >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>{getIcon('Reports')}</span>
                  <span className="link-label">{t('Reports')}</span>
                </span>
                <span className="ml-auto nova-badge link-label">8</span>
                <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: reportsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
            )}
            <div
              className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: reportsOpen ? '800px' : '0', overflow: 'hidden', opacity: reportsOpen ? 1 : 0 }}
            >
              <NavLink
                to="/reports"
                end
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📊</span><span className="text-[15px] link-label">{t('Reports Dashboard')}</span></span>
              </NavLink>
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setSalesReportsOpen(v => !v)}
                  className={`${baseLink} w-full justify-between ${isRTL ? '!pr-0' : '!pl-0'}`}
                  aria-expanded={salesReportsOpen}
                >
                  <span className="nova-icon-label">
                    <span className={`${iconContainer} ${iconTone}`}>💼</span>
                    <span className="text-[15px] link-label">{t('Sales Report')}</span>
                  </span>
                  <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: salesReportsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`${isRTL ? '!pr-0' : '!pl-0'} space-y-0.5 transition-all`}
                  style={{ maxHeight: salesReportsOpen ? '800px' : '0', overflow: 'hidden', opacity: salesReportsOpen ? 1 : 0 }}
                >
                  <NavLink to="/reports/sales/activities" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📞</span><span className="text-[15px] link-label">{t('Sales Activities')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/pipeline" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📈</span><span className="text-[15px] link-label">{t('Leads pipeline')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/meetings" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}> 
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🗓️</span><span className="text-[15px] link-label">{t('Meetings Report')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/reservations" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📌</span><span className="text-[15px] link-label">{t('Reservations')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/closed-deals" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>✅</span><span className="text-[15px] link-label">{t('Closed Deals')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/rent" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏠</span><span className="text-[15px] link-label">{t('Rent')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/check-in" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>✔️</span><span className="text-[15px] link-label">{t('Check in Report')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/customers" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>👥</span><span className="text-[15px] link-label">{t('Customers Report')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/imports" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📥</span><span className="text-[15px] link-label">{t('Import')}</span></span>
                  </NavLink>
                  <NavLink to="/reports/sales/exports" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ''}`}>
                    <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📤</span><span className="text-[15px] link-label">{t('Export')}</span></span>
                  </NavLink>
                </div>
              </div>
              <NavLink
                to="/reports/leads"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🎯</span><span className="text-[15px] link-label">{t('Lead Report')}</span></span>
              </NavLink>
              
              
              <NavLink
                to="/reports/team"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>👥</span><span className="text-[15px] link-label">{t('Team Report')}</span></span>
              </NavLink>
              
              
              
            </div>
          </div>
        )}

        {/* User Management section with full-view submenu (same style as Inventory/Marketing) */}
        {!isMarketingActive && !isCoreReportsActive && (!isSectionViewOpen || usersOpen) && (
          <div className="w-full">
          {usersOpen ? (
              <div className={`sticky top-0 z-10 section-header flex items-center mb-2 ${isLight ? 'bg-gray-100' : 'bg-gray-900'} px-2 py-1`}>
                <span className="text-sm font-bold link-label">{t('User Management')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setUsersOpen(false)
                    setLeadMgmtOpen(false)
                    setInventoryOpen(false)
                    setMarketingOpen(false)
                    setCustomersOpen(false)
                    setSettingsOpen(false)
                    setReportsOpen(false)
                  }}
                  className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>{backLabel}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUsersOpen(true)
                  setLeadMgmtOpen(false)
                  setInventoryOpen(false)
                  setMarketingOpen(false)
                  setCustomersOpen(false)
                  setSettingsOpen(false)
                  setReportsOpen(false)
                }}
                className={`${baseLink} w-full justify-between ${isUsersActive ? 'active-parent' : ''}`}
                aria-expanded={usersOpen}
              >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>{getIcon('User Management')}</span>
                  <span className="link-label">{t('User Management')}</span>
                </span>
                <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: usersOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
            )}
            <div
              className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: usersOpen ? '480px' : '0', overflow: 'hidden', opacity: usersOpen ? 1 : 0 }}
            >
              <NavLink
                to="/user-management/users"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>👥</span><span className="text-[15px] link-label">{t('Users')}</span></span>
              </NavLink>
              <NavLink
                to="/user-management/teams"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🧑‍🤝‍🧑</span><span className="text-[15px] link-label">{t('Teams')}</span></span>
              </NavLink>
              <NavLink
                to="/user-management/departments"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏢</span><span className="text-[15px] link-label">{t('Departments')}</span></span>
              </NavLink>
              <NavLink
                to="/user-management/roles"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔑</span><span className="text-[15px] link-label">{t('Roles')}</span></span>
              </NavLink>
              <NavLink
                to="/user-management/activity-logs"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📝</span><span className="text-[15px] link-label">{t('Activity Logs')}</span></span>
              </NavLink>
              <NavLink
                to="/user-management/access-logs"
                className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-10' : '!pl-10'} ${isActive ? activeLink : ''}`}
              >
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔐</span><span className="text-[15px] link-label">{t('Access Logs')}</span></span>
              </NavLink>
            </div>
          </div>
        )}

        
        

       </nav>

      {/* Settings moved near bottom, above Contact us */}
      {!isMarketingActive && !isCoreReportsActive && (!isSectionViewOpen || settingsOpen) && activeModules.includes('settings') && (
        <div className="pt-2 w-full">
          <div className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-800'} mb-3`}></div>
            {settingsOpen ? (
              <div className={`sticky top-0 z-10 section-header flex items-center mb-2 ${isLight ? 'bg-gray-100' : 'bg-gray-900'} px-2 py-1`}>
                <span className="text-sm font-bold link-label">{t('Settings')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false)
                    setInventoryOpen(false)
                    setCustomersOpen(false)
                    setReportsOpen(false)
                  }}
                  className={`close-btn text-sm font-semibold ${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-200 hover:text-white'} flex items-center gap-2`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span>{backLabel}</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/settings/profile"
                onClick={() => {
                  setSettingsOpen(true)
                  setInventoryOpen(false)
                  setCustomersOpen(false)
                  setReportsOpen(false)
                }}
                className={() => `${baseLink} group/settings w-full justify-between ${isSettingsActive ? 'active-parent' : ''} bg-indigo-50 dark:bg-gray-800 border border-indigo-200 dark:border-gray-700`}
              >
                <span className="nova-icon-label">
                  <span className={`${iconContainer} ${iconTone}`}>{getIcon('Settings')}</span>
                <span className={`link-label !text-black group-hover/settings:!text-white`}>{t('Settings')}</span>
                </span>
                <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{transform: settingsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </NavLink>
            )}
            <div
              className={`${isRTL ? 'mr-0 pr-0 border-r' : 'ml-0 pl-0 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: settingsOpen ? '60vh' : '0', overflow: settingsOpen ? 'auto' : 'hidden', opacity: settingsOpen ? 1 : 0 }}
            >
            {/* Profile & Company (collapsible) */}
            <button
              type="button"
              onClick={() => handleAccordionToggle('profileCompany')}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={profileCompanyOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>👤</span>
                <span className="link-label">{t('Profile & Company')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: profileCompanyOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: profileCompanyOpen ? '300px' : '0', overflow: 'hidden', opacity: profileCompanyOpen ? 1 : 0 }}
            >
              <NavLink end to="/settings/profile" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>👤</span><span className="text-[15px] link-label">{t('Profile Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/profile/company" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏢</span><span className="text-[15px] link-label">{t('Company Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/profile/contact-info" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>☎️</span><span className="text-[15px] link-label">{t('Contact Info Settings')}</span></span>
              </NavLink>
            </div>

            {/* System Settings (collapsible) */}
            <button
              type="button"
              onClick={() => handleAccordionToggle('systemSettings')}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={systemSettingsOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>⚙️</span>
                <span className="link-label">{t('System Settings')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: systemSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: systemSettingsOpen ? '400px' : '0', overflow: 'hidden', opacity: systemSettingsOpen ? 1 : 0 }}
            >
              <NavLink to="/settings/system/preferences" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>⚙️</span><span className="text-[15px] link-label">{t('System Preferences')}</span></span>
              </NavLink>
              <NavLink to="/settings/system/modules" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🧩</span><span className="text-[15px] link-label">{t('Modules Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/system/security" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔐</span><span className="text-[15px] link-label">{t('Security Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/system/custom-fields" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🧾</span><span className="text-[15px] link-label">{t('Custom Fields')}</span></span>
              </NavLink>
              <NavLink to="/settings/system/audit-logs" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📝</span><span className="text-[15px] link-label">{t('Audit Logs')}</span></span>
              </NavLink>
            </div>

            {/* Company Setup (collapsible) */}
            <button
              type="button"
              onClick={() => handleAccordionToggle('companySetup')}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={companySetupOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>🏢</span>
                <span className="link-label">{t('Company Setup')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: companySetupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: companySetupOpen ? '360px' : '0', overflow: 'hidden', opacity: companySetupOpen ? 1 : 0 }}
            >
              <NavLink to="/settings/company-setup/info" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏢</span><span className="text-[15px] link-label">{t('Company Info')}</span></span>
              </NavLink>
              <NavLink to="/settings/company-setup/subscription" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💼</span><span className="text-[15px] link-label">{t('Subscription')}</span></span>
              </NavLink>
              <NavLink to="/settings/company-setup/modules" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🧩</span><span className="text-[15px] link-label">{t('Enabled Modules')}</span></span>
              </NavLink>
              <NavLink to="/settings/company-setup/departments" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏢</span><span className="text-[15px] link-label">{t('Departments')}</span></span>
              </NavLink>
              <NavLink to="/settings/company-setup/visibility" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>👁️</span><span className="text-[15px] link-label">{t('Visibility')}</span></span>
              </NavLink>
            </div>

            {/* Notifications & Templates (collapsible) */}
            <button
              type="button"
              onClick={() => handleAccordionToggle('notifications')}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={notificationsOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>🔔</span>
              <span className="link-label nova-multiline leading-tight">
                <span className="block">{t('Notifications')}</span>
                <span className="block">&amp;</span>
                <span className="block">{t('Templates')}</span>
              </span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: notificationsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: notificationsOpen ? '360px' : '0', overflow: 'hidden', opacity: notificationsOpen ? 1 : 0 }}
            >
              <NavLink end to="/settings/notifications" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔔</span><span className="text-[15px] link-label">{t('Notifications Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/notifications/sms-templates" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📱</span><span className="text-[15px] link-label">{t('SMS Templates')}</span></span>
              </NavLink>
              <NavLink to="/settings/notifications/email-templates" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>✉️</span><span className="text-[15px] link-label">{t('Email Templates')}</span></span>
              </NavLink>
              <NavLink to="/settings/notifications/whatsapp-templates" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🟢</span><span className="text-[15px] link-label">{t('WhatsApp Templates')}</span></span>
              </NavLink>
            </div>

            {/* Billing & Subscription (collapsible) */}
            <button
              type="button"
              onClick={() => handleAccordionToggle('billing')}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={billingOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>💳</span>
                <span className="link-label">{t('Billing & Subscription')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: billingOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: billingOpen ? '320px' : '0', overflow: 'hidden', opacity: billingOpen ? 1 : 0 }}
            >
              {isAdminOwnerUser && (
                <NavLink to="/settings/billing/subscription" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                  <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💳</span><span className="text-[15px] link-label">{t('Billing & Subscription')}</span></span>
                </NavLink>
              )}
              <NavLink to="/settings/billing/payment-history" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📒</span><span className="text-[15px] link-label">{t('Payment History')}</span></span>
              </NavLink>
              <NavLink to="/settings/billing/plans-upgrade" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>⬆️</span><span className="text-[15px] link-label">{t('Plans & Upgrade')}</span></span>
              </NavLink>
            </div>

            {/* Integrations (collapsible) */}
            <button
              type="button"
              onClick={() => setIntegrationOpen(v => !v)}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={integrationOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>🔗</span>
                <span className="link-label">{t('Integrations')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: integrationOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: integrationOpen ? '400px' : '0', overflow: 'hidden', opacity: integrationOpen ? 1 : 0 }}
            >
              <NavLink to="/settings/integrations/api-keys" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔑</span><span className="text-[15px] link-label">{t('API Keys')}</span></span>
              </NavLink>
              <NavLink to="/settings/integrations/webhooks" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🪝</span><span className="text-[15px] link-label">{t('Webhooks')}</span></span>
              </NavLink>
              <NavLink to="/settings/integrations/whatsapp" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🟢</span><span className="text-[15px] link-label">{t('WhatsApp Integration')}</span></span>
              </NavLink>
              <NavLink to="/settings/integrations/payment-gateway" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💳</span><span className="text-[15px] link-label">{t('Payment Gateway Integration')}</span></span>
              </NavLink>
              <NavLink to="/settings/integrations/google-slack" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🧰</span><span className="text-[15px] link-label">{t('Google / Slack Integrations')}</span></span>
              </NavLink>
            </div>

            {/* Data Management (collapsible) */}
            <button
              type="button"
              onClick={() => handleAccordionToggle('dataMgmt')}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={dataMgmtOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>💾</span>
                <span className="link-label">{t('Data Management')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: dataMgmtOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: dataMgmtOpen ? '320px' : '0', overflow: 'hidden', opacity: dataMgmtOpen ? 1 : 0 }}
            >
              <NavLink to="/settings/data/import" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>⬇️</span><span className="text-[15px] link-label">{t('Import')}</span></span>
              </NavLink>
              <NavLink to="/settings/data/export" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>⬆️</span><span className="text-[15px] link-label">{t('Export')}</span></span>
              </NavLink>
              <NavLink to="/settings/data/backup" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💾</span><span className="text-[15px] link-label">{t('Backup')}</span></span>
              </NavLink>
            </div>

            {/* Operations Configuration (collapsible) */}
            <button
              type="button"
              onClick={() => setOperationsOpen(v => !v)}
              className={`${baseLink} w-full justify-between`}
              aria-expanded={operationsOpen}
            >
              <span className="nova-icon-label">
                <span className={`${iconContainer} ${iconTone}`}>🛠️</span>
              <span className="link-label">{t('Configuration')}</span>
              </span>
              <span className={`link-label ${isLight ? 'text-gray-500' : 'text-gray-400'} transition-transform`} style={{ transform: operationsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`${isRTL ? 'mr-4 pr-2 border-r' : 'ml-4 pl-2 border-l'} border-gray-300 dark:border-gray-700 space-y-0.5 transition-all`}
              style={{ maxHeight: operationsOpen ? 'none' : '0', overflow: 'hidden', opacity: operationsOpen ? 1 : 0 }}
            >
              <NavLink end to="/settings/configuration" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📈</span><span className="text-[15px] link-label">{t('Pipeline Setup Stages')}</span></span>
              </NavLink>
              <NavLink to="/settings/configuration/cancel-reasons" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🗑️</span><span className="text-[15px] link-label">{t('Cancel Reasons')}</span></span>
              </NavLink>
              <NavLink to="/settings/configuration/payment-plans" onClick={onSidebarItemClick} className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>💳</span><span className="text-[15px] link-label">{t('Payment Plans')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/scripting" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📝</span><span className="text-[15px] link-label">{t('Scripting')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/eoi" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🗒️</span><span className="text-[15px] link-label">{t('EOI Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/reservation" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🗓️</span><span className="text-[15px] link-label">{t('Reservation Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/rotation" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔄</span><span className="text-[15px] link-label">{t('Rotation Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/contracts" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>📑</span><span className="text-[15px] link-label">{t('Contracts Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/buyer-request-reset" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}> 
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>♻️</span><span className="text-[15px] link-label">{t('Buyer Request Reset')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/matching" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🔍</span><span className="text-[15px] link-label">{t('Matching Settings')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/rent" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏠</span><span className="text-[15px] link-label">{t('Rent Configuration')}</span></span>
              </NavLink>
              <NavLink to="/settings/operations/cil" className={({ isActive }) => `${baseLink} ${isRTL ? '!pr-0' : '!pl-0'} ${isActive ? activeLink : ''}`}>
                <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>🏗️</span><span className="text-[15px] link-label">{t('CIL Settings')}</span></span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Contact us section */}
      <div className={`mt-auto pt-2 w-full ${isCollapsed ? 'hidden' : ''}`}>
        <div className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-800'} mb-3`}></div>
        <NavLink
          to="/contact"
          className={({ isActive }) => `${baseLink} group/contact ${isActive ? activeLink : ''} bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800`}
        >
          <span className="nova-icon-label"><span className={`${iconContainer} ${iconTone}`}>{getIcon('Contact us')}</span><span className={`link-label !text-black group-hover/contact:!text-white`}>{t('Contact us')}</span></span>
        </NavLink>
       </div>

       {/* Logout removed per request */}
    </aside>
  )
}
