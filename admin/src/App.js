import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import AddProduct from './AddProduct';
import AddArticle from './AddArticle';
import AddUser from './AddUser';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import AddAbout from './AddAbout';
import AdminOrders from './AdminOrders';

function App() {
  const [auth, setAuth] = useState(false);

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuth(!!token); // Set to true if token exists
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  return (
    <BrowserRouter>
      {/* Show nav and logout only if logged in */}
      {auth && (
        <nav style={{ marginBottom: 20 }}>
          <Link to="/add-product" style={{ marginRight: 10 }}>
            Add Product
          </Link>
          <Link to="/add-article" style={{ marginRight: 10 }}>
            Add Article
          </Link>
          <Link to="/add-user" style={{ marginRight: 10 }}>
            Add User
          </Link>
          <Link to="/add-about" style={{ marginRight: 10 }}>
            Add About
          </Link>
          <Link to="/admin-orders" style={{ marginRight: 10 }}>
           View Orders
          </Link>
          <button onClick={handleLogout} style={{ marginLeft: 20 }}>
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {/* Login route - redirect to main page if already logged in */}
        <Route
          path="/login"
          element={auth ? <Navigate to="/add-product" replace /> : <Login setAuth={setAuth} />}
        />

        {/* Protected routes */}
        <Route
          path="/add-product"
          element={
            <ProtectedRoute auth={auth}>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-article"
          element={
            <ProtectedRoute auth={auth}>
              <AddArticle />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <ProtectedRoute auth={auth}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-about"
          element={
          <ProtectedRoute auth={auth}>
          <AddAbout />
          </ProtectedRoute>
          }
        />
        <Route
         path="/admin-orders"
         element={
        <ProtectedRoute auth={auth}>
        <AdminOrders />
        </ProtectedRoute>
  }
/>


        {/* Fallback route */}
        <Route path="*" element={<Navigate to={auth ? '/add-product' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
