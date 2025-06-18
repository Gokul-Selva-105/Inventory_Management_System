import axios from "axios";

// Get API URL from environment variables or use default
// For mobile access, we need to detect if we're on a mobile device and use the network IP
const getApiUrl = () => {
  // First check environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're running on a mobile device or different machine
  // by comparing the current hostname with localhost
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  // If we're on localhost, use localhost for API
  if (isLocalhost) {
    return "http://localhost:5001/api";
  }
  
  // Otherwise, use the same hostname but with the API port
  // This works when accessing from another device on the network
  return `http://${window.location.hostname}:5001/api`;
};

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // Enable credentials for CORS requests
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors that are not from product deletion
    if (error.response?.status === 401 && 
        !error.config.url.includes('/products/') && 
        error.config.method !== 'delete') {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post("/users/login", credentials),
  register: (userData) => api.post("/users/register", userData),
  getUserProfile: () => api.get("/users/profile"),
  updateUserProfile: (userData) => api.put("/users/profile", userData),
};

// Products API calls
export const productsAPI = {
  getAll: () => api.get("/products"),
  getById: (id) => api.get(`/products/${id}`),
  getByNumber: (productNumber) => api.get(`/products/number/${productNumber}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  quickAdd: (productData) => api.post("/products/quick-add", productData),
  updateStatus: (productId, statusData) =>
    api.put(`/products/${productId}/status`, statusData),
  getStatusHistory: (productId) =>
    api.get(`/products/${productId}/status-history`),
  // Product movements
  getRecentMovements: () => api.get("/products/movements"),
  recordMovement: (movementData) => api.post("/products/movement", movementData),
  deleteMovement: (movementId) => api.delete(`/products/movements/${movementId}`),
};

// Categories API calls
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Stock History API calls
export const stockHistoryAPI = {
  getAll: () => api.get("/stock-history"),
  getByProductId: (productId) => api.get(`/stock-history/${productId}`),
  create: (historyData) => api.post("/stock-history", historyData),
};

export default api;
