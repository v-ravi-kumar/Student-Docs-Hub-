import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const AdminLogin = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Clear stale data to avoid role-mismatch during redirection
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('department_id');
    
    try {
      const response = await adminLogin(adminId, password);
      const userRole = response.user.role;
      if (userRole === 'root_admin') {
        navigate('/admin/root-dashboard');
      } else {
        navigate('/admin/department-dashboard');
      }
    } catch (err) {
      console.error("Login failed", err);
      if (!err.response) {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError(err.response.data?.msg || 'Invalid credentials');
      }
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', overflow: 'hidden', border: '2px solid var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img src={logo} alt="Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '2px' }}>STUDENT DOCS HUB</h2>
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>Admin Portal</p>
        </div>

        {error && <div style={{ background: '#ef4444', color: '#ffffff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin ID</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Admin username"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Admin Login
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button onClick={() => navigate('/student-login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
            Go to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
