  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import Cart from './Cart'; // Make sure this component exists
  import './ProductList.css';

  const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [zoomImage, setZoomImage] = useState(null);

    // Load products
    useEffect(() => {
      axios.get('https://blum-backend.onrender.com/products')
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));
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
         <ul className="products-list">
  {filteredProducts.length === 0 ? (
    <li className="no-products">
      Using the free version of OnRender... Sooo... Please wait 1 minute for the components to load{selectedCategory !== 'All' && ` in "${selectedCategory}"`} 🛒
    </li>
  ) : (
    filteredProducts.map(p => (
      <li key={p._id}>
        <h3>{p.name}</h3>
        <p>${p.price}</p>
        <p>{p.description}</p>

        {p.imageUrl && (
          <img
            src={p.imageUrl}
            alt={p.name}
            className="product-image"
            onClick={() => setZoomImage(p.imageUrl)}
          />
        )}

        <p>Category: {p.category}</p>
        <button className="add-btn" onClick={() => addToCart(p)}>
          Add to Cart
        </button>
      </li>
    ))
  )}
</ul>

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
