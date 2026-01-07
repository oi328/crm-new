import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import BrokersImportModal from './BrokersImportModal';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, X, Users, Phone, Mail, Percent, Building2, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { FaFilter, FaShareAlt, FaEllipsisV, FaPlus, FaMapMarkerAlt, FaBuilding, FaTimes, FaEye, FaEdit, FaTrash, FaUpload, FaSearch, FaChevronDown, FaChevronUp, FaImage, FaFilePdf, FaVideo, FaPaperclip, FaTags, FaCity, FaCloudDownloadAlt, FaChevronLeft, FaChevronRight, FaDownload, FaFileExcel, FaFileImport, FaFileExport, FaFileCsv } from 'react-icons/fa'
import SearchableSelect from '../../components/SearchableSelect'
import { mockTeamMembers } from '../../data/mockTeamMembers'

export default function Brokers() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const STORAGE_KEY = 'inventoryBrokers';

  // State
  const [brokers, setBrokers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
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
    address: '',
    phones: [''],
    email: '',
    commissionRate: '',
    status: 'Active',
    brokerType: 'individual',
    salesPersons: [],
    contracted: false,
    taxId: '',
    nationalId: '',
    taxAttachment: null,
    nationalAttachment: null
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
    const cleanPhones = Array.isArray(form.phones) ? form.phones.map(p => String(p || '').trim()).filter(Boolean) : [];

    if (form.id) {
      setBrokers(prev => prev.map(b => b.id === form.id ? { ...form, phones: cleanPhones } : b));
    } else {
      setBrokers(prev => [{ ...form, id: Date.now(), phones: cleanPhones }, ...prev]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      agencyName: '',
      address: '',
      phones: [''],
      email: '',
      commissionRate: '',
      status: 'Active',
      brokerType: 'individual',
      salesPersons: [],
      contracted: false,
      taxId: '',
      nationalId: '',
      taxAttachment: null,
      nationalAttachment: null
    });
  };

  const handleEdit = (broker) => {
    const nextPhones = Array.isArray(broker.phones) ? broker.phones : (broker.phone ? [broker.phone] : []);
    setForm({ 
      ...broker, 
      salesPersons: Array.isArray(broker.salesPersons) ? broker.salesPersons : [], 
      address: broker.address || '', 
      phones: nextPhones.length > 0 ? nextPhones : [''],
      contracted: typeof broker.contracted === 'boolean' ? broker.contracted : false,
      taxId: broker.taxId || broker.taxIdOrCard || '',
      nationalId: broker.nationalId || '',
      taxAttachment: broker.taxAttachment || broker.documentAttachment || null,
      nationalAttachment: broker.nationalAttachment || null
    });
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
        const matchPhone = (Array.isArray(b.phones) ? b.phones : (b.phone ? [b.phone] : [])).some(ph => String(ph).toLowerCase().includes(q));
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

  const salesTeamOptions = useMemo(() => {
    return mockTeamMembers
      .filter(m => String(m.department).toLowerCase() === 'sales' || String(m.role).toLowerCase().includes('sales'))
      .map(m => m.name)
  }, [])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBrokers.length / itemsPerPage);
  const paginatedBrokers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrokers.slice(start, start + itemsPerPage);
  }, [filteredBrokers, currentPage, itemsPerPage]);

  const shownFrom = (filteredBrokers.length === 0) ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const shownTo = Math.min(currentPage * itemsPerPage, filteredBrokers.length);

  const clearFilters = () => {
    setFilters({
      search: '',
      agencyName: '',
      status: '',
      brokerType: ''
    });
  };

  const handleImport = (importedData) => {
    const newBrokers = importedData.map(broker => ({
      ...broker,
      id: Date.now() + Math.random(),
      status: broker.status || 'Active',
      brokerType: broker.brokerType || 'individual'
    }));
    setBrokers(prev => [...newBrokers, ...prev]);
    setShowImportModal(false);
  };

  const exportBrokersCsv = () => {
    const headers = ['Name', 'Agency', 'Type', 'Phone', 'Email', 'Commission', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredBrokers.map(b => [
        `"${b.name}"`,
        `"${b.agencyName || ''}"`,
        `"${b.brokerType}"`,
        `"${Array.isArray(b.phones) ? b.phones.filter(Boolean).join(' | ') : (b.phone || '')}"`,
        `"${b.email || ''}"`,
        `"${b.commissionRate || ''}"`,
        `"${b.status}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brokers.csv';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportBrokersPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = await import('jspdf-autotable');
      const doc = new jsPDF();
      
      const tableColumn = ["Name", "Agency", "Type", "Phone", "Status"];
      const tableRows = [];

      filteredBrokers.forEach(item => {
        const rowData = [
          item.name,
          item.agencyName || '',
          item.brokerType,
          Array.isArray(item.phones) ? item.phones.filter(Boolean).join(' | ') : (item.phone || ''),
          item.status
        ];
        tableRows.push(rowData);
      });

      doc.text(isArabic ? "Brokers List" : "Brokers List", 14, 15); // Arabic font support issue in jsPDF standard, keep English title or generic
      autoTable.default(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      doc.save("brokers_list.pdf");
      setShowExportMenu(false);
    } catch (error) {
      console.error("Export PDF Error:", error);
    }
  };

  const handleTaxAttachmentChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          taxAttachment: { name: file.name, dataUrl: reader.result }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNationalAttachmentChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          nationalAttachment: { name: file.name, dataUrl: reader.result }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-4 md:p-6 bg-[var(--content-bg)] text-[var(--content-text)] overflow-x-hidden min-w-0" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="relative flex flex-wrap items-start gap-1">
          <h1 className="page-title text-2xl font-bold text-start">
            {isArabic ? 'الوسطاء العقاريين' : 'Real Estate Brokers'}
          </h1>
          <span
            aria-hidden="true"
            className="inline-block h-[2px] w-full rounded bg-gradient-to-r from-blue-500 to-purple-600"
          />
        </div>
        <div className="flex flex-wrap lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">
           <button 
              className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2"
              onClick={() => setShowImportModal(true)}
           >
              <FaFileImport />
              {isArabic ? 'استيراد' : 'Import'}
           </button>



           <button
             onClick={() => { resetForm(); setShowForm(true); }}
             className="btn btn-sm w-full lg:w-auto bg-green-600 hover:bg-green-500 text-white border-none flex items-center justify-center gap-2"
           >
             <FaPlus /> {isArabic ? 'إضافة وسيط' : 'Add Broker'}
           </button>
           <div className="relative w-full lg:w-auto">
              <button 
                  className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2"
                  onClick={() => setShowExportMenu(!showExportMenu)}
              >
                  <span className="flex items-center gap-2">
                    <FaFileExport  />
                    {isArabic ? 'تصدير' : 'Export'}
                  </span>
                  <FaChevronDown className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} size={12} />
              </button>
              
              {showExportMenu && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 min-w-[150px]">
                      <button 
                          className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          onClick={exportBrokersCsv}
                      >
                          <FaFileCsv className="text-green-500" /> CSV
                      </button>
                      <button 
                          className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                          onClick={exportBrokersPdf}
                      >
                          <FaFilePdf className="text-red-500" /> PDF
                      </button>
                  </div>
              )}
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Filter className="text-blue-500" size={16} /> {isArabic ? 'تصفية' : 'Filter'}
          </h2>
          <div className="flex items-center gap-2">

            <button onClick={clearFilters} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              {isArabic ? 'إعادة تعيين' : 'Reset'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'اسم الشركة' : 'Company Name'}</label>
            <div className="relative">
              <select 
                className="input w-full appearance-none" 
                value={filters.agencyName} 
                onChange={e => setFilters(prev => ({...prev, agencyName: e.target.value}))}
              >
                <option value="">{isArabic ? 'الكل' : 'All Companies'}</option>
                {agencyOptions.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
              <ChevronDown className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} size={14} />
            </div>
          </div>

          <div className={`space-y-1 ${!showAllFilters && 'hidden md:block'}`}>
            <label className="text-xs font-medium text-[var(--muted-text)]">{isArabic ? 'النوع' : 'Type'}</label>
            <div className="relative">
              <select 
                className="input w-full appearance-none" 
                value={filters.brokerType} 
                onChange={e => setFilters(prev => ({...prev, brokerType: e.target.value}))}
              >
                <option value="">{isArabic ? 'الكل' : 'All Types'}</option>
                <option value="individual">{isArabic ? 'فرد' : 'Individual'}</option>
                <option value="company">{isArabic ? 'شركة' : 'Company'}</option>
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
        {paginatedBrokers.map(broker => (
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
              {typeof broker.contracted === 'boolean' && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Users size={14} className="opacity-70" /></div>
                  <span>{isArabic ? (broker.contracted ? 'متعاقد' : 'غير متعاقد') : (broker.contracted ? 'Contracted' : 'Not Contracted')}</span>
                </div>
              )}
              {Array.isArray(broker.salesPersons) && broker.salesPersons.length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-4 flex justify-center"><Users size={14} className="opacity-70" /></div>
                  <div className="flex flex-wrap gap-1">
                    {broker.salesPersons.map((sp, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs">{sp}</span>
                    ))}
                  </div>
                </div>
              )}
              {broker.agencyName && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Building2 size={14} className="opacity-70" /></div>
                  <span>{broker.agencyName}</span>
                </div>
              )}
              {broker.taxId && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><FaTags className="opacity-70" /></div>
                  <span>{broker.taxId}</span>
                  {broker.taxAttachment && (
                    <a 
                      href={broker.taxAttachment.dataUrl} 
                      download={broker.taxAttachment.name}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {isArabic ? 'تحميل' : 'Download'}
                    </a>
                  )}
                </div>
              )}
              {broker.nationalId && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><FaTags className="opacity-70" /></div>
                  <span>{broker.nationalId}</span>
                  {broker.nationalAttachment && (
                    <a 
                      href={broker.nationalAttachment.dataUrl} 
                      download={broker.nationalAttachment.name}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {isArabic ? 'تحميل' : 'Download'}
                    </a>
                  )}
                </div>
              )}
              {broker.address && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><FaMapMarkerAlt className="opacity-70" /></div>
                  <span>{broker.address}</span>
                </div>
              )}
              {broker.phone && (
                <div className="flex items-center gap-2">
                  <div className="w-4 flex justify-center"><Phone size={14} className="opacity-70" /></div>
                  <span dir="ltr">{broker.phone}</span>
                </div>
              )}
              {Array.isArray(broker.phones) && broker.phones.filter(Boolean).length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="w-4 flex justify-center"><Phone size={14} className="opacity-70" /></div>
                  <div className="flex flex-col">
                    {broker.phones.filter(Boolean).map((p, i) => (
                      <span key={i} dir="ltr">{p}</span>
                    ))}
                  </div>
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

      {/* Pagination Footer */}
      {filteredBrokers.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-between rounded-xl p-2 glass-panel gap-4">
          <div className="text-xs text-[var(--muted-text)]">
            {isArabic 
              ? `عرض ${shownFrom}–${shownTo} من ${filteredBrokers.length}`
              : `Showing ${shownFrom}–${shownTo} of ${filteredBrokers.length}`
            }
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                title={isArabic ? 'السابق' : 'Prev'}
              >
                <FaChevronLeft className={isArabic ? 'scale-x-[-1]' : ''} />
              </button>
              <span className="text-sm whitespace-nowrap">{isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                title={isArabic ? 'التالي' : 'Next'}
              >
                <FaChevronRight className={isArabic ? 'scale-x-[-1]' : ''} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-[var(--muted-text)] whitespace-nowrap">{isArabic ? 'لكل صفحة:' : 'Per page:'}</span>
              <select
                className="input w-16 text-sm py-0 px-2 h-8"
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showImportModal && (
        <BrokersImportModal 
          onClose={() => setShowImportModal(false)} 
          isRTL={isArabic} 
          onImport={handleImport}
        />
      )}

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
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setForm({...form, brokerType: 'individual'})}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border shadow-sm ${
                        form.brokerType === 'individual'
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-gray-900'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {isArabic ? 'فرد' : 'Individual'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, brokerType: 'company'})}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border shadow-sm ${
                        form.brokerType === 'company'
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-gray-900'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {isArabic ? 'شركة' : 'Company'}
                    </button>
                  </div>
                </div>

                {form.brokerType === 'company' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'اسم الشركة' : 'Company Name'}</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={form.agencyName}
                        onChange={e => setForm({...form, agencyName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'اسم المسؤول' : 'Contact Person'}</label>
                      <input
                        type="text"
                        required
                        className="input w-full"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
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
                      <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'اسم الوكالة (اختياري)' : 'Agency Name (Optional)'}</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={form.agencyName}
                        onChange={e => setForm({...form, agencyName: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'متعاقد' : 'Contracted'}</label>
                    <select
                      className="input w-full appearance-none"
                      value={form.contracted ? 'yes' : 'no'}
                      onChange={e => setForm(prev => ({ ...prev, contracted: e.target.value === 'yes' }))}
                    >
                      <option value="yes">{isArabic ? 'نعم' : 'Yes'}</option>
                      <option value="no">{isArabic ? 'لا' : 'No'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'الرقم الضريبي' : 'Tax ID'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input w-full"
                        value={form.taxId}
                        onChange={e => setForm({...form, taxId: e.target.value})}
                      />
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleTaxAttachmentChange}
                        className="hidden" 
                        id="tax-attachment-input"
                      />
                      <label htmlFor="tax-attachment-input" className="btn btn-ghost text-blue-600 cursor-pointer">
                        <FaPaperclip />
                      </label>
                    </div>
                    {form.taxAttachment && (
                      <div className="mt-1">
                        <a 
                          href={form.taxAttachment.dataUrl} 
                          download={form.taxAttachment.name} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[10px]"
                        >
                          <FaPaperclip className="mr-1" size={10} />
                          {form.taxAttachment.name}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'رقم البطاقة' : 'National ID'}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input w-full"
                        value={form.nationalId}
                        onChange={e => setForm({...form, nationalId: e.target.value})}
                      />
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleNationalAttachmentChange}
                        className="hidden" 
                        id="national-attachment-input"
                      />
                      <label htmlFor="national-attachment-input" className="btn btn-ghost text-blue-600 cursor-pointer">
                        <FaPaperclip />
                      </label>
                    </div>
                    {form.nationalAttachment && (
                      <div className="mt-1">
                        <a 
                          href={form.nationalAttachment.dataUrl} 
                          download={form.nationalAttachment.name} 
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-[10px]"
                        >
                          <FaPaperclip className="mr-1" size={10} />
                          {form.nationalAttachment.name}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'تعيين إلى موظفي المبيعات' : 'Assign to Sales Persons'}</label>
                  <SearchableSelect
                    options={salesTeamOptions}
                    value={form.salesPersons}
                    onChange={(vals)=>setForm(prev=>({...prev, salesPersons: vals}))}
                    isRTL={isArabic}
                    multiple
                  />
                </div>

                

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'أرقام الهاتف' : 'Phone Numbers'}</label>
                    <div className="space-y-2">
                      {(Array.isArray(form.phones) && form.phones.length > 0 ? form.phones : ['']).map((ph, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="input w-full"
                            value={ph}
                            onChange={e => {
                              const arr = Array.isArray(form.phones) ? [...form.phones] : ['']
                              arr[idx] = e.target.value
                              setForm(prev => ({ ...prev, phones: arr }))
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-ghost text-red-600"
                            onClick={() => {
                              const arr = (Array.isArray(form.phones) ? [...form.phones] : ['']).filter((_, i) => i !== idx)
                              setForm(prev => ({ ...prev, phones: arr.length > 0 ? arr : [''] }))
                            }}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-ghost text-blue-600"
                        onClick={() => {
                          const arr = Array.isArray(form.phones) ? [...form.phones] : []
                          setForm(prev => ({ ...prev, phones: [...arr, ''] }))
                        }}
                      >
                        <FaPlus /> {isArabic ? 'إضافة رقم' : 'Add Number'}
                      </button>
                    </div>
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
                  <label className="text-sm font-medium text-[var(--muted-text)]">{isArabic ? 'العنوان' : 'Address'}</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                  />
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

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-ghost text-[var(--muted-text)]"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
                  >
                    {form.id ? (isArabic ? 'حفظ التغييرات' : 'Save Changes') : (isArabic ? 'إضافة' : 'Add')}
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
