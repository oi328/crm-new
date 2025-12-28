import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { useTranslation } from 'react-i18next'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function ReportingOverTimeChart({ series }) {
  const { t } = useTranslation()
  const labels = series?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const values = series?.values || [8, 10, 9, 12, 15, 18, 16, 20, 22, 24, 23, 28]
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const tickColor = isDark ? '#e5e7eb' : '#374151'

  const data = {
    labels,
    datasets: [
      {
        label: t('Reports'),
        data: values,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#22c55e',
        fill: true
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } } },
      y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 12 } } }
    },
    plugins: { legend: { display: false } }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text">{t('Reporting Over Time')}</h3>
      <div style={{ height: '220px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}