import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    FaSearch, FaFilter, FaPlus, FaCheck, FaTimes, FaFileContract, 
    FaBuilding, FaUser, FaClipboardList, FaEllipsisV, FaChevronDown, FaEdit, FaTrash 
} from 'react-icons/fa';
import SearchableSelect from '../../components/SearchableSelect';

const MOCK_REQUESTS = [
    { id: 1, customer: 'Ahmed Ali', project: 'Nile Tower', unit: 'NTR-101', status: 'Pending', type: 'Booking', date: '2025-12-25' },
    { id: 2, customer: 'Sarah Smith', project: 'October Park', unit: 'OBP-205', status: 'Approved', type: 'Inquiry', date: '2025-12-24' },
    { id: 3, customer: 'Mohamed Hassan', project: 'Nile Tower', unit: 'NTR-105', status: 'Rejected', type: 'Maintenance', date: '2025-12-23' },
    { id: 4, customer: 'Laila Mahmoud', project: 'Sea View', unit: 'SV-303', status: 'Converted', type: 'Booking', date: '2025-12-22' },
    { id: 5, customer: 'Omar Khaled', project: 'Zayed Heights', unit: 'ZHT-102', status: 'Pending', type: 'Inquiry', date: '2025-12-21' },
    { id: 6, customer: 'Nour El-Din', project: 'Maadi Gardens', unit: 'MGD-404', status: 'Approved', type: 'Booking', date: '2025-12-20' },
    { id: 7, customer: 'Fatma Ibrahim', project: 'Nasr City Hub', unit: 'NCH-202', status: 'Pending', type: 'Maintenance', date: '2025-12-19' },
    { id: 8, customer: 'Karim Adel', project: 'Nile Tower', unit: 'NTR-305', status: 'Converted', type: 'Booking', date: '2025-12-18' },
    { id: 9, customer: 'Yasmine Zaki', project: 'Sea View', unit: 'SV-101', status: 'Rejected', type: 'Inquiry', date: '2025-12-17' },
    { id: 10, customer: 'Hassan Moustafa', project: 'October Park', unit: 'OBP-505', status: 'Pending', type: 'Booking', date: '2025-12-16' },
    { id: 11, customer: 'Rana Ahmed', project: 'Zayed Heights', unit: 'ZHT-303', status: 'Approved', type: 'Maintenance', date: '2025-12-15' },
    { id: 12, customer: 'Tarek Salim', project: 'Maadi Gardens', unit: 'MGD-101', status: 'Converted', type: 'Booking', date: '2025-12-14' },
    { id: 13, customer: 'Mona Farouk', project: 'Nasr City Hub', unit: 'NCH-105', status: 'Pending', type: 'Inquiry', date: '2025-12-13' },
    { id: 14, customer: 'Khaled Saeed', project: 'Nile Tower', unit: 'NTR-202', status: 'Rejected', type: 'Booking', date: '2025-12-12' },
    { id: 15, customer: 'Dina Magdy', project: 'Sea View', unit: 'SV-404', status: 'Approved', type: 'Maintenance', date: '2025-12-11' },
    { id: 16, customer: 'Amr Diab', project: 'October Park', unit: 'OBP-101', status: 'Pending', type: 'Inquiry', date: '2025-12-10' },
    { id: 17, customer: 'Sherine Reda', project: 'Zayed Heights', unit: 'ZHT-505', status: 'Converted', type: 'Booking', date: '2025-12-09' },
    { id: 18, customer: 'Mahmoud El-Gendy', project: 'Maadi Gardens', unit: 'MGD-202', status: 'Pending', type: 'Maintenance', date: '2025-12-08' },
    { id: 19, customer: 'Samia Gamal', project: 'Nasr City Hub', unit: 'NCH-303', status: 'Approved', type: 'Booking', date: '2025-12-07' },
    { id: 20, customer: 'Fady Youssef', project: 'Nile Tower', unit: 'NTR-404', status: 'Pending', type: 'Inquiry', date: '2025-12-06' }
];

export default function RealEstateRequestsPage() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    const STORAGE_KEY = 'real_estate_requests';

    const [requests, setRequests] = useState([]);
    const [showAllFilters, setShowAllFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        project: '',
        unit: '',
        customer: '',
        search: ''
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newRequest, setNewRequest] = useState({
        customer: '',
        project: '',
        unit: '',
        type: 'Booking',
        notes: ''
    });

    // Load data from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setRequests(JSON.parse(stored));
            } else {
                setRequests(MOCK_REQUESTS);
            }
        } catch (error) {
            console.error('Error loading requests:', error);
            setRequests(MOCK_REQUESTS);
        }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        try {
            if (requests.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
            }
        } catch (error) {
            console.error('Error saving requests:', error);
        }
    }, [requests]);

    // Derived Data
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const pool = [req.customer, req.unit, req.project, req.type].map(x => (x || '').toLowerCase());
                if (!pool.some(v => v.includes(q))) return false;
            }
            if (filters.status && req.status !== filters.status) return false;
            if (filters.project && req.project !== filters.project) return false;
            if (filters.unit && !req.unit.toLowerCase().includes(filters.unit.toLowerCase())) return false;
            if (filters.customer && !req.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;
            return true;
        });
    }, [requests, filters]);

    const projectOptions = useMemo(() => [...new Set(requests.map(r => r.project))], [requests]);
    const statusOptions = ['Pending', 'Approved', 'Rejected', 'Converted'];

    // Handlers
    const handleStatusChange = (id, newStatus) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    };

    const handleAddRequest = (e) => {
        e.preventDefault();
        if (editingId) {
            setRequests(prev => prev.map(r => r.id === editingId ? { ...r, ...newRequest } : r));
            setEditingId(null);
        } else {
            const request = {
                id: Date.now(),
                ...newRequest,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0]
            };
            setRequests(prev => [request, ...prev]);
        }
        setShowAddModal(false);
        setNewRequest({ customer: '', project: '', unit: '', type: 'Booking', notes: '' });
    };

    const handleEdit = (request) => {
        setEditingId(request.id);
        setNewRequest({
            customer: request.customer,
            project: request.project,
            unit: request.unit,
            type: request.type,
            notes: request.notes || ''
        });
        setShowAddModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete this request?')) {
            setRequests(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleConvertToDeal = (request) => {
        // Create a new opportunity in localStorage
        const newOpportunity = {
            id: `OPP-RE-${Date.now()}`,
            customerId: request.customerId || `CUST-${Math.floor(Math.random() * 1000)}`,
            customerName: request.customer,
            status: 'New',
            amount: request.budget || 0,
            stage: 'Qualification',
            expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks for Real Estate
            createdAt: new Date().toISOString(),
            notes: `Converted from Real Estate Request #${request.id} for Project: ${request.project || 'N/A'}, Unit: ${request.unit || 'N/A'}. ${request.notes || ''}`,
            source: 'Real Estate Request'
        };

        try {
            const stored = localStorage.getItem('crm_opportunities');
            const opportunities = stored ? JSON.parse(stored) : [];
            opportunities.unshift(newOpportunity);
            localStorage.setItem('crm_opportunities', JSON.stringify(opportunities));
            
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('crm_opportunities_updated'));
            
            alert(isRTL ? 'تم تحويل الطلب إلى صفقة بنجاح' : 'Request converted to deal successfully');
        } catch (error) {
            console.error('Error converting to deal:', error);
            alert(isRTL ? 'حدث خطأ أثناء التحويل' : 'Error converting to deal');
        }
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            project: '',
            unit: '',
            customer: '',
            search: ''
        });
    };

    return (
        <div className="space-y-6 pt-4">
            {/* Header */}
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="relative inline-block">
                    <h1 className={`text-2xl font-bold  dark:text-white flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'طلبات العقارات' : 'Real Estate Requests'}
                    </h1>
                    <span aria-hidden className="absolute block h-[1px] rounded bg-gradient-to-r from-blue-500 via-purple-500 to-transparent" style={{ width: 'calc(100% + 8px)', left: isRTL ? 'auto' : '-4px', right: isRTL ? '-4px' : 'auto', bottom: '-4px' }}></span>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setNewRequest({ customer: '', project: '', unit: '', type: 'Booking', notes: '' });
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-sm"
                >
                    <FaPlus size={14} />
                    {isRTL ? 'إضافة طلب' : 'Add Request'}
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <FaFilter className="text-blue-500" /> {isRTL ? 'تصفية' : 'Filter'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setShowAllFilters(prev => !prev)} 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                        >
                            {showAllFilters ? (isRTL ? 'إخفاء' : 'Hide') : (isRTL ? 'إظهار' : 'Show')} <FaChevronDown className={`transform transition-transform ${showAllFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <button 
                            onClick={clearFilters} 
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            {isRTL ? 'مسح المرشحات' : 'Clear Filters'}
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-text)] flex items-center gap-1">
                            <FaSearch className="text-blue-500" size={10} /> {isRTL ? 'بحث' : 'Search'}
                        </label>
                        <input 
                            className="input w-full" 
                            value={filters.search} 
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} 
                            placeholder={isRTL ? 'بحث...' : 'Search...'} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-text)]">{isRTL ? 'المشروع' : 'Project'}</label>
                        <SearchableSelect 
                            options={projectOptions} 
                            value={filters.project} 
                            onChange={val => setFilters(prev => ({ ...prev, project: val }))} 
                            isRTL={isRTL} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-text)]">{isRTL ? 'العميل' : 'Customer'}</label>
                        <input 
                            className="input w-full" 
                            value={filters.customer} 
                            onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))} 
                            placeholder={isRTL ? 'اسم العميل' : 'Customer Name'} 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-text)]">{isRTL ? 'الوحدة' : 'Unit'}</label>
                        <input 
                            className="input w-full" 
                            value={filters.unit} 
                            onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))} 
                            placeholder={isRTL ? 'رقم الوحدة' : 'Unit Number'} 
                        />
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300 overflow-hidden ${showAllFilters ? 'max-h-[300px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-[var(--muted-text)]">{isRTL ? 'الحالة' : 'Status'}</label>
                        <select 
                            className="input w-full" 
                            value={filters.status} 
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="">{isRTL ? 'الكل' : 'All'}</option>
                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card p-4 sm:p-6 bg-transparent" style={{ backgroundColor: 'transparent' }}>
                <h2 className="text-xl font-medium mb-4">{isRTL ? 'قائمة الطلبات' : 'Requests List'}</h2>
                <div className="overflow-x-auto">
                    <table className="nova-table w-full">
                        <thead className="thead-soft">
                            <tr >
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'رقم الطلب' : 'Request ID'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'النوع' : 'Type'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'العميل' : 'Customer'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المشروع' : 'Project'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الوحدة' : 'Unit'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'التاريخ' : 'Date'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider text-center`}>{isRTL ? 'الحالة' : 'Status'}</th>
                                <th className={`px-3 py-3 text-xs font-semibold  uppercase tracking-wider text-center`}>{isRTL ? 'الإجراءات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                                        #{request.id}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm  dark:text-gray-300">
                                        {request.type}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center  dark:text-blue-400 font-bold text-xs">
                                                {request.customer.charAt(0)}
                                            </div>
                                            <div className="text-sm font-medium t dark:text-white">{request.customer}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm  dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <FaBuilding  size={12} />
                                            {request.project}
                                        </div>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-mono  dark:text-gray-300">
                                        {request.unit}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm  dark:text-gray-400">
                                        {request.date}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${request.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                                              request.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 
                                              request.status === 'Converted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {request.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusChange(request.id, 'Approved')}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                                        title={isRTL ? 'قبول' : 'Approve'}
                                                    >
                                                        <FaCheck size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusChange(request.id, 'Rejected')}
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                        title={isRTL ? 'رفض' : 'Reject'}
                                                    >
                                                        <FaTimes size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {request.status === 'Approved' && (
                                                <button 
                                                    onClick={() => handleConvertToDeal(request)}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                                    title={isRTL ? 'تحويل إلى صفقة' : 'Convert to Deal'}
                                                >
                                                    <FaFileContract size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleEdit(request)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                title={isRTL ? 'تعديل' : 'Edit'}
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(request.id)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                title={isRTL ? 'حذف' : 'Delete'}
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
                {/* Pagination (Placeholder) */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm ">
                    <span>{isRTL ? 'عرض 1 إلى 4 من 4' : 'Showing 1 to 4 of 4'}</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled>{isRTL ? 'السابق' : 'Previous'}</button>
                        <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50" disabled>{isRTL ? 'التالي' : 'Next'}</button>
                    </div>
                </div>
            </div>

            {/* Add Request Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="absolute inset-0 flex items-start justify-center p-6 md:p-6">
                        <div className="card p-4 sm:p-6 mt-4 w-[92vw] sm:w-[80vw] lg:w-[60vw] xl:max-w-3xl">
                            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''} mb-4`}>
                                <h2 className="text-xl font-medium">
                                    {editingId 
                                        ? (isRTL ? 'تعديل الطلب' : 'Edit Request') 
                                        : (isRTL ? 'إضافة طلب جديد' : 'Add New Request')
                                    }
                                </h2>
                                <button 
                                    type="button" 
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-red-600 hover:bg-red-50 shadow-md transition-colors" 
                                    onClick={() => setShowAddModal(false)}
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-primary)]">{isRTL ? 'العميل' : 'Customer'}</label>
                                    <input 
                                        required
                                        className="input w-full" 
                                        value={newRequest.customer}
                                        onChange={e => setNewRequest(prev => ({ ...prev, customer: e.target.value }))}
                                        placeholder={isRTL ? 'اسم العميل' : 'Customer Name'} 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-primary)]">{isRTL ? 'المشروع' : 'Project'}</label>
                                    <SearchableSelect 
                                        options={projectOptions} 
                                        value={newRequest.project}
                                        onChange={val => setNewRequest(prev => ({ ...prev, project: val }))}
                                        isRTL={isRTL}
                                        placeholder={isRTL ? 'اختر المشروع' : 'Select Project'}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-primary)]">{isRTL ? 'الوحدة' : 'Unit'}</label>
                                    <input 
                                        required
                                        className="input w-full" 
                                        value={newRequest.unit}
                                        onChange={e => setNewRequest(prev => ({ ...prev, unit: e.target.value }))}
                                        placeholder={isRTL ? 'رقم الوحدة' : 'Unit Number'} 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-primary)]">{isRTL ? 'نوع الطلب' : 'Request Type'}</label>
                                    <select 
                                        className="input w-full" 
                                        value={newRequest.type}
                                        onChange={e => setNewRequest(prev => ({ ...prev, type: e.target.value }))}
                                    >
                                        <option value="Booking">Booking</option>
                                        <option value="Inquiry">Inquiry</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-sm font-medium text-[var(--text-primary)]">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                                    <textarea 
                                        className="input w-full h-24 resize-none" 
                                        value={newRequest.notes}
                                        onChange={e => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder={isRTL ? 'تفاصيل الطلب...' : 'Request details...'}
                                    ></textarea>
                                </div>
                                <div className={`md:col-span-2 flex gap-2 ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'}`}>
                                    <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium">
                                        {isRTL ? 'حفظ' : 'Save'}
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
