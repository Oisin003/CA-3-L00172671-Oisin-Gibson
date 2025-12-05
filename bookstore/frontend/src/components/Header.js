//Oisin Gibson - L00172671
//Header component for the BookStore application

import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

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
        </nav>
      </div>
    </header>
  );
}

export default Header;
