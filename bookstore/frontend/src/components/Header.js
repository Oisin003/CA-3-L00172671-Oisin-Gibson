//Oisin Gibson - L00172671
//Header component for the BookStore application

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import DarkModeToggle from './DarkModeToggle';

function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on component mount and when storage changes
  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      const adminData = localStorage.getItem('admin');
      if (userData) {
        setUser(JSON.parse(userData));
      } else if (adminData) {
        setUser({ ...JSON.parse(adminData), isAdmin: true });
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage events (for cross-tab updates)
    window.addEventListener('storage', checkUser);
    
    // Custom event for same-tab updates
    window.addEventListener('userLoggedIn', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userLoggedIn', checkUser);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <img src="/logo.jpg" alt="OG Books" className="logo-image" /><h1 className="logo-text">OG Books</h1>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">Browse Books</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
          <DarkModeToggle />
          <Link to="/basket" className="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
          </Link>
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header >
  );
}

export default Header;
