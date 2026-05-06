import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const studentLogin = async (register_number, password) => {
    const res = await api.post('/auth/student/login', { register_number, password });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const studentSignup = async (studentData) => {
    const res = await api.post('/auth/student/signup', studentData);
    return res.data;
  };

  const adminLogin = async (admin_id, password) => {
    const res = await api.post('/auth/admin/login', { admin_id, password });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, studentLogin, studentSignup, adminLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
