// Oisin Gibson - L00172671
// Book List page component

/**
 * REFERENCES:
 * - React Hooks (useState, useEffect): https://react.dev/reference/react
 * - Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * - React Router Link: https://reactrouter.com/en/main/components/link
 * - Array.map(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import './BookList.css';

/**
 * BookList Component
 * Main browsing page for the bookstore
 * Features:
 * - Display all books in a responsive grid layout
 * - Search functionality (searches title, author, and category)
 * - Results count display
 * - Links to individual book detail pages
 * - Stock availability indicators
 * - Reset search to view all books
 */
export default function BookList() {
  // State to store the list of books fetched from the API
  const [books, setBooks] = useState([]);
  // State to store the current search input value
  const [search, setSearch] = useState('');
  // Get currency formatting function
  const { formatPrice } = useCurrency();

  /**
   * Effect: Load all books when component mounts
   * Runs once on initial render
   * Dependencies: [] (empty - only runs on mount)
   */
  useEffect(() => {
    loadBooks();
  }, []);

  /**
   * Fetch books from the backend API
   * Supports optional search parameter for filtering results
   * Backend searches across title, author, and category fields
   * @param {String} searchTerm - Optional search query string
   */
  function loadBooks(searchTerm = '') {
    // Start with the base API URL
    let url = 'http://localhost:5000/api/books';
    
    // If search term provided, add it as a query parameter
    // encodeURIComponent ensures special characters are safely encoded
    if (searchTerm) {
      url = url + '?search=' + encodeURIComponent(searchTerm);
    }
    
    // Make the HTTP GET request to the backend
    fetch(url)
      // Convert the response from JSON to JavaScript object
      .then(res => res.json())
      // Update the books state with the data from the API
      .then(data => setBooks(data))
      // If there's an error, log it to the console
      .catch(err => console.error(err));
  }

  /**
   * Handle search form submission
   * Prevents page reload and triggers book search
   * @param {Event} e - Form submit event
   */
  function handleSearch(e) {
    e.preventDefault(); // Prevent default form submission (page reload)
    loadBooks(search); // Fetch books with search term
  }

  /**
   * Reset search and display all books
   * Clears search input and reloads full book list
   */
  function handleReset() {
    setSearch(''); // Clear the search input field
    loadBooks(); // Load all books without any search filter
  }

  return (
    <div className="book-list-container">
      {/* Page heading */}
      <h2>Browse Books</h2>
      
      {/* Search form - single input searches across title, author, and category */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-grid">
          {/* Search input - updates search state on every keystroke */}
          <input 
            type="text"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by book name, author, or category" 
            className="search-input search-input-single"
          />
        </div>
        {/* Action buttons - search executes query, reset clears and shows all */}
        <div className="search-buttons">
          <button type="submit" className="search-btn">Search</button>
          <button type="button" onClick={handleReset} className="reset-btn">Reset</button>
        </div>
      </form>

      {/* Results count - shows number of books found (plural handling) */}
      <p className="results-count">{books.length} book{books.length !== 1 ? 's' : ''} found</p>

      {/* Books grid - responsive card layout */}
      <div className="books-grid">
        {/* Map through books array and create a card for each book */}
        {books.map(book => (
          <div key={book._id} className="book-card">
            {/* Book icon - SVG illustration */}
            <div className="book-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
              </svg>
            </div>
            {/* Book title link - navigates to book detail page */}
            <Link to={'/books/' + book._id} className="book-link">
              <h3 className="book-title">{book.title}</h3>
            </Link>
            {/* Author name */}
            <p className="book-author">by {book.author}</p>
            {/* Category/genre */}
            <p className="book-category">{book.category}</p>
            {/* Footer with price and stock info */}
            <div className="book-footer">
              {/* Price - displays 'N/A' if price is null/undefined */}
              <span className="book-price">{book.price ? formatPrice(book.price) : 'N/A'}</span>
              {/* Stock status - shows quantity or 'Out of stock' message */}
              <span className="book-stock">
                {book.numberInStock > 0 
                  ? `${book.numberInStock} in stock` 
                  : 'Out of stock'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state message - shown when no books match the search */}
      {books.length === 0 && (
        <p className="no-results">No books found. Try adjusting your search.</p>
      )}
    </div>
  );
}
