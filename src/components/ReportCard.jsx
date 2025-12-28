import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ReportCard({ titleKey, descKey, to, Icon }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 grid place-items-center text-blue-600 dark:text-blue-300">
          {Icon ? <Icon /> : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 3h2v11h-2V10zm4-6h2v17h-2V4zm4 9h2v8h-2v-8z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base">{t(titleKey)}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 leading-6">{t(descKey)}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <Link to={to} className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          <span className="text-sm font-medium">{t('Open')}</span>
          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 grid place-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13 5l7 7-7 7M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}