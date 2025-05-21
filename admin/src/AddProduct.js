import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProduct.css';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: ''
  });

  const [products, setProducts] = useState([]);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = e => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProduct(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('❌ Failed to upload image');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/products', product);
      alert('✅ Product added successfully!');
      setProduct({ name: '', price: '', description: '', imageUrl: '', category: '' });
      fetchProducts(); // refresh list
    } catch (error) {
      alert('❌ Failed to add product');
      console.error(error);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/products/${id}`);
        alert('🗑️ Product deleted!');
        fetchProducts(); // refresh list
      } catch (error) {
        alert('❌ Failed to delete product');
        console.error(error);
      }
    }
  };

  return (
    <div className="container">
      <main className="main-content">
        <aside className="sidebar" id="add-product">
          <h2>Add Product</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              name="price"
              type="number"
              value={product.price}
              onChange={handleChange}
              placeholder="Price"
            />
            <input
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <input
              name="category"
              value={product.category}
              onChange={handleChange}
              placeholder="Category"
            />
            <button type="submit">Add Product</button>
          </form>
        </aside>

        <section className="products-section" id="products-list">
          <h2>All Products</h2>
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            <ul>
              {products.map(p => (
                <li key={p._id} className="product-item">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
                  <div className="product-info">
                    <div>
                      <strong>{p.name}</strong>
                      <span className="price">${p.price}</span>
                      <span className="category">{p.category}</span>
                    </div>
                    <small>{p.description}</small>
                  </div>
                  <button onClick={() => handleDelete(p._id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AddProduct;
