import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserTie, FaTruck, FaFilter, FaThList, FaThLarge, FaTimes, FaPhone, FaMapMarkerAlt, FaGlobe, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'inventoryThirdParties';
const VIEW_MODE_KEY = 'inventoryThirdParties_viewMode';

export default function ThirdParties() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const labels = useMemo(() => ({
    title: isRTL ? 'الملاك والموردين' : 'Owners & Suppliers',
    subtitle: isRTL ? 'إدارة الجهات الخارجية للمخزون والعقارات' : 'Manage third-party entities for inventory and properties',
    add: isRTL ? 'إضافة كيان' : 'Add Entity',
    searchPlaceholder: isRTL ? 'بحث بالاسم أو معلومات الاتصال...' : 'Search by name or contact info...',
    allTypes: isRTL ? 'الكل' : 'All',
    suppliers: isRTL ? 'الموردين' : 'Suppliers',
    owners: isRTL ? 'الملاك' : 'Owners',
    noEntities: isRTL ? 'لا توجد كيانات مطابقة لمعايير البحث.' : 'No entities found matching your criteria.',
    editTitle: isRTL ? 'تعديل الكيان' : 'Edit Entity',
    addTitle: isRTL ? 'إضافة كيان جديد' : 'Add New Entity',
    nameLabel: isRTL ? 'الاسم' : 'Name',
    typeLabel: isRTL ? 'النوع' : 'Type',
    supplierLabel: isRTL ? 'مورد' : 'Supplier',
    ownerLabel: isRTL ? 'مالك' : 'Owner',
    contactLabel: isRTL ? 'معلومات الاتصال' : 'Contact Info',
    contactPlaceholder: isRTL ? 'هاتف، بريد إلكتروني، أو عنوان' : 'Phone, Email, or Address',
    descLabel: isRTL ? 'الوصف' : 'Description',
    descPlaceholder: isRTL ? 'تفاصيل إضافية...' : 'Additional details...',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    save: isRTL ? 'حفظ' : 'Save',
    create: isRTL ? 'إنشاء' : 'Create',
    namePlaceholder: isRTL ? 'مثال: شركة النور / أحمد محمد' : 'e.g. Acme Corp / John Doe',
    actions: isRTL ? 'إجراءات' : 'Actions',
    viewList: isRTL ? 'عرض قائمة' : 'List View',
    viewGrid: isRTL ? 'عرض شبكة' : 'Grid View',
    filter: isRTL ? 'تصفية' : 'Filter',
    search: isRTL ? 'بحث' : 'Search',
    clearFilters: isRTL ? 'مسح المرشحات' : 'Clear Filters',
    listTitle: isRTL ? 'قائمة الكيانات' : 'Entities List',
    close: isRTL ? 'إغلاق' : 'Close',
  }), [isRTL]);

  const [parties, setParties] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Seed data
      return [
        { id: 1, name: 'Tech Distro Corp', type: 'Supplier', contact_info: '+1 555-0101 | sales@techdistro.com', description: 'Main supplier for electronics' },
        { id: 2, name: 'Office Supplies Co', type: 'Supplier', contact_info: '+1 555-0102 | orders@officesupplies.com', description: 'Stationery and office equipment' },
        { id: 3, name: 'Furniture Wholesalers', type: 'Supplier', contact_info: '+1 555-0103 | contact@furniture-wholesale.com', description: 'Office furniture supplier' },
        { id: 4, name: 'John Doe', type: 'Owner', contact_info: '+20 100 123 4567 | john.doe@email.com', description: 'Property owner - Downtown' },
        { id: 5, name: 'Real Estate Holding Group', type: 'Owner', contact_info: '+20 122 987 6543 | info@re-holding.com', description: 'Major property portfolio owner' }
      ];
    } catch (e) {
      console.error('Failed to load third parties', e);
      return [];
    }
  });

  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_MODE_KEY) || 'grid';
    } catch {
      return 'grid';
    }
  });

  const [filters, setFilters] = useState({
    search: '',
    type: 'All'
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    contact_info: '',
    type: 'Supplier', // Default
    description: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const filteredParties = useMemo(() => {
    return parties.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            p.contact_info.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'All' || p.type === filters.type;
      return matchesSearch && matchesType;
    });
  }, [parties, filters]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, itemsPerPage])

  // Pagination Logic
  const totalPages = Math.ceil(filteredParties.length / itemsPerPage)
  const paginatedParties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredParties.slice(start, start + itemsPerPage)
  }, [filteredParties, currentPage, itemsPerPage])

  const shownFrom = (filteredParties.length === 0) ? 0 : (currentPage - 1) * itemsPerPage + 1
  const shownTo = Math.min(currentPage * itemsPerPage, filteredParties.length)

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    if (form.id) {
      // Edit
      setParties(prev => prev.map(item => item.id === form.id ? {
        ...item,
        name,
        contact_info: form.contact_info.trim(),
        type: form.type,
        description: form.description.trim()
      } : item));
    } else {
      // Add
      const newItem = {
        id: Date.now(),
        name,
        contact_info: form.contact_info.trim(),
        type: form.type,
        description: form.description.trim()
      };
      setParties(prev => [newItem, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الكيان؟' : 'Are you sure you want to delete this entity?')) {
      setParties(prev => prev.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      contact_info: '',
      type: 'Supplier',
      description: ''
    });
    setShowForm(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', type: 'All' });
  };

  return (
    <div className="space-y-6 pt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative inline-block">
          <h1 className="page-title text-2xl font-semibold">{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isRTL ? 'auto' : '-4px', right: isRTL ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mx-2">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    title={labels.viewList}
                >
                    <FaThList size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    title={labels.viewGrid}
                >
                    <FaThLarge size={16} />
                </button>
           </div>
           <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none gap-2" onClick={() => {
              resetForm();
              setShowForm(true);
          }}>
              <FaPlus />
              {labels.add}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FaFilter className="text-blue-500" /> {labels.filter}
          </h2>
          <button onClick={clearFilters} className="btn btn-glass btn-compact text-[var(--muted-text)] hover:text-red-500">
              {labels.clearFilters}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
            <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={labels.searchPlaceholder} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.typeLabel}</label>
            <select className="input w-full" value={filters.type} onChange={e => setFilters(prev => ({...prev, type: e.target.value}))}>
                <option value="All">{labels.allTypes}</option>
                <option value="Supplier">{labels.suppliers}</option>
                <option value="Owner">{labels.owners}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
        {filteredParties.length === 0 ? (
          <p className="text-sm text-[var(--muted-text)]">{labels.noEntities}</p>
        ) : viewMode === 'list' ? (
            /* List View */
            <div className="overflow-x-auto">
                <table className="nova-table w-full">
                    <thead className="thead-soft">
                        <tr className="text-gray-600 dark:text-gray-300">
                            <th className="text-start px-3 min-w-[200px]">{labels.nameLabel}</th>
                            <th className="text-start px-3 min-w-[150px]">{labels.typeLabel}</th>
                            <th className="text-start px-3 min-w-[200px]">{labels.contactLabel}</th>
                            <th className="text-start px-3 min-w-[200px]">{labels.descLabel}</th>
                            <th className="text-center px-3 min-w-[100px]">{labels.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedParties.map((party) => (
                            <tr key={party.id}>
                                <td className="px-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${party.type === 'Owner' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {party.type === 'Owner' ? <FaUserTie size={16} /> : <FaTruck size={16} />}
                                        </div>
                                        <span className="font-medium">{party.name}</span>
                                    </div>
                                </td>
                                <td className="px-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${party.type === 'Owner' ? 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300' : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'}`}>
                                        {party.type === 'Owner' ? labels.ownerLabel : labels.supplierLabel}
                                    </span>
                                </td>
                                <td className="px-3 text-sm text-[var(--muted-text)]">{party.contact_info || '-'}</td>
                                <td className="px-3 text-sm text-[var(--muted-text)] truncate max-w-[200px]">{party.description || '-'}</td>
                                <td className="px-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleEdit(party)} className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={labels.editTitle}>
                                            <FaEdit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(party.id)} className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={labels.delete}>
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedParties.map(party => (
                    <div key={party.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${party.type === 'Owner' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {party.type === 'Owner' ? <FaUserTie size={20} /> : <FaTruck size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1" title={party.name}>{party.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${party.type === 'Owner' ? 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300' : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'}`}>
                                        {party.type === 'Owner' ? labels.ownerLabel : labels.supplierLabel}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={`absolute top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg p-1 shadow-sm ${isRTL ? 'left-4' : 'right-4'}`}>
                                <button onClick={() => handleEdit(party)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                    <FaEdit size={14} />
                                </button>
                                <button onClick={() => handleDelete(party.id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                            {party.contact_info && (
                                <div className="flex items-start gap-2">
                                    <FaPhone className="mt-1 text-gray-400 shrink-0" size={12} />
                                    <span className="line-clamp-2">{party.contact_info}</span>
                                </div>
                            )}
                            {party.description && (
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-400 shrink-0 mt-1">i</span>
                                    <p className="line-clamp-2">{party.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Pagination Footer */}
        {filteredParties.length > 0 && (
          <div className="mt-2 flex items-center justify-between rounded-xl p-2 glass-panel">
            <div className="text-xs text-[var(--muted-text)]">
              {isRTL 
                ? `عرض ${shownFrom}–${shownTo} من ${filteredParties.length}`
                : `Showing ${shownFrom}–${shownTo} of ${filteredParties.length}`
              }
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  title={isRTL ? 'السابق' : 'Prev'}
                >
                  <FaChevronLeft className={isRTL ? 'scale-x-[-1]' : ''} size={14} />
                </button>
                <span className="text-sm">{isRTL ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  title={isRTL ? 'التالي' : 'Next'}
                >
                  <FaChevronRight className={isRTL ? 'scale-x-[-1]' : ''} size={14} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[var(--muted-text)]">{isRTL ? 'لكل صفحة:' : 'Per page:'}</span>
                <select
                  className="input w-24 text-sm h-8 min-h-0"
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
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-start justify-center p-4 md:p-6">
            <div className="card p-0 mt-4 w-full max-w-md bg-white dark:bg-gray-800 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-medium">{form.id ? labels.editTitle : labels.addTitle}</h2>
                <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                  <FaTimes />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto">
                <form id="partyForm" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">{labels.nameLabel} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="input w-full"
                      placeholder={labels.namePlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">{labels.typeLabel}</label>
                    <select
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value})}
                        className="input w-full"
                    >
                        <option value="Supplier">{labels.suppliers}</option>
                        <option value="Owner">{labels.owners}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">{labels.contactLabel}</label>
                    <input
                        type="text"
                        value={form.contact_info}
                        onChange={e => setForm({...form, contact_info: e.target.value})}
                        className="input w-full"
                        placeholder={labels.contactPlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">{labels.descLabel}</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      className="input w-full min-h-[100px]"
                      placeholder={labels.descPlaceholder}
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  {labels.cancel}
                </button>
                <button
                  type="submit"
                  form="partyForm"
                  className="btn btn-primary"
                >
                  {form.id ? labels.save : labels.create}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
