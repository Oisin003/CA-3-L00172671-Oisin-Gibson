import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AdminImport from './pages/AdminImport';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <Link to="/" >Home</Link>
          <Link to="/admin" >Admin</Link>
        </nav>
        <Routes>
          <Route path="/" element={<BookList/>} />
          <Route path="/books/:id" element={<BookDetail/>} />
          <Route path="/admin" element={<AdminImport/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
