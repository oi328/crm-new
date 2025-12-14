import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/context/ThemeProvider';
import EnhancedLeadDetailsModal from '@shared/components/EnhancedLeadDetailsModal';

export const Comments = ({ employee, dateFrom, dateTo, stageFilter }) => {
  const { t, i18n } = useTranslation();
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const SCROLLBAR_CSS = `
    .scrollbar-thin-blue { scrollbar-width: thin; scrollbar-color: #2563eb transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar { width: 8px; }
    .scrollbar-thin-blue::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin-blue::-webkit-scrollbar-thumb { background-color: #2563eb; border-radius: 9999px; }
    .scrollbar-thin-blue:hover::-webkit-scrollbar-thumb { background-color: #1d4ed8; }
  `
  
  // Enhanced sample data showing real employee-lead interactions
  const recentComments = [
    {
      id: 1,
      employeeName: 'أحمد محمد',
      leadName: 'سارة أحمد',
      comment: 'العميل مهتم جداً بالمنتج وسيقوم بالشراء الأسبوع القادم',
      timestamp: 'منذ 5 دقائق',
      type: 'follow_up',
      priority: 'high'
    },
    {
      id: 2,
      employeeName: 'فاطمة علي',
      leadName: 'محمد خالد',
      comment: 'تم إرسال عرض السعر وتنتظر الموافقة',
      timestamp: 'منذ 15 دقيقة',
      type: 'proposal',
      priority: 'medium'
    },
    {
      id: 3,
      employeeName: 'خالد عبدالله',
      leadName: 'نورة سعيد',
      comment: 'العميل طلب مزيد من المعلومات التقنية حول المنتج',
      timestamp: 'منذ 30 دقيقة',
      type: 'inquiry',
      priority: 'low'
    },
    {
      id: 4,
      employeeName: 'أمل حسن',
      leadName: 'عبدالرحمن علي',
      comment: 'تم حل مشكلة الخدمة والعميل راضٍ عن النتيجة',
      timestamp: 'منذ ساعة',
      type: 'support',
      priority: 'medium'
    },
    {
      id: 5,
      employeeName: 'سعيد إبراهيم',
      leadName: 'ليلى محمد',
      comment: 'تم تأكيد الموعد غداً الساعة 3 مساءً في المكتب',
      timestamp: 'منذ ساعتين',
      type: 'meeting',
      priority: 'high'
    },
    {
      id: 6,
      employeeName: 'نادية فهد',
      leadName: 'عمر يوسف',
      comment: 'العميل يحتاج للتفكير وطلب الاتصال به الأسبوع القادم',
      timestamp: 'منذ 3 ساعات',
      type: 'follow_up',
      priority: 'low'
    },
    {
      id: 7,
      employeeName: 'منى سالم',
      leadName: 'فهد عبدالعزيز',
      comment: 'تم التفاوض على السعر والعميل يطلب خصم إضافي',
      timestamp: 'منذ 4 ساعات',
      type: 'proposal',
      priority: 'high'
    },
    {
      id: 8,
      employeeName: 'عبدالله أحمد',
      leadName: 'أمينة خالد',
      comment: 'العميل مهتم بالحزمة المتقدمة ويريد عرض سعر مخصص',
      timestamp: 'منذ 5 ساعات',
      type: 'inquiry',
      priority: 'medium'
    },
    {
      id: 9,
      employeeName: 'ريم فهد',
      leadName: 'سعد محمد',
      comment: 'تم إصلاح المشكلة التقنية والعميل سعيد بالخدمة',
      timestamp: 'منذ 6 ساعات',
      type: 'support',
      priority: 'low'
    },
    {
      id: 10,
      employeeName: 'يوسف إبراهيم',
      leadName: 'نورا علي',
      comment: 'تم تحديد موعد العرض التجريبي يوم الثلاثاء القادم',
      timestamp: 'منذ 7 ساعات',
      type: 'meeting',
      priority: 'high'
    }
  ];

  const withDates = recentComments.map((c, idx) => ({
    ...c,
    createdAt: new Date(Date.now() - (idx + 1) * 20 * 60 * 1000).toISOString()
  }))

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
    if (s === 'pending') return ['follow_up','proposal','inquiry'].includes(String(c.type || '').toLowerCase())
    if (s === 'followup') return ['follow_up','meeting'].includes(String(c.type || '').toLowerCase())
    if (s === 'coldcalls') return false
    if (s === 'duplicate') return false
    if (s === 'new') return true
    return true
  }
  const displayComments = withDates.filter(c => (
    matchesStage(c) && (!employee || c.employeeName === employee) && inDateRange(c.createdAt)
  ))

  const getPriorityColor = (priority) => {
    if (isLight) {
      // في اللايت مود: خلفية فاتحة غير بيضاء وحد أبيض كما طلبت
      return 'border-white bg-[var(--lm-muted-surface)]';
    }
    switch (priority) {
      case 'high':
        return 'dark:bg-red-900/20 dark:border-red-700';
      case 'medium':
        return 'dark:bg-yellow-900/20 dark:border-yellow-700';
      case 'low':
        return 'dark:bg-green-900/20 dark:border-green-700';
      default:
        return 'dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCommentTypeIcon = (type) => {
    switch (type) {
      case 'follow_up':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'proposal':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case 'inquiry':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      case 'support':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>
      <div className={`overflow-x-auto scrollbar-thin-blue ${displayComments.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
        <div className="sm:hidden space-y-3">
          {displayComments.map((comment) => (
            <div 
              key={comment.id} 
              className={`p-3 rounded-lg border ${getPriorityColor(comment.priority)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCommentTypeIcon(comment.type)}
                  <div className={`w-2 h-2 rounded-full ${getPriorityDot(comment.priority)}`}></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {comment.timestamp}
                </span>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>{t('Employee')}:</span>
                  <span className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{comment.employeeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>{t('Lead')}:</span>
                  <span className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-gray-200'}`}>{comment.leadName}</span>
                </div>
              </div>
              <div className="mt-2 p-2 bg-[var(--lm-surface)] dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                {comment.comment}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('Priority')}: {t(comment.priority)}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('Stage')}: {t(comment.type)}</span>
                </div>
                <button 
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  onClick={() => { setSelectedLead({ fullName: comment.leadName }); setIsLeadModalOpen(true); }}
                >
                  {t('View Lead')}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:block">
          <table className="comments-table w-full min-w-max text-sm text-left">
            <thead className={`text-xs uppercase sticky top-0 ${isLight ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <tr>
                <th scope="col" className="px-6 py-3">{t('Employee')}</th>
                <th scope="col" className="px-6 py-3">{t('Lead')}</th>
                <th scope="col" className="px-6 py-3">{t('Comment')}</th>
                <th scope="col" className="px-6 py-3">{t('Priority')}</th>
                <th scope="col" className="px-6 py-3">{t('Stage')}</th>
                <th scope="col" className="px-6 py-3">{t('Actions')}</th>
                <th scope="col" className="px-6 py-3">{t('Action time')}</th>
              </tr>
            </thead>
            <tbody>
              {displayComments.map((comment) => (
                <tr key={comment.id} className={`border-b ${isLight ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-gray-800 border-gray-700 dark:hover:bg-blue-900/25'}`}>
                  <td className="px-6 py-4">{comment.employeeName}</td>
                  <td className={`px-6 py-4`}>{comment.leadName}</td>
                  <td className={`px-6 py-4`}>{comment.comment}</td>
                  <td className={`px-6 py-4`}>{t(comment.priority)}</td>
                  <td className={`px-6 py-4`}>{t(comment.type)}</td>
                  <td className={`px-6 py-4`}>
                    <button 
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                      onClick={() => { setSelectedLead({ fullName: comment.leadName }); setIsLeadModalOpen(true); }}
                    >
                      {t('View Lead')}
                    </button>
                  </td>
                  <td className={`px-6 py-4`}>{comment.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
