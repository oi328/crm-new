import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@shared/components/Sidebar';
import Topbar from '@shared/components/Topbar';

export const BlankPage = () => {
  const { t } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 sidebar-collapsible">
        <Sidebar 
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>


      {/* Content container */}
      <div className="content-container flex flex-col flex-1 min-h-0 transition-all duration-200">
        {/* Header */}
        <Topbar 
          onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          mobileSidebarOpen={mobileSidebarOpen}
        />

        <main className="flex-1 p-4 space-y-4 bg-[var(--content-bg)] text-[var(--content-text)] overflow-auto">
          {/* Page Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('Blank Page')}</h1>
          
          {/* Empty Content */}
          <div className="p-4 bg-white dark:bg-blue-900 rounded-lg shadow-md h-full">
            {/* صفحة بيضاء فارغة */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BlankPage;