import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { FaDownload, FaTimes, FaFileExcel, FaCloudUploadAlt } from 'react-icons/fa'
import { useTheme } from '../../shared/context/ThemeProvider'

const CategoriesImportModal = ({ onClose, onImport, isRTL }) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [excelFile, setExcelFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importSummary, setImportSummary] = useState(null)

  // Template Generator
  const generateTemplate = () => {
    const templateData = [
      {
        'Category Name': isRTL ? 'مثال للتصنيف' : 'Example Category',
        'Code': 'CAT001',
        'Applies To': 'Product',
        'Status': 'Active',
        'Description': isRTL ? 'وصف التصنيف' : 'Category Description'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories Template')
    XLSX.writeFile(workbook, 'categories_template.xlsx')
  }

  // Validate Fields
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
            reject(new Error(isRTL ? 'الملف فارغ' : 'File is empty'))
            return
          }

          const headers = rows[0].map(h => h?.toString()?.toLowerCase()?.trim())
          const requiredFields = ['category name'] // or 'name'
          const missingFields = []

          requiredFields.forEach(field => {
            const found = headers.some(header => 
              header.includes(field) || 
              (header.includes('name') && field === 'category name') ||
              (header.includes('اسم') && field === 'category name')
            )
            if (!found) {
              missingFields.push(field)
            }
          })

          if (missingFields.length > 0) {
            reject(new Error((isRTL ? 'الحقول المطلوبة مفقودة: ' : 'Missing required fields: ') + missingFields.join(', ')))
          } else {
            resolve(true)
          }
        } catch (error) {
          reject(new Error(isRTL ? 'خطأ في قراءة الملف' : 'Error reading file'))
        }
      }
      reader.readAsArrayBuffer(file)
    })
  }

  // Handle File Upload
  const handleFileUpload = async (file) => {
    if (!file) return
    setImportError(null)
    setImportSummary(null)
    
    try {
      await validateRequiredFields(file)
      setExcelFile(file)
    } catch (error) {
      setImportError(error.message)
      setExcelFile(null)
    }
  }

  // Handle Import
  const handleImport = async () => {
    if (!excelFile) return
    setImporting(true)
    setImportError(null)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const ws = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(ws)
        
        // Map data to expected format
        const mappedData = json.map(row => {
          // Find keys ignoring case/spaces
          const findKey = (keys) => Object.keys(row).find(k => keys.some(key => k.toLowerCase().includes(key.toLowerCase())))
          
          return {
            name: row[findKey(['Category Name', 'Name', 'اسم'])] || '',
            code: row[findKey(['Code', 'كود'])] || '',
            appliesTo: row[findKey(['Applies To', 'ينطبق'])] || 'Product',
            status: row[findKey(['Status', 'حالة'])] || 'Active',
            description: row[findKey(['Description', 'وصف'])] || ''
          }
        }).filter(item => item.name) // Ensure name exists

        setImportSummary({ added: mappedData.length })
        setImporting(false)
        
        // Pass data to parent
        if (onImport) {
          onImport(mappedData)
        }

        // Close after a short delay to show success (if controlled by parent, this might be redundant but matches UI flow)
        // Since onImport in parent closes the modal immediately, we might not see the success message.
        // However, Projects.jsx closes it after 1500ms. 
        // In Categories.jsx, handleImport calls setShowImportModal(false) immediately.
        // To match Projects.jsx UX, we should delay the onImport call or the parent should delay closing.
        // But here, I'll just call onImport immediately because the parent controls visibility.
        // To strictly match "same user experience", I should probably wait here?
        // But if I wait, I can't prevent the parent from closing if onImport triggers state change that closes modal.
        // In Categories.jsx: 
        // const handleImport = (importedData) => { ... setShowImportModal(false) }
        // So it closes immediately.
        // In Projects.jsx: setTimeout(() => { onClose() }, 1500)
        // So Projects.jsx handles the data THEN waits to close.
        // To mimic this, I should change Categories.jsx to NOT close immediately, OR
        // I should wait here, show success, then call onImport.
        // Let's wait here.
        setTimeout(() => {
           // onClose is passed from parent to close modal. onImport adds data.
           // If I call onImport, parent closes.
           // So I should not call onImport until timeout?
           // Or call onImport (which updates list) but assume parent won't close?
           // Parent code: setShowImportModal(false) is inside handleImport.
           // So calling onImport closes it.
           // I will simply wait 1500ms THEN call onImport.
           // But I need to update UI to show success first.
           // So: setImportSummary -> Wait -> onImport
        }, 1500)
      }
      reader.readAsArrayBuffer(excelFile)
    } catch (err) {
      setImportError(isRTL ? 'فشل الاستيراد' : 'Import failed')
      setImporting(false)
    }
  }

  // Modified handleImport to support the delay
  const executeImport = () => {
      if (!excelFile) return
      setImporting(true)
      setImportError(null)

      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const ws = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(ws)
          
          const mappedData = json.map(row => {
            const findKey = (keys) => Object.keys(row).find(k => keys.some(key => k.toLowerCase().includes(key.toLowerCase())))
            return {
              name: row[findKey(['Category Name', 'Name', 'اسم'])] || '',
              code: row[findKey(['Code', 'كود'])] || '',
              appliesTo: row[findKey(['Applies To', 'ينطبق'])] || 'Product',
              status: row[findKey(['Status', 'حالة'])] || 'Active',
              description: row[findKey(['Description', 'وصف'])] || ''
            }
          }).filter(item => item.name)

          setImportSummary({ added: mappedData.length })
          setImporting(false)
          
          setTimeout(() => {
             onImport(mappedData)
          }, 1500)
        }
        reader.readAsArrayBuffer(excelFile)
      } catch (err) {
        setImportError(isRTL ? 'فشل الاستيراد' : 'Import failed')
        setImporting(false)
      }
  }

  return (
    <div className={`fixed inset-0 z-[2000] ${isRTL ? 'rtl' : 'ltr'} flex items-start justify-center pt-20`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div 
        className="relative max-w-2xl w-full mx-4 rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] transition-colors duration-200"
        style={{
          backgroundColor: isDark ? '#172554' : 'white',
          borderColor: isDark ? '#1e3a8a' : '#e5e7eb',
          color: isDark ? 'white' : '#111827'
        }}
      >
        {/* Header */}
        <div 
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b transition-colors duration-200"
          style={{ borderColor: isDark ? '#1e3a8a' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <FaDownload className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: isDark ? 'white' : '#111827' }}>{isRTL ? 'استيراد التصنيفات' : 'Import Categories'}</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto custom-scrollbar">
          {/* Template Download Section */}
          <div 
            className="mb-6 p-4 rounded-xl border transition-colors duration-200"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.4)' : '#eff6ff',
              borderColor: isDark ? '#1e40af' : '#bfdbfe'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaFileExcel className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: isDark ? 'white' : '#111827' }}>
                    {isRTL ? 'تحميل نموذج Excel' : 'Download Excel Template'}
                  </h4>
                  <p className="text-xs" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                    {isRTL ? 'استخدم هذا النموذج لإضافة تصنيفات جديدة' : 'Use this template to add new categories'}
                  </p>
                </div>
              </div>
              <button
                onClick={generateTemplate}
                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none flex items-center gap-2"
              >
                <FaDownload className="w-3 h-3" />
                {isRTL ? 'تحميل' : 'Download'}
              </button>
            </div>
            <div className="mt-3 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <strong>{isRTL ? 'الحقول المطلوبة: ' : 'Required Fields: '}</strong> Category Name
            </div>
          </div>

          {/* Dropzone */}
          <div
            className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-colors duration-300"
            style={{
              backgroundColor: isDark ? 'rgba(30, 58, 138, 0.2)' : 'rgba(255, 255, 255, 0.7)',
              borderColor: isDark ? '#3b82f6' : '#93c5fd'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const file = e.dataTransfer.files?.[0]
              if (file && (/\.xlsx$|\.xls$/i).test(file.name)) {
                await handleFileUpload(file)
              }
            }}
          >
            <FaCloudUploadAlt className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-center" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
              {isRTL ? 'اسحب وأفلت ملف Excel هنا أو اضغط للاختيار' : 'Drag & drop Excel file here or click to browse'}
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
              className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              {isRTL ? 'اختيار ملف' : 'Browse File'}
            </button>

            {excelFile ? (
              <div className="mt-2 text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>{isRTL ? 'تم اختيار: ' + excelFile.name : 'Selected: ' + excelFile.name}</div>
            ) : (
              <div className="mt-2 text-xs" style={{ color: isDark ? '#9ca3af' : '#4b5563' }}>{isRTL ? 'لم يتم اختيار ملف' : 'No file selected'}</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              onClick={executeImport}
              disabled={!excelFile || importing}
              className={`btn btn-sm ${importing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none flex items-center gap-2`}
            >
              <FaDownload className="w-4 h-4" />
              {importing ? (isRTL ? 'جاري الاستيراد...' : 'Importing...') : (isRTL ? 'استيراد البيانات' : 'Import Data')}
            </button>
            <span className="text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>{isRTL ? 'الملفات المدعومة: .xlsx, .xls' : 'Supported files: .xlsx, .xls'}</span>
          </div>

          {/* Feedback */}
          {importError && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              {importError}
            </div>
          )}
          {importSummary && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800">
              {isRTL ? `تم استيراد ${importSummary.added} تصنيف بنجاح` : `Successfully imported ${importSummary.added} categories`}
            </div>
          )}

          <div className="mt-3 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            {isRTL ? 'الحقول المدعومة: اسم التصنيف، الكود، ينطبق على، الحالة، الوصف' : 'Supported Fields: Category Name, Code, Applies To, Status, Description'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesImportModal
