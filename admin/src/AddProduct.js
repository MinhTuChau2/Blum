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
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (product) => {
  setProduct({
    name: product.name,
    price: product.price,
    description: product.description,
    imageUrl: product.imageUrl,
    category: product.category
  });
  setEditingId(product._id);
};

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://blum-backend.onrender.com/products');
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
      const res = await axios.post('https://blum-backend.onrender.com/upload', formData, {
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
    const productToSend = { 
      ...product, 
      price: product.price ? Number(product.price) : 0,
      imageUrl: product.imageUrl || ''
    };

    if (editingId) {
      await axios.put(
        `https://blum-backend.onrender.com/products/${editingId}`,
        productToSend
      );
      alert('✏️ Product updated!');
    } else {
      await axios.post(
        'https://blum-backend.onrender.com/products',
        productToSend
      );
      alert('✅ Product added!');
    }

    setProduct({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      category: ''
    });
    setEditingId(null);
    fetchProducts();
  } catch (error) {
    console.error('Save product error:', error.response?.data || error.message);
    alert('❌ Failed to save product: ' + (error.response?.data?.error || error.message));
  }
};



  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://blum-backend.onrender.com/products/${id}`);
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
            <form onSubmit={handleSubmit}>
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
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
            <button type="submit">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
             {/* Cancel Edit button */}
            {editingId && (
              <button
                type="button"
                onClick={() => {
                setEditingId(null);
                setProduct({
                name: '',
                price: '',
                description: '',
                imageUrl: '',
                category: ''
          });
        }}
      >
        Cancel Edit
      </button>
    )}
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
                  <button onClick={() => handleEdit(p)}>Edit</button>
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
