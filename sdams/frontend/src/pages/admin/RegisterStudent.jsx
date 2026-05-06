import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    register_number: '',
    email: '',
    phone_number: '',
    department_id: '',
    dob: '',
    year_of_joining: new Date().getFullYear(),
    year_of_passing_out: new Date().getFullYear() + 4,
    password: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/auth/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register_student', formData);
      alert("Student registered successfully!");
      navigate('/admin/users');
    } catch (error) {
      alert("Registration failed: " + (error.response?.data?.msg || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="register-student">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Back to Users
      </button>

      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Register New Student</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Create a new student account in the system</p>
      </header>

      <div className="glass-panel" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="username" className="form-input" placeholder="John Doe" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number</label>
              <input type="text" name="register_number" className="form-input" placeholder="622622..." value={formData.register_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone_number" className="form-input" placeholder="10-digit number" value={formData.phone_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  name="department_id" 
                  className="form-input" 
                  value={formData.department_id} 
                  onChange={handleChange} 
                  required
                  style={{ flex: 1 }}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => navigate('/admin/add-department')}
                  style={{ background: 'var(--primary)', color: 'white', padding: '0 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}
                  title="Add New Department"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dob" className="form-input" value={formData.dob} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Joining</label>
              <input type="number" name="year_of_joining" className="form-input" value={formData.year_of_joining} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Passing Out</label>
              <input type="number" name="year_of_passing_out" className="form-input" value={formData.year_of_passing_out} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Password (Optional - Defaults to Reg No)</label>
              <input type="password" name="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', height: '3.5rem' }} disabled={loading}>
            <UserPlus size={20} /> {loading ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;
