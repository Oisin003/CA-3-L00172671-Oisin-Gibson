//Oisin Gibson - L00172671
//Main application component for the BookStore application

/**
 * REFERENCES:
 * - React Router v6: https://reactrouter.com/en/main/start/tutorial
 * - BrowserRouter: https://reactrouter.com/en/main/router-components/browser-router
 * - Routes & Route: https://reactrouter.com/en/main/components/routes
 * - useNavigate Hook: https://reactrouter.com/en/main/hooks/use-navigate
 * - React Context: https://react.dev/reference/react/useContext
 */

import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { DarkModeProvider } from './context/DarkModeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AdminImport from './pages/AdminImport';
import Basket from './pages/Basket';

/**
 * Main App component
 * Sets up the application structure with routing, dark mode, and layout components.
 * 
 * Features:
 * - React Router for navigation between pages
 * - Dark mode context provider wrapping entire app
 * - Persistent header and footer on all pages
 * - Separate login routes for customers and admins
 * - Protected admin route for book management
 */
function App() {
  return (
    // Wrap entire app in DarkModeProvider to enable theme switching
    <DarkModeProvider>
      {/* Wrap app in CurrencyProvider to enable currency conversion */}
      <CurrencyProvider>
        {/* BrowserRouter enables client-side routing */}
        <BrowserRouter>
          <div className="App">
          {/* Header component - displayed on all pages */}
          <Header />
        {/* Main content area - contains routed page components */}
        <main className="main-content">
          {/* Routes define which component renders for each URL path */}
          <Routes>
            {/* Home page - displays all books with search */}
            <Route path="/" element={<BookList/>} />
            {/* Individual book detail page - :id is dynamic parameter */}
            <Route path="/books/:id" element={<BookDetail/>} />
            {/* Shopping cart and checkout page */}
            <Route path="/basket" element={<Basket/>} />
            {/* Customer login route */}
            <Route path="/login" element={<LoginPage isAdmin={false} />} />
            {/* Admin login route */}
            <Route path="/admin-login" element={<LoginPage isAdmin={true} />} />
            {/* Protected admin route - book management dashboard */}
            <Route path="/admin" element={<AdminImport/>} />
          </Routes>
        </main>
        {/* Footer component - displayed on all pages */}
        <Footer />
        </div>
      </BrowserRouter>
      </CurrencyProvider>
    </DarkModeProvider>
  );
}

/**
 * LoginPage wrapper component
 * Wraps the Login component and handles post-login navigation and user persistence.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isAdmin - Whether this is an admin login (true) or customer login (false)
 * 
 * Features:
 * - Saves user info to localStorage for session persistence
 * - Redirects to appropriate page after successful login (admin → /admin, customer → /)
 * - Dispatches custom event to update header with user info
 */
function LoginPage({ isAdmin }) {
  const navigate = useNavigate();
  
  /**
   * Handles successful login by saving user data and navigating to appropriate page
   * 
   * @param {Object} userInfo - User information object from login (includes email, name, etc.)
   */
  function handleLogin(userInfo) {
    // Save user info to localStorage based on user type
    if (isAdmin) {
      // Admin users stored under 'admin' key, navigate to admin dashboard
      localStorage.setItem('admin', JSON.stringify(userInfo));
      navigate('/admin');
    } else {
      // Regular users stored under 'user' key, navigate to home page
      localStorage.setItem('user', JSON.stringify(userInfo));
      navigate('/');
    }
    
    // Dispatch custom event to trigger header update (displays user name/logout)
    window.dispatchEvent(new Event('userLoggedIn'));
  }
  
  return <Login onLogin={handleLogin} isAdmin={isAdmin} />;
}

export default App;
