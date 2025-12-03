const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const fetchBooks = (query = {}) => {
  const params = new URLSearchParams(query).toString();
  return request(`/api/books${params ? `?${params}` : ''}`);
};

export const fetchBook = (id) => request(`/api/books/${id}`);

export const importBooks = () => request('/api/books/import', { method: 'POST' });

export const createBook = (book) => request('/api/books', { method: 'POST', body: JSON.stringify(book) });

export const purchase = (payload) => request('/api/purchases', { method: 'POST', body: JSON.stringify(payload) });

export default { fetchBooks, fetchBook, importBooks, createBook, purchase };
