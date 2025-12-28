import React from 'react'
import { LuCalendarRange, LuUser, LuRefreshCw, LuLoader } from 'react-icons/lu'

const FilterBar = ({
  startDate,
  endDate,
  salesperson,
  salespeople = [],
  onChange,
  onUpdate,
  updating = false
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-2">
        <LuCalendarRange className="text-gray-300" />
        <input
          type="date"
          name="startDate"
          value={startDate || ''}
          onChange={onChange}
          className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100"
        />
        <span className="text-gray-400">—</span>
        <input
          type="date"
          name="endDate"
          value={endDate || ''}
          onChange={onChange}
          className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <LuUser className="text-gray-300" />
        <select
          name="salesperson"
          value={salesperson || ''}
          onChange={onChange}
          className="px-3 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 min-w-40"
        >
          <option value="">All Salespeople</option>
          {salespeople.map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 md:ml-auto">
        <button
          onClick={onUpdate}
          disabled={updating}
          aria-busy={updating}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-blue-500 bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {updating ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuRefreshCw className="w-4 h-4" />}
          {updating ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  )
}

export default FilterBar