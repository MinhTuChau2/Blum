import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cart from './Cart';
import './ProductList.css';
import Orange from "../assets/ORNGE.png";

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

const ProductImageCarousel = ({ images, productName, setZoomImage, isSoldOut }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  if (!images || images.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 30) {
      // Swipe left -> Next
      setActiveIdx((prev) => (prev + 1) % images.length);
    } else if (diff < -30) {
      // Swipe right -> Prev
      setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="carousel-main-image-wrapper">
        <img
          src={images[activeIdx]}
          alt={`${productName} - view ${activeIdx + 1}`}
          className="product-image"
          style={{ filter: isSoldOut ? 'grayscale(35%) opacity(0.8)' : 'none' }}
          onClick={() => setZoomImage(images[activeIdx])}
        />

        {/* Sold Out Overlay Badge */}
        {isSoldOut && (
          <div className="sold-out-overlay">
            <span>SOLD OUT</span>
          </div>
        )}

        {/* Swipe Arrows for multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-arrow left-arrow"
              onClick={handlePrev}
              title="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-arrow right-arrow"
              onClick={handleNext}
              title="Next image"
            >
              ›
            </button>

            <div className="carousel-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`carousel-dot ${idx === activeIdx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="carousel-thumbnails">
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`${productName} thumb ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(idx);
              }}
              className={`carousel-thumb ${idx === activeIdx ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product, addToCart, setZoomImage }) => {
  const images = product.images && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const isSoldOut = !!product.isSoldOut;

  return (
    <li className={`product-card ${isSoldOut ? 'sold-out-card' : ''}`}>
      <h3>{product.name}</h3>
      <p style={{ fontWeight: 'bold', color: '#000000', fontSize: '1.2rem', margin: '4px 0' }}>
        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
      </p>
      <p style={{ color: '#555', fontSize: '0.95rem' }}>{product.description}</p>

      <ProductImageCarousel
        images={images}
        productName={product.name}
        setZoomImage={setZoomImage}
        isSoldOut={isSoldOut}
      />

      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
        Category: {product.category || 'General'}
      </p>

      <button
        className={`add-btn ${isSoldOut ? 'disabled-btn' : ''}`}
        onClick={() => !isSoldOut && addToCart(product)}
        disabled={isSoldOut}
      >
        {isSoldOut ? 'Sold Out' : 'Add to Cart'}
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
    if (product.isSoldOut) return; // Do not add sold out items to cart

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
