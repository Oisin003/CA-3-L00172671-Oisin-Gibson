import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function BookDetail() {
  // Get the book ID from the URL parameter (e.g., /books/123)
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State to store the book details
  const [book, setBook] = useState(null);
  // State to store the selected quantity for purchase
  const [qty, setQty] = useState(1);
  // State to store success or error messages
  const [message, setMessage] = useState('');
  // State to store user's total spending for discount calculation
  const [userTotalSpent, setUserTotalSpent] = useState(0);
  
  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Load book details when component renders or when ID changes
  useEffect(() => { 
    loadBook();
    if (user && user._id) {
      loadUserSpending();
    }
  }, [id]);

  // Fetch user's total spending
  function loadUserSpending() {
    fetch(`http://localhost:5000/api/users/${user._id}`)
      .then(res => res.json())
      .then(data => setUserTotalSpent(data.totalSpent || 0))
      .catch(err => console.error(err));
  }

  // Fetch book details from the backend API
  function loadBook() {
    fetch('http://localhost:5000/api/books/' + id)
      // Convert response to JavaScript object
      .then(res => res.json())
      // Update book state with the data
      .then(data => setBook(data))
      // Log any errors to console
      .catch(err => console.error(err));
  }

  // Calculate if user qualifies for discount and the final price
  function calculatePrice() {
    if (!book) return { subtotal: 0, discount: 0, total: 0, qualifiesForDiscount: false };
    
    const subtotal = book.price * qty;
    const qualifiesForDiscount = userTotalSpent > 150;
    const discount = qualifiesForDiscount ? subtotal * 0.05 : 0;
    const total = subtotal - discount;
    
    return { subtotal, discount, total, qualifiesForDiscount };
  }

  // Handle purchase form submission
  function handlePurchase(e) {
    // Prevent page reload
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      setMessage('Please login to make a purchase');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    // Create purchase object with book ID, quantity, and logged-in user info
    const purchase = {
      bookId: id,
      quantity: qty,
      userId: user._id,
      email: user.email,
      name: user.name
    };
    
    // Send POST request to purchases endpoint
    fetch('http://localhost:5000/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchase)
    })
      // Convert response to JavaScript object
      .then(res => res.json())
      .then(data => {
        // Show success message with discount info if applicable
        const discountMsg = data.purchase.discountApplied > 0 
          ? ` (5% discount applied!)` 
          : '';
        setMessage(`Added to cart! Total: €${data.purchase.totalPrice.toFixed(2)}${discountMsg}`);
        // Update the book's stock count with new value from backend
        setBook({ ...book, numberInStock: data.newStock });
        // Update user's total spent
        setUserTotalSpent(data.userTotalSpent);
        // Redirect to basket after 1.5 seconds
        setTimeout(() => navigate('/basket'), 1500);
      })
      // Show error message if purchase fails
      .catch(err => setMessage('Error: ' + err.message));
  }

  // Show loading message while book data is being fetched
  if (!book) return <div>Loading...</div>;

  const priceInfo = calculatePrice();

  return (
    <div>
      {/* Display book details */}
      <h2>{book.title}</h2>
      <p>{book.author} — {book.category}</p>
      <p>Price: €{book.price}</p>
      <p>In stock: {book.numberInStock}</p>
      
      {/* Show logged in user and their spending status */}
      {user && (
        <div>
          <p style={{ color: 'green' }}>Logged in as: {user.name}</p>
          <p style={{ color: '#d4af37', fontWeight: 'bold' }}>
            Total spent: €{userTotalSpent.toFixed(2)}
          </p>
          {priceInfo.qualifiesForDiscount ? (
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>
              ✓ You qualify for 5% discount on all purchases!
            </p>
          ) : (
            <p style={{ color: '#666' }}>
              Spend €{(150 - userTotalSpent).toFixed(2)} more to unlock 5% discount on future purchases!
            </p>
          )}
        </div>
      )}

      {/* Purchase form */}
      <form onSubmit={handlePurchase}>
        <label>Quantity: </label>
        {/* Dropdown to select quantity (1-5) */}
        <select value={qty} onChange={e => setQty(Number(e.target.value))}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        {/* Disable buy button if selected quantity exceeds stock */}
        <button type="submit" disabled={qty > book.numberInStock}>Add to Cart</button>
      </form>

      {/* Show price breakdown */}
      {user && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f1e8', borderRadius: '8px' }}>
          <p><strong>Price breakdown:</strong></p>
          <p>Subtotal: €{priceInfo.subtotal.toFixed(2)}</p>
          {priceInfo.discount > 0 && (
            <p style={{ color: '#28a745' }}>Discount (5%): -€{priceInfo.discount.toFixed(2)}</p>
          )}
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Total: €{priceInfo.total.toFixed(2)}
          </p>
        </div>
      )}
      
      {/* Display purchase message (success or error) if it exists */}
      {message && <p>{message}</p>}
    </div>
  );
}
