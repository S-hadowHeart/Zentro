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
        console.log('fetchUser: successfully fetched user data:', data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('AuthContext fetch user error:', error);
      setUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const authContextValue = useMemo(() => ({
    user,
    setUser,
    loading,
    fetchUser,
    logout,
  }), [user, loading, fetchUser, logout]);

  const login = async (username, password) => {
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
        console.log('Login successful, received user data:', data.user);
        setUser({ ...data.user, rewards: data.user.rewards || [], punishments: data.user.punishments || [] });
        console.log('User state after setting:', data.user);
        window.location.href = '/tasks';
        return { success: true };
      } else {
        console.log('Login failed, server response:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error during login API call:', error);
      return { success: false, error: 'Server error' };
    }
  };

  const register = async (username, password) => {
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
        setUser({ ...data.user, rewards: data.user.rewards || [], punishments: data.user.punishments || [] });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Server error' };
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 