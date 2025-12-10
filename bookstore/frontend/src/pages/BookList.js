import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BookList.css';

export default function BookList() {
  // State to store the list of books from the API
  const [books, setBooks] = useState([]);
  // State to store the search input value
  const [search, setSearch] = useState('');

  // Load all books when the component first renders
  useEffect(() => {
    loadBooks();
  }, []);

  // Fetch books from the backend API with optional search term
  function loadBooks(searchTerm = '') {
    // Start with the base API URL
    let url = 'http://localhost:5000/api/books';
    
    // If search term provided, add it as a single 'search' parameter
    if (searchTerm) {
      url = url + '?search=' + encodeURIComponent(searchTerm);
    }
    
    // Make the HTTP request to the backend
    fetch(url)
      // Convert the response from JSON to JavaScript object
      .then(res => res.json())
      // Update the books state with the data from the API
      .then(data => setBooks(data))
      // If there's an error, log it to the console
      .catch(err => console.error(err));
  }

  // Handle form submission for search
  function handleSearch(e) {
    e.preventDefault(); // Prevent page reload on form submit
    loadBooks(search);
  }

  // Reset search and load all books again
  function handleReset() {
    setSearch(''); // Clear the search input
    loadBooks(); // Load all books without filters
  }

  return (
    <div className="book-list-container">
      <h2>Browse Books</h2>
      
      {/* Search form with single search bar */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-grid">
          <input 
            type="text"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by book name, author, or category" 
            className="search-input search-input-single"
          />
        </div>
        <div className="search-buttons">
          <button type="submit" className="search-btn">Search</button>
          <button type="button" onClick={handleReset} className="reset-btn">Reset</button>
        </div>
      </form>

      {/* Results count */}
      <p className="results-count">{books.length} book{books.length !== 1 ? 's' : ''} found</p>

      {/* List of books */}
      <div className="books-grid">
        {books.map(book => (
          <div key={book._id} className="book-card">
            <Link to={'/books/' + book._id} className="book-link">
              <h3 className="book-title">{book.title}</h3>
            </Link>
            <p className="book-author">by {book.author}</p>
            <p className="book-category">{book.category}</p>
            <div className="book-footer">
              <span className="book-price">€{book.price ? book.price.toFixed(2) : 'N/A'}</span>
              <span className="book-stock">
                {book.numberInStock > 0 
                  ? `${book.numberInStock} in stock` 
                  : 'Out of stock'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <p className="no-results">No books found. Try adjusting your search.</p>
      )}
    </div>
  );
}
