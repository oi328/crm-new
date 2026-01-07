import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useTranslation } from 'react-i18next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ChannelPerformanceChart({ channelsData, height = 240 }) {
  const { t } = useTranslation()
  const labels = ['Email', 'SMS', 'Social', 'Ads']
  const leads = channelsData?.leads || [3200, 1800, 2400, 1500]
  const spend = channelsData?.spend || [16000, 9000, 12000, 7000]
  const colors = ['#2563eb', '#f59e0b', '#22c55e', '#8b5cf6']
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const tickColor = isDark ? '#cbd5e1' : '#334155'
  const [metric, setMetric] = useState('leads') // 'leads' | 'spend'

  const data = {
    labels,
    datasets: [
      {
        label: metric === 'spend' ? t('Spend') : t('Leads'),
        data: metric === 'spend' ? spend : leads,
        backgroundColor: colors,
        borderRadius: 6,
        barThickness: 24
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 }, color: tickColor } },
      y: { grid: { display: false }, ticks: { font: { size: 12 }, color: tickColor } }
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (items) => labels[items[0].dataIndex],
          label: (ctx) => {
            const idx = ctx.dataIndex
            const l = leads[idx]
            const s = spend[idx]
            const cpl = l > 0 ? Math.round(s / l) : 0
            if (metric === 'spend') {
              return `${t('Spend')}: ${s.toLocaleString()}`
            }
            return `${t('Leads')}: ${l.toLocaleString()}`
          },
          footer: (items) => {
            const idx = items[0].dataIndex
            const l = leads[idx]
            const s = spend[idx]
            const cpl = l > 0 ? Math.round(s / l) : 0
            return `${t('CPL')}: ${cpl.toLocaleString()}`
          }
        }
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">{t('Channel Performance')}</h3>
        <div className="inline-flex items-center gap-1 rounded-full border px-1 py-1 bg-[var(--dropdown-bg)]">
          <button onClick={()=>setMetric('leads')} className={`px-2 py-1 text-xs rounded-full ${metric==='leads' ? 'bg-blue-500 text-white' : 'hover:bg-white/20'}`}>{t('Leads')}</button>
          <button onClick={()=>setMetric('spend')} className={`px-2 py-1 text-xs rounded-full ${metric==='spend' ? 'bg-amber-500 text-white' : 'hover:bg-white/20'}`}>{t('Spend')}</button>
        </div>
      </div>
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <Bar data={data} options={options} />
      </div>
      <div className="mt-3 text-xs text-[var(--muted-text)] dark:text-blue-200 text-center">{t('Last 30 Days')}</div>
    </div>
  )
}
