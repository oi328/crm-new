import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useTranslation } from 'react-i18next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ChannelPerformanceChart({ channelsData, height = 240 }) {
  const { t } = useTranslation()
  const labels = ['Email', 'SMS', 'Social', 'Ads']
  const values = channelsData?.values || [3200, 1800, 2400, 1500]
  const colors = ['#2563eb', '#f59e0b', '#22c55e', '#8b5cf6']
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const tickColor = isDark ? '#e5e7eb' : '#374151'

  const data = {
    labels,
    datasets: [
      {
        label: t('Channel Performance'),
        data: values,
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
    plugins: { legend: { display: false } }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">{t('Channel Performance')}</h3>
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <Bar data={data} options={options} />
      </div>
      <div className="mt-3 text-xs text-[var(--muted-text)] dark:text-blue-200">{t('Last 30 Days')}</div>
    </div>
  )
}