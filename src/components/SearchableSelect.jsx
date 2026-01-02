import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'

export default function SearchableSelect({ options, value, onChange, placeholder, label, isRTL, icon: Icon, multiple = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const wrapperRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedWrapper = wrapperRef.current && wrapperRef.current.contains(event.target)
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(event.target)
      if (!clickedWrapper && !clickedDropdown) {
        setIsOpen(false)
      }
    }

    function handleScroll(event) {
      if (!isOpen) return
      const target = event?.target
      const insideWrapper = target && wrapperRef.current && wrapperRef.current.contains(target)
      const insideDropdown = target && dropdownRef.current && dropdownRef.current.contains(target)
      if (!insideWrapper && !insideDropdown) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleScroll)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleScroll)
    }
  }, [isOpen])

  const toggleOpen = () => {
    if (!isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
    setIsOpen(!isOpen)
  }

  const filteredOptions = options.filter(opt =>
    String(opt).toLowerCase().includes(search.toLowerCase())
  )

  const isSelected = (opt) => multiple ? Array.isArray(value) && value.includes(opt) : value === opt
  const clearValue = () => multiple ? onChange([]) : onChange('')

  const dropdownContent = (
    <div 
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 9999
      }}
      className="bg-[var(--panel-bg)] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FaSearch className={`absolute top-1/2 -translate-y-1/2 text-[var(--muted-text)] ${isRTL ? 'right-3' : 'left-3'}`} size={12} />
          <input
            autoFocus
            type="text"
            className={`w-full bg-[var(--table-header-bg)] dark:bg-gray-900 rounded-md py-1.5 ${isRTL ? 'pr-8 pl-2' : 'pl-8 pr-2'} text-sm focus:outline-none text-[var(--text-primary)] border border-transparent focus:border-blue-500/30`}
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div
            className={`px-3 py-2 cursor-pointer hover:shadow-md hover:backdrop-blur-sm hover:bg-gray-500/10 text-sm text-[var(--text-primary)] ${(!multiple && value === '') || (multiple && Array.isArray(value) && value.length === 0) ? 'bg-blue-500/10 text-blue-500' : ''}`}
            onClick={() => {
              clearValue()
              if (!multiple) setIsOpen(false)
              setSearch('')
            }}
          >
            {isRTL ? 'الكل' : 'All'}
          </div>
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 cursor-pointer hover:shadow-md hover:backdrop-blur-sm hover:bg-gray-500/10 text-sm text-[var(--text-primary)] ${isSelected(opt) ? 'bg-blue-500/10 text-blue-500' : ''}`}
              onClick={() => {
                if (multiple) {
                  const cur = Array.isArray(value) ? value : []
                  const exists = cur.includes(opt)
                  const next = exists ? cur.filter(v => v !== opt) : [...cur, opt]
                  onChange(next)
                } else {
                  onChange(opt)
                  setIsOpen(false)
                }
                setSearch('')
              }}
            >
              {opt}
            </div>
          ))
        ) : (
          <div className="px-3 py-4 text-center text-sm text-[var(--muted-text)]">
            {isRTL ? 'لا توجد نتائج' : 'No results found'}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={`relative ${isOpen ? 'z-50' : ''}`} ref={wrapperRef}>
      <div
        className="input dark:bg-gray-800 w-full flex items-center justify-between cursor-pointer bg-[var(--panel-bg)] border border-black dark:border-gray-700 rounded-lg px-3 py-2"
        onClick={toggleOpen}
      >
        <span className={`text-sm ${(!multiple && !value) || (multiple && Array.isArray(value) && value.length === 0) ? "text-[var(--muted-text)]" : "text-[var(--text-primary)]"}`}>
          {multiple
            ? ((Array.isArray(value) && value.length > 0) ? value.join(', ') : (placeholder || (isRTL ? 'الكل' : 'All')))
            : (value || placeholder || (isRTL ? 'الكل' : 'All'))}
        </span>
        <div className="flex items-center gap-2">
           {(!multiple && value && value !== 'All' && value !== 'الكل') || (multiple && Array.isArray(value) && value.length > 0) ? (
             <FaTimes 
               className="text-[var(--muted-text)] hover:text-red-500 z-10" 
               size={12}
               onClick={(e) => {
                 e.stopPropagation()
                 clearValue()
               }}
             />
           ) : null}
           <FaChevronDown className={`text-[var(--muted-text)] transition-transform ${isOpen ? 'rotate-180' : ''}`} size={10} />
        </div>
      </div>

      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  )
}
