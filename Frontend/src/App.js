import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import api from './api/axiosConfig';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import JobList from './pages/JobList';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadCurrent() {
    try {
      const res = await api.get('/api/auth/current');
      setUser(res.data);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurrent();
  }, []);

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar user={user} setUser={setUser} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<div className="route-container"><JobList user={user} /></div>} />
          <Route path="/jobs" element={<div className="route-container"><JobList user={user} /></div>} />
          <Route path="/login" element={<div className="route-container"><Login setUser={setUser} /></div>} />
          <Route path="/register" element={<div className="route-container"><Register /></div>} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} roles={["ADMIN"]}>
                <div className="route-container"><AdminDashboard /></div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter"
            element={
              <ProtectedRoute user={user} roles={["RECRUITER"]}>
                <div className="route-container"><RecruiterDashboard user={user} /></div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/me"
            element={
              <ProtectedRoute user={user} roles={["JOBSEEKER"]}>
                <div className="route-container"><JobSeekerDashboard user={user} /></div>
              </ProtectedRoute>
            }
          />

          <Route path="/jobs/all" element={<div className="route-container"><JobList user={user} /></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;