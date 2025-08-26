import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import JobCard from '../components/JobCard';
import Profile from './Profile';
import './JobSeekerDashboard.css';

export default function JobSeekerDashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filter, setFilter] = useState({ title: '', location: '', skill: '' });
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  async function fetchJobs() {
    try {
      setLoading(true);
      const params = {};
      if (filter.title) params.title = filter.title;
      if (filter.location) params.location = filter.location;
      if (filter.skill) params.skill = filter.skill;

      const res = await api.get('/jobs/filter', { params });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppliedJobs() {
    try {
      const res = await api.get('/profile/me', { withCredentials: true });
      setAppliedJobs(res.data?.appliedJobIds || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  async function handleApply(jobId) {
    try {
      setAppliedJobs((prev) => [...prev, jobId]);
      await api.post(`/jobs/apply/${jobId}`, {}, { withCredentials: true });
      alert('Applied successfully!');
    } catch (err) {
      alert('Apply failed');
      setAppliedJobs((prev) => prev.filter((id) => id !== jobId));
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchJobs();
    }
  };

  if (selectedJob) {
    return (
      <div className="jobseeker-container">
        <button className="back-btn" onClick={() => setSelectedJob(null)}>
          &larr; Back to Jobs
        </button>
        <JobCard job={selectedJob} showDelete={false} />
        <button
          className="apply-btn"
          disabled={appliedJobs.includes(selectedJob.id)}
          onClick={() => handleApply(selectedJob.id)}
        >
          {appliedJobs.includes(selectedJob.id) ? 'Applied' : 'Apply Now'}
        </button>
      </div>
    );
  }

  if (showProfile) {
    return (
      <div className="jobseeker-container">
        <button className="back-btn" onClick={() => setShowProfile(false)}>
          &larr; Back to Jobs
        </button>
        <Profile />
      </div>
    );
  }

  return (
    <div className="jobseeker-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Available Jobs</h2>
        <button className="profile-btn" onClick={() => setShowProfile(true)}>
          View/Edit Profile
        </button>
      </div>

      <div className="filters-container">
        <input
          className="filter-input"
          placeholder="Job title"
          value={filter.title}
          onChange={(e) => setFilter({ ...filter, title: e.target.value })}
          onKeyDown={handleKeyPress}
        />
        <input
          className="filter-input"
          placeholder="Location"
          value={filter.location}
          onChange={(e) => setFilter({ ...filter, location: e.target.value })}
          onKeyDown={handleKeyPress}
        />
        <input
          className="filter-input"
          placeholder="Skill"
          value={filter.skill}
          onChange={(e) => setFilter({ ...filter, skill: e.target.value })}
          onKeyDown={handleKeyPress}
        />
        <button
          className="search-btn"
          onClick={fetchJobs}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>

      {loading && <div className="loading-message">Loading jobs...</div>}

      {!loading && jobs.length === 0 && (
        <div className="no-jobs-message">No jobs found matching your criteria</div>
      )}

      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-item" onClick={() => setSelectedJob(job)}>
            <JobCard job={job} showDelete={false} />
            <button
              className="apply-btn"
              disabled={appliedJobs.includes(job.id)}
              onClick={(e) => {
                e.stopPropagation();
                handleApply(job.id);
              }}
            >
              {appliedJobs.includes(job.id) ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}