import React from 'react';
import './JobCard.css';

export default function JobCard({ job, onDelete, showDelete }) {
  return (
    <div className="job-card">
      <div className="job-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <div className="job-meta">
            <span className="job-location">
              <i aria-hidden="true"></i>
              {job.location}
            </span>
            <span className="job-skills">
              <i aria-hidden="true"></i>
              Skills: {job.skills}
            </span>
          </div>
          <p className="job-description">{job.description}</p>
        </div>
        {showDelete && (
          <button 
            onClick={() => onDelete(job.id)} 
            className="delete-btn"
            aria-label={`Delete ${job.title} position`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}