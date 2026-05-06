import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const StudentLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { studentLogin, studentSignup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      if (isLogin) {
        await studentLogin(registerNumber, password);
        navigate('/student-dashboard');
      } else {
        // Strong Password Policy (Gmail-like)
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
          alert("You have entered an invalid password. Please correct it to meet all the conditions above.");
          setError("Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.");
          return;
        }
        await studentSignup(registerNumber, password);
        setSuccessMsg('Signup successful! Please log in.');
        setIsLogin(true); // Switch to login after successful signup
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.msg || (isLogin ? 'Login failed.' : 'Signup failed.'));
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
          <p style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '0.5rem', fontSize: '0.9rem' }}>{isLogin ? 'Student Login' : 'Create Student Account'}</p>
        </div>

        {error && <div style={{ background: '#ef4444', color: '#ffffff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>{error}</div>}
        {successMsg && <div style={{ background: '#10b981', color: '#ffffff', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '500' }}>{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Register Number</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Ex: 622622..."
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
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
            {!isLogin && (
              <div style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "#000000", background: "rgba(255,255,255,0.15)", padding: "0.6rem 0.9rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000" }}></div>
                  Password must be at least 8 characters.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000" }}></div>
                  It must include letters, numbers, and symbols.
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Student Login' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          {isLogin && (
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <button 
                onClick={() => navigate('/forgot-password')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                type="button"
              >
                Forgot Password?
              </button>
            </p>
          )}
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Don't have an account?
            <button 
              onClick={() => navigate('/student-signup')} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
            >
              Sign Up
            </button>
          </p>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => navigate('/admin-login')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}>
              Go to Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
