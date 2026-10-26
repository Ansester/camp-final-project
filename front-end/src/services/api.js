import { authUtils } from '../utils/auth.js';

export const API_BASE = process.env.REACT_APP_API_BASE ?? '' // empty in dev when using webpack proxy

async function req(path, init) {
    const token = authUtils.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'omit',
    ...init,
    headers,
  });
  if (!res.ok) {
    // Auto-logout on 401 Unauthorized
    if (res.status === 401) {
      authUtils.clearAuth();
      // Dispatch a custom event so components can respond if they choose
      window.dispatchEvent(new Event('camp:logout'));
    }
    const body = await res.text().catch(()=>'');
    throw new Error(`${res.status} ${res.statusText} @ ${path}${body ? ' :: ' + body : ''}`);
  }
  return res.json();
}

export const api = {
  health: () => req('/api/health'),
  items: (q='') => req(`/api/items${q ? `?${q}` : ''}`),
  suggestedItems: (itemId) => req(`/api/items/${encodeURIComponent(itemId)}/suggested`),
  createItem: (payload) => req('/api/items', { method: 'POST', body: JSON.stringify(payload) }),
  facilities: () => req('/api/facilities'),
  facilityItems: (slug) => req(`/api/facilities/${slug}/items`),
  register: (payload) => req('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (email, password) => req('/api/auth/student/login', { method:'POST', body: JSON.stringify({ email, password }) }),
    staffLogin: (email, password) => req('/api/auth/staff/login', { method:'POST', body: JSON.stringify({ email, password }) }),
  reserve: (payload) => req('/api/reservations', { method:'POST', body: JSON.stringify(payload) }),
  reservations: () => req('/api/reservations'),
  cancelReservation: (id) => req(`/api/reservations/${encodeURIComponent(id)}/cancel`, { method: 'PUT' }),
  borrowals: (userId) => req(`/api/borrowals?userId=${encodeURIComponent(userId)}`),
  fines: (userId) => req(`/api/fines?userId=${encodeURIComponent(userId)}`),
  paymentsHistory: (userId) => req(`/api/payments/history?userId=${encodeURIComponent(userId)}`),
  prefsGet: (userId) => req(`/api/notifications/preferences?userId=${encodeURIComponent(userId)}`),
  prefsPut: (payload) => req('/api/notifications/preferences', { method:'PUT', body: JSON.stringify(payload) }),
  policies: () => req('/api/policies'),
  staffInventory: () => req('/api/staff/inventory'),
  updateItem: (id, payload) => req(`/api/items/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  // New endpoints
  dashboard: (userId) => req(`/api/dashboard?userId=${encodeURIComponent(userId)}`),
  profile: (userId) => req(`/api/users/${encodeURIComponent(userId)}`),
  reservationSlots: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return req(`/api/reservations/slots${qs}`);
  },
  // Staff dashboard uses /api/staff/alerts for inventory stats
  staffDashboard: () => req('/api/staff/alerts'),
  staffReservations: () => req('/api/staff/reservations'),
  staffOverdue: () => req('/api/staff/overdue'),
  students: () => req('/api/users'),
  // New staff student search and borrowal endpoints
  staffSearchStudents: (query) => req(`/api/staff/students/search?q=${encodeURIComponent(query)}`),
  staffStudentBorrowals: (userId) => req(`/api/staff/students/${encodeURIComponent(userId)}/borrowals`),
  staffActiveBorrowals: (itemId) => req(`/api/staff/borrowals/active${itemId ? `?itemId=${encodeURIComponent(itemId)}` : ''}`),
  staffCheckout: (payload) => req('/api/staff/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  staffCheckin: (payload) => req('/api/staff/checkin', { method: 'POST', body: JSON.stringify(payload) }),
  // Fines and payments
  createFine: (payload) => req('/api/fines', { method: 'POST', body: JSON.stringify(payload) }),
  payFine: (fineId, payload) => req(`/api/fines/${encodeURIComponent(fineId)}/pay`, { method: 'POST', body: JSON.stringify(payload) }),
  // Campus Cash / Funds
  addFunds: (payload) => req('/api/users/add-funds', { method: 'POST', body: JSON.stringify(payload) }),
  // Waitlist
  getWaitlist: () => req('/api/waitlist'),
  joinWaitlist: (payload) => req('/api/waitlist', { method: 'POST', body: JSON.stringify(payload) }),
  // Notifications
  getNotifications: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return req(`/api/notifications${qs}`);
  },
  getUnreadNotificationCount: () => req('/api/notifications/unread-count'),
  markNotificationRead: (id) => req(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => req('/api/notifications/read-all', { method: 'PUT' }),
};
