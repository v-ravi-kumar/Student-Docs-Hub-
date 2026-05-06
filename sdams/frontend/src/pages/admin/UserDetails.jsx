import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api';
import { User, FileText, History, Edit2, Save, X, Trash2, Upload, ExternalLink } from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [customDocName, setCustomDocName] = useState('');

  const documentCategories = [
    '10th Marksheet', '12th Marksheet', 'DC Certificate', 'FG Certificate', 
    'Income Certificate', 'Community Certificate', 'Negative Certificate', 
    'University Marksheet', 'Student ID Card', 'Others'
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [userRes, deptsRes] = await Promise.all([
        adminApi.getUserDetails(id),
        adminApi.getDepartments()
      ]);
      setData(userRes.data);
      setEditForm(userRes.data.profile);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateUser(id, editForm);
      setIsEditing(false);
      fetchData();
      alert("Profile updated successfully");
    } catch (error) {
      alert("Update failed: " + (error.response?.data?.msg || error.message));
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (window.confirm("Delete this document?")) {
      try {
        await adminApi.deleteDocument(docId);
        fetchData();
      } catch (error) {
        alert("Failed to delete document");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const finalDocType = uploadType === 'Others' ? customDocName : uploadType;
    
    if (!uploadFile || !finalDocType) {
      return alert("Please select a file and specify the document type.");
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('doc_type', finalDocType);
    formData.append('student_id', data.profile.register_number);
    formData.append('student_name', data.profile.username);
    formData.append('department', data.profile.department_id);

    setUploading(true);
    try {
      await adminApi.uploadForStudent(formData);
      setUploadFile(null);
      setUploadType('');
      setCustomDocName('');
      fetchData();
      alert("Document uploaded successfully");
    } catch (error) {
      alert("Upload failed: " + (error.response?.data?.msg || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="loading">Loading details...</div>;
  if (!data) return <div>Student not found</div>;

  const { profile, documents, activity } = data;

  return (
    <div className="user-details">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.5rem', fontWeight: '700' }}>
            {profile.username.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{profile.username}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>ID: {profile.register_number} • {profile.department_name}</p>
          </div>
        </div>
        {!isEditing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              <Edit2 size={18} /> Edit Profile
            </button>
            <button 
              onClick={async () => {
                if(window.confirm(`Are you sure you want to delete student "${profile.username}"?`)) {
                  try {
                    await adminApi.deleteUser(id);
                    alert("Student deleted successfully");
                    navigate('/admin/users');
                  } catch (err) {
                    alert("Failed to delete student");
                  }
                }
              }} 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Trash2 size={18} /> Delete Student
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditing(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', fontWeight: '500' }}>Cancel</button>
            <button onClick={handleUpdate} className="btn-primary"><Save size={18} /> Save Changes</button>
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column: Profile Info */}
        <section className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={20} /> Personal Information</h3>
          
          <div className="info-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isEditing ? (
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-input" value={editForm.department_id} onChange={e => setEditForm({...editForm, department_id: e.target.value})}>
                    {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.name}</option>)}
                  </select>
                </div>
              </form>
            ) : (
              <>
                <InfoItem label="Email" value={profile.email} />
                <InfoItem label="Phone" value={profile.phone_number} />
                <InfoItem label="DOB" value={profile.dob} />
                <InfoItem label="Joining Year" value={profile.year_of_joining} />
                <InfoItem label="Passing Out" value={profile.year_of_passing_out} />
                <InfoItem label="Qualification" value={profile.qualification} />
              </>
            )}
          </div>
        </section>

        {/* Right Column: Documents & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Documents Section */}
          <section className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={20} /> Documents</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select 
                  className="form-input" 
                  style={{ width: '180px', padding: '0.5rem' }}
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  {documentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {uploadType === 'Others' && (
                  <input 
                    type="text"
                    placeholder="Enter document name"
                    className="form-input"
                    style={{ width: '180px', padding: '0.5rem' }}
                    value={customDocName}
                    onChange={e => setCustomDocName(e.target.value)}
                  />
                )}

                <label className="btn-primary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={18} /> 
                  {uploading ? '...' : (uploadFile ? 'File Selected' : 'Choose File')}
                  <input type="file" hidden onChange={e => setUploadFile(e.target.files[0])} />
                </label>

                {uploadFile && (
                  <button 
                    onClick={handleUpload} 
                    className="btn-primary" 
                    style={{ background: '#10b981', padding: '0.5rem 1.5rem' }}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                )}
              </div>
            </div>

            <div className="docs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {documents.map(doc => (
                <div key={doc.id} className="doc-card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.2)' }}>
                  <div style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}><FileText size={32} /></div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{doc.doc_type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={`http://127.0.0.1:5000${doc.file_url}`} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', padding: '0.4rem', borderRadius: '6px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem' }}>
                      View
                    </a>
                    <button onClick={() => handleDeleteDoc(doc.id)} style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No documents uploaded yet</p>}
            </div>
          </section>

          {/* Activity Section */}
          <section className="glass-panel">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><History size={20} /> Student Activity</h3>
            <div className="activity-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem' }}>Action</th>
                    <th style={{ padding: '0.5rem' }}>Details</th>
                    <th style={{ padding: '0.5rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>{log.action}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{log.details}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{value || 'Not provided'}</span>
  </div>
);

export default UserDetails;
