//Oisin Gibson - L00172671
//Header component for the BookStore application

import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
// import DarkModeToggle from './DarkModeToggle';

function Header() {
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
          {/* <DarkModeToggle /> */} DarkMode Button goes here
          <Link to="/basket" className="nav-link"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
          </svg></Link>
        </nav>
      </div>
      {/* <div className="darkModeButton"> <DarkModeToggle />  </div> */}
    </header >
  );
}

export default Header;
