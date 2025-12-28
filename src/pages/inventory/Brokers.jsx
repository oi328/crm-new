import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, X, Users, Phone, Mail, Percent, Building2, Filter, ChevronDown } from 'lucide-react';

export default function Brokers() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const STORAGE_KEY = 'inventoryBrokers';

  // State
  const [brokers, setBrokers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    agencyName: '',
    status: '',
    brokerType: ''
  });
  
  const [form, setForm] = useState({
    id: null,
    name: '',
    agencyName: '',
    phone: '',
    email: '',
    commissionRate: '',
    status: 'Active',
    brokerType: 'individual'
  });

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setBrokers(JSON.parse(saved));
    } else {
      // Seed data
      const seed = [
        { id: 1, name: 'Karim Nabil', agencyName: 'ReMax', phone: '01000000001', email: 'karim@remax.com', commissionRate: '2.5', status: 'Active', brokerType: 'company' },
        { id: 2, name: 'Sara Mahmoud', agencyName: 'Independent', phone: '01200000002', email: 'sara.m@gmail.com', commissionRate: '1.5', status: 'Active', brokerType: 'individual' },
        { id: 3, name: 'Ahmed Hassan', agencyName: 'Coldwell Banker', phone: '01100000003', email: 'ahmed.h@coldwell.com', commissionRate: '2.0', status: 'Active', brokerType: 'company' },
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
      status: 'Active',
      brokerType: 'individual'
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
  const agencyOptions = useMemo(() => Array.from(new Set(brokers.map(b => b.agencyName).filter(Boolean))), [brokers]);

  const filteredBrokers = useMemo(() => {
    return brokers.filter(b => {
      // Search Text
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchPhone = b.phone?.includes(q);
        const matchEmail = b.email?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      // Agency
      if (filters.agencyName && b.agencyName !== filters.agencyName) return false;

      // Status
      if (filters.status && b.status !== filters.status) return false;

      // Broker Type
      if (filters.brokerType && b.brokerType !== filters.brokerType) return false;

      return true;
    });
  }, [brokers, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      agencyName: '',
      status: '',
      brokerType: ''
    });
  };

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-x-hidden min-w-0" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex flex-col items-start gap-1">
          <h1 className="page-title text-2xl font-bold text-start">
            {isArabic ? 'الوسطاء العقاريين' : 'Real Estate Brokers'}
          </h1>
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-full rounded bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center gap-2"
        >
          <Plus size={16} />
          <span>{isArabic ? 'إضافة وسيط' : 'Add Broker'}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Filter className="text-blue-500" size={16} /> {isArabic ? 'تصفية' : 'Filter'}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAllFilters(prev => !prev)} className="btn btn-glass btn-compact text-blue-600 flex items-center gap-1">
              {showAllFilters ? (isArabic ? 'إخفاء' : 'Hide') : (isArabic ? 'إظهار' : 'Show')} 
              <ChevronDown size={14} className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
              {isArabic ? 'مسح المرشحات' : 'Clear Filters'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <Search className="text-blue-500" size={10} /> {isArabic ? 'بحث' : 'Search'}
            </label>
            <div className="relative">
              <input 
                type="text"
                className="input w-full" 
                value={filters.search} 
                onChange={e => setFilters(prev => ({...prev, search: e.target.value}))} 
                placeholder={isArabic ? 'بحث بالاسم، الهاتف، البريد...' : 'Search name, phone, email...'} 
              />
            </div>
          </div>
          
          <div className={`space-y-1 ${!showAllFilters && 'hidden md:block'}`}>
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'الوكالة' : 'Agency'}</label>
            <div className="relative">
              <select 
                className="input w-full appearance-none" 
                value={filters.agencyName} 
                onChange={e => setFilters(prev => ({...prev, agencyName: e.target.value}))}
              >
                <option value="">{isArabic ? 'الكل' : 'All Agencies'}</option>
                {agencyOptions.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
              <ChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={14} />
            </div>
          </div>

          <div className={`space-y-1 ${!showAllFilters && 'hidden md:block'}`}>
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'الحالة' : 'Status'}</label>
            <div className="relative">
              <select 
                className="input w-full appearance-none" 
                value={filters.status} 
                onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}
              >
                <option value="">{isArabic ? 'الكل' : 'All Statuses'}</option>
                <option value="Active">{isArabic ? 'نشط' : 'Active'}</option>
                <option value="Inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
              </select>
              <ChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrokers.map(broker => (
          <div key={broker.id} className="glass-panel rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(broker)} className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(broker.id)} className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-2">{broker.name}</h3>
            
            <div className="space-y-2 text-sm text-[var(--muted-text)]">
              <div className="flex items-center gap-2">
                <div className="w-4 flex justify-center"><Users size={14} className="opacity-70" /></div>
                <span className="capitalize">
                  {broker.brokerType === 'company' 
                    ? (isArabic ? 'شركة' : 'Company') 
                    : (isArabic ? 'فرد' : 'Individual')}
                </span>
              </div>
              {broker.agencyName && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Building2 size={14} className="opacity-70" /></div>
                  <span>{broker.agencyName}</span>
                </div>
              )}
              {broker.phone && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Phone size={14} className="opacity-70" /></div>
                  <span dir="ltr">{broker.phone}</span>
                </div>
              )}
              {broker.email && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Mail size={14} className="opacity-70" /></div>
                  <span>{broker.email}</span>
                </div>
              )}
              {broker.commissionRate && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Percent size={14} className="opacity-70" /></div>
                  <span>{broker.commissionRate}%</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--panel-border)] flex justify-between items-center">
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
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
            <div className="card p-4 sm:p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">
                  {form.id ? (isArabic ? 'تعديل وسيط' : 'Edit Broker') : (isArabic ? 'إضافة وسيط جديد' : 'Add New Broker')}
                </h2>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-red-600 hover:bg-red-50 shadow-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'نوع الوسيط' : 'Broker Type'}</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="brokerType" 
                        value="individual"
                        checked={form.brokerType === 'individual'}
                        onChange={e => setForm({...form, brokerType: e.target.value})}
                        className="radio radio-primary radio-sm" 
                      />
                      <span className="text-sm">{isArabic ? 'فرد' : 'Individual'}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="brokerType" 
                        value="company"
                        checked={form.brokerType === 'company'}
                        onChange={e => setForm({...form, brokerType: e.target.value})}
                        className="radio radio-primary radio-sm" 
                      />
                      <span className="text-sm">{isArabic ? 'شركة' : 'Company'}</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'اسم الوسيط' : 'Broker Name'}</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'الوكالة / الشركة' : 'Agency / Company'}</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.agencyName}
                    onChange={e => setForm({...form, agencyName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'الهاتف' : 'Phone'}</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input w-full"
                      value={form.commissionRate}
                      onChange={e => setForm({...form, commissionRate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input
                    type="email"
                    className="input w-full"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'الحالة' : 'Status'}</label>
                  <div className="relative">
                    <select
                      className="input w-full appearance-none"
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}
                    >
                      <option value="Active">{isArabic ? 'نشط' : 'Active'}</option>
                      <option value="Inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                    <ChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={14} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium"
                  >
                    {isArabic ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
