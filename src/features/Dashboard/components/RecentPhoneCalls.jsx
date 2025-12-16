import React, { useState } from 'react';
import { useTheme } from '@shared/context/ThemeProvider';
import { useTranslation } from 'react-i18next';
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal';

const RecentPhoneCalls = ({ employee, dateFrom, dateTo, stageFilter }) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : (theme === 'dark');
  const isLight = !isDark;
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const SCROLLBAR_CSS = `
    .scrollbar-thin-blue { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar { width: 8px; }
    .scrollbar-thin-blue::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #2563eb; border-radius: 9999px; }
    .scrollbar-thin-blue:hover::-webkit-scrollbar-thumb { background-color: #1d4ed8; }
  `
  
  // Sample data for recent phone calls with employee actions
  const recentCalls = [
    {
      id: 1,
      employeeName: 'أحمد محمد',
      leadName: 'سارة أحمد',
      phoneNumber: '+966 50 123 4567',
      callType: 'outgoing',
      duration: '15:30',
      timestamp: 'منذ 5 دقائق',
      status: 'answered',
      notes: 'تمت مناقشة متطلبات العميل والجدولة في الأسبوع القادم'
    },
    {
      id: 2,
      employeeName: 'فاطمة علي',
      leadName: 'محمد خالد',
      phoneNumber: '+966 55 234 5678',
      callType: 'incoming',
      duration: '08:45',
      timestamp: 'منذ 12 دقيقة',
      status: 'answered',
      notes: 'استفسار عن المنتجات والأسعار'
    },
    {
      id: 3,
      employeeName: 'خالد عبدالله',
      leadName: 'نورة سعيد',
      phoneNumber: '+966 50 345 6789',
      callType: 'outgoing',
      duration: '22:15',
      timestamp: 'منذ 25 دقيقة',
      status: 'answered',
      notes: 'تم تأكيد الطلب وتحويله إلى قسم المبيعات'
    },
    {
      id: 4,
      employeeName: 'أمل حسن',
      leadName: 'عبدالرحمن علي',
      phoneNumber: '+966 55 456 7890',
      callType: 'missed',
      duration: '00:00',
      timestamp: 'منذ ساعة',
      status: 'missed',
      notes: 'تم إرسال رسالة نصية للمتابعة'
    },
    {
      id: 5,
      employeeName: 'سعيد إبراهيم',
      leadName: 'ليلى محمد',
      phoneNumber: '+966 50 567 8901',
      callType: 'incoming',
      duration: '18:20',
      timestamp: 'منذ ساعتين',
      status: 'answered',
      notes: 'شكوى عن خدمة العملاء - تم التحويل للمدير'
    },
    {
      id: 6,
      employeeName: 'نادية فهد',
      leadName: 'عمر يوسف',
      phoneNumber: '+966 50 678 9012',
      callType: 'outgoing',
      duration: '12:45',
      timestamp: 'منذ 3 ساعات',
      status: 'answered',
      notes: 'متابعة على طلب سابق والعميل مهتم بالعرض'
    },
    {
      id: 7,
      employeeName: 'منى سالم',
      leadName: 'فهد عبدالعزيز',
      phoneNumber: '+966 55 789 0123',
      callType: 'incoming',
      duration: '25:30',
      timestamp: 'منذ 4 ساعات',
      status: 'answered',
      notes: 'استفسار عن مواصفات المنتج ومقارنة الأسعار'
    },
    {
      id: 8,
      employeeName: 'عبدالله أحمد',
      leadName: 'أمينة خالد',
      phoneNumber: '+966 50 890 1234',
      callType: 'missed',
      duration: '00:00',
      timestamp: 'منذ 5 ساعات',
      status: 'missed',
      notes: 'تم إرسال بريد إلكتروني للمتابعة على المكالمة'
    },
    {
      id: 9,
      employeeName: 'ريم فهد',
      leadName: 'سعد محمد',
      phoneNumber: '+966 55 901 2345',
      callType: 'outgoing',
      duration: '19:15',
      timestamp: 'منذ 6 ساعات',
      status: 'answered',
      notes: 'تم عرض الحزمة المتقدمة والعميل مهتم بالشراء'
    },
    {
      id: 10,
      employeeName: 'يوسف إبراهيم',
      leadName: 'نورا علي',
      phoneNumber: '+966 50 012 3456',
      callType: 'incoming',
      duration: '14:20',
      timestamp: 'منذ 7 ساعات',
      status: 'answered',
      notes: 'استفسار عن حالة الطلب وموعد التوصيل المتوقع'
    }
  ];

  const withDates = recentCalls.map((c, idx) => ({
    ...c,
    createdAt: new Date(Date.now() - (idx + 1) * 15 * 60 * 1000).toISOString()
  }))

  const formatDateTimeSafe = (iso) => {
    try {
      const d = new Date(iso)
      const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(d)
    } catch {
      return iso || ''
    }
  }

  const inDateRange = (iso) => {
    if (!dateFrom && !dateTo) return true
    const d = new Date(iso)
    if (isNaN(d)) return true
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      if (day < from) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(0, 0, 0, 0)
      if (day > to) return false
    }
    return true
  }

  const matchesStage = (c) => {
    const s = String(stageFilter || '').toLowerCase()
    if (!s) return true
    if (s === 'coldcalls') return String(c.callType || '').toLowerCase() === 'outgoing'
    if (s === 'pending') return ['incoming','outgoing'].includes(String(c.callType || '').toLowerCase())
    if (s === 'followup') return String(c.callType || '').toLowerCase() === 'outgoing'
    if (s === 'duplicate') return false
    if (s === 'new') return true
    return true
  }
  const displayCalls = withDates.filter(c => (
    matchesStage(c) && (!employee || c.employeeName === employee) && inDateRange(c.createdAt)
  ))

  const getCallTypeIcon = (callType) => {
    switch (callType) {
      case 'outgoing':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'incoming':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L7.586 11H5a1 1 0 110-2h2.586l-1.293-1.293a1 1 0 010-1.414zM11 5a1 1 0 011 1v2.586l1.293-1.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 8.586V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case 'missed':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getCallTypeLabel = (callType) => {
    switch (callType) {
      case 'outgoing': return t('Outgoing');
      case 'incoming': return t('Incoming');
      case 'missed': return t('Missed');
      default: return callType;
    }
  };

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin-blue">
        {displayCalls.map((call) => (
          <div
            key={call.id}
            className={`p-3 rounded-lg border hover:shadow-md transition-shadow ${
              isLight
                ? (call.callType === 'missed'
                    ? 'bg-red-50 border-white'
                    : call.callType === 'outgoing'
                      ? 'bg-emerald-50 border-white'
                      : 'bg-blue-50 border-white')
                : 'dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getCallTypeIcon(call.callType)}
                <span
                  className={`text-xs font-semibold inline-flex items-center px-1.5 py-0.5 rounded ${
                    call.callType === 'outgoing'
                      ? (isLight ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' : 'text-emerald-300 bg-emerald-900/30 border border-emerald-700')
                      : call.callType === 'incoming'
                        ? (isLight ? 'text-blue-700 bg-blue-100 border border-blue-200' : 'text-blue-300 bg-blue-900/30 border border-blue-700')
                        : call.callType === 'missed'
                          ? (isLight ? 'text-red-700 bg-red-100 border border-red-200' : 'text-red-300 bg-red-900/30 border border-red-700')
                          : (isLight ? 'text-gray-700 bg-gray-100 border border-gray-200' : 'text-gray-300 bg-gray-900/30 border border-gray-700')
                  }`}
                >
                  {getCallTypeLabel(call.callType)}
                </span>
              </div>
              <span className={`text-xs ${isLight ? 'text-gray-800' : 'dark:text-gray-200'}`}>
                {formatDateTimeSafe(call.createdAt)}
              </span>
            </div>
            
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'dark:text-gray-200'}`}>
                  {t('Employee')}:
                </span>
                <span className={`text-sm ${isLight ? 'text-gray-900' : 'dark:text-white'}`}>
                  {call.employeeName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'dark:text-gray-200'}`}>
                  {t('Lead')}:
                </span>
                <span className={`text-sm ${isLight ? 'text-gray-900' : 'dark:text-white'}`}>
                  {call.leadName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'dark:text-gray-200'}`}>
                  {t('Phone')}:
                </span>
                <span className={`text-sm ${isLight ? 'text-gray-900' : 'dark:text-white'}`}>
                  {call.phoneNumber}
                </span>
              </div>
              
              {call.duration !== '00:00' && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'dark:text-gray-200'}`}>
                    {t('Duration')}:
                  </span>
                  <span className={`text-sm ${isLight ? 'text-gray-900' : 'dark:text-white'}`}>
                    {call.duration}
                  </span>
                </div>
              )}
            </div>
            
            {call.notes && (
              <div className="mt-2 p-2 bg-[var(--lm-surface)] dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-white">
                <span className="font-medium">{t('Notes')}:</span> {call.notes}
              </div>
            )}
            
            <div className="mt-2 flex justify-end">
              <button 
                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                onClick={() => {
                  setSelectedLead({ fullName: call.leadName, mobile: call.phoneNumber });
                  setIsLeadModalOpen(true);
                }}
              >
                {t('View Lead')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <EnhancedLeadDetailsModal
        isOpen={isLeadModalOpen}
        lead={selectedLead}
        onClose={() => setIsLeadModalOpen(false)}
        isArabic={i18n.language === 'ar'}
      />
    </>
  );
};

export default RecentPhoneCalls;
