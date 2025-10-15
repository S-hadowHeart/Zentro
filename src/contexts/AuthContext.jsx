import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading until session is verified
  const navigate = useNavigate();

  // This is the key function to fetch user data based on a token
  const fetchUser = useCallback(async (token) => {
    try {
      const response = await fetch('https://zentro-yerp.onrender.com/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return data.user;
      } else {
        // Token is invalid or expired
        setUser(null);
        localStorage.removeItem('token');
        return null;
      }
    } catch (error) {
      console.error('AuthContext fetch user error:', error);
      setUser(null);
      localStorage.removeItem('token');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // On initial app load, check for a token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      // No token, so we are done with authentication loading
      setLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch('https://zentro-yerp.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/tasks');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Server error' };
    }
  }, [navigate]);

  const register = useCallback(async (username, password) => {
    try {
      const response = await fetch('https://zentro-yerp.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/tasks');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error during registration:', error);
      return { success: false, error: 'Server error' };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  // This function is now the single source of truth for user updates.
  const updateUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      return await fetchUser(token);
    }
    return null;
  }, [fetchUser]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    register,
    updateUser
  }), [user, loading, login, logout, register, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
