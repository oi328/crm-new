import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaDownload, FaFileExcel } from 'react-icons/fa'
import * as XLSX from 'xlsx'

const ImportLeadsModal = ({
  isOpen,
  onClose,
  excelFile,
  setExcelFile,
  importing,
  importError,
  importSummary,
  onImport,
}) => {
  const { t, i18n } = useTranslation()

  // دالة توليد ملف Excel التيمبليت
  const generateTemplate = () => {
    const templateData = [
      {
        'LEAD': 'أحمد محمد',
        'Email': 'ahmed@example.com', 
        'Phone': '01234567890',
        'Company': 'شركة المثال',
        'Status': 'new',
        'Priority': 'medium',
        'Source': 'website',
        'Assigned To': 'مندوب المبيعات',
        'Created At': '2024-01-01',
        'Last Contact': '2024-01-01',
        'Estimated Value': '10000',
        'Probability': '50',
        'Notes': 'ملاحظات العميل'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Template')
    
    // تحميل الملف
    XLSX.writeFile(workbook, 'leads_template.xlsx')
  }

  // دالة التحقق من وجود الحقول المطلوبة
  const validateRequiredFields = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          if (rows.length === 0) {
            reject(new Error('الملف فارغ'))
            return
          }

          const headers = rows[0].map(h => h?.toString()?.toLowerCase()?.trim())
          const requiredFields = ['lead', 'email', 'phone']
          const missingFields = []

          requiredFields.forEach(field => {
            const found = headers.some(header => 
              header.includes(field) || 
              header.includes('name') && field === 'lead' ||
              header.includes('الاسم') && field === 'lead' ||
              header.includes('البريد') && field === 'email' ||
              header.includes('الهاتف') && field === 'phone'
            )
            if (!found) {
              missingFields.push(field)
            }
          })

          if (missingFields.length > 0) {
            reject(new Error(`الحقول المطلوبة مفقودة: ${missingFields.join(', ')}`))
          } else {
            resolve(true)
          }
        } catch (error) {
          reject(new Error('خطأ في قراءة الملف'))
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }

  // دالة معالجة رفع الملف مع التحقق
  const handleFileUpload = async (file) => {
    if (!file) return
    
    try {
      await validateRequiredFields(file)
      setExcelFile(file)
    } catch (error) {
      alert(error.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-[2000] ${i18n.language === 'ar' ? 'rtl' : 'ltr'} flex items-center justify-center`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-w-2xl w-full mx-4 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FaDownload className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('import.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t('Close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Template Download Section */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFileExcel className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('template.downloadExcel')}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('template.downloadDescription')}
                  </p>
                </div>
              </div>
              <button
                onClick={generateTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors duration-200"
              >
                <FaDownload className="w-3 h-3" />
                {t('template.downloadButton')}
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <strong>{t('template.requiredFields')}</strong> LEAD, Email, Phone
            </div>
          </div>

          {/* Dropzone */}
          <div
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-600 bg-white/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-300"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const file = e.dataTransfer.files?.[0]
              if (file && (/\.xlsx$|\.xls$/i).test(file.name)) {
                await handleFileUpload(file)
              }
            }}
          >
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0l-3 3m3-3l3 3m7 4v12m0 0l-3-3m3 3l3-3" />
            </svg>
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              {t('import.dropzone')}
            </p>
            <input
              id="modal-excel-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={async (e) => {
                const file = e.target.files?.[0] || null
                if (file) {
                  await handleFileUpload(file)
                } else {
                  setExcelFile(null)
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => document.getElementById('modal-excel-file-input')?.click()}
              className="px-4 py-2 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-gray-200"
            >
              {t('import.browseButton')}
            </button>

            {excelFile ? (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{t('import.selectedFile', { file: excelFile.name })}</div>
            ) : (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{t('import.noFileSelected')}</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              onClick={onImport}
              disabled={!excelFile || importing}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold ${importing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-md transition-colors duration-300`}
            >
              <FaDownload className="w-4 h-4" />
              {importing ? t('import.importing') : t('import.importButton')}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t('import.supportedFiles')}</span>
          </div>

          {/* Feedback */}
          {importError && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
              {t(importError)}
            </div>
          )}
          {importSummary && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              {t('import.summary', { count: importSummary.added })}
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {t('import.supportedFields')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm">
            {t('Close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImportLeadsModal