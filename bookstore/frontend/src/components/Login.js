import React, { useState } from 'react';
import './Login.css';

// Simple login component for users and admins
export default function Login({ onLogin, isAdmin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Handle login form submission
  function handleLogin(e) {
    e.preventDefault();
    
    // Make sure both fields are filled
    if (name && email) {
      // Pass user info to parent component
      onLogin({ name, email });
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
          
          <button type="submit" className="login-button">
            {isAdmin ? 'Login as Admin' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
