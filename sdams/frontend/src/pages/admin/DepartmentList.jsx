import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api';
import { Building2, Users, FileText, UserCheck, ArrowRight } from 'lucide-react';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await adminApi.getDepartmentsDetailed();
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading departments...</div>;

  return (
    <div className="department-list">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Academic Departments</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor all departments across the institution</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {departments.map((dept) => (
          <div key={dept.dept_id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(0, 95, 97, 0.1)', color: 'var(--primary)' }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>{dept.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dept ID: {dept.dept_id}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/admin/dashboard?dept=${dept.dept_id}`)}
                style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--surface-hover)', color: 'var(--primary)' }}
                title="View Dashboard"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <Users size={14} /> Students
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{dept.student_count}</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <FileText size={14} /> Documents
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{dept.doc_count}</div>
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0, 95, 97, 0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'white', color: 'var(--primary)' }}>
                <UserCheck size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.625rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Assigned Sub Admin</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{dept.sub_admin ? dept.sub_admin.username : 'Not Assigned'}</div>
              </div>
              {dept.sub_admin && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{dept.sub_admin.email}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentList;
