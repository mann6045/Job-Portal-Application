import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './Navbar.css';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.get('/api/auth/logout');
    } catch (e) {
      // ignore
    }
    setUser(null);
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          JobPortal
        </Link>

        <div className="nav-links">
          <Link to="/jobs" className="nav-link">Jobs</Link>
          {user && user.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}
          {user && user.role === 'RECRUITER' && <Link to="/recruiter" className="nav-link">Recruiter</Link>}
          {user && user.role === 'JOBSEEKER' && <Link to="/me" className="nav-link">Profile</Link>}

          {user ? (
            <>
              <span className="user-info">{user.username} ({user.role})</span>
              <button onClick={handleLogout} className="auth-btn logout-btn">Logout</button>
            </>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="auth-btn login-btn">Login</Link>
              <Link to="/register" className="auth-btn register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}