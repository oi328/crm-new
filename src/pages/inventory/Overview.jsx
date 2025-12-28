import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBoxOpen, FaBuilding, FaChartLine, FaClipboardList, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

export default function InventoryOverview() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // State
  const [items, setItems] = useState([])
  const [properties, setProperties] = useState([])
  const [requests, setRequests] = useState([])

  // Load Data
  useEffect(() => {
    try {
      const loadedItems = JSON.parse(localStorage.getItem('inventoryItems') || '[]')
      setItems(loadedItems)

      const loadedProperties = JSON.parse(localStorage.getItem('inventoryProperties') || '[]')
      setProperties(loadedProperties)

      const loadedRequests = JSON.parse(localStorage.getItem('inventoryRequests') || '[]')
      setRequests(loadedRequests)
    } catch (e) {
      console.error('Failed to load inventory data', e)
    }
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    // 1. Available Units Count
    const availableUnits = properties.filter(p => p.status === 'Available').length
    const totalUnits = properties.length

    // 2. Total Inventory Value (Items Stock * Price + Properties Price)
    // Note: Properties price is often per unit, so we sum it up. Items is price * stock.
    const itemsValue = items.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.stock || 0)), 0)
    const propertiesValue = properties.reduce((acc, prop) => acc + Number(prop.price || 0), 0)
    const totalValue = itemsValue + propertiesValue

    // 3. Low Stock Items
    const lowStockCount = items.filter(i => Number(i.stock) <= Number(i.minStock)).length

    // 4. Pending Requests
    const pendingRequests = requests.filter(r => r.status === 'Pending').length

    return {
      availableUnits,
      totalUnits,
      totalValue,
      lowStockCount,
      pendingRequests
    }
  }, [items, properties, requests])

  // Chart Data
  const propertyStatusData = useMemo(() => {
    const statusCounts = properties.reduce((acc, p) => {
      const s = p.status || 'Unknown'
      acc[s] = (acc[s] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }, [properties])

  const itemCategoryData = useMemo(() => {
    const catCounts = items.reduce((acc, i) => {
      const c = i.category || 'Uncategorized'
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {})

    return Object.entries(catCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5 categories
  }, [items])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  // Labels
  const labels = {
    title: isRTL ? 'نظرة عامة على المخزون' : 'Inventory Overview',
    availableUnits: isRTL ? 'الوحدات المتاحة' : 'Available Units',
    totalValue: isRTL ? 'إجمالي قيمة المخزون' : 'Total Inventory Value',
    lowStock: isRTL ? 'أصناف منخفضة المخزون' : 'Low Stock Items',
    pendingRequests: isRTL ? 'طلبات معلقة' : 'Pending Requests',
    propertyStatus: isRTL ? 'حالة العقارات' : 'Property Status',
    itemCategories: isRTL ? 'أعلى التصنيفات (أصناف)' : 'Top Categories (Items)',
    currency: isRTL ? 'ج.م' : 'EGP'
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{labels.title}</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Units */}
        <div className="card p-4 flex items-center justify-between bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-300 font-medium mb-1">{labels.availableUnits}</p>
            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-100">{stats.availableUnits} <span className="text-sm font-normal text-blue-600 dark:text-blue-300">/ {stats.totalUnits}</span></h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center text-blue-600 dark:text-blue-200">
            <FaBuilding size={20} />
          </div>
        </div>

        {/* Total Value */}
        <div className="card p-4 flex items-center justify-between bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div>
            <p className="text-sm text-green-600 dark:text-green-300 font-medium mb-1">{labels.totalValue}</p>
            <h3 className="text-xl font-bold text-green-800 dark:text-green-100 truncate max-w-[150px]" title={formatCurrency(stats.totalValue)}>
              {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(stats.totalValue)} <span className="text-xs">{labels.currency}</span>
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center text-green-600 dark:text-green-200">
            <FaDollarSign size={20} />
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-4 flex items-center justify-between bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
          <div>
            <p className="text-sm text-orange-600 dark:text-orange-300 font-medium mb-1">{labels.lowStock}</p>
            <h3 className="text-2xl font-bold text-orange-800 dark:text-orange-100">{stats.lowStockCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-200 dark:bg-orange-700 flex items-center justify-center text-orange-600 dark:text-orange-200">
            <FaExclamationTriangle size={20} />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card p-4 flex items-center justify-between bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div>
            <p className="text-sm text-purple-600 dark:text-purple-300 font-medium mb-1">{labels.pendingRequests}</p>
            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-100">{stats.pendingRequests}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-200 dark:bg-purple-700 flex items-center justify-center text-purple-600 dark:text-purple-200">
            <FaClipboardList size={20} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Status Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">{labels.propertyStatus}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Item Categories Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">{labels.itemCategories}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={itemCategoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
