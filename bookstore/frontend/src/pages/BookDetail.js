import React, { useEffect, useState } from 'react';
import { fetchBook, purchase } from '../api';
import { useParams } from 'react-router-dom';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, [id]);
  async function load() {
    const b = await fetchBook(id);
    setBook(b);
  }

  async function onPurchase(e) {
    e.preventDefault();
    try {
      const resp = await purchase({ bookId: id, quantity: qty, email: 'guest@example.com', name: 'Guest' });
      setMessage('Purchase successful — total: €' + resp.purchase.totalPrice);
      setBook(prev => ({ ...prev, numberInStock: resp.newStock }));
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  }

  if (!book) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{book.title}</h2>
      <div>{book.author} — {book.category}</div>
      <div>Price: €{book.price}</div>
      <div>In stock: {book.numberInStock}</div>

      <form onSubmit={onPurchase} style={{ marginTop: 12 }}>
        <label>Quantity: </label>
        <select value={qty} onChange={e => setQty(Number(e.target.value))}>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button type="submit" disabled={qty > book.numberInStock}>Buy</button>
      </form>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </div>
  );
}
