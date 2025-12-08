import { useTranslation } from 'react-i18next'
import { 
  RiTimeLine, 
  RiCircleFill, 
  RiRefreshLine,
  RiMoreLine,
  RiUserStarLine,
  RiUserSettingsLine
} from 'react-icons/ri'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@shared/context/ThemeProvider'

export default function ActiveUsersChart({ users = [] }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'en'
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const isDark = !isLight
  const [refreshing, setRefreshing] = useState(false)
  const VISIBLE_USERS_COUNT = 3
  const ITEM_HEIGHT = 60
  const SCROLLBAR_CSS = `
    .scrollbar-thin-blue { scrollbar-width: thin; scrollbar-color: #94a3b8 transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar { width: 8px; }
    .scrollbar-thin-blue::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #94a3b8; border-radius: 9999px; }
    .scrollbar-thin-blue:hover::-webkit-scrollbar-thumb { background-color: #64748b; }
    .dark .scrollbar-thin-blue { scrollbar-color: #2563eb transparent; }
    .dark .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #2563eb; }
    .dark .scrollbar-thin-blue:hover::-webkit-scrollbar-thumb { background-color: #1d4ed8; }
  `

  const cardRef = useRef(null)
  const headerRef = useRef(null)
  const footerRef = useRef(null)
  const [contentMaxH, setContentMaxH] = useState(null)
  useEffect(() => {
    const measure = () => {
      const cardH = cardRef.current?.clientHeight || 0
      const headH = headerRef.current?.clientHeight || 0
      const footH = footerRef.current?.clientHeight || 0
      const calc = Math.max(cardH - headH - footH, 0)
      setContentMaxH(calc || null)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const defaultUsers = [
    { 
      name: lang === 'ar' ? 'إبراهيم أحمد' : 'Ibrahim Ahmed', 
      active: true, 
      lastSeen: new Date(),
      role: lang === 'ar' ? 'مدير' : 'Manager',
      avatar: '👨‍💼'
    },
    { 
      name: lang === 'ar' ? 'آدم محمد' : 'Adam Mohamed', 
      active: false, 
      lastSeen: new Date(Date.now() - (3 * 60 + 25) * 60 * 1000),
      role: lang === 'ar' ? 'مطور' : 'Developer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'سارة علي' : 'Sara Ali', 
      active: true, 
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      role: lang === 'ar' ? 'مصممة' : 'Designer',
      avatar: '👩‍🎨'
    },
    { 
      name: lang === 'ar' ? 'محمد حسن' : 'Mohamed Hassan', 
      active: false, 
      lastSeen: new Date(Date.now() - (26 * 60 + 5) * 60 * 1000),
      role: lang === 'ar' ? 'محلل' : 'Analyst',
      avatar: '👨‍📊'
    },
    { 
      name: lang === 'ar' ? 'فاطمة خالد' : 'Fatima Khaled', 
      active: true, 
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      role: lang === 'ar' ? 'مسوقة' : 'Marketer',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'زينب حسام' : 'Zeinab Hossam', 
      active: true, 
      lastSeen: new Date(Date.now() - 7 * 60 * 1000),
      role: lang === 'ar' ? 'مديرة التسويق' : 'Marketing Manager',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'كريم صلاح' : 'Karim Salah', 
      active: false, 
      lastSeen: new Date(Date.now() - 180 * 60 * 1000),
      role: lang === 'ar' ? 'مطور أمان' : 'Security Developer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'هدى عبدالله' : 'Hoda Abdullah', 
      active: true, 
      lastSeen: new Date(Date.now() - 20 * 60 * 1000),
      role: lang === 'ar' ? 'مصممة جرافيك' : 'Graphic Designer',
      avatar: '👩‍🎨'
    },
    { 
      name: lang === 'ar' ? 'طارق فؤاد' : 'Tarek Fouad', 
      active: true, 
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      role: lang === 'ar' ? 'مهندس DevOps' : 'DevOps Engineer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'رنا سمير' : 'Rana Samir', 
      active: false, 
      lastSeen: new Date(Date.now() - 240 * 60 * 1000),
      role: lang === 'ar' ? 'كاتبة محتوى' : 'Content Writer',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'حسام الدين' : 'Hossam Eldeen', 
      active: true, 
      lastSeen: new Date(Date.now() - 10 * 60 * 1000),
      role: lang === 'ar' ? 'مطور موبايل' : 'Mobile Developer',
      avatar: '👨‍💻'
    },
    { 
      name: lang === 'ar' ? 'مريم عادل' : 'Mariam Adel', 
      active: false, 
      lastSeen: new Date(Date.now() - 300 * 60 * 1000),
      role: lang === 'ar' ? 'محاسبة' : 'Accountant',
      avatar: '👩‍💼'
    },
    { 
      name: lang === 'ar' ? 'خالد وليد' : 'Khaled Waleed', 
      active: true, 
      lastSeen: new Date(Date.now() - 25 * 60 * 1000),
      role: lang === 'ar' ? 'مدير الموارد البشرية' : 'HR Manager',
      avatar: '👨‍💼'
    },
    { 
      name: lang === 'ar' ? 'دينا محمد' : 'Dina Mohamed', 
      active: true, 
      lastSeen: new Date(Date.now() - 6 * 60 * 1000),
      role: lang === 'ar' ? 'مطورة قواعد بيانات' : 'Database Developer',
      avatar: '👩‍💻'
    },
    { 
      name: lang === 'ar' ? 'عبدالرحمن أحمد' : 'Abdulrahman Ahmed', 
      active: false, 
      lastSeen: new Date(Date.now() - 150 * 60 * 1000),
      role: lang === 'ar' ? 'مهندس شبكات' : 'Network Engineer',
      avatar: '👨‍💻'
    }
  ]
  const dataUsers = users.length ? users : defaultUsers

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const formatHM = (d) => {
    try {
      return new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
    } catch {
      const pad = (n) => String(n).padStart(2, '0')
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }

  const formatRelative = (d) => {
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const rem = mins % 60
    if (lang === 'ar') {
      if (hours <= 0) return `قبل ${rem} دقيقة`
      return `قبل ${hours} ساعة و${rem} دقيقة`
    }
    if (hours <= 0) return `${rem} min ago`
    return `${hours}h ${rem}m ago`
  }


  const activeCount = dataUsers.filter(u => u.active).length
  const totalCount = dataUsers.length

  return (
    <div ref={cardRef} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div
        ref={headerRef}
        className={`${isLight ? 'bg-gradient-to-r from-blue-50 to-purple-100 text-slate-900 border-b border-gray-200' : 'bg-gray-900 text-white border-b border-gray-700'} p-3 flex-shrink-0`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLight ? 'bg-white' : 'bg-gray-800'}`}>
              <RiUserStarLine className="text-2xl" />
            </div>
            <div>
              <div className={`flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''} gap-2`}>
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{t('Active Users')}</h3>
              </div>
              <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} text-sm`}>
                {activeCount} {lang === 'ar' ? 'نشط من' : 'active of'} {totalCount} {lang === 'ar' ? 'مستخدمين' : 'users'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${isLight ? 'bg-white hover:bg-gray-100' : 'bg-gray-800 hover:bg-gray-700 text-white'} ${refreshing ? 'animate-spin' : ''}`}
              title={t('Refresh')}
            >
              <RiRefreshLine className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <style>{SCROLLBAR_CSS}</style>
      <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin-blue" style={{ maxHeight: (Array.isArray(dataUsers) && dataUsers.length <= 3) ? (Math.min(dataUsers.length, 3) * ITEM_HEIGHT) : (contentMaxH || (VISIBLE_USERS_COUNT * ITEM_HEIGHT)) }}>
            <div className="p-2 space-y-2">
              {dataUsers.map((u, idx) => (
                <div 
                  key={idx} 
                  className={`grid grid-cols-[auto,1fr,auto] items-center gap-2 p-2 rounded-lg border ${
                    (u.active ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center text-[var(--content-text)] dark:text-white text-sm font-bold shadow dark:shadow-lg">
                        {u.avatar || u.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        <RiCircleFill className="w-full h-full" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-[15px] sm:text-base truncate max-w-[14rem] text-black`}>{u.name}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-xs text-black`}>
                        <RiUserSettingsLine className={`text-xs ${isLight ? (u.active ? 'text-emerald-700' : 'text-red-700') : 'text-gray-300'}`} />
                        <span className="truncate max-w-[12rem] text-black">{u.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {u.active ? (
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-sm rounded-full font-semibold">
                          {lang === 'ar' ? 'متصل' : 'Online'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-sm rounded-full font-semibold">
                          {lang === 'ar' ? 'أوفلاين' : 'Offline'}
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 text-xs text-black mt-0.5`}>
                      <RiTimeLine className={`text-xs ${isLight ? (u.active ? 'text-emerald-700' : 'text-red-700') : 'text-gray-300'}`} />
                      <span>{formatHM(u.lastSeen)}</span>
                    </div>
                    <div className={`text-[11px] mt-0.5 text-black`}>
                      {formatRelative(u.lastSeen)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Footer Stats */}
      <div ref={footerRef} className={`px-3 py-2 border-t flex-shrink-0 ${isLight ? 'bg-[var(--lm-muted-surface)] border-white' : 'dark:bg-gray-700 dark:border-gray-600'}`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-black font-bold dark:text-white">
                {activeCount} {lang === 'ar' ? 'نشط' : 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-black font-bold dark:text-white">
                {totalCount - activeCount} {lang === 'ar' ? 'غير نشط' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="text-black font-semibold dark:text-gray-300">
            {lang === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {formatHM(new Date())}
          </div>
        </div>
      </div>
    </div>
  )
}
