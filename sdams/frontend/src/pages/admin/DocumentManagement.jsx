import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FileText, Search, Filter, Trash2, Download, ExternalLink, User } from 'lucide-react';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [docTypes, setDocTypes] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterDocs();
  }, [search, typeFilter, documents]);

  const fetchData = async () => {
    try {
      // For now, I'll fetch all students and then their docs, or ideally a new "all docs" endpoint
      // Let's check if there's an endpoint for all docs. If not, I'll add one to admin.py
      const typesRes = await api.get('/documents/types');
      setDocTypes(typesRes.data);
      
      // I'll add a GET /api/admin/documents endpoint to backend/routes/admin.py
      const docsRes = await api.get('/admin/documents');
      setDocuments(docsRes.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocs = () => {
    let result = documents;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.student_name.toLowerCase().includes(q) || 
        d.student_reg_no.toLowerCase().includes(q) ||
        d.doc_type.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      result = result.filter(d => d.doc_type === typeFilter);
    }
    setFilteredDocs(result);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await api.delete(`/api/admin/documents/${id}`);
        setDocuments(documents.filter(d => d.id !== id));
      } catch (error) {
        alert("Failed to delete document");
      }
    }
  };

  if (loading) return <div className="loading">Loading documents...</div>;

  return (
    <div className="document-management">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-primary)' }}>Document Repository</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage all academic documents uploaded to the system</p>
      </header>

      <div className="filters glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by student, reg no, or document type..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {docTypes.map(t => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Document</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Student</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Type</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem' }}>Uploaded On</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={20} color="var(--primary)" />
                      <span style={{ fontWeight: '500' }}>{doc.file_path.split('/').pop()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: '500' }}>{doc.student_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{doc.student_reg_no}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.05)', color: 'var(--text-primary)' }}>
                      {doc.doc_type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <a href={`http://127.0.0.1:5000${doc.file_path}`} target="_blank" rel="noreferrer" title="View Document" style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)', background: 'rgba(0, 95, 97, 0.1)' }}>
                        <ExternalLink size={18} />
                      </a>
                      <button onClick={() => handleDelete(doc.id)} title="Delete Document" style={{ padding: '0.5rem', borderRadius: '8px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentManagement;
