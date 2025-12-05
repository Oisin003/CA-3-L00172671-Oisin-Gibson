import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function BookList() {
  // State to store the list of books from the API
  const [books, setBooks] = useState([]);
  // State to store the search input value
  const [search, setSearch] = useState('');

  // Load all books when the component first renders
  useEffect(() => {
    loadBooks();
  }, []);

  // Fetch books from the backend API
  // If a title is provided, filter books by that title
  function loadBooks(title) {
    // Start with the base API URL
    let url = 'http://localhost:5000/api/books';
    
    // If a title was provided, add it as a query parameter for filtering
    if (title) {
      url = url + '?title=' + title;// ? is for query parameters
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
    e.preventDefault();// Prevent page reload on form submit
    loadBooks(search);
  }

  // Reset search and load all books again
  function handleReset() {
    setSearch('');// Clear the search input
    loadBooks();// Load all books without filters
  }

  return (
    <div>
      <h2>Browse Books</h2>
      {/* Search form */}
      <form onSubmit={handleSearch}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title" />
        <button type="submit">Search</button>
        <button type="button" onClick={handleReset}>Reset</button>
      </form>
      {/* List of books */}
      <ul>
        {books.map(book => (
          <li key={book._id}>
            <Link to={'/books/' + book._id}><strong>{book.title}</strong></Link>
            <p>{book.author} — {book.category} — €{book.price} — In stock: {book.numberInStock}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
