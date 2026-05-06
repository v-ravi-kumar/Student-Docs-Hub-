import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center', background: 'var(--bg-gradient)', minHeight: '100vh' }}>Loading Admin Session...</div>;
  
  const allowedRoles = ['root_admin', 'sub_admin', 'admin'];
  if (!user || !allowedRoles.includes(user.role)) {
    console.log("AdminLayout: Access denied for user", user);
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="app-container">
      <AdminSidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
