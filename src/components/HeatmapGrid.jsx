import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const normalize = (s) => String(s || '').trim().toLowerCase()

function hexToRgb(hex) {
  try {
    const h = (hex || '').replace('#', '')
    const bigint = parseInt(h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  } catch {
    return { r: 59, g: 130, b: 246 } // default blue
  }
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function HeatmapGrid({ rows = [], stages = [], data = {}, valueFormatter = (v) => String(v) }) {
  const { t, i18n } = useTranslation()

  const stageKeys = useMemo(() => stages.map(s => normalize(s.name)), [stages])
  const maxValue = useMemo(() => {
    let m = 0
    rows.forEach(row => {
      stageKeys.forEach(k => {
        const v = (data?.[row]?.[k]) || 0
        if (v > m) m = v
      })
    })
    return m || 1
  }, [rows, data, stageKeys])

  const textColorForAlpha = (alpha) => alpha >= 0.55 ? 'text-white' : 'text-gray-900 dark:text-gray-100'

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-gray-700">
            <th className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium">{t('Salesperson')}</th>
            {stages.map((s, idx) => (
              <th key={idx} className="px-3 py-2 text-gray-700 dark:text-gray-200 font-medium">
                <div className="flex items-center gap-2">
                  {s.icon && <span className="text-sm">{s.icon}</span>}
                  <span>{i18n.language === 'ar' ? (s.nameAr || s.name) : s.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-gray-800 dark:text-gray-100 font-medium">{row}</td>
              {stages.map((s, cIdx) => {
                const key = normalize(s.name)
                const v = (data?.[row]?.[key]) || 0
                const ratio = Math.min(1, v / maxValue)
                const bg = rgbaFromHex(s.color || '#3b82f6', 0.18 + ratio * 0.62)
                const txt = textColorForAlpha(0.18 + ratio * 0.62)
                return (
                  <td key={cIdx} className="px-3 py-2">
                    <div className="rounded-md text-center px-2 py-2" style={{ backgroundColor: bg }}>
                      <span className={`${txt} font-semibold`}>{valueFormatter(v)}</span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}