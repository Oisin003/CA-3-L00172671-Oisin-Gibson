/**
 * REFERENCES:
 * - React Hooks: https://react.dev/reference/react
 * - FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 * - File API: https://developer.mozilla.org/en-US/docs/Web/API/File
 * - JSON.parse(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 * - Fetch API CRUD: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

// Import required dependencies
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import './AdminImport.css';

/**
 * AdminImport Component
 * Complete admin dashboard for book management
 * Features:
 * - View all books in a table
 * - Import books from JSON file
 * - Add new books (Create)
 * - Edit existing books (Update)
 * - Delete books
 * - Admin authentication check
 */
export default function AdminImport() {
  const navigate = useNavigate();
  
  // State to store status messages (importing, success, error)
  const [status, setStatus] = useState('');
  // State to store all books from database
  const [books, setBooks] = useState([]);
  // State to track which book is being edited (null if creating new)
  const [editingBook, setEditingBook] = useState(null);
  // State to control visibility of add/edit form
  const [showAddForm, setShowAddForm] = useState(false);
  
  // State for form fields - controlled components
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author: '',
    category: '',
    price: '',
    numberInStock: ''
  });
  
  // Get logged-in admin from localStorage
  const admin = JSON.parse(localStorage.getItem('admin'));
  
  /**
   * Effect: Check admin authentication and load books
   * Runs on component mount
   * Redirects to admin login if not authenticated
   */
  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
    } else {
      loadBooks();
    }
  }, [admin, navigate]);
  
  /**
   * Load all books from the database
   * Fetches from backend API and updates books state
   */
  function loadBooks() {
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }
  
  /**
   * Handle form input changes
   * Updates formData state as user types
   * @param {Event} e - Input change event
   */
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  /**
   * Reset form to initial state
   * Clears all form fields and editing state
   * Hides the add/edit form
   */
  function resetForm() {
    setFormData({
      title: '',
      isbn: '',
      author: '',
      category: '',
      price: '',
      numberInStock: ''
    });
    setEditingBook(null);
    setShowAddForm(false);
  }
  
  // If not logged in, show nothing (will redirect via useEffect)
  if (!admin) return null;

  /**
   * Import books from the JSON file on the server
   * Calls backend import endpoint which reads books.json
   * Shows success message with count and reloads book list
   */
  function handleImport() {
    setStatus('Importing...');
    fetch('http://localhost:5000/api/books/import', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setStatus(`✓ Imported ${data.imported} books`);
        loadBooks();
        // Clear status message after 3 seconds
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }

  /**
   * Handle form submission to create a new book
   * Validates and sends book data to backend
   * @param {Event} e - Form submit event
   */
  function handleCreate(e) {
    e.preventDefault();
    
    // Build book object with proper data types
    const book = {
      title: formData.title,
      isbn: formData.isbn,
      author: formData.author,
      category: formData.category,
      price: Number(formData.price),
      numberInStock: Number(formData.numberInStock)
    };
    
    // Send POST request to create book
    fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
      .then(res => res.json())
      .then(() => {
        setStatus('Book created successfully');
        resetForm();
        loadBooks();
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }
  
  /**
   * Handle book update
   * Updates existing book with new data
   * Note: ISBN cannot be changed (unique identifier)
   * @param {Event} e - Form submit event
   */
  function handleUpdate(e) {
    e.preventDefault();
    
    // Build updates object (excluding ISBN which can't be changed)
    const updates = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      price: Number(formData.price),
      numberInStock: Number(formData.numberInStock)
    };
    
    // Send PUT request to update book
    fetch(`http://localhost:5000/api/books/${editingBook._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
      .then(res => res.json())
      .then(() => {
        setStatus('✓ Book updated successfully');
        resetForm();
        loadBooks();
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }
  
  /**
   * Handle book deletion
   * Shows confirmation dialog before deleting
   * @param {String} bookId - MongoDB ID of book to delete
   * @param {String} bookTitle - Title of book (for confirmation message)
   */
  function handleDelete(bookId, bookTitle) {
    // Confirm deletion with user
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }
    
    // Send DELETE request
    fetch(`http://localhost:5000/api/books/${bookId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        setStatus('Book deleted successfully');
        loadBooks();
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }
  
  /**
   * Start editing a book
   * Populates form with book data and shows form
   * @param {Object} book - Book object to edit
   */
  function startEdit(book) {
    setEditingBook(book);
    // Populate form with existing book data
    setFormData({
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      category: book.category || '',
      price: book.price.toString(),
      numberInStock: book.numberInStock.toString()
    });
    setShowAddForm(true);
  }
  
  /**
   * Logout function
   * Removes admin from localStorage and redirects to login
   */
  function handleLogout() {
    localStorage.removeItem('admin');
    navigate('/admin-login');
  }

  return (
    <div className="admin-container">
      {/* Admin Header - displays admin info and logout button */}
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="admin-info">Logged in as: {admin.name} ({admin.email})</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>

      {/* Status Message - shows success or error messages */}
      {status && (
        <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}

      {/* Quick Actions Card - Import and Add buttons */}
      <div className="admin-actions">
        <Card>
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            {/* Import Books Button - imports from books.json on server */}
            <button onClick={handleImport} className="btn-import">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 14-4-4m4 4 4-4" />
              </svg>
              Import Books from JSON
            </button>
            
            {/* Add New Book Button - toggles form visibility */}
            <button onClick={() => { resetForm(); setShowAddForm(!showAddForm); }} className="btn-add">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
              </svg>
              Add New Book
            </button>
          </div>
        </Card>
      </div>

      {/* Add/Edit Book Form - conditionally rendered */}
      {showAddForm && (
        <Card className="form-card">
          <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={editingBook ? handleUpdate : handleCreate} className="book-form">
            <div className="form-grid">
              {/* Title Input */}
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Book Title"
                  required
                />
              </div>

              {/* ISBN Input - disabled when editing (can't change unique identifier) */}
              <div className="form-group">
                <label htmlFor="isbn">ISBN *</label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="978-0000000000"
                  required
                  disabled={editingBook !== null}
                />
              </div>

              {/* Author Input */}
              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author Name"
                  required
                />
              </div>

              {/* Category Input - optional field */}
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Fiction, Fantasy, etc."
                />
              </div>

              {/* Price Input - number with decimal step */}
              <div className="form-group">
                <label htmlFor="price">Price (€) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="9.99"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Stock Input - whole number only */}
              <div className="form-group">
                <label htmlFor="numberInStock">Stock *</label>
                <input
                  type="number"
                  id="numberInStock"
                  name="numberInStock"
                  value={formData.numberInStock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingBook ? 'Update Book' : 'Create Book'}
              </button>
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Books Table Card - displays all books */}
      <Card className="books-list-card">
        <h3>All Books ({books.length})</h3>
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through books and display each in a row */}
              {books.map(book => (
                <tr key={book._id}>
                  <td className="book-title">{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category || '-'}</td>
                  <td className="book-isbn">{book.isbn}</td>
                  <td>€{book.price ? book.price.toFixed(2) : 'N/A'}</td>
                  {/* Highlight out of stock items */}
                  <td className={book.numberInStock === 0 ? 'out-of-stock' : ''}>
                    {book.numberInStock || 0}
                  </td>
                  <td className="action-buttons-cell">
                    {/* Edit Button - opens edit form */}
                    <button 
                      onClick={() => startEdit(book)} 
                      className="btn-edit"
                      title="Edit book"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4M9 15l11-11m0 0v3.4m0-3.4h-3.4" />
                      </svg>
                    </button>
                    {/* Delete Button - shows confirmation before deleting */}
                    <button 
                      onClick={() => handleDelete(book._id, book.title)} 
                      className="btn-delete"
                      title="Delete book"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Empty state message */}
          {books.length === 0 && (
            <p className="no-books">No books found. Import or add books to get started.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
