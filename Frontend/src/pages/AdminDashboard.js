import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import JobCard from '../components/JobCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);

  async function fetchUsers() {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchJobs() {
    try {
      const res = await api.get('/api/admin/jobs');
      setJobs(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchJobs();
  }, []);

  async function deleteUser(id) {
    if (!window.confirm('Delete user?')) return;
    await api.delete('/api/admin/users/' + id);
    setUsers(users.filter(u => u.id !== id));
  }

  async function deleteJob(id) {
    if (!window.confirm('Delete job?')) return;
    await api.delete('/api/admin/jobs/' + id);
    setJobs(jobs.filter(j => j.id !== id));
  }

  // Chart Data
  const jobData = jobs.map(j => ({ name: j.title, applicants: j.applicantIds?.length || 0 }));
  const userRoleData = [
    { name: 'Admin', value: users.filter(u => u.role === 'ADMIN').length },
    { name: 'Job Seeker', value: users.filter(u => u.role === 'JOB_SEEKER').length },
    { name: 'Employer', value: users.filter(u => u.role === 'EMPLOYER').length },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Jobs</li>
          <li>Reports</li>
        </ul>
      </aside>

      <main className="main-content">
        <h2>Overview</h2>
        <div className="summary-cards">
          <div className="card">Total Users: {users.length}</div>
          <div className="card">Total Jobs: {jobs.length}</div>
          <div className="card">Applicants: {jobs.reduce((sum, j) => sum + (j.applicantIds?.length || 0), 0)}</div>
        </div>

        <div className="charts-container">
          <div className="chart">
            <h3>Jobs vs Applicants</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applicants" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart">
            <h3>Users by Role</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h3 className="section-title">Users</h3>
        {users.map(u => (
          <div key={u.id} className="list-item">
            {u.username} • {u.role}
            <button onClick={() => deleteUser(u.id)} className="delete-btn">Delete</button>
          </div>
        ))}

        <h3 className="section-title">Jobs</h3>
        {jobs.map(j => (
          <div key={j.id} className="list-item">
            <JobCard job={j} onDelete={deleteJob} showDelete={true} />
            <p><strong>Applicants:</strong> {j.applicantIds?.length || 0}</p>
          </div>
        ))}
      </main>
    </div>
  );
}