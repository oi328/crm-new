import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, X, Building, Phone, Mail, MapPin } from 'lucide-react';

export default function Developers() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const STORAGE_KEY = 'inventoryDevelopers';

  // State
  const [developers, setDevelopers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    id: null,
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active'
  });

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setDevelopers(JSON.parse(saved));
    } else {
      // Seed data
      const seed = [
        { id: 1, name: 'Emaar Misr', contactPerson: 'Ahmed Hassan', phone: '16116', email: 'info@emaar.com', address: 'Cairo, Egypt', status: 'Active' },
        { id: 2, name: 'Palm Hills', contactPerson: 'Mohamed Ali', phone: '19743', email: 'sales@palmhills.com', address: '6th October, Egypt', status: 'Active' },
      ];
      setDevelopers(seed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (developers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(developers));
    }
  }, [developers]);

  // Form Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;

    if (form.id) {
      setDevelopers(prev => prev.map(d => d.id === form.id ? { ...form } : d));
    } else {
      setDevelopers(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'Active'
    });
  };

  const handleEdit = (dev) => {
    setForm(dev);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this developer?')) {
      setDevelopers(prev => prev.filter(d => d.id !== id));
    }
  };

  // Filtering
  const filteredDevelopers = useMemo(() => {
    return developers.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [developers, searchQuery]);

  return (
    <div className={`p-6 max-w-[1600px] mx-auto ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="text-blue-600" />
            {isArabic ? 'المطورين العقاريين' : 'Real Estate Developers'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isArabic ? 'إدارة شركات التطوير العقاري وبيانات الاتصال' : 'Manage real estate development companies and contacts'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>{isArabic ? 'إضافة مطور' : 'Add Developer'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
        <input
          type="text"
          placeholder={isArabic ? 'بحث باسم المطور أو المسؤول...' : 'Search by developer name or contact person...'}
          className={`w-full ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevelopers.map(dev => (
          <div key={dev.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Building className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(dev)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(dev.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{dev.name}</h3>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {dev.contactPerson && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><span className="text-gray-400">👤</span></div>
                  <span>{dev.contactPerson}</span>
                </div>
              )}
              {dev.phone && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Phone size={14} className="text-gray-400" /></div>
                  <span dir="ltr">{dev.phone}</span>
                </div>
              )}
              {dev.email && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Mail size={14} className="text-gray-400" /></div>
                  <span>{dev.email}</span>
                </div>
              )}
              {dev.address && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><MapPin size={14} className="text-gray-400" /></div>
                  <span>{dev.address}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                dev.status === 'Active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {dev.status === 'Active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {form.id ? (isArabic ? 'تعديل مطور' : 'Edit Developer') : (isArabic ? 'إضافة مطور جديد' : 'Add New Developer')}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'اسم الشركة' : 'Company Name'}</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'الشخص المسؤول' : 'Contact Person'}</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.contactPerson}
                    onChange={e => setForm({...form, contactPerson: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'العنوان' : 'Address'}</label>
                <textarea
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'الحالة' : 'Status'}</label>
                <select
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}
                >
                  <option value="Active">{isArabic ? 'نشط' : 'Active'}</option>
                  <option value="Inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {isArabic ? 'حفظ' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
