import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, History, LogOut, GraduationCap, Building2 } from 'lucide-react';

import { AuthContext } from '../context/AuthContext';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = React.useContext(AuthContext);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Documents', path: '/admin/documents', icon: FolderOpen },
    { name: 'Activity Logs', path: '/admin/activity', icon: History },
  ];

  // Root Admin only items
  const isRoot = user?.role === 'root_admin' || user?.role === 'admin' || user?.register_number === 'admin';
  if (isRoot) {
    navItems.splice(1, 0, { name: 'Departments', path: '/admin/departments', icon: Building2 });
    navItems.push({ name: 'Admin Management', path: '/admin/sub-admins', icon: Users });
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <GraduationCap size={32} color="var(--primary)" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', letterSpacing: '-0.02em' }}>SDAMS ADMIN</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {navItems.map((item) => (
            <li key={item.name} style={{ marginBottom: '0.5rem' }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.2s',
                  fontWeight: isActive ? '600' : '500',
                })}
                className="nav-link"
              >
                <item.icon size={20} />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
          borderRadius: '12px',
          color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.1)',
          width: '100%',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
