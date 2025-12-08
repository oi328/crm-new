import React from 'react'

const DataTable = ({ columns = [], rows = [], align = [] }) => {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#0b1220] overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[#0b1220]">
          <tr className="text-left">
            {columns.map((c, i) => (
              <th key={i} className="px-3 py-2 font-medium text-gray-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-gray-900 even:bg-gray-800 hover:bg-gray-700 transition">
              {r.map((cell, j) => (
                <td key={j} className={`px-3 py-2 ${align[j] === 'right' ? 'text-right' : 'text-left'}`}>{cell}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-3 text-center text-gray-400" colSpan={columns.length}>No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable