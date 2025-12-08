import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaColumns, FaUndoAlt } from 'react-icons/fa';

const ColumnToggle = ({ columns, visibleColumns, onColumnToggle, onResetColumns }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-label={t('Display Options')}
        title={t('Display Options')}
      >
        <FaColumns className="h-5 w-5" />
        <span className="text-sm font-medium">{t('Display Options')}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-lg shadow-xl bg-[var(--panel-bg)] text-[var(--content-text)] ring-1 ring-[var(--panel-border)] z-50">
          <div className="p-3 space-y-3" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">
                {t('Show/Hide Columns')}
              </div>
              {onResetColumns && (
                <button
                  type="button"
                  onClick={onResetColumns}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[var(--table-header-bg)] hover:bg-[var(--table-row-hover)] text-[var(--content-text)]"
                  title={t('Reset Columns')}
                >
                  <FaUndoAlt className="h-3 w-3" />
                  {t('Reset Columns')}
                </button>
              )}
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Search columns...')}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--content-text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="max-h-64 overflow-y-auto divide-y divide-[var(--divider)]">
              {Object.keys(columns)
                .filter((key) => columns[key].toLowerCase().includes(searchTerm.toLowerCase()))
                .map((key) => (
                  <label key={key} className="flex items-center gap-3 px-2 py-2 text-sm hover:bg-[var(--table-row-hover)] cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      checked={visibleColumns[key]}
                      onChange={() => onColumnToggle(key)}
                    />
                    <span>{columns[key]}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnToggle;