import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — auto logout (skip for login/register endpoints)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/register')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// ─── Universities ─────────────────────────────────────
export const universityAPI = {
  getAll: (params) => API.get('/universities', { params }),
  getOne: (id) => API.get(`/universities/${id}`),
  create: (data) => API.post('/universities', data),
  update: (id, data) => API.put(`/universities/${id}`, data),
  delete: (id) => API.delete(`/universities/${id}`),
};

// ─── Canteens ─────────────────────────────────────────
export const canteenAPI = {
  getAll: (params) => API.get('/canteens', { params }),
  getOne: (id) => API.get(`/canteens/${id}`),
  create: (data) => API.post('/canteens', data),
  update: (id, data) => API.put(`/canteens/${id}`, data),
  toggle: (id) => API.patch(`/canteens/${id}/toggle`),
  analytics: (id) => API.get(`/canteens/${id}/analytics`),
  getStaff: (id) => API.get(`/canteens/${id}/staff`),
  createStaff: (id, data) => API.post(`/canteens/${id}/staff`, data),
  updateStaff: (canteenId, staffId, data) => API.put(`/canteens/${canteenId}/staff/${staffId}`, data),
};

// ─── Menu ─────────────────────────────────────────────
export const menuAPI = {
  getAll: (params) => API.get('/menu', { params }),
  getOne: (id) => API.get(`/menu/${id}`),
  getCategories: (canteenId) => API.get(`/menu/categories/${canteenId}`),
  create: (data) => API.post('/menu', data),
  update: (id, data) => API.put(`/menu/${id}`, data),
  delete: (id) => API.delete(`/menu/${id}`),
  toggleAvailability: (id) => API.patch(`/menu/${id}/toggle`),
};

// ─── Orders ───────────────────────────────────────────
export const orderAPI = {
  place: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  getCanteenOrders: (canteenId, params) => API.get(`/orders/canteen/${canteenId}`, { params }),
  updateStatus: (id, status) => API.patch(`/orders/${id}/status`, { status }),
  verifyQR: (qr_code) => API.post('/orders/verify-qr', { qr_code }),
};

// ─── Payment ──────────────────────────────────────────
export const paymentAPI = {
  createOrder: (order_id) => API.post('/payment/create-order', { order_id }),
  verify: (data) => API.post('/payment/verify', data),
  walletTopup: (amount) => API.post('/payment/wallet/topup', { amount }),
  verifyWallet: (data) => API.post('/payment/wallet/verify', data),
};

// ─── Reviews ──────────────────────────────────────────
export const reviewAPI = {
  add: (data) => API.post('/reviews', data),
  getCanteenReviews: (canteenId) => API.get(`/reviews/${canteenId}`),
};

// ─── Admin ────────────────────────────────────────────
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  createUser: (data) => API.post('/admin/users', data),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  toggleBlock: (id) => API.patch(`/admin/users/${id}/block`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  approveOwner: (id) => API.patch(`/admin/owners/${id}/approve`),
  setCommission: (id, pct) => API.patch(`/admin/canteens/${id}/commission`, { commission_percentage: pct }),
  getPendingCanteens: (params) => API.get('/admin/canteens/pending', { params }),
  createCanteen: (data) => API.post('/admin/canteens', data),
  editCanteen: (id, data) => API.put(`/canteens/${id}`, data),
  deleteCanteen: (id) => API.delete(`/admin/canteens/${id}`),
  updateCanteenStatus: (id, status) => API.patch(`/admin/canteens/${id}/status`, { status }),
  getAds: () => API.get('/admin/ads'),
  createAd: (data) => API.post('/admin/ads', data),
  updateAd: (id, data) => API.put(`/admin/ads/${id}`, data),
  deleteAd: (id) => API.delete(`/admin/ads/${id}`),
};

export default API;
