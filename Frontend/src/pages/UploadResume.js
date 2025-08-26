import React, { useState } from 'react';
import api from '../api/axiosConfig';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  async function upload(e) {
    e.preventDefault();
    if (!file) { setMsg('Select a file'); return; }
    const fd = new FormData();
    fd.append('resume', file);

    try {
      const res = await api.post('/profile/uploadResume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg(res.data || 'Uploaded');
    } catch (err) {
      setMsg(err.response?.data || 'Upload failed');
    }
  }

  return (
    <div>
      <h2>Upload Resume</h2>
      <form onSubmit={upload}>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <div>{msg}</div>
    </div>
  );
}