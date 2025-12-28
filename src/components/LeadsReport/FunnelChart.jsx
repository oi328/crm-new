import React from 'react'

// Simple funnel using progress bars to visualize stages
const stageColors = {
  New: '#60a5fa',
  Contacted: '#34d399',
  Qualified: '#f59e0b',
  Proposal: '#a78bfa',
  Closed: '#22d3ee'
}

const FunnelChart = ({ stages = [] }) => {
  const total = stages.reduce((s, st) => s + (st.count || 0), 0) || 1
  return (
    <div className="space-y-3">
      {stages.map((st, idx) => {
        const pct = Math.round(((st.count || 0) / total) * 100)
        const color = st.color || stageColors[st.label] || '#64748b'
        return (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-200">{st.label}</div>
              <div className="text-xs text-gray-400">{st.count} • {pct}%</div>
            </div>
            <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FunnelChart