import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTag, FaGlobe, FaImage, FaFilter, FaChevronDown, FaTimes, FaThList, FaThLarge, FaSortAmountDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SearchableSelect from '../../components/SearchableSelect';

const STORAGE_KEY = 'inventoryBrands';

export default function Brands() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isRTL = isArabic;

  const labels = useMemo(() => ({
    title: isRTL ? 'إدارة العلامات التجارية' : 'Brands Management',
    subtitle: isRTL ? 'إدارة العلامات التجارية والشركات المصنعة' : 'Manage product brands and manufacturers',
    add: isRTL ? 'إضافة علامة تجارية' : 'Add Brand',
    close: isRTL ? 'إغلاق' : 'Close',
    filter: isRTL ? 'تصفية' : 'Filter',
    search: isRTL ? 'بحث' : 'Search',
    clearFilters: isRTL ? 'مسح المرشحات' : 'Clear Filters',
    editTitle: isRTL ? 'تعديل العلامة التجارية' : 'Edit Brand',
    addTitle: isRTL ? 'إضافة علامة تجارية جديدة' : 'Add New Brand',
    nameLabel: isRTL ? 'اسم العلامة التجارية' : 'Brand Name',
    originLabel: isRTL ? 'المنشأ / الدولة' : 'Origin / Country',
    websiteLabel: isRTL ? 'الموقع الإلكتروني' : 'Website',
    logoLabel: isRTL ? 'رابط الشعار' : 'Logo URL',
    descLabel: isRTL ? 'الوصف' : 'Description',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    save: isRTL ? 'حفظ' : 'Save',
    create: isRTL ? 'إنشاء' : 'Create',
    pasteLink: isRTL ? 'الصق رابط مباشر لملف الصورة.' : 'Paste a direct link to the image file.',
    websitePlaceholder: 'https://example.com',
    logoPlaceholder: 'https://example.com/logo.png',
    originPlaceholder: isRTL ? 'مثال: الولايات المتحدة، ألمانيا' : 'e.g. USA, Germany',
    namePlaceholder: isRTL ? 'مثال: نايك، أبل' : 'e.g. Nike, Apple',
    descPlaceholder: isRTL ? 'تفاصيل إضافية...' : 'Additional details...',
    listTitle: isRTL ? 'قائمة العلامات التجارية' : 'Brands List',
    empty: isRTL ? 'لا توجد علامات تجارية' : 'No brands found',
    actions: isRTL ? 'الإجراءات' : 'Actions',
    viewList: isRTL ? 'عرض القائمة' : 'List View',
    viewGrid: isRTL ? 'عرض الشبكة' : 'Grid View',
    all: isRTL ? 'الكل' : 'All',
    family: isRTL ? 'العائلة' : 'Family',
    category: isRTL ? 'التصنيف' : 'Category',
    group: isRTL ? 'المجموعة' : 'Group',
    selectFamily: isRTL ? 'اختر العائلة' : 'Select Family',
    selectCategory: isRTL ? 'اختر التصنيف' : 'Select Category',
    selectGroup: isRTL ? 'اختر المجموعة' : 'Select Group',
  }), [isRTL]);

  const [families, setFamilies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    try {
      const storedFamilies = JSON.parse(localStorage.getItem('inventoryFamilies') || '[]');
      setFamilies(storedFamilies);
      
      const storedCategories = JSON.parse(localStorage.getItem('inventoryCategories') || '[]');
      setCategories(storedCategories);
      
      const storedGroups = JSON.parse(localStorage.getItem('inventoryGroups') || '[]');
      setGroups(storedGroups);
    } catch (e) {
      console.error('Failed to load auxiliary data', e);
    }
  }, []);

  const [brands, setBrands] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Seed data
      return [
        { id: 1, name: 'Apple', origin: 'USA', website: 'https://apple.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', description: 'Consumer electronics', family: '', category: '', group: '' },
        { id: 2, name: 'Samsung', origin: 'South Korea', website: 'https://samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', description: 'Electronics and appliances', family: '', category: '', group: '' },
        { id: 3, name: 'IKEA', origin: 'Sweden', website: 'https://ikea.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg', description: 'Furniture and home accessories', family: '', category: '', group: '' },
        { id: 4, name: 'Sony', origin: 'Japan', website: 'https://sony.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Sony_logo.svg', description: 'Audio and video equipment', family: '', category: '', group: '' },
        { id: 5, name: 'Nike', origin: 'USA', website: 'https://nike.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', description: 'Sportswear and equipment', family: '', category: '', group: '' }
      ];
    } catch (e) {
      console.error('Failed to load brands', e);
      return [];
    }
  });

  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('brandsViewMode') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const [filters, setFilters] = useState({
    search: '',
    origin: '',
    family: '',
    category: '',
    group: ''
  });

  const uniqueOrigins = useMemo(() => {
    const origins = [...new Set(brands.map(b => b.origin).filter(Boolean))];
    return origins.sort().map(o => ({ id: o, name: o }));
  }, [brands]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    origin: '',
    website: '',
    logo: '',
    description: '',
    family: '',
    category: '',
    group: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    try { localStorage.setItem('brandsViewMode', viewMode); } catch {}
  }, [viewMode]);

  const filteredBrands = useMemo(() => {
    let result = brands.filter(b => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && 
            !b.description.toLowerCase().includes(q)) return false;
      }
      if (filters.origin) {
        if (b.origin !== filters.origin) return false;
      }
      if (filters.family) {
        if (b.family !== filters.family) return false;
      }
      if (filters.category) {
        if (b.category !== filters.category) return false;
      }
      if (filters.group) {
        if (b.group !== filters.group) return false;
      }
      return true;
    });

    return result.sort((a, b) => b.id - a.id);
  }, [brands, filters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    if (form.id) {
      // Edit
      setBrands(prev => prev.map(item => item.id === form.id ? {
        ...item,
        name,
        origin: form.origin.trim(),
        website: form.website.trim(),
        logo: form.logo.trim(),
        description: form.description.trim(),
        family: form.family,
        category: form.category,
        group: form.group
      } : item));
    } else {
      // Add
      const newItem = {
        id: Date.now(),
        name,
        origin: form.origin.trim(),
        website: form.website.trim(),
        logo: form.logo.trim(),
        description: form.description.trim(),
        family: form.family,
        category: form.category,
        group: form.group
      };
      setBrands(prev => [newItem, ...prev]);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setForm(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه العلامة التجارية؟' : 'Are you sure you want to delete this brand?')) {
      setBrands(prev => prev.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      origin: '',
      website: '',
      logo: '',
      description: '',
      family: '',
      category: '',
      group: ''
    });
    setShowForm(false);
  };

  const clearFilters = () => {
    setFilters({ search: '', origin: '', family: '', category: '', group: '' });
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
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : ' dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    title={labels.viewList}
                >
                    <FaThList size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-gray-50 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
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
          {/* Search */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
              <FaSearch className="text-blue-500" size={10} /> {labels.search}
            </label>
            <input 
              className="input w-full" 
              value={filters.search} 
              onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} 
              placeholder={isArabic ? 'بحث بالاسم...' : 'Search by name...'} 
            />
          </div>

          {/* Origin Filter */}
          <div className="space-y-1">
             <label className="text-xs font-medium text-[var(--muted-text)]">{labels.originLabel}</label>
             <SearchableSelect
                placeholder={labels.all}
                options={uniqueOrigins.map(o => o.name)}
                value={filters.origin}
                onChange={(val) => setFilters(prev => ({ ...prev, origin: val }))}
                isRTL={isRTL}
             />
          </div>

          {/* Family Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.family}</label>
            <select 
              className="input w-full"
              value={filters.family}
              onChange={e => setFilters(prev => ({ ...prev, family: e.target.value }))}
            >
              <option value="">{labels.all}</option>
              {families.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.category}</label>
            <select 
              className="input w-full"
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">{labels.all}</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.group}</label>
            <select 
              className="input w-full"
              value={filters.group}
              onChange={e => setFilters(prev => ({ ...prev, group: e.target.value }))}
            >
              <option value="">{labels.all}</option>
              {groups.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
        {filteredBrands.length === 0 ? (
          <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="overflow-x-auto">
            <table className="nova-table w-full">
              <thead className="thead-soft">
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="text-start px-3 min-w-[200px]">{labels.nameLabel}</th>
                  <th className="text-start px-3 min-w-[150px]">{labels.originLabel}</th>
                  <th className="text-start px-3 min-w-[200px]">{labels.websiteLabel}</th>
                  <th className="text-start px-3 min-w-[200px]">{labels.descLabel}</th>
                  <th className="text-center px-3 min-w-[100px]">{labels.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map(brand => (
                  <tr key={brand.id}>
                    <td className="px-3">
                      <div className="flex items-center gap-3">
                         {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain rounded border border-gray-100" onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32?text=?'}} />
                         ) : (
                            <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-400">{brand.name.substring(0, 1)}</div>
                         )}
                         <span className="font-medium">{brand.name}</span>
                      </div>
                    </td>
                    <td className="px-3 text-sm">{brand.origin || '-'}</td>
                    <td className="px-3 text-sm">
                        {brand.website ? (
                             <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                <FaGlobe size={10} /> {brand.website.replace(/^https?:\/\//, '')}
                             </a>
                        ) : '-'}
                    </td>
                    <td className="px-3 text-sm text-[var(--muted-text)] truncate max-w-[200px]">{brand.description || '-'}</td>
                    <td className="px-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button type="button" className="btn btn-sm btn-circle btn-ghost text-blue-600 hover:bg-blue-100" title={labels.editTitle} onClick={() => handleEdit(brand)}>
                          <FaEdit size={16} />
                        </button>
                        <button type="button" className="btn btn-sm btn-circle btn-ghost text-red-600 hover:bg-red-100" title={labels.delete} onClick={() => handleDelete(brand.id)}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBrands.map(brand => (
                <div key={brand.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-32 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border-b border-gray-100 dark:border-gray-700 relative">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="h-24 w-auto object-contain max-w-[80%]" onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Logo'}} />
                    ) : (
                      <span className="text-4xl font-bold text-gray-300 uppercase">{brand.name.substring(0, 2)}</span>
                    )}
                    
                    <div className={`absolute top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-lg p-1 shadow-sm ${isRTL ? 'left-2' : 'right-2'}`}>
                      <button onClick={() => handleEdit(brand)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg truncate" title={brand.name}>{brand.name}</h3>
                      {brand.origin && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 shrink-0">
                          {brand.origin}
                        </span>
                      )}
                    </div>
                    
                    {brand.website && (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-2">
                        <FaGlobe size={10} /> {brand.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    
                    {brand.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{brand.description}</p>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6 overflow-y-auto">
            <div className="card p-4 sm:p-6 mt-4 w-[95vw] sm:w-[85vw] lg:w-[60vw] xl:max-w-3xl my-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">{form.id ? labels.editTitle : labels.addTitle}</h2>
                <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
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
                    <label className="block text-sm mb-1">{labels.originLabel}</label>
                    <SearchableSelect
                      placeholder={labels.originPlaceholder}
                      options={uniqueOrigins.map(o => o.name)}
                      value={form.origin}
                      onChange={(val) => setForm({...form, origin: val})}
                      freeText
                      isRTL={isRTL}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">{labels.websiteLabel}</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={e => setForm({...form, website: e.target.value})}
                      className="input w-full"
                      placeholder={labels.websitePlaceholder}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-1">{labels.family}</label>
                      <select
                        value={form.family}
                        onChange={e => setForm({...form, family: e.target.value})}
                        className="input w-full"
                      >
                        <option value="">{labels.selectFamily}</option>
                        {families.map(f => (
                          <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{labels.category}</label>
                      <select
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="input w-full"
                      >
                        <option value="">{labels.selectCategory}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">{labels.group}</label>
                      <select
                        value={form.group}
                        onChange={e => setForm({...form, group: e.target.value})}
                        className="input w-full"
                      >
                        <option value="">{labels.selectGroup}</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">{labels.logoLabel}</label>
                    <div className="relative">
                      <FaImage className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? 'left-3' : 'right-3'}`} />
                      <input
                        type="url"
                        value={form.logo}
                        onChange={e => setForm({...form, logo: e.target.value})}
                        className={`input w-full ${isRTL ? 'pl-10' : 'pr-10'}`}
                        placeholder={labels.logoPlaceholder}
                      />
                    </div>
                    <p className="text-xs text-[var(--muted-text)] mt-1">{labels.pasteLink}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">{labels.descLabel}</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      className="input w-full min-h-[100px]"
                      placeholder={labels.descPlaceholder}
                    />
                  </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" className="btn bg-blue-600 hover:bg-blue-500 text-white flex-1">{labels.save}</button>
                  <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowForm(false)}>{labels.close}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
