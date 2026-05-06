import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api';
import { UserPlus, Edit2, Trash2, Shield, Mail, Building2 } from 'lucide-react';

const SubAdminManagement = () => {
  const navigate = useNavigate();
  const [subAdmins, setSubAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    staff_id: '',
    department_id: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, deptsRes] = await Promise.all([
        adminApi.getSubAdmins(),
        adminApi.getDepartments()
      ]);
      setSubAdmins(adminsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error("Error fetching sub admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await adminApi.updateSubAdmin(editingAdmin.id, formData);
        alert("Sub Admin updated successfully");
      } else {
        await adminApi.createSubAdmin(formData);
        alert("Sub Admin created successfully");
      }
      setIsModalOpen(false);
      setEditingAdmin(null);
      setFormData({ username: '', email: '', staff_id: '', department_id: '', password: '' });
      fetchData();
    } catch (error) {
      alert("Error: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sub-admin?")) {
      try {
        await adminApi.deleteSubAdmin(id);
        fetchData();
      } catch (error) {
        alert("Error deleting sub-admin");
      }
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      staff_id: admin.register_number,
      department_id: admin.department_id,
      password: '' // Keep password empty unless changing
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="loading">Loading admin management...</div>;

  return (
    <div className="sub-admin-management">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Admin Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage department-specific sub-administrators</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingAdmin(null); setFormData({username:'', email:'', staff_id:'', department_id:'', password:''}); setIsModalOpen(true); }}>
          <UserPlus size={20} /> Create Sub Admin
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Staff ID</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subAdmins.map((admin) => (
              <tr key={admin.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={18} color="var(--primary)" />
                    <span style={{ fontWeight: '600' }}>{admin.username}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{admin.register_number}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Mail size={14} /> {admin.email}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(0, 95, 97, 0.1)', color: 'var(--primary)', fontWeight: '600' }}>
                    {departments.find(d => d.dept_id === admin.department_id)?.name || admin.department_id}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleEdit(admin)} style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)', background: 'rgba(0, 95, 97, 0.1)' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(admin.id)} style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingAdmin ? 'Edit Sub Admin' : 'Create Sub Admin'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Staff ID</label>
                <input type="text" className="form-input" value={formData.staff_id} onChange={e => setFormData({...formData, staff_id: e.target.value})} required disabled={!!editingAdmin} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department Assignment</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    className="form-input" 
                    value={formData.department_id} 
                    onChange={e => setFormData({...formData, department_id: e.target.value})} 
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
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
                <label className="form-label">{editingAdmin ? 'New Password (Optional)' : 'Password'}</label>
                <input type="password" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingAdmin} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', fontWeight: '600' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingAdmin ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminManagement;
