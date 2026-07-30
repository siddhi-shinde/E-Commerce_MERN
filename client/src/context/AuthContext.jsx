import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mk_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mk_token'));
  const [loading, setLoading] = useState(true);

  const persistSession = (nextToken, nextUser) => {
    if (nextToken) localStorage.setItem('mk_token', nextToken);
    if (nextUser) localStorage.setItem('mk_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem('mk_token');
    localStorage.removeItem('mk_user');
    setToken(null);
    setUser(null);
  }, []);

  // Rehydrate the logged-in user's full profile on first load (in case
  // localStorage's cached copy is stale)
  useEffect(() => {
    const rehydrate = async () => {
      const storedToken = localStorage.getItem('mk_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get('/auth/getUserInfo');
        setUser(data.user);
        localStorage.setItem('mk_user', JSON.stringify(data.user));
      } catch (err) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    rehydrate();
  }, [clearSession]);

  // Listen for forced logouts triggered by the axios 401 interceptor
  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener('mk:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('mk:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    persistSession(data.token, data.user);
    return data.user;
  };

 const register = async (payload) => {
  const { data } = await axiosInstance.post('/auth/register', payload);
  // Don't log the user in here
  return data;
};

  const logout = () => {
    clearSession();
  };

  const updateStoredUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('mk_user', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateStoredUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
