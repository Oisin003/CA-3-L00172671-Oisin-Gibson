// Oisin Gibson - L00172671
// Book Detail page component

/**
 * REFERENCES:
 * - React Hooks: https://react.dev/reference/react
 * - useParams Hook: https://reactrouter.com/en/main/hooks/use-params
 * - useNavigate Hook: https://reactrouter.com/en/main/hooks/use-navigate
 * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * - Fetch API POST: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/Card';
import './BookDetail.css';

/**
 * BookDetail Component
 * Displays detailed information about a single book
 * Features:
 * - Book information display (title, author, price, stock)
 * - User spending tracker with discount status
 * - Add to cart functionality with quantity selection
 * - Real-time discount calculation (5% for users who spent >€150)
 * - Stock availability checking
 * - User authentication integration
 */
export default function BookDetail() {
  // Get the book ID from the URL parameter (e.g., /books/123)
  const { id } = useParams();
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // Get currency formatting function
  const { formatPrice } = useCurrency();
  
  // State to store the book details fetched from backend
  const [book, setBook] = useState(null);
  // State to store the selected quantity for purchase (1-5)
  const [qty, setQty] = useState(1);
  // State to store success or error messages after purchase attempt
  const [message, setMessage] = useState('');
  // State to store user's total spending for discount calculation
  const [userTotalSpent, setUserTotalSpent] = useState(0);
  
  // Get logged-in user from localStorage (null if not logged in)
  const user = JSON.parse(localStorage.getItem('user'));

  /**
   * Effect: Load book details and user spending on component mount
   * Runs when component renders or when book ID changes
   * Dependencies: [id]
   */
  useEffect(() => { 
    loadBook();
    // Only fetch user spending if user is logged in
    if (user && user._id) {
      loadUserSpending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * Fetch user's total spending from backend
   * Used to determine if user qualifies for 5% discount (>€150 spent)
   * Updates userTotalSpent state with the result
   */
  function loadUserSpending() {
    fetch(`http://localhost:5000/api/users/${user._id}`)
      .then(res => res.json())
      .then(data => setUserTotalSpent(data.totalSpent || 0))
      .catch(err => console.error(err));
  }

  /**
   * Fetch book details from the backend API
   * Makes GET request to /api/books/:id
   * Updates book state with returned data
   */
  function loadBook() {
    fetch('http://localhost:5000/api/books/' + id)
      // Convert response to JavaScript object
      .then(res => res.json())
      // Update book state with the data
      .then(data => setBook(data))
      // Log any errors to console
      .catch(err => console.error(err));
  }

  /**
   * Calculate price breakdown with discount logic
   * Discount rules: 5% off if user has spent more than €150
   * @returns {Object} Price information object
   * @returns {Number} subtotal - Price before discount
   * @returns {Number} discount - Discount amount (5% if qualified)
   * @returns {Number} total - Final price after discount
   * @returns {Boolean} qualifiesForDiscount - Whether user qualifies for discount
   */
  function calculatePrice() {
    // Return zero values if book not loaded yet
    if (!book) return { subtotal: 0, discount: 0, total: 0, qualifiesForDiscount: false };
    
    // Calculate subtotal (price × quantity)
    const subtotal = book.price * qty;
    // Check if user qualifies for discount (spent > €150)
    const qualifiesForDiscount = userTotalSpent > 150;
    // Calculate 5% discount if qualified, otherwise 0
    const discount = qualifiesForDiscount ? subtotal * 0.05 : 0;
    // Calculate final total
    const total = subtotal - discount;
    
    return { subtotal, discount, total, qualifiesForDiscount };
  }

  /**
   * Handle add to cart form submission
   * Validates user is logged in
   * Sends purchase request to backend
   * Updates UI with success/error message
   * Redirects to basket after successful purchase
   * @param {Event} e - Form submit event
   */
  function handlePurchase(e) {
    // Prevent page reload
    e.preventDefault();
    
    // Check if user is logged in - redirect to login if not
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
          ? ` (Discount of 5% applied!)` 
          : '';
        setMessage(`Added to cart! Total: €${data.purchase.totalPrice.toFixed(2)}${discountMsg}`);
        // Update the book's stock count with new value from backend
        setBook({ ...book, numberInStock: data.newStock });
        // Update user's total spent amount
        setUserTotalSpent(data.userTotalSpent);
        // Redirect to basket after 1.5 seconds
        setTimeout(() => navigate('/basket'), 1500);
      })
      // Show error message if purchase fails
      .catch(err => setMessage('Error: ' + err.message));
  }

  // Show loading message while book data is being fetched
  if (!book) return <div className="book-detail-container"><p>Loading...</p></div>;

  // Calculate price information for display
  // Calculate price information for display
  const priceInfo = calculatePrice();

  return (
    <div className="book-detail-container">
      {/* Main book information card - displays book details */}
      <Card className="book-detail-card">
        {/* Book icon - large SVG illustration */}
        <div className="book-icon-large">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
          </svg>
        </div>

        {/* Book title, author, and category */}
        <h2 className="book-title">{book.title}</h2>
        <p className="book-author">by {book.author}</p>
        <p className="book-category">{book.category}</p>
        
        {/* Price and stock information grid */}
        <div className="book-info-grid">
          <div className="info-item">
            <span className="info-label">Price:</span>
            <span className="info-value">{formatPrice(book.price)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">In stock:</span>
            {/* Add 'out-of-stock' class if stock is 0 */}
            <span className={`info-value ${book.numberInStock === 0 ? 'out-of-stock' : ''}`}>
              {book.numberInStock}
            </span>
          </div>
        </div>
      </Card>

      {/* User spending status card - only shown if user is logged in */}
      {user && (
        <Card className="user-status-card">
          <h3>Your Account</h3>
          {/* User icon and name */}
          <div className="user-info-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
            </svg>
            <span>{user.name}</span>
          </div>
          {/* Spending information and discount status */}
          <div className="spending-info">
            <p className="spending-amount">Total spent: {formatPrice(userTotalSpent)}</p>
            {/* Show success badge if user qualifies for discount (>€150 spent) */}
            {priceInfo.qualifiesForDiscount ? (
              <div className="discount-badge success">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
                </svg>
                You qualify for 5% discount!
              </div>
            ) : (
              /* Show info badge with amount needed to unlock discount */
              <div className="discount-badge info">
                Spend {formatPrice(150 - userTotalSpent)} more to unlock 5% discount
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Purchase form card - add to cart functionality */}
      <Card className="purchase-card">
        <h3>Add to Cart</h3>
        <form onSubmit={handlePurchase} className="purchase-form">
          {/* Quantity selector dropdown (1-5) */}
          <div className="form-group">
            <label htmlFor="quantity">Quantity:</label>
            <select 
              id="quantity"
              value={qty} 
              onChange={e => setQty(Number(e.target.value))}
              className="quantity-select"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Price breakdown - only shown for logged-in users */}
          {user && (
            <div className="price-breakdown">
              {/* Subtotal row */}
              <div className="price-row">
                <span>Subtotal:</span>
                <span>{formatPrice(priceInfo.subtotal)}</span>
              </div>
              {/* Discount row - only shown if discount > 0 */}
              {priceInfo.discount > 0 && (
                <div className="price-row discount-row">
                  <span>Discount (5%):</span>
                  <span>-{formatPrice(priceInfo.discount)}</span>
                </div>
              )}
              {/* Total row with final price */}
              <div className="price-row total-row">
                <strong>Total:</strong>
                <strong>{formatPrice(priceInfo.total)}</strong>
              </div>
            </div>
          )}

          {/* Add to cart button - disabled if requested quantity exceeds stock */}
          <button 
            type="submit" 
            disabled={qty > book.numberInStock}
            className="btn-add-to-cart"
          >
            {qty > book.numberInStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </form>

        {/* Success/error message display - shown after purchase attempt */}
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}
