import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaFilter, FaSearch, FaTimes, FaEdit, FaTrash, FaCheck, FaBan, FaFileContract, FaShoppingCart, FaQuestionCircle, FaFileInvoice, FaSync, FaPlus } from 'react-icons/fa'

export default function RequestsPage() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const isRTL = isArabic

  const labels = useMemo(() => ({
    title: isArabic ? 'طلبات المخزون العام' : 'General Inventory Requests',
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

  // Initial Seed Data
  const SEED_DATA = [
    { id: 'REQ-1001', type: 'Purchase Order', customer: 'John Doe', item: 'Dell XPS 15', date: '2024-03-15', status: 'Pending', amount: 1200, notes: 'Urgent request for new hire' },
    { id: 'REQ-1002', type: 'Inquiry', customer: 'Jane Smith', item: 'CRM Subscription', date: '2024-03-14', status: 'Approved', amount: 0, notes: 'Client asking for pricing tiers' },
    { id: 'REQ-1003', type: 'Quote', customer: 'Mike Johnson', item: 'Web Development Service', date: '2024-03-13', status: 'Rejected', amount: 2500, notes: 'Budget too high for client' },
    { id: 'REQ-1004', type: 'Subscription', customer: 'Sarah Wilson', item: 'Monthly Maintenance', date: '2024-03-12', status: 'Pending', amount: 300, notes: 'Renewal discussion pending' },
    { id: 'REQ-1005', type: 'Purchase Order', customer: 'Tom Brown', item: 'Office Chair', date: '2024-03-10', status: 'Approved', amount: 500, notes: 'Ergonomic chair for manager' },
    { id: 'REQ-1006', type: 'Inquiry', customer: 'Emily Davis', item: 'Cloud Storage', date: '2024-03-09', status: 'Converted', amount: 0, notes: 'Interested in enterprise plan' },
    { id: 'REQ-1007', type: 'Quote', customer: 'David Lee', item: 'Mobile App Design', date: '2024-03-08', status: 'Pending', amount: 4500, notes: 'Awaiting feedback on proposal' },
    { id: 'REQ-1008', type: 'Purchase Order', customer: 'Lisa White', item: 'Monitor 27"', date: '2024-03-07', status: 'Approved', amount: 350, notes: 'Replacement for broken screen' },
    { id: 'REQ-1009', type: 'Subscription', customer: 'Robert Green', item: 'SEO Optimization', date: '2024-03-06', status: 'Pending', amount: 800, notes: 'Quarterly review needed' },
    { id: 'REQ-1010', type: 'Inquiry', customer: 'Karen Black', item: 'Security Audit', date: '2024-03-05', status: 'Rejected', amount: 0, notes: 'Not interested at this time' },
    { id: 'REQ-1011', type: 'Quote', customer: 'James Wilson', item: 'Custom Software', date: '2024-03-04', status: 'Approved', amount: 15000, notes: 'Signed contract received' },
    { id: 'REQ-1012', type: 'Purchase Order', customer: 'Patricia Moore', item: 'Keyboard & Mouse', date: '2024-03-03', status: 'Pending', amount: 120, notes: 'Standard office supplies' },
    { id: 'REQ-1013', type: 'Subscription', customer: 'Jennifer Taylor', item: 'Email Marketing', date: '2024-03-02', status: 'Converted', amount: 200, notes: 'Upgraded to pro plan' },
    { id: 'REQ-1014', type: 'Inquiry', customer: 'Charles Anderson', item: 'Data Analysis', date: '2024-03-01', status: 'Pending', amount: 0, notes: 'Checking feasibility' },
    { id: 'REQ-1015', type: 'Quote', customer: 'Linda Martinez', item: 'Network Setup', date: '2024-02-29', status: 'Approved', amount: 3000, notes: 'Installation scheduled next week' },
    { id: 'REQ-1016', type: 'Purchase Order', customer: 'Michael Thompson', item: 'Printer Toner', date: '2024-02-28', status: 'Pending', amount: 400, notes: 'Low stock alert' },
    { id: 'REQ-1017', type: 'Subscription', customer: 'Barbara Hernandez', item: 'Video Conferencing', date: '2024-02-27', status: 'Rejected', amount: 150, notes: 'Switching to competitor' },
    { id: 'REQ-1018', type: 'Inquiry', customer: 'William Clark', item: 'IT Support', date: '2024-02-26', status: 'Converted', amount: 0, notes: 'Signed annual agreement' },
    { id: 'REQ-1019', type: 'Quote', customer: 'Elizabeth Rodriguez', item: 'Server Upgrade', date: '2024-02-25', status: 'Pending', amount: 5000, notes: 'Waiting for budget approval' },
    { id: 'REQ-1020', type: 'Purchase Order', customer: 'Joseph Lewis', item: 'Tablet', date: '2024-02-24', status: 'Approved', amount: 800, notes: 'For field sales team' }
  ]

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

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)) } catch (e) { void e }
  }, [requests])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!form.customer || !form.item) return

    if (form.id && !form.id.toString().startsWith('NEW-')) {
      // Edit existing
      setRequests(prev => prev.map(r => r.id === form.id ? { ...form, amount: Number(form.amount) || 0 } : r))
    } else {
      // Add new
      const newRequest = {
        ...form,
        id: `REQ-${Math.floor(Math.random() * 10000)}`,
        amount: Number(form.amount) || 0
      }
      setRequests(prev => [newRequest, ...prev])
    }
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

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="relative inline-block">
          <h1 className="page-title text-2xl font-semibold">{labels.title}</h1>
          <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isArabic ? 'auto' : '-4px', right: isArabic ? '-4px' : 'auto', bottom: '-4px' }}></span>
        </div>
        <div className="flex items-center gap-2">
           <button className="btn btn-sm bg-green-600 hover:bg-green-500 text-white border-none gap-2" onClick={() => {
              resetForm();
              setShowForm(true);
          }}>
              <FaPlus />
              {labels.add}
          </button>
        </div>
      </div>

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
                {filtered.map(req => (
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
                    <td className="px-3 text-sm font-mono font-semibold">{req.amount > 0 ? `$${req.amount}` : '-'}</td>
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
                            onClick={() => onEdit(req)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title={labels.edit}
                        >
                            <FaEdit size={16} />
                        </button>
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
      </div>

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
