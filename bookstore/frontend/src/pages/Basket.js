//Oisin Gibson - L00172671
//Basket/Checkout page component

import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import './Basket.css';

export default function Basket() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
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

  useEffect(() => {
    // Get logged-in user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create order confirmation
    const orderNumber = 'ORD-' + Date.now();
    const confirmation = {
      orderNumber,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: cartItems,
      deliveryInfo: {
        name: formData.name,
        email: formData.email,
        address: `${formData.city}, ${formData.country}`,
        phone: formData.phone
      },
      paymentMethod: formData.paymentMethod,
      deliveryMethod: formData.deliveryMethod,
      subtotal: calculateSubtotal(),
      delivery: getDeliveryPrice(),
      tax: calculateTax(),
      total: calculateTotal()
    };
    
    setOrderConfirmation(confirmation);
    // Scroll to top to show confirmation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.2 * 100) / 100; // 20% VAT
  };

  const getDeliveryPrice = () => {
    switch (formData.deliveryMethod) {
      case 'free': return 0;
      case 'standard': return 5;
      case 'express': return 15;
      default: return 5;
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + getDeliveryPrice() + calculateTax();
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item._id !== itemId));
  };

  if (loading) {
    return <div className="basket-container"><p>Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="basket-container">
        <Card className="section-card">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your basket.</p>
          <a href="/login" className="btn-checkout">Go to Login</a>
        </Card>
      </div>
    );
  }

  // Order Confirmation View
  if (orderConfirmation) {
    return (
      <div className="basket-container">
        <Card className="confirmation-card">
          <div className="confirmation-header">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="confirmation-icon">
              <path stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <h2>Order Confirmed!</h2>
            <p className="confirmation-subtitle">Thank you for your purchase</p>
          </div>

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

          <div className="confirmation-section">
            <h3>Order Items</h3>
            {orderConfirmation.items.map((item, index) => (
              <div key={index} className="confirmation-item">
                <div>
                  <strong>{item.book?.title || 'Book'}</strong>
                  <p className="item-meta">Quantity: {item.quantity} × €{(item.totalPrice / item.quantity).toFixed(2)}</p>
                </div>
                <span className="item-price">€{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>

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

          <div className="confirmation-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>€{orderConfirmation.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>€{orderConfirmation.delivery.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (VAT 20%):</span>
              <span>€{orderConfirmation.tax.toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <strong>Total:</strong>
              <strong>€{orderConfirmation.total.toFixed(2)}</strong>
            </div>
          </div>

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

  return (
    <div className="basket-container">
      {/* Checkout Steps */}
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

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="checkout-main">
          {/* Cart Items Summary */}
          <Card className="section-card">
            <h2>Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h2>
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty</p>
                <a href="/" className="btn-apply">Browse Books</a>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.book?.title || 'Book Title'}</h4>
                      <p className="cart-item-author">by {item.book?.author || 'Unknown Author'}</p>
                      <p className="cart-item-meta">
                        Quantity: {item.quantity} × €{(item.totalPrice / item.quantity).toFixed(2)}
                      </p>
                      {item.discountApplied > 0 && (
                        <p className="cart-item-discount">
                          Discount applied: {(item.discountApplied * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-item-price">€{item.totalPrice.toFixed(2)}</div>
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

          {/* Delivery Details */}
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

          {/* Payment Methods */}
          <Card className="section-card">
            <h3>Payment</h3>
            <div className="payment-methods">
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
                    <p className="option-description">+€15 payment processing fee</p>
                  </div>
                </div>
              </Card>

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

          {/* Delivery Methods */}
          <Card className="section-card">
            <h3>Delivery Methods</h3>
            <div className="delivery-methods">
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
                    <label htmlFor="standard">€5 - Standard Delivery</label>
                    <p className="option-description">Get it within 3-5 days</p>
                  </div>
                </div>
              </Card>

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
                    <label htmlFor="express">€15 - Express Delivery</label>
                    <p className="option-description">Get it by tomorrow</p>
                  </div>
                </div>
              </Card>

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

          {/* Voucher Section */}
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

        {/* Order Summary Sidebar */}
        <aside className="order-summary">
          <Card>
            <h3>Order Summary</h3>
            <div className="summary-items">
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>€{getDeliveryPrice().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (VAT 20%)</span>
                <span>€{calculateTax().toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <strong>Total</strong>
                <strong>€{calculateTotal().toFixed(2)}</strong>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-checkout"
              disabled={cartItems.length === 0}
            >
              Proceed to Payment
            </button>
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
