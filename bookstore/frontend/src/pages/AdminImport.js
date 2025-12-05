import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminImport() {
  const navigate = useNavigate();
  
  // State to store status messages (importing, success, error)
  const [status, setStatus] = useState('');
  // State for each form field
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  
  // Get logged-in admin from localStorage
  const admin = JSON.parse(localStorage.getItem('admin'));
  
  // Check if admin is logged in, redirect to admin login if not
  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
    }
  }, [admin, navigate]);
  
  // If not logged in, show nothing (will redirect)
  if (!admin) return null;

  // Import books from the JSON file on the server
  function handleImport() {
    setStatus('Importing...');
    // Send POST request to import endpoint
    fetch('http://localhost:5000/api/books/import', { method: 'POST' })
      // Convert response to JavaScript object
      .then(res => res.json())
      // Display how many books were imported
      .then(data => setStatus('Imported ' + data.imported + ' books'))
      // Show error message if import fails
      .catch(err => setStatus('Error: ' + err.message));
  }

  // Handle form submission to create a new book
  function handleCreate(e) {
    // Prevent page reload
    e.preventDefault();
    
    // Create book object from form inputs
    const book = {
      title: title,
      isbn: isbn,
      author: author,
      price: Number(price),
      numberInStock: Number(stock)
    };
    
    // Send POST request to create book endpoint
    fetch('http://localhost:5000/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
      // Show success message
      .then(() => setStatus('Book created'))
      // Show error message if creation fails
      .catch(err => setStatus('Error: ' + err.message));
  }
  
  // Logout function
  function handleLogout() {
    localStorage.removeItem('admin');
    navigate('/admin-login');
  }

  return (
    <div>
      <h2>Admin Page</h2>
      <p style={{ color: 'green' }}>Logged in as: {admin.name} ({admin.email})</p>
      <button onClick={handleLogout} style={{ marginBottom: '20px' }}>Logout</button>

      {/* Import button to load books from JSON file */}
      <button onClick={handleImport}>Import Books from JSON</button>
      {/* Display status messages */}
      <p>{status}</p>

      <h3>Add New Book</h3>
      {/* Form to manually add a new book */}
      <form onSubmit={handleCreate}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <br />
        <input placeholder="ISBN" value={isbn} onChange={e => setIsbn(e.target.value)} />
        <br />
        <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} />
        <br />
        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        <br />
        <input placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} />
        <br />
        <button type="submit">Create Book</button>
      </form>
    </div>
  );
}
