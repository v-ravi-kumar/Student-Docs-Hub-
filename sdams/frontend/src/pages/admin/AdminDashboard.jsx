import React, { useState, useEffect, useContext } from 'react';
import { adminApi } from '../../api';
import { Users, FileText, Building2, Clock, ArrowRight, Shield, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = ({ type }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [selectedDept, setSelectedDept] = useState(queryParams.get('dept') || '');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role === 'root_admin') {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [selectedDept, type, user]);

  const fetchInitialData = async () => {
    try {
      const deptsRes = await adminApi.getDepartments();
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let deptId = selectedDept;
      if (type === 'dept' && user.role === 'sub_admin') {
        deptId = user.department_id;
      }
      const response = await adminApi.getStats(deptId ? { department_id: deptId } : {});
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <div className="loading" style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Loading Dashboard Data...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  if (!stats) return <div style={{ padding: '2rem', textAlign: 'center' }}>No dashboard data available for this view.</div>;

  const isRootView = type === 'root' || ((user?.role === 'root_admin' || user?.role === 'admin') && !selectedDept);

  const statCards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: '#3b82f6' },
    { label: 'Total Documents', value: stats?.total_documents || 0, icon: FileText, color: '#10b981' },
  ];

  if (isRootView) {
    statCards.push({ label: 'Departments', value: stats?.total_departments || 0, icon: Building2, color: '#f59e0b' });
    statCards.push({ label: 'Sub Admins', value: stats?.total_sub_admins || 0, icon: Shield, color: '#8b5cf6' });
  }

  return (
    <div className="admin-dashboard">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {type === 'root' ? 'Root Admin Dashboard' : (selectedDept || user?.department_id ? `${stats?.department_name || 'Department'} Dashboard` : 'Admin Dashboard')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {type === 'root' ? 'System-wide monitoring and management' : 'Departmental document control center'}
          </p>
        </div>
        
        {user?.role === 'root_admin' && type === 'root' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Filter size={18} color="var(--primary)" />
            <select 
              className="form-input" 
              style={{ border: 'none', background: 'transparent', padding: '0.25rem', width: '200px', fontWeight: '600' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Activity</h3>
            <Link to="/admin/activity" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="activity-list">
            {stats?.recent_activity?.length > 0 ? (
              stats.recent_activity.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ marginTop: '0.25rem' }}><Clock size={16} color="var(--text-secondary)" /></div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{log.username} <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>{log.action}</span></p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No recent activity</p>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Building2 size={48} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>System Integrity</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
            All documents are securely stored and encrypted. Regular backups are performed every 24 hours.
          </p>
          <div style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
            System Status: Healthy
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
