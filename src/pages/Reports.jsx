import React from 'react';
import Layout from '@shared/layouts/Layout';
import { useTranslation } from 'react-i18next';
import ReportsKpis from '../components/ReportsKpis';
import EmployeesReportingStats from '../components/EmployeesReportingStats';

export default function Reports() {
  const { t } = useTranslation();

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('Reports Dashboard')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 glass-panel rounded-lg shadow-md">
          <ReportsKpis />
        </div>
        <div className="p-4 glass-panel rounded-lg shadow-md">
          <EmployeesReportingStats />
        </div>
      </div>
    </Layout>
  );
}