import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api';
import { Building2, Plus, ArrowLeft } from 'lucide-react';

const AddDepartment = () => {
  const [deptId, setDeptId] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminApi.addDepartment({ dept_id: deptId, name });
      alert("Department added successfully!");
      navigate(-1); // Go back to previous page (SubAdminManagement or RegisterStudent)
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add department. It may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', background: 'var(--bg-gradient)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Building2 size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add New Department</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Expand the system by adding a new academic department</p>
        </div>

        {error && <div style={{ background: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department ID (Code)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CSE, MECH, IT"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Computer Science Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Adding...' : 'OK'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
