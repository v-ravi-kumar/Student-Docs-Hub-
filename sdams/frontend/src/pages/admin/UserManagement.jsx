import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { Search, Filter, Eye, Edit2, Trash2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, deptFilter, users]);

  const fetchData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDepartments()
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(q) || 
        u.register_number.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    if (deptFilter) {
      result = result.filter(u => u.department_id === deptFilter);
    }
    setFilteredUsers(result);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    department_id: '',
    dob: '',
    qualification: '',
    year_of_joining: '',
    year_of_passing_out: '',
    password: ''
  });

  const handleEditClick = (user) => {
    // We need more details than what list_users provides, but for now we'll use what we have
    // or we could fetch full details. Let's use what we have and default others.
    setEditingStudent(user);
    setEditFormData({
      username: user.username,
      email: user.email || '',
      phone_number: user.phone_number || '',
      department_id: user.department_id,
      dob: user.dob || '',
      qualification: user.qualification || '',
      year_of_joining: user.year_of_joining || '',
      year_of_passing_out: user.year_of_passing_out || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateUser(editingStudent.id, editFormData);
      alert("Student updated successfully");
      setIsEditModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      alert("Error updating student: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) {
      try {
        await adminApi.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        alert("Student deleted successfully");
      } catch (error) {
        alert("Error deleting student: " + (error.response?.data?.msg || error.message));
      }
    }
  };

  if (loading) return <div className="loading" style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Loading users...</div>;

  return (
    <div className="user-management">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage student accounts and permissions</p>
        </div>
        <Link to="/admin/register-student" className="btn-primary">
          <UserPlus size={20} /> Add New Student
        </Link>
      </header>

      {/* ... (Search and Filter) ... */}
      <div className="filters glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by name, reg no, or email..."
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ width: '200px', position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <select
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Student Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Reg Number</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Department</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Email / Phone</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user.register_number}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.625rem', borderRadius: '6px', background: 'rgba(0, 95, 97, 0.1)', color: 'var(--primary)', fontWeight: '500' }}>
                      {user.department_name}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <div>{user.email || 'N/A'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{user.phone_number || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link to={`/admin/users/${user.id}`} title="View Details" style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)', background: 'rgba(0, 95, 97, 0.1)' }}>
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => handleEditClick(user)} title="Edit Student" style={{ padding: '0.5rem', borderRadius: '8px', color: '#004080', background: 'rgba(0, 64, 128, 0.1)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id, user.username)} title="Delete Student" style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No students found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Student Profile</h2>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={editFormData.username} onChange={e => setEditFormData({...editFormData, username: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" value={editFormData.phone_number} onChange={e => setEditFormData({...editFormData, phone_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input" value={editFormData.department_id} onChange={e => setEditFormData({...editFormData, department_id: e.target.value})} required>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={editFormData.dob} onChange={e => setEditFormData({...editFormData, dob: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualification</label>
                  <input type="text" className="form-input" value={editFormData.qualification} onChange={e => setEditFormData({...editFormData, qualification: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Joining</label>
                  <input type="number" className="form-input" value={editFormData.year_of_joining} onChange={e => setEditFormData({...editFormData, year_of_joining: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Passing Out</label>
                  <input type="number" className="form-input" value={editFormData.year_of_passing_out} onChange={e => setEditFormData({...editFormData, year_of_passing_out: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">New Password (Leave blank to keep current)</label>
                  <input type="password" placeholder="••••••••" className="form-input" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', fontWeight: '600' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Update Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
