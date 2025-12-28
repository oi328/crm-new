
const STORAGE_KEY = 'inventory_requests_data';

const sampleRequests = [
  { id: 1001, customerName: 'Alice Johnson', propertyUnit: 'Palm Residency A-12', status: 'Pending', priority: 'High', type: 'Inquiry', createdAt: '2025-10-02', updatedAt: '2025-10-05', assignedTo: 'John Doe', description: 'Interested in 2BHK, need pricing details.' },
  { id: 1002, customerName: 'Omar Ali', propertyUnit: 'Green Villas V-7', status: 'In Progress', priority: 'Medium', type: 'Maintenance', createdAt: '2025-10-01', updatedAt: '2025-10-06', assignedTo: 'Sara Ahmed', description: 'AC unit not cooling properly.' },
  { id: 1003, customerName: 'Emily Clark', propertyUnit: 'Blue Towers T-22', status: 'Approved', priority: 'Low', type: 'Booking', createdAt: '2025-09-29', updatedAt: '2025-10-03', assignedTo: 'Mark Spencer', description: 'Booking confirmed for 1BR apartment.' },
  { id: 1004, customerName: 'Khaled Mohamed', propertyUnit: 'Sunset Apartments S-9', status: 'Rejected', priority: 'Low', type: 'Inquiry', createdAt: '2025-10-03', updatedAt: '2025-10-04', assignedTo: 'Nadia Karim', description: 'Requested discount not applicable.' },
  { id: 1005, customerName: 'Sara Ibrahim', propertyUnit: 'Palm Residency A-08', status: 'Pending', priority: 'High', type: 'Booking', createdAt: '2025-10-05', updatedAt: '2025-10-05', assignedTo: 'John Doe', description: 'Urgent booking inquiry for 3BR.' },
  { id: 1006, customerName: 'Michael Brown', propertyUnit: 'Green Villas V-12', status: 'In Progress', priority: 'Medium', type: 'Maintenance', createdAt: '2025-10-06', updatedAt: '2025-10-07', assignedTo: 'Sara Ahmed', description: 'Plumbing issue in master bathroom.' },
  { id: 1007, customerName: 'Jessica Davis', propertyUnit: 'Blue Towers T-05', status: 'Pending', priority: 'High', type: 'Inquiry', createdAt: '2025-10-07', updatedAt: '2025-10-07', assignedTo: 'Mark Spencer', description: 'Requesting viewing for penthouse.' },
  { id: 1008, customerName: 'Ahmed Hassan', propertyUnit: 'Sunset Apartments S-15', status: 'Approved', priority: 'Medium', type: 'Booking', createdAt: '2025-10-08', updatedAt: '2025-10-09', assignedTo: 'Nadia Karim', description: 'Down payment received for unit S-15.' },
  { id: 1009, customerName: 'Fatima Zayed', propertyUnit: 'Palm Residency A-20', status: 'Rejected', priority: 'Low', type: 'Inquiry', createdAt: '2025-10-09', updatedAt: '2025-10-10', assignedTo: 'John Doe', description: 'Credit check failed.' },
  { id: 1010, customerName: 'David Wilson', propertyUnit: 'Green Villas V-03', status: 'Pending', priority: 'Medium', type: 'Maintenance', createdAt: '2025-10-10', updatedAt: '2025-10-10', assignedTo: 'Sara Ahmed', description: 'Garden landscaping request.' },
  { id: 1011, customerName: 'Layla Mahmoud', propertyUnit: 'Blue Towers T-18', status: 'In Progress', priority: 'High', type: 'Booking', createdAt: '2025-10-11', updatedAt: '2025-10-12', assignedTo: 'Mark Spencer', description: 'Contract preparation in progress.' },
  { id: 1012, customerName: 'Robert Taylor', propertyUnit: 'Sunset Apartments S-02', status: 'Approved', priority: 'Low', type: 'Maintenance', createdAt: '2025-10-12', updatedAt: '2025-10-13', assignedTo: 'Nadia Karim', description: 'Routine HVAC maintenance completed.' },
  { id: 1013, customerName: 'Nour El-Din', propertyUnit: 'Palm Residency A-05', status: 'Pending', priority: 'High', type: 'Inquiry', createdAt: '2025-10-13', updatedAt: '2025-10-13', assignedTo: 'John Doe', description: 'Inquiring about payment plans.' },
  { id: 1014, customerName: 'Jennifer Anderson', propertyUnit: 'Green Villas V-10', status: 'In Progress', priority: 'Medium', type: 'Booking', createdAt: '2025-10-14', updatedAt: '2025-10-15', assignedTo: 'Sara Ahmed', description: 'Awaiting bank approval.' },
  { id: 1015, customerName: 'Mohamed Ali', propertyUnit: 'Blue Towers T-30', status: 'Rejected', priority: 'High', type: 'Maintenance', createdAt: '2025-10-15', updatedAt: '2025-10-16', assignedTo: 'Mark Spencer', description: 'Damage caused by tenant negligence.' },
  { id: 1016, customerName: 'Sarah Thomas', propertyUnit: 'Sunset Apartments S-11', status: 'Pending', priority: 'Low', type: 'Inquiry', createdAt: '2025-10-16', updatedAt: '2025-10-16', assignedTo: 'Nadia Karim', description: 'General inquiry about amenities.' },
  { id: 1017, customerName: 'Hassan Youssef', propertyUnit: 'Palm Residency A-15', status: 'Approved', priority: 'Medium', type: 'Booking', createdAt: '2025-10-17', updatedAt: '2025-10-18', assignedTo: 'John Doe', description: 'Lease agreement signed.' },
  { id: 1018, customerName: 'Lisa White', propertyUnit: 'Green Villas V-22', status: 'In Progress', priority: 'High', type: 'Maintenance', createdAt: '2025-10-18', updatedAt: '2025-10-19', assignedTo: 'Sara Ahmed', description: 'Roof leak repair scheduled.' },
  { id: 1019, customerName: 'Kareem Adel', propertyUnit: 'Blue Towers T-12', status: 'Pending', priority: 'Medium', type: 'Inquiry', createdAt: '2025-10-19', updatedAt: '2025-10-19', assignedTo: 'Mark Spencer', description: 'Requesting floor plan details.' },
  { id: 1020, customerName: 'Amy Martin', propertyUnit: 'Sunset Apartments S-07', status: 'Approved', priority: 'Low', type: 'Maintenance', createdAt: '2025-10-20', updatedAt: '2025-10-21', assignedTo: 'Nadia Karim', description: 'Key replacement provided.' }
];

export const getRequests = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading requests from storage', e);
  }
  return sampleRequests;
};

export const saveRequest = (request) => {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === request.id);
  let newRequests;
  if (index >= 0) {
    newRequests = [...requests];
    newRequests[index] = request;
  } else {
    newRequests = [request, ...requests];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRequests));
  
  // Dispatch event for real-time updates across components
  window.dispatchEvent(new Event('inventory-requests-updated'));
  return request;
};

export const deleteRequest = (id) => {
  const requests = getRequests();
  const newRequests = requests.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRequests));
  window.dispatchEvent(new Event('inventory-requests-updated'));
};
