import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductList.css'; // Make sure the filename matches exactly

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="products-container">
      <h2>Products</h2>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="category-filter"
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {filteredProducts.length === 0 ? (
        <p>No products available</p>
      ) : (
        <ul className="products-list">
          {filteredProducts.map(p => (
            <li key={p._id}>
              <h3>{p.name}</h3>
              <p>${p.price}</p>
              <p>{p.description}</p>
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
              <p>Category: {p.category}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductsList;
