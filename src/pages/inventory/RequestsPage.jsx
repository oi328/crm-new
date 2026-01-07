import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaFilter, FaSearch, FaTimes, FaEdit, FaTrash, FaCheck, FaBan, FaFileContract, FaShoppingCart, FaQuestionCircle, FaFileInvoice, FaSync, FaPlus, FaChevronLeft, FaChevronRight, FaFileExport, FaFileImport } from 'react-icons/fa'
import RequestsImportModal from './RequestsImportModal'

export default function RequestsPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isRTL = isArabic

  const labels = useMemo(() => ({
    title: isArabic ? 'طلبات العام' : 'General  Requests',
    subtitle: isArabic ? 'إدارة طلبات المنتجات والخدمات والاشتراكات' : 'Manage requests for Products, Services, and Subscriptions',
    formTitle: isArabic ? 'بيانات الطلب' : 'Request Details',
    add: isArabic ? 'إضافة طلب' : 'Add Request',
    close: isArabic ? 'إغلاق' : 'Close',
    filter: isArabic ? 'تصفية' : 'Filter',
    search: isArabic ? 'بحث' : 'Search',
    clearFilters: isArabic ? 'مسح المرشحات' : 'Clear Filters',
    id: isArabic ? 'رقم الطلب' : 'Request ID',
    customer: isArabic ? 'العميل' : 'Customer',
    item: isArabic ? 'الصنف' : 'Item',
    type: isArabic ? 'النوع' : 'Type',
    date: isArabic ? 'التاريخ' : 'Date',
    status: isArabic ? 'الحالة' : 'Status',
    amount: isArabic ? 'المبلغ' : 'Amount',
    notes: isArabic ? 'ملاحظات' : 'Notes',
    save: isArabic ? 'حفظ' : 'Save',
    listTitle: isArabic ? 'قائمة الطلبات' : 'Requests List',
    empty: isArabic ? 'لا توجد طلبات' : 'No requests found',
    actions: isArabic ? 'الإجراءات' : 'Actions',
    delete: isArabic ? 'حذف' : 'Delete',
    edit: isArabic ? 'تعديل' : 'Edit',
    convert: isArabic ? 'تحويل لصفقة' : 'Convert to Deal',
    pending: isArabic ? 'قيد الانتظار' : 'Pending',
    approved: isArabic ? 'موافق عليه' : 'Approved',
    rejected: isArabic ? 'مرفوض' : 'Rejected',
    converted: isArabic ? 'تم التحويل' : 'Converted',
  }), [isArabic])

  const STORAGE_KEY = 'inventoryRequests'

  // Initial Seed Data - Removed as per user request to clear temporary data
  const SEED_DATA = [];

  const [form, setForm] = useState({
    id: null,
    type: 'Purchase Order',
    customer: '',
    item: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    amount: '',
    notes: ''
  })

  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ 
    search: '', 
    status: 'all',
    type: 'all'
  })

  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const updateStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('inventory-requests-updated'));
  };

  const exportRequestsCsv = () => {
    const headers = ['ID', 'Type', 'Customer', 'Item', 'Date', 'Amount', 'Status', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filtered.map(req => [
        `"${req.id}"`,
        `"${req.type}"`,
        `"${req.customer}"`,
        `"${req.item}"`,
        `"${req.date}"`,
        `"${req.amount}"`,
        `"${req.status}"`,
        `"${req.notes || ''}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'requests.csv'
    a.click(); URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportRequestsPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF()
      
      const tableColumn = ["ID", "Type", "Customer", "Item", "Date", "Amount", "Status"]
      const tableRows = []

      filtered.forEach(req => {
        const rowData = [
          req.id,
          req.type,
          req.customer,
          req.item,
          req.date,
          req.amount,
          req.status
        ]
        tableRows.push(rowData)
      })

      doc.text("Requests List", 14, 15)
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: 'helvetica', fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] }
      })
      doc.save("requests_list.pdf")
      setShowExportMenu(false)
    } catch (error) {
      console.error("Export PDF Error:", error)
    }
  }

  const handleImport = (importedData) => {
    const newRequests = importedData.map((item, index) => ({
      ...item,
      id: `REQ-${Date.now()}-${index}`,
      amount: Number(item.amount) || 0
    }))
    
    const updatedRequests = [...newRequests, ...requests]
    setRequests(updatedRequests)
    updateStorage(updatedRequests)
    setShowImportModal(false)
  }

  useEffect(() => {
    const loadData = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRequests(parsed)
          } else {
            setRequests(SEED_DATA)
          }
        } else {
          setRequests(SEED_DATA)
        }
      } catch (e) { 
          console.warn('Failed to load requests', e) 
          setRequests(SEED_DATA)
      }
    };

    loadData();

    window.addEventListener('inventory-requests-updated', loadData);
    return () => window.removeEventListener('inventory-requests-updated', loadData);
  }, [])


  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!form.customer || !form.item) return

    let updatedRequests;
    if (form.id && !form.id.toString().startsWith('NEW-')) {
      // Edit existing
      updatedRequests = requests.map(r => r.id === form.id ? { ...form, amount: Number(form.amount) || 0 } : r);
    } else {
      // Add new
      const newRequest = {
        ...form,
        id: `REQ-${Math.floor(Math.random() * 10000)}`,
        amount: Number(form.amount) || 0
      }
      updatedRequests = [newRequest, ...requests];
    }
    setRequests(updatedRequests);
    updateStorage(updatedRequests);
    setShowForm(false)
    resetForm()
  }

  function resetForm() {
    setForm({
        id: null,
        type: 'Purchase Order',
        customer: '',
        item: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        amount: '',
        notes: ''
    })
  }

  function onDelete(id) {
    if (window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this request?')) {
      setRequests(prev => prev.filter(r => r.id !== id))
    }
  }

  function onEdit(req) {
    setForm({ ...req })
    setShowForm(true)
  }

  const handleStatusChange = (id, newStatus) => {
    const updatedRequests = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    setRequests(updatedRequests);
    updateStorage(updatedRequests);
    
    // Optional: Show toast or notification
    if (isRTL) {
       // alert(newStatus === 'Approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب');
    }
  };

  const handleConvertToDeal = (id) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    // Create a new opportunity in localStorage
    const newOpportunity = {
      id: `OPP-${Date.now()}`,
      customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
      customerName: request.customer,
      status: 'New',
      amount: request.amount || 0,
      stage: 'Qualification',
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      notes: `Converted from Request #${request.id}: ${request.notes || ''}`,
      source: 'General Request'
    };

    try {
      const stored = localStorage.getItem('crm_opportunities');
      const opportunities = stored ? JSON.parse(stored) : [];
      opportunities.unshift(newOpportunity);
      localStorage.setItem('crm_opportunities', JSON.stringify(opportunities));
      
      // Update request status to Converted
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Converted' } : r));

      window.dispatchEvent(new Event('crm_opportunities_updated'));
      
      alert(isRTL ? 'تم تحويل الطلب إلى صفقة بنجاح' : 'Request converted to deal successfully');
    } catch (error) {
      console.error('Error converting to deal:', error);
      alert(isRTL ? 'حدث خطأ أثناء التحويل' : 'Error converting to deal');
    }
  };

  const filtered = useMemo(() => {
    return requests.filter(req => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
            !req.customer.toLowerCase().includes(q) && 
            !req.item.toLowerCase().includes(q) &&
            !req.id.toLowerCase().includes(q)
        ) return false
      }
      if (filters.status !== 'all' && req.status !== filters.status) return false
      if (filters.type !== 'all' && req.type !== filters.type) return false
      return true
    })
  }, [requests, filters])

  function clearFilters() {
    setFilters({ search: '', status: 'all', type: 'all' })
  }

  const TypeIcon = ({ type }) => {
    switch (type) {
        case 'Purchase Order': return <FaShoppingCart className="text-blue-500" />;
        case 'Inquiry': return <FaQuestionCircle className="text-orange-500" />;
        case 'Quote': return <FaFileInvoice className="text-purple-500" />;
        case 'Subscription': return <FaSync className="text-green-500" />;
        default: return <FaFileContract className="text-gray-500" />;
    }
  }

  const StatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    let label = status;

    switch(status) {
        case 'Pending': 
            colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            label = labels.pending;
            break;
        case 'Approved': 
            colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            label = labels.approved;
            break;
        case 'Rejected': 
            colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            label = labels.rejected;
            break;
        case 'Converted': 
            colorClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            label = labels.converted;
            break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {label}
        </span>
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-wrap lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative inline-block">
          <h1 className="page-title text-2xl font-semibold">{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
        <div className="w-full lg:w-auto flex flex-wrap lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3">

            <button 
              className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2"
              onClick={() => setShowImportModal(true)}
            >
              <FaFileImport />
              {isArabic ? 'استيراد' : 'Import'}
            </button>
           <button className="btn btn-sm w-full lg:w-auto bg-green-600 hover:bg-green-500 text-white border-none gap-2" onClick={() => {
              resetForm();
              setShowForm(true);
          }}>
              <FaPlus />
              {labels.add}
          </button>
          <div className="relative dropdown-container w-full lg:w-auto">
              <button 
                className="btn btn-sm w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none flex items-center justify-center gap-2"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <FaFileExport />
                {isArabic ? 'تصدير' : 'Export'}
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                  <button onClick={exportRequestsCsv} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2">
                    <span className="text-green-600 font-bold">CSV</span> Export as CSV
                  </button>
                  <button onClick={exportRequestsPdf} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2">
                    <span className="text-red-600 font-bold">PDF</span> Export as PDF
                  </button>
                </div>
              )}
            </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FaFilter className="text-blue-500" /> {labels.filter}
          </h2>
              <button onClick={clearFilters} className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                {isArabic ? 'إعادة تعيين' : 'Reset'}
              </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1"><FaSearch className="text-blue-500" size={10} /> {labels.search}</label>
            <input className="input w-full" value={filters.search} onChange={e=>setFilters(prev=>({...prev, search: e.target.value}))} placeholder={isArabic ? 'بحث...' : 'Search...'} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.type}</label>
            <select className="input w-full" value={filters.type} onChange={e => setFilters(prev => ({...prev, type: e.target.value}))}>
                <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                <option value="Purchase Order">Purchase Order</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Quote">Quote</option>
                <option value="Subscription">Subscription</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--muted-text)]">{labels.status}</label>
            <select className="input w-full" value={filters.status} onChange={e => setFilters(prev => ({...prev, status: e.target.value}))}>
                <option value="all">{isArabic ? 'الكل' : 'All'}</option>
                <option value="Pending">{labels.pending}</option>
                <option value="Approved">{labels.approved}</option>
                <option value="Rejected">{labels.rejected}</option>
                <option value="Converted">{labels.converted}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
        <h2 className="text-xl font-medium mb-4">{labels.listTitle}</h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted-text)]">{labels.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="nova-table w-full">
              <thead className="thead-soft">
                <tr className="text-gray-600 dark:text-gray-300">
                  <th className="text-start px-3 min-w-[100px]">{labels.id}</th>
                  <th className="text-start px-3 min-w-[120px]">{labels.type}</th>
                  <th className="text-start px-3 min-w-[150px]">{labels.customer}</th>
                  <th className="text-start px-3 min-w-[150px]">{labels.item}</th>
                  <th className="text-start px-3 min-w-[100px]">{labels.date}</th>
                  <th className="text-start px-3 min-w-[100px]">{labels.amount}</th>
                  <th className="text-center px-3 min-w-[100px]">{labels.status}</th>
                  <th className="text-center px-3 min-w-[120px]">{labels.actions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-3 text-sm font-medium text-blue-600 dark:text-blue-400">{req.id}</td>
                    <td className="px-3">
                        <div className="flex items-center gap-2 text-sm">
                            <TypeIcon type={req.type} />
                            <span>{req.type}</span>
                        </div>
                    </td>
                    <td className="px-3 text-sm font-medium">{req.customer}</td>
                    <td className="px-3 text-sm">{req.item}</td>
                    <td className="px-3 text-sm text-[var(--muted-text)]">{req.date}</td>
                    <td className="px-3 text-sm font-mono font-semibold">{req.amount > 0 ? req.amount : '-'}</td>
                    <td className="px-3 text-center">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {req.status === 'Pending' && (
                            <>
                                <button 
                                    onClick={() => handleStatusChange(req.id, 'Approved')}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                    title={isRTL ? 'قبول' : 'Approve'}
                                >
                                    <FaCheck size={16} />
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(req.id, 'Rejected')}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                    title={isRTL ? 'رفض' : 'Reject'}
                                >
                                    <FaTimes size={16} />
                                </button>
                            </>
                        )}
                        {req.status === 'Approved' && (
                            <button 
                                onClick={() => handleConvertToDeal(req.id)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                title={labels.convert}
                            >
                                <FaFileContract size={16} />
                            </button>
                        )}
                        <button 
                            onClick={() => onDelete(req.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title={labels.delete}
                        >
                            <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filtered.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-between rounded-xl p-2 glass-panel gap-4">
              <div className="text-xs text-[var(--muted-text)]">
                {isArabic 
                  ? `عرض ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)} من ${filtered.length}` 
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length}`}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    title={isArabic ? 'السابق' : 'Prev'}
                  >
                    <FaChevronLeft className={isArabic ? 'scale-x-[-1]' : ''} />
                  </button>
                  <span className="text-sm whitespace-nowrap">{isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    title={isArabic ? 'التالي' : 'Next'}
                  >
                    <FaChevronRight className={isArabic ? 'scale-x-[-1]' : ''} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[var(--muted-text)] whitespace-nowrap">{isArabic ? 'لكل صفحة:' : 'Per page:'}</span>
                  <select
                    className="input w-24 text-sm py-0 px-2 h-8"
                    value={itemsPerPage}
                    onChange={e => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                  </select>
                </div>
              </div>
            </div>
        )}
      </div>

      {showImportModal && (
        <RequestsImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          isRTL={isRTL}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6 overflow-y-auto">
            <div className="card p-4 sm:p-6 mt-4 w-[95vw] sm:w-[85vw] lg:w-[60vw] xl:max-w-3xl my-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">{labels.formTitle}</h2>
                <button type="button" className="btn btn-glass btn-sm text-red-500 hover:text-red-600" onClick={() => setShowForm(false)} aria-label={labels.close}>
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-sm mb-1">{labels.type}</label>
                  <select name="type" className="input w-full" value={form.type} onChange={onChange}>
                    <option value="Purchase Order">Purchase Order</option>
                    <option value="Inquiry">Inquiry</option>
                    <option value="Quote">Quote</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">{labels.date}</label>
                  <input type="date" name="date" value={form.date} onChange={onChange} className="input w-full" required />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">{labels.customer}</label>
                  <input name="customer" value={form.customer} onChange={onChange} placeholder={labels.customer} className="input w-full" required />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">{labels.item}</label>
                  <input name="item" value={form.item} onChange={onChange} placeholder={labels.item} className="input w-full" required />
                </div>

                <div>
                  <label className="block text-sm mb-1">{labels.amount}</label>
                  <input type="number" name="amount" value={form.amount} onChange={onChange} placeholder="0.00" className="input w-full" />
                </div>

                <div>
                  <label className="block text-sm mb-1">{labels.status}</label>
                  <select name="status" className="input w-full" value={form.status} onChange={onChange}>
                    <option value="Pending">{labels.pending}</option>
                    <option value="Approved">{labels.approved}</option>
                    <option value="Rejected">{labels.rejected}</option>
                    <option value="Converted">{labels.converted}</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">{labels.notes}</label>
                  <textarea name="notes" value={form.notes} onChange={onChange} placeholder={labels.notes} className="input w-full min-h-[80px]" />
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
  )
}
