import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const userData = res.data;
        localStorage.setItem('role', userData.role);
        if (userData.department_id) {
          localStorage.setItem('department_id', userData.department_id);
        }
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user', error);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('department_id');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const studentLogin = async (register_number, password) => {
    const res = await api.post('/auth/student/login', { register_number, password });
    localStorage.setItem('token', res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const studentSignup = async (data) => {
    const res = await api.post('/auth/student/signup', data);
    return res.data;
  };

  const adminLogin = async (admin_id, password) => {
    try {
      const res = await api.post('/auth/admin/login', { admin_id, password });
      const { access_token, user: adminData } = res.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', adminData.role);
      if (adminData.department_id) {
        localStorage.setItem('department_id', adminData.department_id);
      }
      
      setUser(adminData);
      return res.data;
    } catch (error) {
      console.error("Admin login error", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('department_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, studentLogin, studentSignup, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
