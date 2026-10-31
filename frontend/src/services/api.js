import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para tratar expiração ou invalidação de token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redireciona para o login se o token for inválido ou ausente
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

export const accountsApi = {
  list: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
};

export const categoriesApi = {
  list: (tipo) => api.get('/categories', { params: { tipo } }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  seedDefaults: () => api.post('/categories/seed-defaults'),
};

export const cardsApi = {
  list: () => api.get('/cards'),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
  listInvoices: (id) => api.get(`/cards/${id}/invoices`),
};

export const transactionsApi = {
  list: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const reportsApi = {
  balances: () => api.get('/reports/balances'),
  summary: (month) => api.get('/reports/summary', { params: { month } }),
  byCategory: (month) => api.get('/reports/by-category', { params: { month } }),
};

export default api;

