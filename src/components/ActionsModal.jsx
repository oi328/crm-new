import React, { useState } from 'react';
import { 
  FaTimes, FaDownload, FaPrint, FaShare, FaEdit, FaTrash, 
  FaPhone, FaEnvelope, FaCalendarAlt, FaStickyNote, 
  FaHandshake, FaChartLine, FaHistory, FaPlus
} from 'react-icons/fa';

const ActionsModal = ({ isOpen, onClose, lead, theme = 'light', isArabic = false }) => {
  const [selectedAction, setSelectedAction] = useState(null);

  // Theme colors
  const isDark = theme === 'dark';
  const colors = {
    modalBg: isDark ? 'bg-gray-800' : 'bg-white',
    cardBg: isDark ? 'bg-gray-700' : 'bg-gray-50',
    headerBg: isDark ? 'bg-gray-900' : 'bg-slate-100',
    
    // نصوص
    primaryText: isDark ? 'text-gray-100' : 'text-gray-800',
    secondaryText: isDark ? 'text-gray-300' : 'text-gray-600',
    
    // حدود
    border: isDark ? 'border-gray-600' : 'border-gray-200',
    
    // أزرار
    primaryBtn: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    secondaryBtn: isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
    dangerBtn: isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600',
    
    // تفاعل
    hover: isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50',
  };

  const actions = [
    {
      id: 'download',
      title: isArabic ? 'تحميل' : 'Download',
      description: isArabic ? 'تحميل بيانات العميل' : 'Download lead data',
      icon: FaDownload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => console.log('Download action')
    },
    {
      id: 'print',
      title: isArabic ? 'طباعة' : 'Print',
      description: isArabic ? 'طباعة تفاصيل العميل' : 'Print lead details',
      icon: FaPrint,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => console.log('Print action')
    },
    {
      id: 'share',
      title: isArabic ? 'مشاركة' : 'Share',
      description: isArabic ? 'مشاركة بيانات العميل' : 'Share lead information',
      icon: FaShare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      onClick: () => console.log('Share action')
    },
    {
      id: 'edit',
      title: isArabic ? 'تعديل' : 'Edit',
      description: isArabic ? 'تعديل بيانات العميل' : 'Edit lead information',
      icon: FaEdit,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      onClick: () => console.log('Edit action')
    },
    {
      id: 'call',
      title: isArabic ? 'اتصال' : 'Call',
      description: isArabic ? 'إجراء مكالمة هاتفية' : 'Make a phone call',
      icon: FaPhone,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      onClick: () => console.log('Call action')
    },
    {
      id: 'email',
      title: isArabic ? 'بريد إلكتروني' : 'Email',
      description: isArabic ? 'إرسال بريد إلكتروني' : 'Send an email',
      icon: FaEnvelope,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      onClick: () => console.log('Email action')
    },
    {
      id: 'schedule',
      title: isArabic ? 'جدولة' : 'Schedule',
      description: isArabic ? 'جدولة موعد أو اجتماع' : 'Schedule appointment',
      icon: FaCalendarAlt,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      onClick: () => console.log('Schedule action')
    },
    {
      id: 'note',
      title: isArabic ? 'ملاحظة' : 'Add Note',
      description: isArabic ? 'إضافة ملاحظة جديدة' : 'Add a new note',
      icon: FaStickyNote,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: () => console.log('Note action')
    },
    {
      id: 'deal',
      title: isArabic ? 'صفقة' : 'Create Deal',
      description: isArabic ? 'إنشاء صفقة جديدة' : 'Create a new deal',
      icon: FaHandshake,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      onClick: () => console.log('Deal action')
    },
    {
      id: 'analytics',
      title: isArabic ? 'تحليلات' : 'Analytics',
      description: isArabic ? 'عرض تحليلات العميل' : 'View lead analytics',
      icon: FaChartLine,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      onClick: () => console.log('Analytics action')
    },
    {
      id: 'history',
      title: isArabic ? 'السجل' : 'History',
      description: isArabic ? 'عرض سجل الأنشطة' : 'View activity history',
      icon: FaHistory,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      onClick: () => console.log('History action')
    },
    {
      id: 'delete',
      title: isArabic ? 'حذف' : 'Delete',
      description: isArabic ? 'حذف العميل المحتمل' : 'Delete lead',
      icon: FaTrash,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => console.log('Delete action')
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-6">
      <div className={`${colors.modalBg} sm:rounded-3xl shadow-2xl w-full h-screen sm:max-w-4xl sm:max-h-[90vh] sm:h-auto overflow-y-auto`}>
        
        {/* Header */}
        <div className={`${colors.headerBg} p-8 border-b ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-3xl font-bold ${colors.primaryText} mb-2`}>
                {isArabic ? 'الإجراءات المتاحة' : 'Available Actions'}
              </h2>
              <p className={`${colors.secondaryText} text-lg`}>
                {isArabic ? 'اختر الإجراء المطلوب تنفيذه' : 'Choose the action you want to perform'}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-4 ${colors.secondaryBtn} rounded-2xl ${colors.primaryText} transition-all duration-300 hover:scale-105`}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => {
                  setSelectedAction(action.id);
                  action.onClick();
                  // يمكن إضافة منطق إضافي هنا
                }}
                className={`${colors.cardBg} rounded-2xl p-6 border ${colors.border} transition-all duration-300 hover:scale-105 ${colors.hover} group text-left`}
              >
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className={`${action.bgColor} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`${action.color} text-2xl`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`${colors.primaryText} font-semibold text-lg mb-2`}>
                      {action.title}
                    </h3>
                    <p className={`${colors.secondaryText} text-sm`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`${colors.headerBg} p-6 border-t ${colors.border}`}>
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className={`px-8 py-3 ${colors.secondaryBtn} rounded-xl ${colors.primaryText} font-medium transition-all duration-300 hover:scale-105`}
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionsModal;