import React, { useEffect, useState } from 'react';
import { fetchBooks } from '../api';
import { Link } from 'react-router-dom';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load(query) {
    const data = await fetchBooks(query || {});
    setBooks(data);
  }

  const onSearch = async (e) => {
    e.preventDefault();
    await load({ title: q });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Browse Books</h2>
      <form onSubmit={onSearch} style={{ marginBottom: 12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title" />
        <button type="submit">Search</button>
        <button type="button" onClick={() => { setQ(''); load(); }}>Reset</button>
      </form>
      <ul>
        {books.map(b => (
          <li key={b._id} style={{ marginBottom: 8 }}>
            <Link to={`/books/${b._id}`}><strong>{b.title}</strong></Link>
            <div>{b.author} — {b.category} — €{b.price} — In stock: {b.numberInStock}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
