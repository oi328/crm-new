import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaPhone, FaEnvelope, FaCalendarAlt, FaComments, FaHandshake, FaFileAlt, FaCheck, FaMapMarkerAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const AddActionModal = ({ isOpen, onClose, onSave, lead, inline = false }) => {
  const { t, i18n } = useTranslation();
  
  const [actionData, setActionData] = useState({
    type: 'call',
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
    showSchedule: false,
    answerStatus: 'answer',
    selectedQuickOption: null
  });

  if (!isOpen) return null;

  const isArabic = i18n.language === 'ar';

  const actionTypes = [
    { value: 'call', label: isArabic ? 'مكالمة' : 'Call', icon: FaPhone, color: 'bg-blue-500' },
    { value: 'follow_up', label: isArabic ? 'متابعة' : 'Follow up', icon: FaComments, color: 'bg-teal-500' },
    { value: 'meeting', label: isArabic ? 'اجتماع' : 'Meeting', icon: FaCalendarAlt, color: 'bg-purple-500' }
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setActionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleActionTypeSelect = (type) => {
    setActionData(prev => ({
      ...prev,
      type: type
    }));
  };

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
      showSchedule: false,
      answerStatus: 'answer',
      selectedQuickOption: null
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
    ? 'bg-gray-800 sm:rounded-lg shadow-xl w-full h-auto max-h-[85vh] overflow-y-auto'
    : 'bg-gray-800 sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[85vh] h-auto overflow-y-auto m-0 sm:m-4';

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
        <div className="flex items-center justify-between p-8 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {isArabic ? 'إضافة أكشن' : 'Add Action'}
            </h2>
          </div>
          {!inline && (
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          )}
        </div>

        {/* Subtitle */}
        <div className="px-8 pt-6">
          <p className="text-gray-400 text-sm">
            {isArabic ? 'اختر نوع الأكشن وحدد التفاصيل' : 'Select action type and schedule details'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Action Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              {isArabic ? 'اختر النوع' : 'Select type'}
            </label>
            <select
              name="type"
              value={actionData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Answer Status Toggle */}
          {actionData.type && (
            <div className={`flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
               <button
                 type="button"
                 onClick={() => setActionData(prev => ({ 
                   ...prev, 
                   answerStatus: prev.answerStatus === 'answer' ? 'no_answer' : 'answer' 
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

          {/* Meeting Type and Location (only show for meeting type) */}
          {actionData.type === 'meeting' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isArabic ? 'نوع الاجتماع' : 'Meeting Type'}
                </label>
                <select
                  name="meetingType"
                  value={actionData.meetingType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  {meetingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isArabic ? 'مكان الاجتماع' : 'Meeting Location'}
                </label>
                <select
                  name="meetingLocation"
                  value={actionData.meetingLocation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  {meetingLocations.map(location => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Schedule Date */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text白">
              {isArabic ? 'تاريخ الجدولة' : 'Schedule Date'}
            </h3>

            {/* Split layout: left input (50%), right buttons (50%) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm pr-12"
                  placeholder="05/12/2025 23:58:53"
                />
              </div>

              {/* Right: Buttons grouped in columns (each column has two buttons) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('after_1_hour')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'after_1_hour' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600'}`}
                  >
                    {isArabic ? 'بعد ساعة' : 'After 1 hour'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('after_2_hours')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'after_2_hours' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600'}`}
                  >
                    {isArabic ? 'بعد ساعتين' : 'After 2 hours'}
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('tomorrow')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'tomorrow' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600'}`}
                  >
                    {isArabic ? 'غداً' : 'Tomorrow'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickTimeSelect('next_week')}
                    className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${actionData.selectedQuickOption === 'next_week' ? 'bg-teal-600 text-white border-teal-500 ring-2 ring-teal-400/40' : 'bg-gray-700 text-gray-300 border-gray-500 hover:bg-gray-600'}`}
                  >
                    {isArabic ? 'الأسبوع القادم' : 'Next Week'}
                  </button>
                </div>
              </div>
            </div>

            {/* Show Schedule Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showSchedule"
                name="showSchedule"
                checked={actionData.showSchedule}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showSchedule" className="text-sm text-gray-300">
                {isArabic ? 'إظهار جدولي' : 'Show my schedule'}
              </label>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {isArabic ? 'تعليق *' : 'Comment *'}
            </label>
            <textarea
              name="notes"
              value={actionData.notes}
              onChange={handleInputChange}
              placeholder={isArabic ? 'اكتب تعليقك هنا. يُسمح بعدد غير محدود من الكلمات...' : 'Write your comment here. Unlimited words are allowed...'}
              rows="4"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
            >
              {isArabic ? 'حفظ الأكشن' : 'Save Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (inline) return content;
  return createPortal(content, document.body);
};

export default AddActionModal;
