import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FileText, LogOut, Download, Award, Calendar, BookOpen, User } from 'lucide-react';
import logo from '../assets/logo.png';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/my_documents');
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    logout();
    navigate('/student-login');
  };

  const getDocIcon = (type) => {
    if (type.includes('Marksheet')) return <Award size={24} color="var(--primary)" />;
    if (type.includes('Certificate')) return <BookOpen size={24} color="var(--secondary)" />;
    return <FileText size={24} color="#F59E0B" />;
  };

  const downloadFile = (url, type) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'true');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar" style={{ width: '250px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'white', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--primary)' }}>
            <img src={logo} alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--primary)' }}>STUDENT DOCS HUB</h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: 'var(--primary)',
              color: 'white',
              transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <FileText size={20} /> My Documents
          </button>
          
          <div style={{ margin: '1rem 0', borderBottom: '1px solid var(--border)' }}></div>

          <button 
            onClick={() => navigate('/profile')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: 'transparent',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s', textAlign: 'left', width: '100%'
            }}
          >
            <User size={20} /> My Profile
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.username?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.username || 'Student'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.register_number}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', background: 'none', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Welcome, {user?.username?.split(' ')[0] || 'Student'} 👋</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Access and download your academic documents here.</p>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your documents...</div>
        ) : documents.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <FileText size={48} color="var(--border)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Documents Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your documents have not been uploaded yet. Please contact the administration.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {documents.map((doc) => (
              <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--surface-hover)', padding: '0.75rem', borderRadius: '12px' }}>
                    {getDocIcon(doc.doc_type)}
                  </div>
                  <span className={`badge badge-${doc.status}`}>{doc.status.toUpperCase()}</span>
                </div>
                
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{doc.doc_type}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  <Calendar size={14} />
                  <span>Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                </div>
                
                <button 
                  onClick={() => downloadFile(doc.file_url, doc.doc_type)}
                  className="btn-primary" 
                  style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                >
                  <Download size={18} /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
