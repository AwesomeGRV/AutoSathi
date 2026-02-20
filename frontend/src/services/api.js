import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (page = 1, limit = 10) => 
    api.get(`/vehicles?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
  updateOdometer: (id, odometerReading) => 
    api.patch(`/vehicles/${id}/odometer`, { odometerReading }),
  getStats: () => api.get('/vehicles/stats'),
  getUpcomingRenewals: (days = 30) => 
    api.get(`/vehicles/renewals?days=${days}`),
};

// Fuel API
export const fuelAPI = {
  getByVehicleId: (vehicleId, page = 1, limit = 50) => 
    api.get(`/fuel/vehicle/${vehicleId}?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/fuel/${id}`),
  create: (fuelData) => api.post('/fuel', fuelData),
  update: (id, fuelData) => api.put(`/fuel/${id}`, fuelData),
  delete: (id) => api.delete(`/fuel/${id}`),
  getMonthlyStats: (vehicleId, months = 12) => 
    api.get(`/fuel/vehicle/${vehicleId}/stats/monthly?months=${months}`),
  getAverageMileage: (vehicleId) => 
    api.get(`/fuel/vehicle/${vehicleId}/stats/mileage`),
  getTotalExpense: (vehicleId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/fuel/vehicle/${vehicleId}/stats/expense?${params}`);
  },
  getRecentEntries: (limit = 10) => 
    api.get(`/fuel/recent?limit=${limit}`),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getMileageStats: () => api.get('/dashboard/mileage-stats'),
  getExpenseTrends: (months = 12) => 
    api.get(`/dashboard/expense-trends?months=${months}`),
  getServiceReminders: () => api.get('/dashboard/service-reminders'),
  getVehicleHealth: () => api.get('/dashboard/vehicle-health'),
};

// Insurance API (placeholder)
export const insuranceAPI = {
  getAll: () => api.get('/insurance'),
  getById: (id) => api.get(`/insurance/${id}`),
  create: (insuranceData) => api.post('/insurance', insuranceData),
  update: (id, insuranceData) => api.put(`/insurance/${id}`, insuranceData),
  delete: (id) => api.delete(`/insurance/${id}`),
};

// PUC API (placeholder)
export const pucAPI = {
  getAll: () => api.get('/puc'),
  getById: (id) => api.get(`/puc/${id}`),
  create: (pucData) => api.post('/puc', pucData),
  update: (id, pucData) => api.put(`/puc/${id}`, pucData),
  delete: (id) => api.delete(`/puc/${id}`),
};

// Services API (placeholder)
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (serviceData) => api.post('/services', serviceData),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
};

// Documents API (placeholder)
export const documentsAPI = {
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  upload: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Notifications API (placeholder)
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
