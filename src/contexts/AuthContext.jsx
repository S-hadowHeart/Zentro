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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = useCallback(async (token) => {
    if (!token) {
      setUser(null); // Ensure user is null if no token
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('AuthContext fetch user error:', error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies are stable

  // Effect to handle navigation after auth state is determined
  // useEffect(() => {
  //   if (!loading && !user && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
  //     navigate('/login');
  //   }
  // }, [loading, user, navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetchUser(token);
  }, [fetchUser]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    register,
    fetchUser
  }), [user, loading, login, logout, register, fetchUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 