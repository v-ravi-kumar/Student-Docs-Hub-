import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api';
import { History, Search, Filter, Clock, User as UserIcon } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [search, actionFilter, logs]);

  const fetchLogs = async () => {
    try {
      const response = await adminApi.getActivityLogs();
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let result = logs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l => 
        l.username?.toLowerCase().includes(q) || 
        l.details?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q)
      );
    }
    if (actionFilter) {
      result = result.filter(l => l.action === actionFilter);
    }
    setFilteredLogs(result);
  };

  const actions = [...new Set(logs.map(l => l.action))];

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <div className="activity-logs">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>System Activity Logs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track all user and administrative actions across the platform</p>
      </header>

      <div className="filters glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by user or detail..."
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
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            {actions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Timestamp</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>User</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Action</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <Clock size={14} color="var(--text-secondary)" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: log.role === 'admin' ? 'var(--primary)' : 'rgba(0,0,0,0.1)', color: log.role === 'admin' ? 'white' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        <UserIcon size={12} />
                      </div>
                      <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>{log.username}</span>
                      <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: log.role === 'admin' ? 'rgba(0, 95, 97, 0.1)' : 'rgba(0,0,0,0.05)', color: log.role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                        {log.role}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.5rem', borderRadius: '6px', background: getActionColor(log.action), color: 'white' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {log.details}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No activity logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getActionColor = (action) => {
  switch (action) {
    case 'LOGIN': return '#3b82f6';
    case 'UPLOAD_DOCUMENT': return '#10b981';
    case 'DELETE_DOCUMENT': return '#ef4444';
    case 'EDIT_USER': return '#f59e0b';
    case 'DELETE_USER': return '#dc2626';
    case 'ADMIN_PASSWORD_RESET': return '#8b5cf6';
    default: return '#6b7280';
  }
};

export default ActivityLogs;
