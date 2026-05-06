import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Mail, Phone, Calendar, BookOpen, Award, ArrowLeft, ShieldCheck, Hash, Camera, Upload } from 'lucide-react';
import logo from '../assets/logo.png';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfileData(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/auth/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData({ ...profileData, profile_pic: res.data.url });
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload profile picture.");
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="app-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '0' }}>
        {/* Profile Header */}
        <div style={{ 
          background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))', 
          padding: '3rem 2rem', 
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <div style={{ 
              background: 'white', 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              overflow: 'hidden', 
              border: '4px solid var(--primary)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              position: 'relative'
            }}>
              <img 
                src={profileData?.profile_pic ? `http://localhost:5000${profileData.profile_pic}` : logo} 
                alt="Profile" 
                style={{ width: profileData?.profile_pic ? '100%' : '85%', height: profileData?.profile_pic ? '100%' : '85%', objectFit: profileData?.profile_pic ? 'cover' : 'contain' }} 
              />
            </div>
            <label style={{ 
              position: 'absolute', 
              bottom: '0', 
              right: '0', 
              background: 'var(--primary)', 
              color: 'white', 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              border: '3px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              <Camera size={18} />
              <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
            </label>
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>{profileData?.username}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: '600' }}>
                {profileData?.role?.toUpperCase()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Hash size={16} /> {profileData?.register_number}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Personal Information</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}><Mail size={20} /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address</div>
                <div style={{ fontWeight: '500' }}>{profileData?.email || 'Not Provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}><Phone size={20} /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</div>
                <div style={{ fontWeight: '500' }}>{profileData?.phone_number || 'Not Provided'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}><Calendar size={20} /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date of Birth</div>
                <div style={{ fontWeight: '500' }}>{profileData?.dob || 'Not Provided'}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Academic Details</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}><BookOpen size={20} /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Department</div>
                <div style={{ fontWeight: '500' }}>{profileData?.department_id || 'General'}</div>
              </div>
            </div>

            {profileData?.role === 'student' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}><Calendar size={20} /></div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Batch Period</div>
                    <div style={{ fontWeight: '500' }}>{profileData?.year_of_joining} - {profileData?.year_of_passing_out}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}><Award size={20} /></div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Qualification</div>
                  <div style={{ fontWeight: '500' }}>{profileData?.qualification || 'Not Specified'}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)' }}><ShieldCheck size={20} /></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Account Status</div>
                <div style={{ color: '#10b981', fontWeight: '600' }}>Verified & Active</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            To update your profile information, please contact the STUDENT DOCS HUB administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
