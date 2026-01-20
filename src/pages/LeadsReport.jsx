import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
// Layout removed per app-level layout usage
import { mockReservationData, mockCallsData, mockTeamsData, mockTotalAccounts } from '../data/mockData';
import Tabs from '../components/LeadsReport/Tabs';
import SalesActions from '../components/LeadsReport/SalesActions';
import SalesLeads from '../components/LeadsReport/SalesLeads';
import { RefreshCw, Loader } from 'lucide-react';

// Simulate API fetch
const fetchData = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        reservationData: mockReservationData,
        callsData: mockCallsData,
        teamsData: mockTeamsData,
        totalAccounts: mockTotalAccounts,
        leads: JSON.parse(localStorage.getItem('leads')) || [],
      });
    }, 1000);
  });
};

const LeadsReport = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [activeTab, setActiveTab] = useState('actions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ reservationData: [], callsData: [], teamsData: [], totalAccounts: 0, leads: [] });
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString());
  const [updating, setUpdating] = useState(false);

  const [filters, setFilters] = useState({
    manager: '',
    employee: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  const handleUpdate = () => {
    // Smooth UX: keep page visible, just show button loading state
    if (updating) return;
    setUpdating(true);
    fetchData()
      .then(fetchedData => {
        setData(fetchedData);
        setLastUpdate(new Date().toLocaleString());
        setUpdating(false);
      })
      .catch(err => {
        setError('Failed to fetch data');
        setUpdating(false);
      });
  };

  // Keyboard shortcut: press "u" to update
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'u') {
        handleUpdate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [updating]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads-report.xlsx');
  };

  if (loading) return <><div>Loading...</div></>;
  if (error) return <><div>{error}</div></>;

  return (
    <>
      <div className="p-4 md:p-6 bg-[#0f172a] text-[#f1f5f9] rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row items-start md:items-center md:justify-between">
          <div className="self-start">
            <BackButton to="/reports" />
            <h1 className="text-2xl font-semibold text-left">{isRTL ? 'تقرير العملاء المحتملين' : 'Leads Report'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{isRTL ? 'آخر تحديث' : 'Last update'}: {lastUpdate}</span>
            <button
              onClick={handleUpdate}
              title={isRTL ? 'تحديث' : 'Update'}
              aria-label={isRTL ? 'تحديث' : 'Update'}
              aria-busy={updating}
              aria-disabled={updating}
              disabled={updating}
              className="relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/40 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-400"
            >
              {updating ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {updating ? (isRTL ? 'جاري التحديث...' : 'Updating...') : (isRTL ? 'تحديث' : 'Update')}
            </button>
            <span className="sr-only" aria-live="polite">{updating ? 'Updating data' : 'Data up to date'}</span>
          </div>
        </div>
        <div className="mt-3 border-t border-gray-800" />

        {/* Tabs */}
        <div className="mt-4">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="mt-10">
          {activeTab === 'actions' && 
            <SalesActions 
              reservationData={data.reservationData} 
              callsData={data.callsData} 
              teamsData={data.teamsData} 
              totalAccounts={data.totalAccounts}
              lastUpdate={lastUpdate}
              onUpdate={handleUpdate}
            />
          }
          {activeTab === 'leads' && <SalesLeads leads={data.leads} />}
        </div>
      </div>
    </>
  );
};

export default LeadsReport;
