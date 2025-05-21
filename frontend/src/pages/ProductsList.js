import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductList.css'; // Make sure the filename matches exactly

const ProductsList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="products-container">
      <h2>Products</h2>
      {products.length === 0 && <p>No products available</p>}
      <ul className="products-list">
        {products.map(p => (
          <li key={p._id}>
            <h3>{p.name}</h3>
            <p>${p.price}</p>
            <p>{p.description}</p>
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
            <p>Category: {p.category}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsList;
