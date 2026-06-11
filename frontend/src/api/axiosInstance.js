import axios from 'axios';

// Create a centralized Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor to automatically inject the Bearer Token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Error parsing token from localStorage', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (e.g., unauthorized access)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error response exists and contains a message
    const message = error.response?.data?.message || 'An unexpected error occurred.';
    
    // Log out if 401 Unauthorized (optional, depending on auth strategy)
    if (error.response?.status === 401) {
      console.warn('Unauthorized request, logging out user...');
      localStorage.removeItem('userInfo');
      // Dispatching logout event can be handled in Redux or by checking status in app
    }
    
    // Customize the error object to return cleaner messages to components
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    
    return Promise.reject(customError);
  }
);

export default axiosInstance;
