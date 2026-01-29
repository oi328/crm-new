
// Simple localStorage wrapper to simulate a database for the Case Study
const STORAGE_KEYS = {
  ORDERS: 'besouhoula_orders',
  INVOICES: 'besouhoula_invoices',
  CUSTOMERS: 'besouhoula_customers',
  QUOTATIONS: 'besouhoula_quotations'
}

// Initial Seed Data based on User's Case Study
const SEED_DATA = {
  CUSTOMERS: [
    { code: 'CUST-1001', name: 'Mohamed Ali', phone: '01000000001' },
    { code: 'CUST-001', name: 'Tech Solutions Inc.' },
    { code: 'CUST-002', name: 'Global Trading Co.' }
  ],
  QUOTATIONS: [
    {
      id: 'QUO-1001',
      customerCode: 'CUST-001',
      customerName: 'Tech Solutions Inc.',
      items: [
        { id: 1, name: 'Web Development', price: 1500, quantity: 10, type: 'Service', category: 'Software' },
        { id: 2, name: 'Server Setup', price: 1000, quantity: 10, type: 'Service', category: 'Electronics' }
      ],
      salesPerson: 'John Doe'
    },
    {
      id: 'QUO-1002',
      customerCode: 'CUST-002',
      customerName: 'Global Trading Co.',
      items: [],
      salesPerson: 'Sarah Smith'
    },
    {
      id: 'QUO-1003',
      customerCode: 'CUST-003',
      customerName: 'Local Services Ltd.',
      items: [],
      salesPerson: 'System Bot'
    },
  ],
  ORDERS: [
    {
      id: 'SO-1001',
      customerCode: 'CUST-1001',
      customerName: 'Mohamed Ali',
      status: 'Confirmed',
      date: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        { 
          id: 1, 
          name: 'Wireless Headphones', 
          price: 50, 
          quantity: 100, 
          discount: 0,
          type: 'Product', 
          category: 'Electronics',
          invoicedQuantity: 0 // Track how much has been invoiced
        }
      ],
      subtotal: 5000,
      tax: 0,
      total: 5000,
      paymentTerms: 'Net 30',
      salesPerson: 'Admin',
      invoicedAmount: 0
    }
  ],
  INVOICES: []
}

export const mockStorage = {
  // Initialize
  init: () => {
    const checkAndInit = (key, data) => {
      const stored = localStorage.getItem(key)
      if (!stored || stored === "undefined") {
        localStorage.setItem(key, JSON.stringify(data))
      }
    }
    checkAndInit(STORAGE_KEYS.CUSTOMERS, SEED_DATA.CUSTOMERS)
    checkAndInit(STORAGE_KEYS.ORDERS, SEED_DATA.ORDERS)
    checkAndInit(STORAGE_KEYS.INVOICES, SEED_DATA.INVOICES)
    checkAndInit(STORAGE_KEYS.QUOTATIONS, SEED_DATA.QUOTATIONS)
  },

  // Customers
  getCustomers: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
    if (!stored || stored === "undefined") return []
    try {
        return JSON.parse(stored)
    } catch (e) {
        console.error("Error parsing customers", e)
        return []
    }
  },

  saveCustomer: (customer) => {
    const customers = mockStorage.getCustomers()
    const index = customers.findIndex(c => c.id === customer.id || c.code === customer.code)
    if (index >= 0) {
      customers[index] = { ...customers[index], ...customer }
    } else {
      customers.unshift(customer)
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
    return customer
  },

  // Quotations
  getQuotations: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.QUOTATIONS)
    if (!stored || stored === "undefined") return []
    try {
        return JSON.parse(stored)
    } catch (e) {
        console.error("Error parsing quotations", e)
        return []
    }
  },

  saveQuotation: (quotation) => {
    const quotations = mockStorage.getQuotations()
    const index = quotations.findIndex(q => q.id === quotation.id)
    if (index >= 0) {
      quotations[index] = { ...quotations[index], ...quotation }
    } else {
      quotations.unshift(quotation)
    }
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations))
    return quotation
  },

  deleteQuotation: (id) => {
    const quotations = mockStorage.getQuotations()
    const filtered = quotations.filter(q => q.id !== id)
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(filtered))
    return true
  },

  // Orders
  getOrders: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
    if (!stored || stored === "undefined") return []
    try {
        return JSON.parse(stored)
    } catch (e) {
        console.error("Error parsing orders", e)
        return []
    }
  },

  getOrder: (id) => {
    const orders = mockStorage.getOrders()
    return orders.find(o => o.id === id)
  },

  saveOrder: (order) => {
    const orders = mockStorage.getOrders()
    const index = orders.findIndex(o => o.id === order.id)
    if (index >= 0) {
      orders[index] = order
    } else {
      orders.unshift(order)
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    return order
  },

  deleteOrder: (id) => {
    const orders = mockStorage.getOrders()
    const filteredOrders = orders.filter(o => o.id !== id)
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filteredOrders))
    return true
  },

  // Invoices
  getInvoices: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.INVOICES)
    if (!stored || stored === "undefined") return []
    try {
        return JSON.parse(stored)
    } catch (e) {
        console.error("Error parsing invoices", e)
        return []
    }
  },

  saveInvoice: (invoice) => {
    const invoices = mockStorage.getInvoices()
    const index = invoices.findIndex(i => i.id === invoice.id)
    
    // Update Invoice
    if (index >= 0) {
      invoices[index] = invoice
    } else {
      invoices.unshift(invoice)
    }
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices))

    // Update Linked Order Logic
    if (invoice.orderId) {
      mockStorage.updateOrderFromInvoice(invoice)
    }

    return invoice
  },

  // Core Business Logic: Update Order based on Invoice
  updateOrderFromInvoice: (invoice) => {
    const orders = mockStorage.getOrders()
    const orderIndex = orders.findIndex(o => o.id === invoice.orderId)
    if (orderIndex === -1) return

    const order = orders[orderIndex]
    
    // Logic:
    // 1. If Advance Invoice: Update 'invoicedAmount' but NOT 'invoicedQuantity' of items (usually).
    //    However, user requirement says: "Advance Invoice: Quantity Delivered 0".
    // 2. If Partial/Full: Update 'invoicedQuantity' of items.

    if (invoice.invoiceType === 'Advance') {
      // Advance doesn't touch item quantities in this specific requirement
    } else {
      // Partial or Full
      // Re-calculate Order state from ALL invoices for this order
      const allInvoices = mockStorage.getInvoices()
        .filter(i => i.orderId === order.id && i.status !== 'Cancelled')
      
      // Reset Order Invoiced Quantities
      order.items.forEach(item => item.invoicedQuantity = 0)

      allInvoices.forEach(inv => {
        if (inv.invoiceType === 'Advance') return // Skip advance for quantity calc

        inv.items.forEach(invItem => {
          const orderItem = order.items.find(oi => oi.name === invItem.name || oi.id === invItem.id)
          if (orderItem) {
             orderItem.invoicedQuantity = (orderItem.invoicedQuantity || 0) + (Number(invItem.quantity) || 0)
          }
        })
      })

      // Determine Status
      let totalOrdered = 0
      let totalInvoiced = 0

      order.items.forEach(item => {
        totalOrdered += item.quantity
        totalInvoiced += (item.invoicedQuantity || 0)
      })

      if (totalInvoiced === 0) {
        // No quantity invoiced yet (maybe only Advance)
        // Keep as Confirmed or In Progress
      } else if (totalInvoiced >= totalOrdered) {
        order.status = 'Fully Invoiced'
      } else {
        order.status = 'Partially Invoiced'
      }
    }

    orders[orderIndex] = order
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  }
}

// Auto-init on load
mockStorage.init()
