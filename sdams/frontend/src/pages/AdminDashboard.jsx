import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Users, FileUser, LogOut, Upload as UploadIcon, UserPlus, Search, Trash2, Activity, FileText, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import logo from '../assets/logo.png';

const AdminDashboard = () => {
  const DEPARTMENTS = [
    "Agriculture Engineering",
    "Biomedical Engineering",
    "Civil Engineering",
    "Computer Science and Engineering",
    "Electrical and Electronics",
    "Electronics and Communication",
    "Information Technology",
    "Mechanical Engineering",
    "Other"
  ];

  const ADMIN_DEPARTMENTS = [
    "Information Technology (IT)",
    "Computer Science Engineering (CSE)",
    "Artificial Intelligence (AI)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering (MECH)",
    "Civil Engineering"
  ];

  const DOC_TYPES = [
    "Income Certificate",
    "Community Certificate",
    "Negative Certificate",
    "10th Marksheet",
    "12th Marksheet",
    "TC (Transfer Certificate)",
    "FC Certificate (First Graduate Certificate)",
    "Student ID Card",
    "Bonafide Certificate",
    "Aadhaar",
    "Other"
  ];

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documents');
  const [students, setStudents] = useState([]);
  
  // Registration Form
  const [regUsername, setRegUsername] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regJoinYear, setRegJoinYear] = useState('');
  const [regPassYear, setRegPassYear] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Admin Registration Form
  const [adminName, setAdminName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminQualification, setAdminQualification] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminDept, setAdminDept] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  // Admin Reset Password Form
  const [resetUsername, setResetUsername] = useState('');
  const [resetRegNo, setResetRegNo] = useState('');
  const [resetDeptId, setResetDeptId] = useState('');
  const [resetDob, setResetDob] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // Upload Form - Step 1: Validation
  const [uploadStudentName, setUploadStudentName] = useState('');
  const [uploadRegNo, setUploadRegNo] = useState('');
  const [uploadDeptId, setUploadDeptId] = useState('');
  const [uploadDeptName, setUploadDeptName] = useState('');
  const [validatedStudent, setValidatedStudent] = useState(null);
  const [validatedStudentDocs, setValidatedStudentDocs] = useState([]);
  
  // Upload Form - Step 2: File Upload
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState(null);

  // Delete Form
  const [searchDeleteRegNo, setSearchDeleteRegNo] = useState('');
  const [searchDeleteName, setSearchDeleteName] = useState('');
  const [searchDeleteDeptId, setSearchDeleteDeptId] = useState('');
  const [searchDeleteDeptName, setSearchDeleteDeptName] = useState('');
  const [searchedStudentDocs, setSearchedStudentDocs] = useState([]);
  const [activeStudentForDelete, setActiveStudentForDelete] = useState(null);

  // Activity Logs
  const [activities, setActivities] = useState([]);

  // Status
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/auth/students');
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/auth/activity_logs');
      setActivities(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (regPassword && regPassword !== regConfirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    try {
      await api.post('/auth/register_student', {
        username: regUsername,
        register_number: regNumber,
        email: regEmail,
        phone_number: regPhone,
        department_id: regDept,
        dob: regDob,
        year_of_joining: parseInt(regJoinYear),
        year_of_passing_out: parseInt(regPassYear),
        password: regPassword
      });
      setMessage({ text: 'Student registered successfully', type: 'success' });
      setRegUsername(''); setRegNumber(''); setRegEmail(''); setRegPhone('');
      setRegDept(''); setRegDob(''); setRegJoinYear(''); setRegPassYear(''); setRegPassword(''); setRegConfirmPassword('');
      fetchStudents();
    } catch (error) {
      setMessage({ text: error.response?.data?.msg || 'Registration failed', type: 'error' });
    }
  };

  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    if (adminPassword !== adminConfirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    try {
      await api.post('/auth/admin/register_admin', {
        username: adminName,
        admin_id: adminId,
        email: adminEmail,
        phone_number: adminPhone,
        department_id: adminDept,
        qualification: adminQualification,
        password: adminPassword
      });
      setMessage({ text: 'Admin registered successfully', type: 'success' });
      setAdminName(''); setAdminId(''); setAdminQualification(''); setAdminEmail(''); 
      setAdminPhone(''); setAdminDept(''); setAdminPassword(''); setAdminConfirmPassword('');
    } catch (error) {
      setMessage({ text: error.response?.data?.msg || 'Admin registration failed', type: 'error' });
    }
  };

  // Upload Logic
  const handleValidateStudent = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.register_number === uploadRegNo);
    if (student) {
      setValidatedStudent(student);
      setMessage({ text: 'Student validated successfully. Proceed to upload.', type: 'success' });
      try {
        const res = await api.get(`/documents/student/${student.id}`);
        setValidatedStudentDocs(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setValidatedStudent(null);
      setValidatedStudentDocs([]);
      setMessage({ text: 'Student not found in the database. Please check registration number.', type: 'error' });
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Please select a file', type: 'error' });
      return;
    }
    const formData = new FormData();
    formData.append('student_id', validatedStudent.id);
    formData.append('student_name', uploadStudentName);
    formData.append('doc_type', docType);
    formData.append('department', uploadDeptName);
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ text: 'Document uploaded successfully', type: 'success' });
      setFile(null);
      setDocType('');
      try {
        const res = await api.get(`/documents/student/${validatedStudent.id}`);
        setValidatedStudentDocs(res.data);
      } catch (err) {
        console.error(err);
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.msg || 'Upload failed', type: 'error' });
    }
  };

  const handleDeleteValidatedDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setValidatedStudentDocs(validatedStudentDocs.filter(d => d.id !== docId));
      setMessage({ text: 'Document deleted successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to delete document', type: 'error' });
    }
  };

  // Delete Logic
  const handleSearchDocs = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.register_number === searchDeleteRegNo);
    if (!student) {
      setMessage({ text: 'Student not found', type: 'error' });
      setSearchedStudentDocs([]);
      setActiveStudentForDelete(null);
      return;
    }
    try {
      const res = await api.get(`/documents/student/${student.id}`);
      setSearchedStudentDocs(res.data);
      setActiveStudentForDelete(student);
      setMessage({ text: `Found ${res.data.length} documents for ${student.username}`, type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.msg || 'Failed to fetch documents', type: 'error' });
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSearchedStudentDocs(searchedStudentDocs.filter(d => d.id !== docId));
      setMessage({ text: 'Document deleted successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to delete document', type: 'error' });
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    if (resetNewPassword !== resetConfirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    try {
      const res = await api.post('/auth/admin/reset_student_password', {
        register_number: resetRegNo,
        username: resetUsername,
        phone_number: resetPhone,
        department_id: resetDeptId,
        dob: resetDob,
        new_password: resetNewPassword
      });
      setMessage({ text: res.data.msg, type: 'success' });
      setResetRegNo(''); setResetUsername(''); setResetPhone(''); setResetDeptId(''); setResetDob(''); 
      setResetNewPassword(''); setResetConfirmPassword('');
    } catch (error) {
      setMessage({ text: error.response?.data?.msg || 'Password reset failed', type: 'error' });
    }
  };

  const onLogout = () => {
    logout();
    navigate('/admin-login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ background: 'white', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--primary)' }}>
            <img src={logo} alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--primary)' }}>STUDENT DOCS HUB</h2>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => { setActiveTab('documents'); setMessage({text:'', type:''}); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: activeTab === 'documents' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'documents' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <UploadIcon size={20} /> Document Upload
          </button>
          <button 
            onClick={() => { setActiveTab('delete_docs'); setMessage({text:'', type:''}); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: activeTab === 'delete_docs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'delete_docs' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <Trash2 size={20} /> Document Delete
          </button>
          <button 
            onClick={() => { setActiveTab('activity'); setMessage({text:'', type:''}); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: activeTab === 'activity' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'activity' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <Activity size={20} /> Student Activity
          </button>

          <div style={{ margin: '1rem 0', borderBottom: '1px solid var(--border)' }}></div>

          <button 
            onClick={() => { setActiveTab('students'); setMessage({text:'', type:''}); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: activeTab === 'students' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'students' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <UserPlus size={20} /> Register Student
          </button>
          <button 
            onClick={() => { setActiveTab('reset_password'); setMessage({text:'', type:''}); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
              borderRadius: '8px', background: activeTab === 'reset_password' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'reset_password' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <KeyRound size={20} /> Reset Password
          </button>
          {user && ['admin', 'ravi kumar'].includes(user.register_number) && (
            <button 
              onClick={() => { setActiveTab('admins'); setMessage({text:'', type:''}); }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
                borderRadius: '8px', background: activeTab === 'admins' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'admins' ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              <Users size={20} /> Manage Admins
            </button>
          )}

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
            <UserPlus size={20} /> My Profile
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="var(--text-primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.username || 'Admin'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Administrator</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', background: 'none', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            {activeTab === 'documents' ? 'Document Upload' : 
             activeTab === 'delete_docs' ? 'Document Delete' : 
             activeTab === 'activity' ? 'Student Activity Log' : 
             activeTab === 'students' ? 'Student Management' : 
             activeTab === 'reset_password' ? 'Reset Student Password' : 'Admin Management'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {activeTab === 'documents' ? 'Validate student and upload academic documents.' : 
             activeTab === 'delete_docs' ? 'Search student profiles to view and delete documents.' : 
             activeTab === 'activity' ? 'Track all login, upload, and deletion activities across the system.' : 
             activeTab === 'students' ? 'Register new students to the portal.' : 
             activeTab === 'reset_password' ? 'Reset a student account password using their details.' : 'Create new administrator accounts.'}
          </p>
        </header>

        {message.text && (
          <div style={{ 
            background: message.type === 'success' ? '#10b981' : '#ef4444', 
            color: '#ffffff', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            fontWeight: '600',
            boxShadow: message.type === 'success' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span style={{ fontSize: '0.95rem' }}>{message.text}</span>
          </div>
        )}

        <div className={activeTab === 'activity' ? "" : "glass-panel"} style={{ maxWidth: activeTab === 'activity' ? '100%' : '600px' }}>
          
          {/* TAB: DOCUMENT UPLOAD */}
          {activeTab === 'documents' && (
            <div>
              {!validatedStudent ? (
                <form onSubmit={handleValidateStudent}>
                  <h3 style={{fontSize:'1.1rem', marginBottom:'1rem', color:'var(--text-primary)', borderBottom:'1px solid var(--border)', paddingBottom:'0.5rem'}}>Step 1: Validate Student</h3>
                  <div className="form-group">
                    <label className="form-label">Student Name</label>
                    <input type="text" className="form-input" placeholder="Enter student name..." value={uploadStudentName} onChange={(e) => setUploadStudentName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input type="text" className="form-input" placeholder="Enter student registration number..." value={uploadRegNo} onChange={(e) => setUploadRegNo(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department ID</label>
                    <input type="text" className="form-input" placeholder="e.g. CS101" value={uploadDeptId} onChange={(e) => setUploadDeptId(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department Name</label>
                    <select className="form-input" value={uploadDeptName} onChange={(e) => setUploadDeptName(e.target.value)} required>
                      <option value="" disabled>-- Select a department --</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    <Search size={18} /> Validate Student
                  </button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleUploadDocument}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)', paddingBottom:'0.5rem', marginBottom:'1rem'}}>
                    <h3 style={{fontSize:'1.1rem', color:'var(--text-primary)', margin:0}}>Step 2: Upload Document</h3>
                    <button type="button" onClick={() => setValidatedStudent(null)} style={{background:'none', color:'var(--primary)', fontSize:'0.875rem', textDecoration:'underline'}}>Back to Validation</button>
                  </div>
                  
                  <div style={{background:'var(--surface-hover)', padding:'1rem', borderRadius:'8px', marginBottom:'1.5rem'}}>
                    <div style={{fontWeight:'bold', marginBottom:'0.25rem'}}>{validatedStudent.username}</div>
                    <div style={{fontSize:'0.875rem', color:'var(--text-secondary)'}}>Reg: {validatedStudent.register_number}</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select className="form-input" value={docType} onChange={(e) => setDocType(e.target.value)} required>
                      <option value="" disabled>-- Select a document type --</option>
                      {DOC_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Choose File (PDF, JPG, PNG)</label>
                    <input type="file" className="form-input" onChange={(e) => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" required />
                    {file && <div style={{marginTop:'0.5rem', fontSize:'0.8rem', color:'var(--text-secondary)'}}>File size: {(file.size / 1024).toFixed(2)} KB</div>}
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    <UploadIcon size={18} /> Upload Document
                  </button>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{fontSize:'1.1rem', color:'var(--text-primary)', marginBottom:'1rem'}}>Student's Uploaded Documents</h3>
                  {validatedStudentDocs.length === 0 ? (
                    <div style={{textAlign:'center', padding:'1rem', color:'var(--text-secondary)'}}>
                      No documents found for this student.
                    </div>
                  ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                      {validatedStudentDocs.map(doc => (
                        <div key={doc.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px'}}>
                          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                            <div style={{width:'40px', height:'40px', background:'var(--surface-hover)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              <FileText size={20} color="var(--primary)" />
                            </div>
                            <div>
                              <div style={{fontWeight:'500'}}>{doc.doc_type}</div>
                              <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Uploaded: {new Date(doc.uploaded_at).toLocaleString()}</div>
                            </div>
                          </div>
                          <div style={{display:'flex', gap:'0.5rem'}}>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{padding:'0.5rem', borderRadius:'6px'}}>
                              View
                            </a>
                            <button type="button" onClick={() => handleDeleteValidatedDoc(doc.id)} style={{background:'#FEE2E2', color:'#EF4444', border:'none', padding:'0.5rem', borderRadius:'6px', cursor:'pointer'}}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </>
              )}
            </div>
          )}

          {/* TAB: STUDENT ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="glass-panel" style={{maxWidth: '100%', overflowX: 'auto'}}>
               <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                 <thead>
                   <tr style={{borderBottom: '1px solid var(--border)'}}>
                     <th style={{padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500'}}>Timestamp</th>
                     <th style={{padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500'}}>User</th>
                     <th style={{padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500'}}>Role</th>
                     <th style={{padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500'}}>Action</th>
                     <th style={{padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500'}}>Details</th>
                   </tr>
                 </thead>
                 <tbody>
                   {activities.length === 0 ? (
                     <tr>
                       <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>No activities logged yet.</td>
                     </tr>
                   ) : (
                     activities.map(log => (
                       <tr key={log.id} style={{borderBottom: '1px solid var(--border)', transition: 'background 0.2s'}}>
                         <td style={{padding: '1rem', fontSize: '0.875rem'}}>{new Date(log.timestamp).toLocaleString()}</td>
                         <td style={{padding: '1rem', fontWeight: '500'}}>{log.username}</td>
                         <td style={{padding: '1rem'}}>
                           <span style={{
                             padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem',
                             background: log.role === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                             color: log.role === 'admin' ? '#3b82f6' : '#10b981'
                           }}>
                             {log.role}
                           </span>
                         </td>
                         <td style={{padding: '1rem'}}>
                           <span style={{fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.875rem'}}>{log.action}</span>
                         </td>
                         <td style={{padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>{log.details}</td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
          )}

          {/* TAB: DOCUMENT DELETE */}
          {activeTab === 'delete_docs' && (
            <div>
              <form onSubmit={handleSearchDocs} style={{marginBottom:'2rem'}}>
                <h3 style={{fontSize:'1.1rem', marginBottom:'1rem', color:'var(--text-primary)', borderBottom:'1px solid var(--border)', paddingBottom:'0.5rem'}}>Search Student Profile</h3>
                
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-input" placeholder="Enter student name..." value={searchDeleteName} onChange={(e) => setSearchDeleteName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
                  <input type="text" className="form-input" placeholder="Enter registration number..." value={searchDeleteRegNo} onChange={(e) => setSearchDeleteRegNo(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department ID</label>
                  <input type="text" className="form-input" placeholder="e.g. CS101" value={searchDeleteDeptId} onChange={(e) => setSearchDeleteDeptId(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Name</label>
                  <select className="form-input" value={searchDeleteDeptName} onChange={(e) => setSearchDeleteDeptName(e.target.value)} required>
                    <option value="" disabled>-- Select a department --</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                  <Search size={18} /> Search Profile
                </button>
              </form>

              {activeStudentForDelete && (
                <div>
                  <div style={{background:'var(--surface-hover)', padding:'1rem', borderRadius:'8px', marginBottom:'1.5rem'}}>
                    <h4 style={{margin:0, fontSize:'1rem'}}>{activeStudentForDelete.username}'s Documents</h4>
                    <div style={{fontSize:'0.875rem', color:'var(--text-secondary)'}}>Reg No: {activeStudentForDelete.register_number}</div>
                  </div>

                  {searchedStudentDocs.length === 0 ? (
                    <div style={{textAlign:'center', padding:'2rem', color:'var(--text-secondary)'}}>
                      No documents found for this student.
                    </div>
                  ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                      {searchedStudentDocs.map(doc => (
                        <div key={doc.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px'}}>
                          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                            <div style={{width:'40px', height:'40px', background:'var(--surface-hover)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              <FileText size={20} color="var(--primary)" />
                            </div>
                            <div>
                              <div style={{fontWeight:'500'}}>{doc.doc_type}</div>
                              <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Uploaded: {new Date(doc.uploaded_at).toLocaleString()}</div>
                            </div>
                          </div>
                          <div style={{display:'flex', gap:'0.5rem'}}>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{padding:'0.5rem', borderRadius:'6px'}}>
                              View
                            </a>
                            <button onClick={() => handleDeleteDoc(doc.id)} style={{background:'#FEE2E2', color:'#EF4444', border:'none', padding:'0.5rem', borderRadius:'6px', cursor:'pointer'}}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === 'students' && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
              <form onSubmit={handleRegisterStudent}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="Ex: John Doe" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Register Number (Numbers only)</label>
                    <input type="number" className="form-input" placeholder="Ex: 622622..." value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="student@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" className="form-input" placeholder="10 digit number" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-input" value={regDept} onChange={(e) => setRegDept(e.target.value)} required>
                      <option value="">-- Select Department --</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-input" value={regDob} onChange={(e) => setRegDob(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year of Joining</label>
                    <input type="number" className="form-input" placeholder="2021" value={regJoinYear} onChange={(e) => setRegJoinYear(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year of Passing Out</label>
                    <input type="number" className="form-input" placeholder="2025" value={regPassYear} onChange={(e) => setRegPassYear(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="form-label">Password (Optional)</label>
                      <input type="password" className="form-input" placeholder="Leave blank to use Register Number" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Confirm Password</label>
                      <input type="password" className="form-input" placeholder="Confirm password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                  <UserPlus size={18} /> Register Student
                </button>
              </form>
            </div>
          )}

          {/* TAB: RESET PASSWORD */}
          {activeTab === 'reset_password' && (
            <form onSubmit={handleAdminResetPassword}>
              <div className="form-group">
                <label className="form-label">Student Name</label>
                <input type="text" className="form-input" placeholder="Ex: John Doe" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Student Register Number</label>
                <input type="text" className="form-input" placeholder="Ex: 622622" value={resetRegNo} onChange={(e) => setResetRegNo(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input type="tel" className="form-input" placeholder="10 digit number" value={resetPhone} onChange={(e) => setResetPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={resetDeptId} onChange={(e) => setResetDeptId(e.target.value)} required>
                  <option value="" disabled>-- Select Department --</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-input" value={resetDob} onChange={(e) => setResetDob(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                <KeyRound size={18} /> Reset Password
              </button>
            </form>
          )}

          {/* TAB: ADMINS */}
          {activeTab === 'admins' && (
            <form onSubmit={handleRegisterAdmin}>
              <div className="form-group">
                <label className="form-label">Admin Name</label>
                <input type="text" className="form-input" placeholder="Ex: Jane Doe" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Staff ID</label>
                <input type="text" className="form-input" placeholder="Ex: STAFF002" value={adminId} onChange={(e) => setAdminId(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification</label>
                <input type="text" className="form-input" placeholder="Ex: Ph.D. in Computer Science" value={adminQualification} onChange={(e) => setAdminQualification(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="admin@institute.edu" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="Ex: +1234567890" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <select className="form-input" value={adminDept} onChange={(e) => setAdminDept(e.target.value)} required>
                  <option value="" disabled>-- Select Department --</option>
                  {ADMIN_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-input" placeholder="••••••••" value={adminConfirmPassword} onChange={(e) => setAdminConfirmPassword(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', background: '#3b82f6' }}>
                <UserPlus size={18} /> Create Admin
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
