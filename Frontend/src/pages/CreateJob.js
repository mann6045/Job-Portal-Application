import React, { useState } from 'react';
import api from '../api/axiosConfig';
import './CreateJob.css';

export default function CreateJob({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/jobs/create', { title, description, location, skills }, { withCredentials: true });
      setTitle(''); 
      setDescription(''); 
      setLocation(''); 
      setSkills('');
      if (onCreated) onCreated();
      alert('Job created successfully!');
    } catch(err) {
      console.error('Error creating job:', err);
      alert('Failed to create job. Please try again.');
    }
  }

  return (
    <div className="create-job-card">
      <h3 className="create-job-header">Create Job</h3>
      <form className="create-job-form" onSubmit={submit}>
        <div className="form-group">
          <label>Title</label>
          <input
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter job title"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Location</label>
          <input
            className="form-input"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter job location"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Skills (comma separated)</label>
          <input
            className="form-input"
            value={skills}
            onChange={e => setSkills(e.target.value)}
            placeholder="e.g. JavaScript, React, Node.js"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Enter detailed job description"
            required
          />
        </div>
        
        <button className="submit-btn" type="submit">Post Job</button>
      </form>
    </div>
  );
}