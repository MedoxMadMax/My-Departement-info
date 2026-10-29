import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { login as apiLogin, getMe } from '../api/authApi';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('jwt_token');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await fetchUser();
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    if (data && data.token) {
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      await fetchUser();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
