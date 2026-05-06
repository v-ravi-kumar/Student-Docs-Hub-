import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentSignup from './pages/StudentSignup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import AddDepartment from './pages/AddDepartment';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';
import DocumentManagement from './pages/admin/DocumentManagement';
import ActivityLogs from './pages/admin/ActivityLogs';
import RegisterStudent from './pages/admin/RegisterStudent';
import SubAdminManagement from './pages/admin/SubAdminManagement';
import DepartmentList from './pages/admin/DepartmentList';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;

  if (!user) {
    const is_admin_route = window.location.pathname.startsWith('/admin');
    return <Navigate to={is_admin_route ? "/admin/login" : "/student-login"} />;
  }

  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'root_admin') return <Navigate to="/admin/root-dashboard" />;
    if (user.role === 'sub_admin') return <Navigate to="/admin/department-dashboard" />;
    return <Navigate to={`/${user.role}-dashboard`} />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-gradient)', color: 'white', fontWeight: 'bold' }}>Loading SDAMS...</div>;

  return (
    <Routes>
      <Route path="/" element={
        user ? (
          (user.role === 'root_admin' || user.role === 'admin') ? <Navigate to="/admin/root-dashboard" /> :
          user.role === 'sub_admin' ? <Navigate to="/admin/department-dashboard" /> :
          <Navigate to="/student-dashboard" />
        ) : <Navigate to="/student-login" />
      } />
      
      {/* Student Routes */}
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/student-dashboard" element={
        <PrivateRoute roleRequired="student">
          <StudentDashboard />
        </PrivateRoute>
      } />
      
      {/* Admin Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin-login" element={<Navigate to="/admin/login" />} />
      <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" />} />

      {/* Admin Dashboard Protected Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={
          (user?.role === 'root_admin' || user?.role === 'admin') ? <Navigate to="/admin/root-dashboard" /> : <Navigate to="/admin/department-dashboard" />
        } />
        <Route path="root-dashboard" element={<AdminDashboard type="root" />} />
        <Route path="department-dashboard" element={<AdminDashboard type="dept" />} />
        <Route path="dashboard" element={
          (user?.role === 'root_admin' || user?.role === 'admin') ? <Navigate to="/admin/root-dashboard" /> : <Navigate to="/admin/department-dashboard" />
        } />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="register-student" element={<RegisterStudent />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="activity" element={<ActivityLogs />} />
        <Route path="sub-admins" element={<SubAdminManagement />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="add-department" element={<AddDepartment />} />
      </Route>

      {/* Global Routes */}
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
