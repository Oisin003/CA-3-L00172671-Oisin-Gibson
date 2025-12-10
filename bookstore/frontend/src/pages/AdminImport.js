import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import './AdminImport.css';

export default function AdminImport() {
  const navigate = useNavigate();
  
  // State to store status messages (importing, success, error)
  const [status, setStatus] = useState('');
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // State for form fields
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
  
  // Check if admin is logged in, redirect to admin login if not
  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
    } else {
      loadBooks();
    }
  }, [admin, navigate]);
  
  // Load all books from the database
  function loadBooks() {
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }
  
  // Handle form input changes
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  // Reset form
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
  
  // If not logged in, show nothing (will redirect)
  if (!admin) return null;

  // Import books from the JSON file on the server
  function handleImport() {
    setStatus('Importing...');
    fetch('http://localhost:5000/api/books/import', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setStatus(`✓ Imported ${data.imported} books`);
        loadBooks();
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }

  // Handle form submission to create a new book
  function handleCreate(e) {
    e.preventDefault();
    
    const book = {
      title: formData.title,
      isbn: formData.isbn,
      author: formData.author,
      category: formData.category,
      price: Number(formData.price),
      numberInStock: Number(formData.numberInStock)
    };
    
    fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
      .then(res => res.json())
      .then(() => {
        setStatus('✓ Book created successfully');
        resetForm();
        loadBooks();
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }
  
  // Handle book update
  function handleUpdate(e) {
    e.preventDefault();
    
    const updates = {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      price: Number(formData.price),
      numberInStock: Number(formData.numberInStock)
    };
    
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
  
  // Handle book deletion
  function handleDelete(bookId, bookTitle) {
    if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) {
      return;
    }
    
    fetch(`http://localhost:5000/api/books/${bookId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        setStatus('✓ Book deleted successfully');
        loadBooks();
        setTimeout(() => setStatus(''), 3000);
      })
      .catch(err => setStatus('Error: ' + err.message));
  }
  
  // Start editing a book
  function startEdit(book) {
    setEditingBook(book);
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
  
  // Logout function
  function handleLogout() {
    localStorage.removeItem('admin');
    navigate('/admin-login');
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="admin-info">Logged in as: {admin.name} ({admin.email})</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>

      {status && (
        <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}

      <div className="admin-actions">
        <Card>
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={handleImport} className="btn-import">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 14-4-4m4 4 4-4" />
              </svg>
              Import Books from JSON
            </button>
            <button onClick={() => { resetForm(); setShowAddForm(!showAddForm); }} className="btn-add">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m7-7H5" />
              </svg>
              Add New Book
            </button>
          </div>
        </Card>
      </div>

      {showAddForm && (
        <Card className="form-card">
          <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={editingBook ? handleUpdate : handleCreate} className="book-form">
            <div className="form-grid">
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
              {books.map(book => (
                <tr key={book._id}>
                  <td className="book-title">{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category || '-'}</td>
                  <td className="book-isbn">{book.isbn}</td>
                  <td>€{book.price ? book.price.toFixed(2) : 'N/A'}</td>
                  <td className={book.numberInStock === 0 ? 'out-of-stock' : ''}>
                    {book.numberInStock || 0}
                  </td>
                  <td className="action-buttons-cell">
                    <button 
                      onClick={() => startEdit(book)} 
                      className="btn-edit"
                      title="Edit book"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4M9 15l11-11m0 0v3.4m0-3.4h-3.4" />
                      </svg>
                    </button>
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
          {books.length === 0 && (
            <p className="no-books">No books found. Import or add books to get started.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
