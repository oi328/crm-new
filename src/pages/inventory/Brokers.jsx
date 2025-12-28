import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, X, Users, Phone, Mail, Percent, Building2 } from 'lucide-react';

export default function Brokers() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const STORAGE_KEY = 'inventoryBrokers';

  // State
  const [brokers, setBrokers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    id: null,
    name: '',
    agencyName: '',
    phone: '',
    email: '',
    commissionRate: '',
    status: 'Active'
  });

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBrokers(JSON.parse(saved));
    } else {
      // Seed data
      const seed = [
        { id: 1, name: 'Karim Nabil', agencyName: 'ReMax', phone: '01000000001', email: 'karim@remax.com', commissionRate: '2.5', status: 'Active' },
        { id: 2, name: 'Sara Mahmoud', agencyName: 'Independent', phone: '01200000002', email: 'sara.m@gmail.com', commissionRate: '1.5', status: 'Active' },
        { id: 3, name: 'Ahmed Hassan', agencyName: 'Coldwell Banker', phone: '01100000003', email: 'ahmed.h@coldwell.com', commissionRate: '2.0', status: 'Active' },
      ];
      setBrokers(seed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (brokers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(brokers));
    }
  }, [brokers]);

  // Form Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;

    if (form.id) {
      setBrokers(prev => prev.map(b => b.id === form.id ? { ...form } : b));
    } else {
      setBrokers(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      agencyName: '',
      phone: '',
      email: '',
      commissionRate: '',
      status: 'Active'
    });
  };

  const handleEdit = (broker) => {
    setForm(broker);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this broker?')) {
      setBrokers(prev => prev.filter(b => b.id !== id));
    }
  };

  // Filtering
  const filteredBrokers = useMemo(() => {
    return brokers.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.agencyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery)
    );
  }, [brokers, searchQuery]);

  return (
    <div className={`p-6 max-w-[1600px] mx-auto ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-blue-600" />
            {isArabic ? 'الوسطاء العقاريين' : 'Real Estate Brokers'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isArabic ? 'إدارة الوسطاء والوكالات العقارية' : 'Manage real estate brokers and agencies'}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>{isArabic ? 'إضافة وسيط' : 'Add Broker'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
        <input
          type="text"
          placeholder={isArabic ? 'بحث باسم الوسيط، الوكالة أو الهاتف...' : 'Search by broker name, agency or phone...'}
          className={`w-full ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrokers.map(broker => (
          <div key={broker.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(broker)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(broker.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{broker.name}</h3>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {broker.agencyName && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Building2 size={14} className="text-gray-400" /></div>
                  <span>{broker.agencyName}</span>
                </div>
              )}
              {broker.phone && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Phone size={14} className="text-gray-400" /></div>
                  <span dir="ltr">{broker.phone}</span>
                </div>
              )}
              {broker.email && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Mail size={14} className="text-gray-400" /></div>
                  <span>{broker.email}</span>
                </div>
              )}
              {broker.commissionRate && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Percent size={14} className="text-gray-400" /></div>
                  <span>{broker.commissionRate}%</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                broker.status === 'Active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {broker.status === 'Active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
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
                {form.id ? (isArabic ? 'تعديل وسيط' : 'Edit Broker') : (isArabic ? 'إضافة وسيط جديد' : 'Add New Broker')}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'اسم الوسيط' : 'Broker Name'}</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'الوكالة / الشركة' : 'Agency / Company'}</label>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.agencyName}
                  onChange={e => setForm({...form, agencyName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isArabic ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.commissionRate}
                    onChange={e => setForm({...form, commissionRate: e.target.value})}
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
