import React, { useState } from 'react';
import './Login.css';

// Simple login component for users and admins
export default function Login({ onLogin, isAdmin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle login form submission
  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    
    // Make sure both fields are filled
    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }

    // For admin login, just save locally without backend call
    if (isAdmin) {
      onLogin({ name, email });
      return;
    }

    // For regular users, authenticate with backend to get user ID
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Pass complete user data including _id to parent component
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>{isAdmin ? 'Admin Login' : 'Customer Login'}</h2>
          <p>{isAdmin ? 'Access the admin panel' : 'Login to make purchases'}</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : (isAdmin ? 'Login as Admin' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}
