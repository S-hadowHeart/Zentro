import { createContext, useContext, useState, useEffect } from 'react';
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
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async (token) => {
    console.log('fetchUser: attempting to fetch user with token:', token);
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('fetchUser: successfully fetched user data:', data.user);
        setUser({ ...data.user, rewards: data.user.rewards || [], punishments: data.user.punishments || [] });
        return data.user;
      } else {
        console.error('fetchUser: Failed to fetch user, response not OK:', response.status);
        localStorage.removeItem('token');
        setUser({});
        return null;
      }
    } catch (error) {
      console.error('fetchUser: Error during API call:', error);
      setUser({});
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext useEffect: token from localStorage:', token);
    if (token) {
      setLoading(true);
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setUser({});
      setLoading(false);
    }
  }, []);

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
        navigate('/tasks');
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser({});
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 