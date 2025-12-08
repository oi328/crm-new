import React from 'react'

export function FunnelChart({
  segments = [],
  width = 380,
  sliceHeight = 30,
  gap = 10,
  showConversions = true,
  formatValue,
}) {
  const max = Math.max(...segments.map(s => s.value), 1)
  const total = segments.reduce((t, x) => t + x.value, 0) || 1
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
  const mutedColor = isDark ? 'text-gray-300' : 'text-gray-600'

  return (
    <div style={{ width }} className="mx-auto">
      {segments.map((s, idx) => {
        const w = Math.max(48, Math.round((s.value / max) * width))
        const pct = Math.round((s.value / total) * 100)
        const displayValue = formatValue ? formatValue(s.value) : s.value.toLocaleString()
        const start = s.colorStart || s.color || '#3b82f6'
        const end = s.colorEnd || s.color || '#1e40af'
        const next = segments[idx + 1]
        const conv = next && s.value > 0 ? Math.round((next.value / s.value) * 100) : null
        return (
          <div key={s.label} style={{ marginBottom: gap }}>
            <div className="relative" style={{ height: sliceHeight }}>
              <div
                style={{
                  width: w,
                  height: sliceHeight,
                  margin: '0 auto',
                  clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
                  backgroundImage: `linear-gradient(90deg, ${start}, ${end})`,
                }}
                className="rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
                title={`${s.label}: ${displayValue} (${pct}%)`}
              />
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className={`text-xs ${textColor} flex items-center gap-2`}>
                  {s.icon ? (
                    <span className="text-sm">{s.icon}</span>
                  ) : (
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: start }} />
                  )}
                  {s.label}
                </span>
                <span className={`text-xs ${mutedColor}`}>{displayValue} • {pct}%</span>
              </div>
            </div>
            {showConversions && conv !== null && (
              <div className="flex items-center justify-center mt-1">
                <span className={`text-[11px] ${mutedColor}`}>↓ {conv}%</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}