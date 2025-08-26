import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import JobCard from '../components/JobCard';
import './JobList.css';

export default function JobList({ user }) {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filter, setFilter] = useState({ 
    title: '', 
    location: '', 
    skill: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  async function fetchJobs() {
    setIsLoading(true);
    try {
      const params = {};
      if (filter.title) params.title = filter.title;
      if (filter.location) params.location = filter.location;
      if (filter.skill) params.skill = filter.skill;
      const res = await api.get('/jobs/filter', { params });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAppliedJobs() {
    if (!user || user.role !== 'JOBSEEKER') return;
    try {
      const res = await api.get('/profile/me', { withCredentials: true });
      setAppliedJobs(res.data.appliedJobIds || []);
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
      await api.post(`/jobs/apply/${jobId}`, {}, { withCredentials: true });
      setAppliedJobs([...appliedJobs, jobId]);
    } catch (err) {
      console.error('Apply failed:', err);
    }
  }

  if (!user || user.role !== 'JOBSEEKER') {
    return (
      <div className="joblist-container">
        <div className="no-jobs-message">
          You must be logged in as a Job Seeker to view jobs
        </div>
      </div>
    );
  }

  return (
    <div className="joblist-container">
      <div className="joblist-header">
        <h2>Available Jobs</h2>
      </div>

      <div className="filter-container">
        <input
          className="filter-input"
          placeholder="Job title"
          value={filter.title}
          onChange={(e) => setFilter({ ...filter, title: e.target.value })}
        />
        <input
          className="filter-input"
          placeholder="Location"
          value={filter.location}
          onChange={(e) => setFilter({ ...filter, location: e.target.value })}
        />
        <input
          className="filter-input"
          placeholder="Skill"
          value={filter.skill}
          onChange={(e) => setFilter({ ...filter, skill: e.target.value })}
        />
        <button 
          className="search-btn" 
          onClick={fetchJobs}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>

      {isLoading ? (
        <div className="no-jobs-message">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="no-jobs-message">No jobs found matching your criteria</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-card-container">
              {appliedJobs.includes(job.id) && (
                <span className="applied-badge">Applied</span>
              )}
              <JobCard job={job} />
              <button
                className="apply-btn"
                disabled={appliedJobs.includes(job.id)}
                onClick={() => handleApply(job.id)}
              >
                {appliedJobs.includes(job.id) ? 'Already Applied' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}