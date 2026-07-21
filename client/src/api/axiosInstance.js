import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Attach the JWT (if present) to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('mk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (expired/invalid token), clear local auth state and let the app
// re-render into a logged-out view. We dispatch a custom event rather than
// importing AuthContext here to avoid a circular dependency.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('mk_token');
      localStorage.removeItem('mk_user');
      window.dispatchEvent(new Event('mk:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
