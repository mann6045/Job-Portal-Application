import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './Login.css';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await api.post('/api/auth/login', { username, password }, { withCredentials: true });
      setUser(res.data);
      if (res.data.role === 'ADMIN') navigate('/admin');
      else if (res.data.role === 'RECRUITER') navigate('/recruiter');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#4299E1"/>
            <path d="M20 12L12 20L20 28L28 20L20 12Z" fill="white"/>
          </svg>
        </div>
        
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
        </div>
        
        <form className="login-form" onSubmit={submit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : 'Sign In'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form> 
      </div>
    </div>
  );
}