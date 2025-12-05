//Oisin Gibson - L00172671
//Main application component for the BookStore application

import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AdminImport from './pages/AdminImport';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<BookList/>} />
            <Route path="/books/:id" element={<BookDetail/>} />
            {/* Customer login route */}
            <Route path="/login" element={<LoginPage isAdmin={false} />} />
            {/* Admin login route */}
            <Route path="/admin-login" element={<LoginPage isAdmin={true} />} />
            {/* Protected admin route */}
            <Route path="/admin" element={<AdminImport/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

// Login page wrapper component
function LoginPage({ isAdmin }) {
  const navigate = useNavigate();
  
  // Handle successful login
  function handleLogin(userInfo) {
    // Save user info to localStorage
    if (isAdmin) {
      localStorage.setItem('admin', JSON.stringify(userInfo));
      navigate('/admin');
    } else {
      localStorage.setItem('user', JSON.stringify(userInfo));
      navigate('/');
    }
  }
  
  return <Login onLogin={handleLogin} isAdmin={isAdmin} />;
}

export default App;
