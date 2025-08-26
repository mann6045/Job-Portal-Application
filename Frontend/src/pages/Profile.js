import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [education, setEducation] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/profile/me', { withCredentials: true });
        if (res.data) {
          setProfile(res.data);
          setFullName(res.data.fullName || '');
          setEmail(res.data.email || '');
          setMobileNo(res.data.mobileNo || '');
          setEducation(res.data.education || '');
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('mobileNo', mobileNo);
    formData.append('education', education);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      await api.post('/profile/save', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditMode(false);
      setResumeFile(null);
      const refreshed = await api.get('/profile/me', { withCredentials: true });
      setProfile(refreshed.data);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    }
  }

  async function downloadResume() {
    try {
      const response = await fetch('/profile/resume', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to download resume');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const disposition = response.headers.get('Content-Disposition');
      let filename = 'resume.pdf';
      if (disposition && disposition.includes('filename=')) {
        filename = disposition
          .split('filename=')[1]
          .split(';')[0]
          .replace(/"/g, '');
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  }

  if (loading) return <div className="loading-message">Loading...</div>;

  if (!profile && !editMode) {
    return (
      <div className="no-profile">
        <h3>No profile found.</h3>
        <button className="create-profile-btn" onClick={() => setEditMode(true)}>
          Create Profile
        </button>
      </div>
    );
  }

  if (editMode) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h3 className="profile-header">{profile ? 'Edit Profile' : 'Create Profile'}</h3>
          <form className="edit-form" onSubmit={handleSave}>
            <input
              name="fullName"
              className="form-input"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              name="mobileNo"
              className="form-input"
              placeholder="Mobile No"
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
              required
            />
            <input
              name="education"
              className="form-input"
              placeholder="Education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              required
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <div className="form-actions">
              <button type="submit" className="edit-btn">
                Save
              </button>
              <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h3 className="profile-header">Your Profile</h3>
        <div className="profile-info">
          <div className="info-item">
            <div className="info-label">Full Name:</div>
            <div className="info-value">{profile.fullName || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email:</div>
            <div className="info-value">{profile.email || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Mobile No:</div>
            <div className="info-value">{profile.mobileNo || 'N/A'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Education:</div>
            <div className="info-value">{profile.education || 'N/A'}</div>
          </div>
        </div>

        <div className="resume-section">
          {profile.fileName ? (
            <button className="resume-btn" onClick={downloadResume}>
              Download Resume ({profile.fileName})
            </button>
          ) : (
            <p>No resume uploaded</p>
          )}
          <button className="edit-btn" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}