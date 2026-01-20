import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'

export default function SearchableSelect({ options, value, onChange, placeholder, label, isRTL, icon: Icon, multiple = false, className = '', showAllOption = true }) {
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

  const filteredOptions = options.filter(opt => {
    const label = typeof opt === 'object' && opt !== null && 'label' in opt ? opt.label : String(opt)
    return String(label).toLowerCase().includes(search.toLowerCase())
  })

  const isSelected = (opt) => {
    const val = typeof opt === 'object' && opt !== null && 'value' in opt ? opt.value : opt
    return multiple ? Array.isArray(value) && value.includes(val) : value === val
  }
  
  const clearValue = () => multiple ? onChange([]) : onChange('')

  const getDisplayValue = () => {
    if (multiple) {
      if (Array.isArray(value) && value.length > 0) {
        return value.map(v => {
          const opt = options.find(o => (typeof o === 'object' && o !== null && 'value' in o ? o.value : o) === v)
          return opt ? (typeof opt === 'object' && 'label' in opt ? opt.label : opt) : v
        }).join(', ')
      }
      return placeholder || (showAllOption ? (isRTL ? 'الكل' : 'All') : '')
    }
    if (!value) return placeholder || (showAllOption ? (isRTL ? 'الكل' : 'All') : '')
    const opt = options.find(o => (typeof o === 'object' && o !== null && 'value' in o ? o.value : o) === value)
    return opt ? (typeof opt === 'object' && 'label' in opt ? opt.label : opt) : value
  }

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
      className="rounded-xl shadow-xl bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] backdrop-blur-md max-h-60 overflow-hidden flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="p-2 border-b border-[var(--dropdown-border)]/70">
        <div className="relative">
          <FaSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} size={12} />
          <input
            autoFocus
            type="text"
            className={`input input-sm w-full bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)]/80 text-sm ${isRTL ? 'pr-8 pl-2' : 'pl-8 pr-2'} text-theme-text dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-[var(--nova-accent)]`}
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="overflow-y-auto max-h-48 py-1 scrollbar-thin-blue">
          {showAllOption && (
            <div
              className={`mx-1 rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${(!multiple && value === '') || (multiple && Array.isArray(value) && value.length === 0) ? 'bg-[rgba(37,99,235,0.28)] text-white' : 'hover:bg-[rgba(37,99,235,0.18)]'} text-theme-text dark:text-gray-100`}
              onClick={() => {
                clearValue()
                if (!multiple) setIsOpen(false)
                setSearch('')
              }}
            >
              {isRTL ? 'الكل' : 'All'}
            </div>
          )}
        {filteredOptions.length > 0 ? (
          filteredOptions.map((opt, idx) => {
            const label = typeof opt === 'object' && opt !== null && 'label' in opt ? opt.label : opt
            const val = typeof opt === 'object' && opt !== null && 'value' in opt ? opt.value : opt
            return (
              <div
                key={idx}
                className={`mx-1 rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${isSelected(opt) ? 'bg-[rgba(37,99,235,0.28)] text-white' : 'hover:bg-[rgba(37,99,235,0.18)]'} text-theme-text dark:text-gray-100`}
                onClick={() => {
                  if (multiple) {
                    const cur = Array.isArray(value) ? value : []
                    const exists = cur.includes(val)
                    const next = exists ? cur.filter(v => v !== val) : [...cur, val]
                    onChange(next)
                  } else {
                    onChange(val)
                    setIsOpen(false)
                  }
                  setSearch('')
                }}
              >
                {label}
              </div>
            )
          })
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
        className={`input w-full flex items-center justify-between cursor-pointer ${className}`}
        onClick={toggleOpen}
      >
        <span className={`text-sm ${(!multiple && !value) || (multiple && Array.isArray(value) && value.length === 0) ? "text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-200"}`}>
          {getDisplayValue()}
        </span>
        <div className="flex items-center gap-2">
           {(!multiple && value && value !== 'All' && value !== 'الكل') || (multiple && Array.isArray(value) && value.length > 0) ? (
             <FaTimes 
               className="text-gray-400 dark:text-gray-500 hover:text-red-500 z-10" 
               size={12}
               onClick={(e) => {
                 e.stopPropagation()
                 clearValue()
               }}
             />
           ) : null}
           <FaChevronDown className={`text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={10} />
        </div>
      </div>

      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  )
}
