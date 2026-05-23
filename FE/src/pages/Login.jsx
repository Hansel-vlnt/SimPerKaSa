import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_BASE = 'http://localhost:8000/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      if (res.data.ok) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_username', res.data.username);
        navigate('/admin');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Username atau password salah.');
      } else {
        setError('Terjadi kesalahan pada server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">SIM-PERKASA</h1>
          <p className="login-subtitle">Masuk ke Panel Admin</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              placeholder="Masukkan username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              placeholder="Masukkan password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
        
        <div className="login-footer">
          <button type="button" className="text-link" onClick={() => navigate('/')}>
            ← Kembali ke Beranda Publik
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
