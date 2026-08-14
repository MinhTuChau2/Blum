import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cart from './Cart';
import './ProductList.css';
import Orange from "../assets/ORNGE.png";

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

const ProductCard = ({ product, addToCart, setZoomImage }) => {
  const images = product.images && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const currentImage = images[activeImageIndex] || product.imageUrl;

  return (
    <li>
      <h3>{product.name}</h3>
      <p style={{ fontWeight: 'bold', color: '#ff7b00', fontSize: '1.1rem' }}>${product.price}</p>
      <p>{product.description}</p>

      {currentImage && (
        <img
          src={currentImage}
          alt={product.name}
          className="product-image"
          style={{ cursor: 'zoom-in' }}
          onClick={() => setZoomImage(currentImage)}
        />
      )}

      {/* Multiple Image Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', margin: '8px 0' }}>
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${product.name} thumbnail ${idx + 1}`}
              onClick={() => setActiveImageIndex(idx)}
              style={{
                width: '45px',
                height: '45px',
                objectFit: 'cover',
                borderRadius: '4px',
                cursor: 'pointer',
                border: idx === activeImageIndex ? '2px solid #ff7b00' : '1px solid #ddd',
                opacity: idx === activeImageIndex ? 1 : 0.6,
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.85rem', color: '#666' }}>Category: {product.category || 'General'}</p>
      <button className="add-btn" onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </li>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [zoomImage, setZoomImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load products
  useEffect(() => {
    setLoading(true);

    axios.get(`${API_BASE}/products`)
      .then(res => {
        const productData = Array.isArray(res.data) ? res.data : res.data.products || [];
        setProducts(productData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Filter logic
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  // Add to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(prevCart =>
      prevCart
        .map(item => item._id === id ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0)
    );
  };

  return (
    <div className="products-container">
      <h2>Products</h2>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="category-filter"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Cart Component */}
      <Cart cart={cart} removeFromCart={removeFromCart} />

      <div className="main-content">
        {loading ? (
          <div className="loading-container">
            <img
              src={Orange}
              alt="Loading..."
              className="flower-spinner"
            />
            <p>
              Waking up Render server... please wait 🌼
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            No products found
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`} 🛒
          </div>
        ) : (
          <ul className="products-list">
            {filteredProducts.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                addToCart={addToCart}
                setZoomImage={setZoomImage}
              />
            ))}
          </ul>
        )}
      </div>

      {zoomImage && (
        <div className="image-modal" onClick={() => setZoomImage(null)}>
          <img
            src={zoomImage}
            alt="Zoomed product"
            className="zoomed-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProductsList;
