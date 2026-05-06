import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentSignup from './pages/StudentSignup';
import AddDepartment from './pages/AddDepartment';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/student-login" />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={`/${user.role}-dashboard`} />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = React.useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={`/${user.role}-dashboard`} /> : <Navigate to="/student-login" />
      } />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/add-department" element={<AddDepartment />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={
        <PrivateRoute roleRequired="admin">
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="/student-dashboard" element={
        <PrivateRoute roleRequired="student">
          <StudentDashboard />
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
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
