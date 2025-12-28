import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaPhone, FaEnvelope, FaCalendarAlt, FaComments, FaHandshake, FaFileAlt, FaCheck, FaMapMarkerAlt, FaToggleOn, FaToggleOff, FaChevronDown } from 'react-icons/fa';
import { useTheme } from '../shared/context/ThemeProvider.jsx';

const AddActionModal = ({ isOpen, onClose, onSave, lead, inline = false, initialType = 'call' }) => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [actionData, setActionData] = useState({
    type: initialType,
    actionType: initialType,
    nextAction: 'follow_up',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    notes: '',
    meetingType: 'introduction',
    meetingLocation: 'indoor',
    answerStatus: 'answer',
    selectedQuickOption: null,
    proposalAmount: '',
    proposalDiscount: '',
    proposalValidityDays: '',
    proposalAttachmentUrl: '',
    reservationProject: '',
    reservationUnit: '',
    reservationAmount: '',
    rentUnit: '',
    rentStart: '',
    rentEnd: '',
    rentAmount: ''
  });

  // عدم الإرجاع قبل الهوكس لضمان استدعائها دومًا

  const isArabic = i18n.language === 'ar';

  const actionTypes = [
    { value: 'call', label: isArabic ? 'مكالمة' : 'Call', icon: FaPhone, color: 'bg-blue-500' },
    { value: 'whatsapp', label: 'WhatsApp', icon: FaComments, color: 'bg-green-500' },
    { value: 'email', label: isArabic ? 'بريد' : 'Email', icon: FaEnvelope, color: 'bg-yellow-500' },
    { value: 'google_meet', label: 'Google Meet', icon: FaCalendarAlt, color: 'bg-purple-500' },
    { value: 'send_offer', label: isArabic ? 'إرسال عرض سعر' : 'Send Offer', icon: FaFileAlt, color: 'bg-teal-500' }
  ];

  const nextActionOptions = [
    { value: 'follow_up', label: isArabic ? 'متابعة' : 'Follow Up' },
    { value: 'meeting', label: isArabic ? 'اجتماع' : 'Meeting' },
    { value: 'proposal', label: isArabic ? 'عرض سعر' : 'Proposal' },
    { value: 'reservation', label: isArabic ? 'حجز' : 'Reservation' },
    { value: 'closing_deals', label: isArabic ? 'إغلاق الصفقات' : 'Closing Deals' },
    { value: 'rent', label: isArabic ? 'إيجار' : 'Rent' },
    { value: 'cancel', label: isArabic ? 'إلغاء' : 'Cancel' }
  ];

  const meetingTypes = [
    { value: 'introduction', label: isArabic ? 'اجتماع تعريفي' : 'Introduction Meeting' },
    { value: 'follow_up', label: isArabic ? 'اجتماع متابعة' : 'Follow-up Meeting' },
    { value: 'presentation', label: isArabic ? 'اجتماع عرض' : 'Presentation Meeting' },
    { value: 'negotiation', label: isArabic ? 'اجتماع تفاوض' : 'Negotiation Meeting' }
  ];

  const meetingLocations = [
    { value: 'indoor', label: isArabic ? 'داخلي' : 'Indoor' },
    { value: 'outdoor', label: isArabic ? 'خارجي' : 'Outdoor' },
    { value: 'online', label: isArabic ? 'عبر الإنترنت' : 'Online' },
    { value: 'client_office', label: isArabic ? 'مكتب العميل' : 'Client Office' }
  ];

  // خيارات المشاريع والوحدات (قائمة بسيطة قابلة للتوسعة لاحقًا)
  const projectOptions = [
    { value: '', label: isArabic ? 'اختر' : 'Select' },
    { value: 'project_a', label: isArabic ? 'مشروع A' : 'Project A' },
    { value: 'project_b', label: isArabic ? 'مشروع B' : 'Project B' },
    { value: 'project_c', label: isArabic ? 'مشروع C' : 'Project C' }
  ];
  const unitOptions = [
    { value: '', label: isArabic ? 'اختر' : 'Select' },
    { value: 'unit_101', label: 'Unit 101' },
    { value: 'unit_202', label: 'Unit 202' },
    { value: 'unit_303', label: 'Unit 303' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setActionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'actionType' ? { type: value } : {})
    }));
  };

  // إزالة دالة غير مستخدمة

  const handleQuickTimeSelect = (timeOption) => {
    const now = new Date();
    let targetTime;
    
    switch(timeOption) {
      case 'after_1_hour':
        targetTime = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case 'after_2_hours':
        targetTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        break;
      case 'tomorrow':
        targetTime = new Date(now);
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(9, 0, 0, 0);
        break;
      case 'next_week':
        targetTime = new Date(now);
        targetTime.setDate(targetTime.getDate() + 7);
        targetTime.setHours(9, 0, 0, 0);
        break;
      default:
        return;
    }
    
    setActionData(prev => ({
      ...prev,
      date: targetTime.toISOString().split('T')[0],
      time: targetTime.toTimeString().slice(0, 5),
      selectedQuickOption: timeOption
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAction = {
      ...actionData,
      type: actionData.actionType,
      id: Date.now(),
      leadId: lead?.id,
      leadName: lead?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(newAction);
    console.log(isArabic ? 'إضافة أكشن جديد:' : 'Adding new action:', newAction);
    
    // إعادة تعيين النموذج
    setActionData({
      type: 'call',
      actionType: 'call',
      nextAction: 'follow_up',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      status: 'pending',
      priority: 'medium',
      assignedTo: '',
      notes: '',
      meetingType: 'introduction',
      meetingLocation: 'indoor',
      answerStatus: 'answer',
      selectedQuickOption: null,
      proposalAmount: '',
      proposalDiscount: '',
      proposalValidityDays: '',
      proposalAttachmentUrl: '',
      reservationProject: '',
      reservationUnit: '',
      reservationAmount: '',
      rentUnit: '',
      rentStart: '',
      rentEnd: '',
      rentAmount: ''
    });
    
    onClose();
  };

  const selectedActionType = actionTypes.find(type => type.value === actionData.type);
  const ActionIcon = selectedActionType?.icon || FaComments;

  // Wrapper classes for overlay vs inline modes
  const overlayWrapper = inline 
    ? 'relative p-0'
    : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-0 sm:p-6';
  const containerClasses = inline 
    ? `${isLight ? 'bg-white text-slate-800' : 'bg-gray-800 text-white'} sm:rounded-lg shadow-xl w-full h-auto`
    : `${isLight ? 'bg-white text-slate-800' : 'bg-gray-800 text-white'} sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[85vh] h-auto overflow-y-auto m-0 sm:m-4`;

  useEffect(() => {
    if (!inline && isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return () => { document.body.style.overflow = prev; };
    }
  }, [inline, isOpen]);

  const content = (
    <div className={overlayWrapper}>
      <div className={containerClasses}>
        {/* Header */}
        <div className={`flex items-center justify-between p-8 border-b ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
          <div className="flex items-center gap-3">
            <h2 className={`text-xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isArabic ? 'إضافة أكشن' : 'Add Action'}
            </h2>
          </div>
          {!inline && (
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost text-red-500"
              >
                <FaTimes size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Subtitle */}
        <div className="px-8 pt-6">
          <p className={`${isLight ? 'text-slate-600' : 'text-gray-400'} text-sm`}>
            {isArabic
              ? (actionData.nextAction === 'meeting' ? 'اختر تفاصيل الاجتماع' : 'اختر نوع الأكشن وحدد التفاصيل')
              : (actionData.nextAction === 'meeting' ? 'Choose meeting details' : 'Select action type and schedule details')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Next Action Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isLight ? 'text-slate-900' : 'text-gray-300'}`}>
              {isArabic ? 'الاجراء القادم ' : 'Next action'}
            </label>
            <div className="relative">
              <select
                name="nextAction"
                value={actionData.nextAction}
                onChange={handleInputChange}
                className={`${isLight ? 'w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
              >
                {nextActionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
            </div>
          </div>

          {/* Action Type Selection - مخفي عند اختيار اجتماع */}
          {actionData.nextAction !== 'meeting' && (
            <div>
              <label className={`block text-sm font-medium mb-3 ${isLight ? 'text-slate-900' : 'text-gray-300'}`}>
                {isArabic ? 'نوع الأكشن' : 'Action Type'}
              </label>
              <div className="relative">
                <select
                  name="actionType"
                  value={actionData.actionType}
                  onChange={handleInputChange}
                  className={`${isLight ? 'w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                >
                  {actionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
              </div>
            </div>
          )}

          {/* Answer Status Toggle */}
          {actionData.type && (
            <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={() => setActionData(prev => ({
                  ...prev,
                  answerStatus: prev.answerStatus === 'answer' ? 'no_answer' : 'answer',
                  notes: prev.answerStatus === 'answer'
                    ? 'no answer'
                    : (prev.notes === 'no answer' ? '' : prev.notes)
                }))}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all font-medium backdrop-blur-md bg-white/10 hover:bg-white/20 shadow-2xl shadow-black/30 hover:shadow-black/50 border ${
                  actionData.answerStatus === 'answer'
                    ? 'text-green-300 hover:text-green-200 shadow-green-500/20 border-green-400/40'
                    : 'text-red-300 hover:text-red-200 shadow-red-500/20 border-red-400/40'
                }`}
               >
                 {actionData.answerStatus === 'answer' ? (
                   <>
                     <FaToggleOn className="text-lg text-green-400" />
                     <span>{isArabic ? 'إجابة' : 'Answer'}</span>
                   </>
                 ) : (
                   <>
                     <FaToggleOff className="text-lg text-red-400" />
                     <span>{isArabic ? 'لا يوجد إجابة' : 'No Answer'}</span>
                   </>
                 )}
               </button>
            </div>
          )}

          {/* Meeting Type and Location (عند اختيار nextAction=meeting) */}
          {actionData.nextAction === 'meeting' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isArabic ? 'نوع الاجتماع' : 'Meeting Type'}
                </label>
                <div className="relative">
                  <select
                    name="meetingType"
                    value={actionData.meetingType}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    {meetingTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isArabic ? 'مكان الاجتماع' : 'Meeting Location'}
                </label>
                <div className="relative">
                  <select
                    name="meetingLocation"
                    value={actionData.meetingLocation}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    {meetingLocations.map(location => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
                </div>
              </div>
            </div>
          )}

          {/* Proposal fields */}
          {actionData.nextAction === 'proposal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'قيمة العرض' : 'Proposal Amount'}</label>
                <input name="proposalAmount" type="number" value={actionData.proposalAmount} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'الخصم %' : 'Discount %'}</label>
                <input name="proposalDiscount" type="number" value={actionData.proposalDiscount} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'مدة الصلاحية (أيام)' : 'Validity Days'}</label>
                <input name="proposalValidityDays" type="number" value={actionData.proposalValidityDays} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'رابط المرفق' : 'Attachment URL'}</label>
                <input name="proposalAttachmentUrl" type="url" value={actionData.proposalAttachmentUrl} onChange={handleInputChange} placeholder="https://..." className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
            </div>
          )}

          {/* Reservation fields */}
          {actionData.nextAction === 'reservation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'المشروع' : 'Project'}</label>
                <div className="relative">
                  <select
                    name="reservationProject"
                    value={actionData.reservationProject}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    {projectOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'الوحدة' : 'Unit'}</label>
                <div className="relative">
                  <select
                    name="reservationUnit"
                    value={actionData.reservationUnit}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'قيمة الحجز' : 'Reservation Amount'}</label>
                <input name="reservationAmount" type="number" value={actionData.reservationAmount} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
            </div>
          )}

          {/* Rent fields */}
          {actionData.nextAction === 'rent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'الوحدة' : 'Unit'}</label>
                <div className="relative">
                  <select
                    name="rentUnit"
                    value={actionData.rentUnit}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-500' : 'text-gray-300'} pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'بداية الإيجار' : 'Rent Start'}</label>
                <input name="rentStart" type="date" value={actionData.rentStart} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'نهاية الإيجار' : 'Rent End'}</label>
                <input name="rentEnd" type="date" value={actionData.rentEnd} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{isArabic ? 'قيمة الإيجار' : 'Rent Amount'}</label>
                <input name="rentAmount" type="number" value={actionData.rentAmount} onChange={handleInputChange} className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-slate-900' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white'}`} />
              </div>
            </div>
          )}

          {/* Schedule Date - مخفي لحالات الإغلاق والإلغاء */}
          {!['closing_deals', 'cancel'].includes(actionData.nextAction) && (
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isArabic ? 'تاريخ الجدولة' : 'Schedule Date'}
            </h3>

            {/* Split layout: left input (50%), right buttons (50%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left: Date and Time Input with Calendar Icon */}
              <div className="relative">
                <input
                  type="datetime-local"
                  name="date"
                  value={`${actionData.date}T${actionData.time}`}
                  onChange={(e) => {
                    const [date, time] = e.target.value.split('T');
                    setActionData(prev => ({
                      ...prev,
                      date: date,
                      time: time
                    }));
                  }}
                  className={`${isLight ? 'w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm pr-12' : 'w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm pr-12'}`}
                  placeholder="05/12/2025 23:58:53"
                />
              </div>

              {/* Right: Buttons grouped in columns (each column has two buttons) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('after_1_hour')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'after_1_hour' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : (isLight ? 'bg-gray-100 text-slate-700 border-gray-300 hover:bg-gray-200' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600')}`}
                  >
                    {isArabic ? 'بعد ساعة' : 'After 1 hour'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('after_2_hours')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'after_2_hours' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : (isLight ? 'bg-gray-100 text-slate-700 border-gray-300 hover:bg-gray-200' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600')}`}
                  >
                    {isArabic ? 'بعد ساعتين' : 'After 2 hours'}
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('tomorrow')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'tomorrow' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : (isLight ? 'bg-gray-100 text-slate-700 border-gray-300 hover:bg-gray-200' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600')}`}
                  >
                    {isArabic ? 'غداً' : 'Tomorrow'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('next_week')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'next_week' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : (isLight ? 'bg-gray-100 text-slate-700 border-gray-300 hover:bg-gray-200' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600')}`}
                  >
                    {isArabic ? 'الأسبوع القادم' : 'Next Week'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Comment */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              {isArabic ? 'تعليق *' : 'Comment *'}
            </label>
            <textarea
              name="notes"
              value={actionData.notes}
              onChange={handleInputChange}
              placeholder={isArabic ? 'اكتب تعليقك هنا. يُسمح بعدد غير محدود من الكلمات...' : 'Write your comment here. Unlimited words are allowed...'}
              rows="4"
              className={`${isLight ? 'w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-gray-400' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400'} resize-none`}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              {isArabic ? 'حفظ الأكشن' : 'Save Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (inline) return content;
  if (!isOpen) return null;
  return createPortal(content, document.body);
};

export default AddActionModal;
