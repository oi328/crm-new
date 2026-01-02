
const STORAGE_KEY = 'real_estate_requests';

const sampleRequests = [
    { id: 1, customer: 'Ahmed Ali', project: 'Nile Tower', unit: 'NTR-101', status: 'Pending', type: 'Booking', date: '2025-12-25' },
    { id: 2, customer: 'Sarah Smith', project: 'October Park', unit: 'OBP-205', status: 'Approved', type: 'Inquiry', date: '2025-12-24' },
    { id: 3, customer: 'Mohamed Hassan', project: 'Nile Tower', unit: 'NTR-105', status: 'Rejected', type: 'Maintenance', date: '2025-12-23' },
    { id: 4, customer: 'Laila Mahmoud', project: 'Sea View', unit: 'SV-303', status: 'Converted', type: 'Booking', date: '2025-12-22' },
    { id: 5, customer: 'Omar Khaled', project: 'Zayed Heights', unit: 'ZHT-102', status: 'Pending', type: 'Inquiry', date: '2025-12-21' },
    { id: 6, customer: 'Nour El-Din', project: 'Maadi Gardens', unit: 'MGD-404', status: 'Approved', type: 'Booking', date: '2025-12-20' },
    { id: 7, customer: 'Fatma Ibrahim', project: 'Nasr City Hub', unit: 'NCH-202', status: 'Pending', type: 'Maintenance', date: '2025-12-19' },
    { id: 8, customer: 'Karim Adel', project: 'Nile Tower', unit: 'NTR-305', status: 'Converted', type: 'Booking', date: '2025-12-18' },
    { id: 9, customer: 'Yasmine Zaki', project: 'Sea View', unit: 'SV-101', status: 'Rejected', type: 'Inquiry', date: '2025-12-17' },
    { id: 10, customer: 'Hassan Moustafa', project: 'October Park', unit: 'OBP-505', status: 'Pending', type: 'Booking', date: '2025-12-16' },
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
    // Generate new ID if not present
    if (!request.id) {
        request.id = Date.now();
    }
    newRequests = [request, ...requests];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRequests));
  
  // Dispatch event for real-time updates across components
  window.dispatchEvent(new Event('real-estate-requests-updated'));
  return request;
};

export const deleteRequest = (id) => {
  const requests = getRequests();
  const newRequests = requests.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRequests));
  window.dispatchEvent(new Event('real-estate-requests-updated'));
};
