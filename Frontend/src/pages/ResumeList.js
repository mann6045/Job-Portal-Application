import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await api.get("/api/resume/list");
        setResumes(res.data);
      } catch (err) {
        setMsg("Failed to fetch resumes");
      }
    }
    fetchResumes();
  }, []);

  return (
    <div className="container">
      <h2>My Resumes</h2>
      {msg && <p>{msg}</p>}
      {resumes.length === 0 ? (
        <p>No resumes found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Graduation</th>
              <th>Project Details</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.graduation}</td>
                <td>{r.projectDetails}</td>
                <td>
                  <a
                    href={`http://localhost:8080${r.viewUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View / Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}