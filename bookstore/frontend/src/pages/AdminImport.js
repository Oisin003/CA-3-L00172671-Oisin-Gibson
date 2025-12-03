import React, { useState } from 'react';
import { importBooks, createBook } from '../api';

export default function AdminImport() {
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ title: '', isbn: '', author: '', price: '', numberInStock: '' });

  const onImport = async () => {
    setStatus('Importing...');
    try {
      const res = await importBooks();
      setStatus(`Imported ${res.imported || res} books`);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      await createBook({
        title: form.title,
        isbn: form.isbn,
        author: form.author,
        price: Number(form.price),
        numberInStock: Number(form.numberInStock)
      });
      setStatus('Book created');
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin — Import / Add Books</h2>
      <button onClick={onImport}>Import from JSON</button>
      <div style={{ marginTop: 12 }}>{status}</div>

      <h3 style={{ marginTop: 20 }}>Create new book</h3>
      <form onSubmit={onCreate}>
        <div><input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} /></div>
        <div><input placeholder="ISBN" value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})} /></div>
        <div><input placeholder="Author" value={form.author} onChange={e=>setForm({...form, author:e.target.value})} /></div>
        <div><input placeholder="Price" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} /></div>
        <div><input placeholder="Number in stock" value={form.numberInStock} onChange={e=>setForm({...form, numberInStock:e.target.value})} /></div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
