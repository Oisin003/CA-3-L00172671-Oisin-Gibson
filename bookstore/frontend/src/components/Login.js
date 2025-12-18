/**
 * REFERENCES:
 * - React Forms: https://react.dev/reference/react-dom/components/input
 * - Controlled Components: https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable
 * - Fetch API POST: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 * - Form Validation: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
 */

// Import required dependencies
import React, { useState } from 'react';
import './Login.css';

/**
 * Login Component
 * Handles authentication for both regular users and admins
 * For users: Authenticates with backend and creates/retrieves user record
 * For admins: Local authentication only (no backend call)
 * 
 * @param {Function} onLogin - Callback function to handle successful login
 * @param {Boolean} isAdmin - Flag to differentiate admin vs user login
 */
export default function Login({ onLogin, isAdmin }) {
  // Form state - user input values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Error state - displays validation or API errors
  const [error, setError] = useState('');
  // Loading state - shows loading indicator during API call
  const [loading, setLoading] = useState(false);

  /**
   * Handle login form submission
   * Validates inputs, then either:
   * - For admin: saves credentials locally
   * - For user: authenticates with backend API
   */
  async function handleLogin(e) {
    // Prevent default form submission behavior
    e.preventDefault();
    // Clear any previous errors
    setError('');
    
    // Validate that both fields are filled
    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }

    // For admin login, just save locally without backend call
    // Admin authentication is simplified (no database record needed)
    if (isAdmin) {
      onLogin({ name, email });
      return;
    }

    // For regular users, authenticate with backend to get/create user record
    setLoading(true);
    try {
      // Call backend login endpoint
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      // Check if request was successful
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Pass complete user data (including _id from database) to parent component
      // This ID is needed for purchases and user-specific operations
      onLogin(data.user);
    } catch (err) {
      // Display error message to user
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      // Always stop loading indicator, regardless of success/failure
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header - different text for admin vs user */}
        <div className="login-header">
          <h2>{isAdmin ? 'Admin Login' : 'Customer Login'}</h2>
          <p>{isAdmin ? 'Access the admin panel' : 'Login to make purchases'}</p>
        </div>
        
        {/* Login form */}
        <form onSubmit={handleLogin} className="login-form">
          {/* Name input field */}
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
          
          {/* Email input field */}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} // Update email state on change
              placeholder="Enter your email"
              required
            />
          </div>
          
          {/* Error message display - only shown when error exists */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Submit button - disabled during loading, shows different text for admin/user */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : (isAdmin ? 'Login as Admin' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}
