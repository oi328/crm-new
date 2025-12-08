import React, { useState } from 'react'
import { FaTimes, FaCloudUploadAlt, FaDownload } from 'react-icons/fa'

export default function ImportPropertiesModal({ onClose, isRTL, onImported }) {
  const [files, setFiles] = useState([])
  const [logs, setLogs] = useState([])
  const [preview, setPreview] = useState(null)

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || [])
    setFiles(arr)
  }

  const parseCSV = async (file) => {
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    const headers = lines[0].split(',')
    const rows = lines.slice(1).map(line => {
      const cols = line.split(',')
      const obj = {}
      headers.forEach((h, i) => obj[h.trim()] = (cols[i] || '').trim())
      return obj
    })
    return { headers, rows }
  }

  const handlePreview = async () => {
    if (!files.length) return
    const f = files[0]
    if (f.name.toLowerCase().endsWith('.csv')) {
      const res = await parseCSV(f)
      setPreview(res)
    } else {
      setPreview({ headers: ['File', 'Type', 'Size'], rows: [{ File: f.name, Type: f.type || 'xlsx', Size: `${f.size} bytes` }] })
    }
  }

  const handleImport = async () => {
    const user = 'Admin'
    const ts = new Date().toISOString()
    const log = { file: files.map(f=>f.name).join(', '), user, ts, status: 'Success' }
    setLogs(l => [log, ...l])
    if (preview?.rows?.length) onImported(preview.rows)
    onClose()
  }

  const downloadTemplate = (ext='csv') => {
    const headers = ['name','city','developer','status','units','area','price','documents','lastUpdated','description','progress']
    const csv = headers.join(',') + '\n'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `properties_template.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 glass-panel rounded-xl p-4 w-[900px] max-w-[95vw]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{isRTL ? 'استيراد العقارات' : 'Import Properties'}</h2>
          <button className="btn btn-glass" onClick={onClose}>{isRTL ? 'إغلاق' : 'Close'}</button>
        </div>

        <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isRTL ? 'dir-rtl' : ''}`}
             onDragOver={(e)=>{e.preventDefault();}}
             onDrop={(e)=>{e.preventDefault(); handleFiles(e.dataTransfer.files)}}>
          <div className="flex flex-col items-center gap-2">
            <FaCloudUploadAlt className="text-2xl" />
            <div className="text-sm text-[var(--muted-text)]">{isRTL ? 'اسحب الملفات هنا أو اخترها' : 'Drag files here or choose files'}</div>
            <input type="file" multiple accept=".csv,.xlsx" onChange={(e)=>handleFiles(e.target.files)} className="mt-2" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button className="btn btn-glass" onClick={()=>downloadTemplate('csv')}><FaDownload /> CSV {isRTL ? 'قالب' : 'Template'}</button>
          <button className="btn btn-glass" onClick={()=>downloadTemplate('xlsx')}><FaDownload /> XLSX {isRTL ? 'قالب' : 'Template'}</button>
          <div className="flex-1" />
          <button className="btn btn-primary" onClick={handlePreview}>{isRTL ? 'معاينة' : 'Preview'}</button>
          <button className="btn btn-success" onClick={handleImport} disabled={!files.length}>{isRTL ? 'استيراد' : 'Import'}</button>
        </div>

        {preview && (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {preview.headers.map((h,i)=>(<th key={i} className="text-left p-2 border-b">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0,20).map((r,idx)=>(
                  <tr key={idx}>
                    {preview.headers.map((h,i)=>(<td key={i} className="p-2 border-b">{r[h]}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">{isRTL ? 'سجل الاستيراد' : 'Import Log'}</div>
          <div className="space-y-2">
            {logs.map((l,idx)=>(
              <div key={idx} className="text-xs text-[var(--muted-text)]">{l.ts} • {l.user} • {l.file} • {l.status}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}