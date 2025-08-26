import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('JOBSEEKER');
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      await api.post('/api/auth/register', { username, password, role });
      setMessage({ text: 'Registration successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage({ 
        text: err.response?.data || 'Registration failed', 
        type: 'error' 
      });
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join our platform today</p>
        </div>
        
        <form className="register-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="JOBSEEKER">Job Seeker</option>
              <option value="RECRUITER">Recruiter</option>
            </select>
          </div>
          
          <button type="submit" className="register-btn">Register</button>
          
          {message.text && (
            <div className={`message ${message.type}-message`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}