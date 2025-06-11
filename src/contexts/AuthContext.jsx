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
  const [loading, setLoading] = useState(true); // Keep true initially to show auth loading
  const navigate = useNavigate();

  const fetchUser = useCallback(async (token) => {
    if (!token) {
      setUser(null); // Ensure user is null if no token
      setLoading(false); // Auth loading is done if no token
      return;
    }

    setLoading(true); // Start loading when token exists
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

  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => {
      const newUser = {
        ...prevUser,
        ...updatedUserData
      };
      // Persist the entire updated user object to localStorage
      // Note: Make sure updatedUserData from backend includes rewards and punishments
      localStorage.setItem('user', JSON.stringify(newUser)); 
      return newUser;
    });
  }, []);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setUser(null);
        localStorage.removeItem('user');
      }
    }

    // Always attempt to fetch user from API to ensure data is fresh
    // This will also handle cases where only a token exists but no user in localStorage
    if (token) {
      fetchUser(token);
    } else if (!localUser) {
      setLoading(false); // If no token and no local user, auth loading is complete
    }
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
    fetchUser,
    updateUser
  }), [user, loading, login, logout, register, fetchUser, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 