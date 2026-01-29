import React from 'react'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { Customers } from './Customers'
import { ThemeProvider } from '../shared/context/ThemeProvider'

// Mock Translations
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() }
  })
}))

// Mock ThemeProvider
jest.mock('../shared/context/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'light' })
}))

// Mock API
jest.mock('../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}))

// Mock DatePicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker({ selectsRange, startDate, endDate, onChange, placeholderText }) {
    return (
      <div data-testid="date-picker-wrapper">
        <input 
          data-testid="date-picker-input"
          placeholder={placeholderText}
          value={startDate ? `${startDate.toISOString().split('T')[0]} - ${endDate ? endDate.toISOString().split('T')[0] : ''}` : ''}
          readOnly
        />
        <button 
          data-testid="date-picker-select-today" 
          onClick={() => {
            const today = new Date()
            onChange([today, today])
          }}
        >
          Select Today
        </button>
      </div>
    )
  }
})

// Mock Sub-components
jest.mock('../components/CustomersImportModal', () => {
  return function MockImportModal({ onClose, onImport }) {
    return (
      <div data-testid="import-modal">
        <button onClick={onClose}>Close Import</button>
        <button onClick={() => onImport([{ name: 'Test Customer' }])}>Import Data</button>
      </div>
    )
  }
})

jest.mock('../components/CustomersFormModal', () => {
  return function MockFormModal({ onClose }) {
    return (
      <div data-testid="form-modal">
        <button onClick={onClose}>Close Form</button>
      </div>
    )
  }
})

jest.mock('../components/SearchableSelect', () => {
  return function MockSelect({ placeholder, onChange, multiple, value, options }) {
    return (
      <div data-testid="search-select-wrapper">
        <label>{placeholder}</label>
        <select 
          data-testid={`search-select-${placeholder}`} 
          onChange={(e) => {
             const val = e.target.value
             if (multiple) {
               onChange(val ? [val] : [])
             } else {
               onChange({ value: val, label: val })
             }
          }} 
          aria-label={placeholder}
          multiple={multiple}
          value={multiple ? (value || []) : (value?.value || '')}
        >
          <option value="">{placeholder}</option>
          {options && options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    )
  }
})

// Mock window.confirm
const originalConfirm = window.confirm
beforeAll(() => {
  window.confirm = jest.fn(() => true)
})
afterAll(() => {
  window.confirm = originalConfirm
})

// Clear localStorage before tests
beforeEach(() => {
  localStorage.clear()
})

describe('Customers Page', () => {
  test('renders customers page title', () => {
    render(<Customers />)
    expect(screen.getByText('Customers')).toBeInTheDocument()
  })

  test('opens import modal when import button is clicked', () => {
    render(<Customers />)
    const importBtn = screen.getByText('Import')
    fireEvent.click(importBtn)
    expect(screen.getByTestId('import-modal')).toBeInTheDocument()
  })

  test('opens add customer form when add button is clicked', () => {
    render(<Customers />)
    const addBtn = screen.getByText('Add Customer')
    fireEvent.click(addBtn)
    expect(screen.getByTestId('form-modal')).toBeInTheDocument()
  })

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test('filters customers by search query', async () => {
    render(<Customers />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Ahmed Mohamed')).toBeInTheDocument()
    }, { timeout: 3000 })

    const searchInput = screen.getByPlaceholderText('Search in all data...')
    fireEvent.change(searchInput, { target: { value: 'John' } }) // Search for John

    // Should show John
    await waitFor(() => {
       expect(screen.getByText('John Doe')).toBeInTheDocument()
    }, { timeout: 5000 })

    // Should not show Ahmed
    expect(screen.queryByText('Ahmed Mohamed')).not.toBeInTheDocument()
  }, 10000)

  test('toggles advanced filters', () => {
    render(<Customers />)
    
    // Initially "Show All" button exists
    const toggleBtn = screen.getByText('Show All')
    
    // Click to show
    fireEvent.click(toggleBtn)
    expect(screen.getByText('Hide')).toBeInTheDocument()
  })

  test('resets filters when Reset button is clicked', async () => {
    render(<Customers />)
    
    const searchInput = screen.getByPlaceholderText('Search in all data...')
    fireEvent.change(searchInput, { target: { value: 'Ahmed' } })
    expect(searchInput.value).toBe('Ahmed')

    const resetBtn = screen.getByText('Reset')
    fireEvent.click(resetBtn)

    expect(searchInput.value).toBe('')
  })
  
  test('handles date range filter', async () => {
    render(<Customers />)
    
    // Expand filters to see date inputs
    const toggleBtn = screen.getByText('Show All')
    fireEvent.click(toggleBtn)
    
    // Find DatePicker mock trigger
    const selectTodayBtn = screen.getByTestId('date-picker-select-today')
    fireEvent.click(selectTodayBtn)
    
    // Check if date input is populated
    const today = new Date().toISOString().split('T')[0]
    const dateInput = screen.getByTestId('date-picker-input')
    expect(dateInput.value).toContain(today)
  })

  test('shows bulk action bar when items are selected', async () => {
    render(<Customers />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Ahmed Mohamed')).toBeInTheDocument()
    }, { timeout: 3000 })

    // Find checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is "select all", second is for first row
    const firstRowCheckbox = checkboxes[1]
    
    // Click to select
    fireEvent.click(firstRowCheckbox)
    
    // Check if bulk action bar appears (look for "Selected" text)
    expect(screen.getByText('Selected')).toBeInTheDocument()
    
    // Check if Export button exists
    expect(screen.getByTitle('Export')).toBeInTheDocument()
  })
})
