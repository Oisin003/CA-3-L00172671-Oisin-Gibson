//Oisin Gibson - L00172671
//Basket/Checkout page component

/**
 * REFERENCES:
 * - React Hooks: https://react.dev/reference/react
 * - Form Handling in React: https://react.dev/reference/react-dom/components/input
 * - Array.reduce(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
 * - localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * - Fetch API DELETE: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */

import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/Card';
import './Basket.css';

/**
 * Basket Component
 * Complete shopping cart and checkout page
 * Features:
 * - View cart items with prices and discounts
 * - Checkout form with delivery and payment details
 * - Order summary with automatic calculations
 * - Order confirmation page
 * - User authentication check
 */
export default function Basket() {
  // State for cart items fetched from backend
  const [cartItems, setCartItems] = useState([]);
  // State for logged-in user (from localStorage)
  const [user, setUser] = useState(null);
  // Loading state while fetching cart data
  const [loading, setLoading] = useState(true);
  // Order confirmation data (null until order is placed)
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  // Get currency formatting function
  const { formatPrice } = useCurrency();
  // Form data for checkout (delivery and payment info)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'Ireland',
    city: '',
    phone: '',
    company: '',
    paymentMethod: 'credit-card',
    deliveryMethod: 'standard'
  });

  /**
   * Effect: Load user and cart data on component mount
   * Checks localStorage for logged-in user
   * Pre-fills form with user data if available
   * Loads cart items for logged-in user
   */
  useEffect(() => {
    // Get logged-in user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Pre-fill form with user's name and email
      setFormData(prev => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || ''
      }));
      loadCartItems(parsedUser._id);
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Load cart items from backend for a specific user
   * Fetches all items in user's cart from /api/purchases/cart/:userId
   * @param {String} userId - MongoDB ID of the user
   */
  const loadCartItems = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/purchases/cart/${userId}`);
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   * Updates formData state as user types
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission (checkout)
   * Creates order confirmation object with all order details
   * Switches to confirmation view and scrolls to top
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create unique order number using timestamp (e.g., "ORD-1702392847123")
    const orderNumber = 'ORD-' + Date.now();
    
    // Build confirmation object with all order details for display on confirmation page
    const confirmation = {
      // Unique identifier for this order
      orderNumber,
      // Current date in localized format (e.g., "12/12/2025")
      date: new Date().toLocaleDateString(),
      // Current time in localized format (e.g., "14:30:45")
      time: new Date().toLocaleTimeString(),
      // Array of all purchased items from cart
      items: cartItems,
      // Customer delivery information object
      deliveryInfo: {
        name: formData.name,           // Customer's full name
        email: formData.email,         // Customer's email address
        address: `${formData.city}, ${formData.country}`,  // Combined address string
        phone: formData.phone          // Customer's phone number
      },
      // Selected payment method ('credit-card', 'pay-on-delivery', or 'paypal')
      paymentMethod: formData.paymentMethod,
      // Selected delivery speed ('free', 'standard', or 'express')
      deliveryMethod: formData.deliveryMethod,
      // Price calculations - all values in euros
      subtotal: calculateSubtotal(),              // Sum of all items after discounts
      originalPrice: calculateOriginalPrice(),    // Total before any discounts applied
      totalDiscount: calculateTotalDiscount(),    // Total amount saved from discounts
      delivery: getDeliveryPrice(),               // Delivery fee (0, 5, or 15 euros)
      tax: calculateTax(),                        // VAT at 20% of subtotal
      total: calculateTotal()                     // Final total (subtotal + delivery + tax)
    };
    
    // Store confirmation data in state to trigger confirmation view
    setOrderConfirmation(confirmation);
    // Scroll to top to show confirmation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Calculate subtotal (sum of all item prices after discounts)
   * @returns {Number} Total price of all items in cart
   */
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  /**
   * Calculate original price before any discounts were applied
   * Reverses the discount calculation to show savings
   * @returns {Number} Original price without discounts
   */
  const calculateOriginalPrice = () => {
    // Calculate what the price would have been without discounts
    return cartItems.reduce((sum, item) => {
      const originalPrice = item.totalPrice / (1 - item.discountApplied);
      return sum + originalPrice;
    }, 0);
  };

  /**
   * Calculate total discount amount (difference between original and discounted price)
   * @returns {Number} Total savings from discounts
   */
  const calculateTotalDiscount = () => {
    return calculateOriginalPrice() - calculateSubtotal();
  };

  /**
   * Calculate tax (20% VAT on subtotal)
   * Rounds to 2 decimal places
   * @returns {Number} Tax amount
   */
  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.2 * 100) / 100; // 20% VAT
  };

  /**
   * Get delivery price based on selected delivery method
   * @returns {Number} Delivery cost (0, 5, or 15 euros)
   */
  const getDeliveryPrice = () => {
    switch (formData.deliveryMethod) {
      case 'free': return 0;
      case 'standard': return 5;
      case 'express': return 15;
      default: return 5;
    }
  };

  /**
   * Calculate final total (subtotal + delivery + tax)
   * @returns {Number} Final amount to pay
   */
  const calculateTotal = () => {
    return calculateSubtotal() + getDeliveryPrice() + calculateTax();
  };

  /**
   * Remove an item from cart
   * Filters out the item with matching ID
   * @param {String} itemId - MongoDB ID of cart item to remove
   */
  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId));
  };

  // Show loading indicator while fetching data
  if (loading) {
    return <div className="basket-container"><p>Loading...</p></div>;
  }

  /**
   * Login Prompt View
   * Displayed when user is not logged in
   * Shows message and button to navigate to login page
   */
  if (!user) {
    return (
      <div className="basket-container">
        <Card className="section-card">
          <div className="login-prompt-card">
            <div className="login-prompt-content">
              {/* User icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="login-icon">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
              </svg>
              <h3>Please Log In</h3>
              <p>You must be logged in to view your basket.</p>
              <a href="/login" className="btn-login">Go to Login</a>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /**
   * Order Confirmation View
   * Displayed after successful checkout
   * Shows order details, items, delivery info, and summary
   * Includes options to continue shopping or print receipt
   */
  if (orderConfirmation) {
    return (
      <div className="basket-container">
        <Card className="confirmation-card">
          {/* Confirmation Header - success icon and messages */}
          <div className="confirmation-header">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="confirmation-icon">
              <path stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <h2>Order Confirmed!</h2>
            <p className="confirmation-subtitle">Thank you for your purchase</p>
          </div>

          {/* Order Details - order number, date, email */}
          <div className="confirmation-details">
            <div className="confirmation-row">
              <span className="label">Order Number:</span>
              <strong>{orderConfirmation.orderNumber}</strong>
            </div>
            <div className="confirmation-row">
              <span className="label">Date:</span>
              <span>{orderConfirmation.date} at {orderConfirmation.time}</span>
            </div>
            <div className="confirmation-row">
              <span className="label">Email:</span>
              <span>{orderConfirmation.deliveryInfo.email}</span>
            </div>
          </div>

          {/* Order Items Section - list of purchased books */}
          <div className="confirmation-section">
            <h3>Order Items</h3>
            {orderConfirmation.items.map((item, index) => (
              <div key={index} className="confirmation-item">
                <div>
                  <strong>{item.book?.title || 'Book'}</strong>
                  <p className="item-meta">Quantity: {item.quantity} × {formatPrice(item.totalPrice / item.quantity)}</p>
                </div>
                <span className="item-price">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Delivery Information Section */}
          <div className="confirmation-section">
            <h3>Delivery Information</h3>
            <p>{orderConfirmation.deliveryInfo.name}</p>
            <p>{orderConfirmation.deliveryInfo.address}</p>
            <p>{orderConfirmation.deliveryInfo.phone}</p>
            <p className="delivery-method-info">
              {formData.deliveryMethod === 'express' ? 'Express Delivery (1-2 days)' : 
               formData.deliveryMethod === 'standard' ? 'Standard Delivery (3-5 days)' : 
               'Free Delivery (7-10 days)'}
            </p>
          </div>

          {/* Order Summary - prices, discounts, tax, total */}
          <div className="confirmation-summary">
            {/* Show original price and discount if applicable */}
            {orderConfirmation.totalDiscount > 0 && (
              <div className="summary-row discount-highlight">
                <span>Original Price:</span>
                <span>{formatPrice(orderConfirmation.originalPrice)}</span>
              </div>
            )}
            {orderConfirmation.totalDiscount > 0 && (
              <div className="summary-row discount-highlight">
                <span>Discount (5%):</span>
                <span className="discount-amount">-{formatPrice(orderConfirmation.totalDiscount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatPrice(orderConfirmation.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>{formatPrice(orderConfirmation.delivery)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (VAT 20%):</span>
              <span>{formatPrice(orderConfirmation.tax)}</span>
            </div>
            <div className="summary-row summary-total">
              <strong>Total:</strong>
              <strong>{formatPrice(orderConfirmation.total)}</strong>
            </div>
          </div>

          {/* Action Buttons - continue shopping or print */}
          <div className="confirmation-actions">
            <button onClick={() => window.location.href = '/'} className="btn-checkout">
              Continue Shopping
            </button>
            <button onClick={() => window.print()} className="btn-apply">
              Print Receipt
            </button>
          </div>
        </Card>
      </div>
    );
  }

  /**
   * Main Checkout View
   * Contains checkout form with cart items, delivery details,
   * payment options, delivery options, and order summary
   */
  /**
   * Main Checkout View
   * Contains checkout form with cart items, delivery details,
   * payment options, delivery options, and order summary
   */
  return (
    <div className="basket-container">
      {/* Checkout Steps - visual progress indicator */}
      <div className="checkout-steps">
        <div className="step step-active">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Cart</span>
        </div>
        <div className="step-divider"></div>
        <div className="step step-active">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Checkout</span>
        </div>
        <div className="step-divider"></div>
        <div className="step">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Order Summary</span>
        </div>
      </div>

      {/* Main Checkout Form - contains all form sections and order summary */}
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-main">
          {/* Cart Items Summary Card */}
          <Card className="section-card">
            <h2>Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h2>
            {/* Show login prompt if user is not logged in */}
            {!user ? (
              <div className="login-prompt-card">
                <div className="login-prompt-content">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="login-icon">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                    <path fillRule="evenodd" d="M0 8a8 8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                  </svg>
                  <h3>Please Log In</h3>
                  <p>You must be logged in to view your basket.</p>
                  <a href="/login" className="btn-login">Go to Login</a>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              /* Empty cart message */
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <a href="/" className="btn-apply">Browse Books</a>
              </div>
            ) : (
              /* Cart items list */
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.book?.title || 'Book Title'}</h4>
                      <p className="cart-item-author">by {item.book?.author || 'Unknown Author'}</p>
                      <p className="cart-item-meta">
                        Quantity: {item.quantity} × {formatPrice(item.totalPrice / item.quantity)}
                      </p>
                      {/* Show discount badge if discount was applied */}
                      {item.discountApplied > 0 && (
                        <p className="cart-item-discount">
                          ✓ {(item.discountApplied * 100).toFixed(0)}% discount applied
                        </p>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-item-price">{formatPrice(item.totalPrice)}</div>
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item._id)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Delivery Details Card - form inputs for shipping address */}
          <Card className="section-card">
            <h2>Delivery Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Your name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Your email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Ireland">Ireland</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Spain">Spain</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Dublin"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="087-123-4567"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company Ltd"
                />
              </div>
            </div>
          </Card>

          {/* Payment Methods Card - radio button options */}
          <Card className="section-card">
            <h3>Payment</h3>
            <div className="payment-methods">
              {/* Credit Card Option */}
              <Card padding="small" className="payment-option">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="credit-card"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === 'credit-card'}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label htmlFor="credit-card">Credit Card</label>
                    <p className="option-description">Pay with your credit card</p>
                  </div>
                </div>
              </Card>

              {/* Pay on Delivery Option */}
              <Card padding="small" className="payment-option">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="pay-on-delivery"
                    name="paymentMethod"
                    value="pay-on-delivery"
                    checked={formData.paymentMethod === 'pay-on-delivery'}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label htmlFor="pay-on-delivery">Payment on delivery</label>
                    <p className="option-description">+{formatPrice(15)} payment processing fee</p>
                  </div>
                </div>
              </Card>

              {/* PayPal Option */}
              <Card padding="small" className="payment-option">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label htmlFor="paypal">PayPal account</label>
                    <p className="option-description">Connect to your account</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Delivery Methods Card - shipping speed options */}
          <Card className="section-card">
            <h3>Delivery Methods</h3>
            <div className="delivery-methods">
              {/* Standard Delivery (€5) */}
              <Card padding="small" className="delivery-option">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="standard"
                    name="deliveryMethod"
                    value="standard"
                    checked={formData.deliveryMethod === 'standard'}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label htmlFor="standard">{formatPrice(5)} - Standard Delivery</label>
                    <p className="option-description">Get it within 3-5 days</p>
                  </div>
                </div>
              </Card>

              {/* Express Delivery (€15) */}
              <Card padding="small" className="delivery-option">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="express"
                    name="deliveryMethod"
                    value="express"
                    checked={formData.deliveryMethod === 'express'}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label htmlFor="express">{formatPrice(15)} - Express Delivery</label>
                    <p className="option-description">Get it by tomorrow</p>
                  </div>
                </div>
              </Card>

              {/* Free Delivery (slower) */}
              <Card padding="small" className="delivery-option">
                <div className="radio-group">
                  <input
                    type="radio"
                    id="free"
                    name="deliveryMethod"
                    value="free"
                    checked={formData.deliveryMethod === 'free'}
                    onChange={handleInputChange}
                  />
                  <div>
                    <label htmlFor="free">Free Delivery</label>
                    <p className="option-description">Get it within 7-10 days</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Voucher Section - promotional code input (non-functional) */}
          <Card className="section-card">
            <label htmlFor="voucher">Enter a gift card, voucher or promotional code</label>
            <div className="voucher-input">
              <input
                type="text"
                id="voucher"
                placeholder="Enter code"
              />
              <button type="button" className="btn-apply">Apply</button>
            </div>
          </Card>
        </div>

        {/* Order Summary Sidebar - sticky sidebar with price breakdown */}
        <aside className="order-summary">
          <Card>
            <h3>Order Summary</h3>
            <div className="summary-items">
              {/* Show discount savings if applicable */}
              {calculateTotalDiscount() > 0 && (
                <>
                  <div className="summary-row">
                    <span>Original Price</span>
                    <span className="strikethrough">{formatPrice(calculateOriginalPrice())}</span>
                  </div>
                  <div className="summary-row discount-row">
                    <span>Your Discount (5%)</span>
                    <span className="discount-amount">-{formatPrice(calculateTotalDiscount())}</span>
                  </div>
                </>
              )}
              {/* Subtotal */}
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              {/* Delivery cost */}
              <div className="summary-row">
                <span>Delivery</span>
                <span>{formatPrice(getDeliveryPrice())}</span>
              </div>
              {/* Tax (20% VAT) */}
              <div className="summary-row">
                <span>Tax (VAT 20%)</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              {/* Total */}
              <div className="summary-row summary-total">
                <strong>Total</strong>
                <strong>{formatPrice(calculateTotal())}</strong>
              </div>
              {/* Savings badge if discount applied */}
              {calculateTotalDiscount() > 0 && (
                <div className="savings-badge">
                  You saved {formatPrice(calculateTotalDiscount())}!
                </div>
              )}
            </div>
            {/* Checkout button - disabled if cart is empty */}
            <button 
              type="submit" 
              className="btn-checkout"
              disabled={cartItems.length === 0}
            >
              Proceed to Payment
            </button>
            {/* Login reminder if not logged in */}
            {!user && (
              <p className="checkout-note">
                Please <a href="/login">sign in</a> to complete your purchase.
              </p>
            )}
          </Card>
        </aside>
      </form>
    </div>
  );
}
