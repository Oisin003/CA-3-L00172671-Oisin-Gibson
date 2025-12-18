//Oisin Gibson - L00172671
//Header component for the BookStore application

/**
 * REFERENCES:
 * - React Router Link: https://reactrouter.com/en/main/components/link
 * - useNavigate Hook: https://reactrouter.com/en/main/hooks/use-navigate
 * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * - Custom Events: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
 * - Event Listeners: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 */

// Import required dependencies
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import DarkModeToggle from './DarkModeToggle';
import CurrencySelector from './CurrencySelector';

/**
 * Header Component
 * Main navigation bar displayed at the top of all pages
 * Features:
 * - Logo and navigation links
 * - User authentication state (login/logout)
 * - Shopping cart icon
 * - Dark mode toggle
 * - Separates regular users from admins (admin logout handled on admin page)
 */
function Header() {
  // State to track logged-in user (null if not logged in)
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on component mount and when storage changes
  useEffect(() => {
    /**
     * checkUser function
     * Checks localStorage for user authentication
     * Only shows user info for regular users, NOT admins
     * This separation prevents confusion between user/admin states
     */
    const checkUser = () => {
      // Only show user info in header for regular users, not admins
      const userData = localStorage.getItem('user');
      const adminData = localStorage.getItem('admin');
      
      // Only set user if regular user is logged in (not admin)
      // This ensures admin logout is handled separately on admin page
      if (userData && !adminData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    // Initial check on component mount
    checkUser();

    // Listen for storage events (for cross-tab updates)
    // Keeps user state in sync across multiple browser tabs
    window.addEventListener('storage', checkUser);
    
    // Custom event for same-tab updates
    // Triggered when user logs in/out in the same tab
    window.addEventListener('userLoggedIn', checkUser);

    // Cleanup function - remove event listeners when component unmounts
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userLoggedIn', checkUser);
    };
  }, []);

  /**
   * handleLogout function
   * Logs out the regular user and redirects to home page
   * Note: Admin logout is handled separately on the admin page
   */
  const handleLogout = () => {
    // Remove user from localStorage (only 'user', not 'admin')
    localStorage.removeItem('user');
    // Clear user state
    setUser(null);
    // Redirect to home page
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo section - clickable link to home page */}
        <div className="logo">
          <Link to="/">
            <img src="/logo.jpg" alt="OG Books" className="logo-image" />
            <h1 className="logo-text">OG Books</h1>
          </Link>
        </div>
        
        {/* Navigation section - main navigation links */}
        <nav className="nav">
          {/* Browse Books link - main book catalog */}
          <Link to="/" className="nav-link">Browse Books</Link>
          
          {/* Admin link - access to admin dashboard */}
          <Link to="/admin" className="nav-link">Admin</Link>
          
          {/* Dark mode toggle button */}
          <DarkModeToggle />
          
          {/* Currency selector dropdown */}
          <CurrencySelector />
          
          {/* Shopping cart link with cart icon */}
          <Link to="/basket" className="nav-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
          </Link>
          
          {/* Conditional rendering: Show logout for logged-in users, login link otherwise */}
          {user ? (
            // Logout button - only shown for regular users (not admins)
            <button onClick={handleLogout} className="nav-link logout-link">Logout</button>
          ) : (
            // Login link - shown when no user is logged in
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header >
  );
}

// Export Header component for use in App.js
export default Header;
