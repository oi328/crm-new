
const STORAGE_KEY = 'inventoryRequests';

const sampleRequests = [
  { id: 1001, customer: 'Alice Johnson', item: 'Palm Residency A-12', status: 'Pending', type: 'Inquiry', date: '2025-10-02', assignedTo: 'John Doe', notes: 'Interested in 2BHK, need pricing details.', amount: 0 },
  { id: 1002, customer: 'Omar Ali', item: 'Green Villas V-7', status: 'In Progress', type: 'Maintenance', date: '2025-10-01', assignedTo: 'Sara Ahmed', notes: 'AC unit not cooling properly.', amount: 0 },
  { id: 1003, customer: 'Emily Clark', item: 'Blue Towers T-22', status: 'Approved', type: 'Booking', date: '2025-09-29', assignedTo: 'Mark Spencer', notes: 'Booking confirmed for 1BR apartment.', amount: 120000 },
  { id: 1004, customer: 'Khaled Mohamed', item: 'Sunset Apartments S-9', status: 'Rejected', type: 'Inquiry', date: '2025-10-03', assignedTo: 'Nadia Karim', notes: 'Requested discount not applicable.', amount: 0 },
  { id: 1005, customer: 'Sara Ibrahim', item: 'Palm Residency A-08', status: 'Pending', type: 'Booking', date: '2025-10-05', assignedTo: 'John Doe', notes: 'Urgent booking inquiry for 3BR.', amount: 150000 }
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
