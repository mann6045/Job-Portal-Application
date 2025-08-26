import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import JobCard from '../components/JobCard';
import './RecruiterDashboard.css';

export default function RecruiterDashboard({ user }) {
  const [job, setJob] = useState({
    title: '',
    description: '',
    location: '',
    skills: '',
  });

  const [myJobs, setMyJobs] = useState([]);
  const [applicantsMap, setApplicantsMap] = useState({});

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs', { withCredentials: true });
      setMyJobs(res.data);

      const newApplicantsMap = {};
      for (const j of res.data) {
        const applicantsRes = await api.get(`/jobs/applicants/${j.id}`, { withCredentials: true });
        newApplicantsMap[j.id] = applicantsRes.data;
      }
      setApplicantsMap(newApplicantsMap);
    } catch (err) {
      console.error('Error fetching my jobs:', err);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs/create', job, { withCredentials: true });
      alert('Job created successfully!');
      setJob({ title: '', description: '', location: '', skills: '' });
      fetchMyJobs();
    } catch (err) {
      console.error('Error creating job:', err);
      alert('Failed to create job. Are you logged in as a recruiter?');
    }
  };

  const handleDownloadResume = async (userId) => {
    try {
      const response = await fetch(`/profile/resume/${userId}`, {
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
  };

  return (
    <div className="recruiter-dashboard">
      <div className="create-job-section">
        <h2 className="section-title">Post a New Job</h2>
        <form className="job-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="Job Title"
              onChange={handleChange}
              value={job.title}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Job Description"
              onChange={handleChange}
              value={job.description}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              className="form-control"
              placeholder="Location"
              onChange={handleChange}
              value={job.location}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              className="form-control"
              placeholder="Skills (comma separated)"
              onChange={handleChange}
              value={job.skills}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">Create Job</button>
        </form>
      </div>

      <div className="jobs-list">
        <h2 className="section-title">My Posted Jobs</h2>
        {myJobs.length === 0 && <p className="no-applicants">No jobs posted yet.</p>}

        {myJobs.map((job) => (
          <div key={job.id} className="job-item">
            <JobCard job={job} showDelete={false} />
            
            <div className="applicants-section">
              <h4 className="applicants-title">Applicants:</h4>
              {applicantsMap[job.id] && applicantsMap[job.id].length > 0 ? (
                <ul className="applicant-list">
                  {applicantsMap[job.id].map((applicant, idx) => (
                    <li key={idx} className="applicant-item">
                      <div className="applicant-info">
                        <strong>{applicant.fullName}</strong> - {applicant.email} - {applicant.mobileNo} - {applicant.education}
                      </div>
                      <button 
                        className="download-btn"
                        onClick={() => handleDownloadResume(applicant.userId)}
                      >
                        Download Resume
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-applicants">No applicants yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}