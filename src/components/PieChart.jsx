import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

export const PieChart = ({ title, data }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: [
          '#3b82f6',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#6366f1',
          '#8b5cf6',
          '#ec4899',
          '#14b8a6',
        ],
        borderColor: [
          '#1e40af',
          '#b91c1c',
          '#047857',
          '#b45309',
          '#4338ca',
          '#5b21b6',
          '#be185d',
          '#0f766e',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isRTL ? 'right' : 'left',
        labels: {
          color: '#e2e8f0', // Light text for dark mode compatibility if needed
          font: {
            family: isRTL ? 'Cairo' : 'Inter',
          }
        },
        rtl: isRTL,
      },
      title: {
        display: !!title,
        text: title,
        color: '#e2e8f0',
        font: {
          size: 16,
          family: isRTL ? 'Cairo' : 'Inter',
        }
      },
      tooltip: {
        rtl: isRTL,
        titleFont: {
          family: isRTL ? 'Cairo' : 'Inter',
        },
        bodyFont: {
          family: isRTL ? 'Cairo' : 'Inter',
        }
      }
    },
  };

  return (
    <div className="w-full h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
