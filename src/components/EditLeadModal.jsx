import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaPhone, FaEnvelope, FaBuilding, FaMapMarkerAlt, FaDollarSign, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../shared/context/ThemeProvider.jsx';

const EditLeadModal = ({ isOpen, onClose, onSave, lead }) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    company: '',
    location: '',
    status: 'New',
    priority: 'Medium',
    source: 'Website',
    assignedTo: 'Unassigned',
    estimatedValue: '',
    probability: '50',
    notes: ''
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        fullName: lead.fullName || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        company: lead.company || '',
        location: lead.location || '',
        status: lead.status || 'New',
        priority: lead.priority || 'Medium',
        source: lead.source || 'Website',
        assignedTo: lead.assignedTo || 'Unassigned',
        estimatedValue: lead.estimatedValue || '',
        probability: lead.probability || '50',
        notes: lead.notes || ''
      });
    }
  }, [lead]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedLead = {
      ...lead,
      ...formData,
      lastModified: new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')
    };
    onSave(updatedLead);
    onClose();
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isLight ? 'bg-white text-gray-800' : 'bg-slate-800 text-white'} sm:rounded-lg shadow-xl w-full h-screen sm:max-w-4xl sm:max-h-[90vh] sm:h-auto sm:mx-4 mx-0 overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'border-gray-200' : 'border-slate-700'}`}>
          <h2 className={`text-xl font-semibold flex items-center ${isLight ? 'text-gray-800' : 'text-white'}`}>
            <FaUser className="mr-2 text-blue-600" />
            {isArabic ? 'تحرير بيانات العميل المحتمل' : 'Edit Lead'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-red-500"
            title={isArabic ? 'إغلاق' : 'Close'}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-4 border-b pb-2 ${isLight ? 'text-gray-800 border-gray-200' : 'text-white border-slate-700'}`}>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <FaUser className="inline mr-1" />
                  {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل الاسم الكامل' : 'Enter full name'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <FaPhone className="inline mr-1" />
                  {isArabic ? 'رقم الهاتف *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <FaEnvelope className="inline mr-1" />
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل البريد الإلكتروني' : 'Enter email'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <FaBuilding className="inline mr-1" />
                  {isArabic ? 'الشركة' : 'Company'}
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل اسم الشركة' : 'Enter company name'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  <FaMapMarkerAlt className="inline mr-1" />
                  {isArabic ? 'الموقع' : 'Location'}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل الموقع' : 'Enter location'}
                />
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-4 border-b pb-2 ${isLight ? 'text-gray-800 border-gray-200' : 'text-white border-slate-700'}`}>{isArabic ? 'تفاصيل العميل المحتمل' : 'Lead Details'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{isArabic ? 'الحالة' : 'Status'}</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    <option value="New">{isArabic ? 'جديد' : 'New'}</option>
                    <option value="Contacted">{isArabic ? 'تم التواصل' : 'Contacted'}</option>
                    <option value="Qualified">{isArabic ? 'مؤهل' : 'Qualified'}</option>
                    <option value="Proposal">{isArabic ? 'عرض' : 'Proposal'}</option>
                    <option value="Negotiation">{isArabic ? 'تفاوض' : 'Negotiation'}</option>
                    <option value="Closed Won">{isArabic ? 'مغلق - فوز' : 'Closed Won'}</option>
                    <option value="Closed Lost">{isArabic ? 'مغلق - خسارة' : 'Closed Lost'}</option>
                  </select>
                  <FaChevronDown className={`${isLight ? 'text-slate-500' : 'text-gray-300'} absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{isArabic ? 'الأولوية' : 'Priority'}</label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    <option value="Low">{isArabic ? 'منخفضة' : 'Low'}</option>
                    <option value="Medium">{isArabic ? 'متوسطة' : 'Medium'}</option>
                    <option value="High">{isArabic ? 'عالية' : 'High'}</option>
                    <option value="Urgent">{isArabic ? 'عاجلة' : 'Urgent'}</option>
                  </select>
                  <FaChevronDown className={`${isLight ? 'text-slate-500' : 'text-gray-300'} absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{isArabic ? 'المصدر' : 'Source'}</label>
                <div className="relative">
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    <option value="Website">{isArabic ? 'الموقع الإلكتروني' : 'Website'}</option>
                    <option value="Social Media">{isArabic ? 'وسائل التواصل الاجتماعي' : 'Social Media'}</option>
                    <option value="Referral">{isArabic ? 'إحالة' : 'Referral'}</option>
                    <option value="Cold Call">{isArabic ? 'اتصال بارد' : 'Cold Call'}</option>
                    <option value="Email Campaign">{isArabic ? 'حملة بريد إلكتروني' : 'Email Campaign'}</option>
                    <option value="Event">{isArabic ? 'حدث' : 'Event'}</option>
                    <option value="Other">{isArabic ? 'أخرى' : 'Other'}</option>
                  </select>
                  <FaChevronDown className={`${isLight ? 'text-slate-500' : 'text-gray-300'} absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`} />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-4 border-b pb-2 ${isLight ? 'text-gray-800 border-gray-200' : 'text-white border-slate-700'}`}>{isArabic ? 'معلومات إضافية' : 'Additional Information'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{isArabic ? 'مُعيَّن إلى' : 'Assigned To'}</label>
                <div className="relative">
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className={`${isLight ? 'w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full appearance-none px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  >
                    <option value="Unassigned">{isArabic ? 'غير مُعيَّن' : 'Unassigned'}</option>
                    <option value="Ahmed Ali">{isArabic ? 'أحمد علي' : 'Ahmed Ali'}</option>
                    <option value="Sara Mohamed">{isArabic ? 'سارة محمد' : 'Sara Mohamed'}</option>
                    <option value="Omar Hassan">{isArabic ? 'عمر حسن' : 'Omar Hassan'}</option>
                    <option value="Fatima Ibrahim">{isArabic ? 'فاطمة إبراهيم' : 'Fatima Ibrahim'}</option>
                  </select>
                  <FaChevronDown className={`${isLight ? 'text-slate-500' : 'text-gray-300'} absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none`} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  {isArabic ? 'الدخل المتوقع' : 'Expected Revenue'}
                </label>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleInputChange}
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل الدخل المتوقع' : 'Enter expected revenue'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{isArabic ? 'الاحتمالية (%)' : 'Probability (%)'}</label>
                <input
                  type="number"
                  name="probability"
                  value={formData.probability}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
                  placeholder={isArabic ? 'أدخل الاحتمالية' : 'Enter probability'}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{isArabic ? 'ملاحظات' : 'Notes'}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="4"
              className={`${isLight ? 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' : 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'}`}
              placeholder={isArabic ? 'أدخل أي ملاحظات إضافية...' : 'Enter any additional notes...'}
            />
          </div>

          {/* Footer */}
          <div className={`flex justify-end space-x-3 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-slate-700'}`}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-2"
            >
              <FaSave className="mr-0" />
              {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
