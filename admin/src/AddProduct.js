import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddProduct.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    images: [],
    category: '',
    isSoldOut: false
  });

  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products`);
      setProducts(Array.isArray(res.data) ? res.data : res.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProduct({ ...product, [e.target.name]: value });
  };

  const handleEdit = (p) => {
    const existingImages = p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []);
    setProduct({
      name: p.name || '',
      price: p.price || '',
      description: p.description || '',
      imageUrl: p.imageUrl || (existingImages[0] || ''),
      images: existingImages,
      category: p.category || '',
      isSoldOut: !!p.isSoldOut
    });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProduct({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      images: [],
      category: '',
      isSoldOut: false
    });
  };

  const handleToggleSoldOut = async (p) => {
    try {
      const updated = { ...p, isSoldOut: !p.isSoldOut };
      await axios.put(`${API_BASE}/products/${p._id}`, updated);
      fetchProducts();
    } catch (error) {
      alert('❌ Failed to update status');
    }
  };

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    setIsUploading(true);
    try {
      const res = await axios.post(`${API_BASE}/upload-multiple`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newUrls = res.data.imageUrls || [];
      setProduct(prev => {
        const updatedImages = [...(prev.images || []), ...newUrls];
        return {
          ...prev,
          images: updatedImages,
          imageUrl: prev.imageUrl || updatedImages[0] || ''
        };
      });
    } catch (error) {
      console.error('Multiple image upload failed:', error);
      alert('❌ Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setProduct(prev => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updatedImages,
        imageUrl: updatedImages[0] || ''
      };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (isUploading) {
      alert('⏳ Please wait until image uploads finish...');
      return;
    }

    try {
      const finalImages = product.images || [];
      const productToSend = { 
        ...product, 
        price: product.price ? Number(product.price) : 0,
        images: finalImages,
        imageUrl: finalImages[0] || product.imageUrl || '',
        isSoldOut: !!product.isSoldOut
      };

      if (editingId) {
        await axios.put(`${API_BASE}/products/${editingId}`, productToSend);
        alert('✏️ Product updated!');
      } else {
        await axios.post(`${API_BASE}/products`, productToSend);
        alert('✅ Product added!');
      }

      cancelEdit();
      fetchProducts();
    } catch (error) {
      console.error('Save product error:', error.response?.data || error.message);
      alert('❌ Failed to save product: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE}/products/${id}`);
        alert('🗑️ Product deleted!');
        fetchProducts();
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
              placeholder="Product Name"
              required
            />
            <input
              name="price"
              type="number"
              step="0.01"
              value={product.price}
              onChange={handleChange}
              placeholder="Price ($)"
              required
            />
            <input
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <input
              name="category"
              value={product.category}
              onChange={handleChange}
              placeholder="Category (e.g. Clothes, Art, Accessories)"
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', cursor: 'pointer', padding: '8px 12px', background: product.isSoldOut ? '#fff0f0' : '#f0fff0', borderRadius: '6px', border: `1px solid ${product.isSoldOut ? '#ffcdd2' : '#c8e6c9'}` }}>
              <input
                type="checkbox"
                name="isSoldOut"
                checked={!!product.isSoldOut}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold', color: product.isSoldOut ? '#d32f2f' : '#2e7d32', fontSize: '0.95rem' }}>
                {product.isSoldOut ? '🔴 Product is SOLD OUT' : '🟢 Product is IN STOCK'}
              </span>
            </label>

            <label style={{ fontWeight: 'bold', marginTop: '14px', display: 'block' }}>
              Product Images (Upload Multiple):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageUpload}
              disabled={isUploading}
            />
            {isUploading && <p style={{ color: 'orange', fontSize: '0.85rem' }}>⏳ Uploading images...</p>}

            {/* Thumbnail previews */}
            {product.images && product.images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
                {product.images.map((imgUrl, index) => (
                  <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                    <img
                      src={imgUrl}
                      alt={`Product preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: index === 0 ? '2px solid #007bff' : '1px solid #ccc'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : editingId ? 'Update Product' : 'Add Product'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} style={{ backgroundColor: '#6c757d', color: 'white' }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="products-section" id="products-list">
          <h2>All Products</h2>
          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            <ul>
              {products.map(p => {
                const itemImages = p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []);
                return (
                  <li key={p._id} className="product-item" style={{ borderLeft: p.isSoldOut ? '5px solid #d32f2f' : '5px solid #2e7d32' }}>
                    {itemImages.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <img src={itemImages[0]} alt={p.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', filter: p.isSoldOut ? 'grayscale(50%)' : 'none' }} />
                        {itemImages.length > 1 && (
                          <span style={{ fontSize: '0.75rem', background: '#eee', padding: '2px 6px', borderRadius: '10px' }}>
                            +{itemImages.length - 1} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="product-info">
                      <div>
                        <strong>{p.name}</strong>
                        {p.isSoldOut && (
                          <span style={{ background: '#d32f2f', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                            SOLD OUT
                          </span>
                        )}
                        <span className="price">${p.price}</span>
                        <span className="category">{p.category}</span>
                      </div>
                      <small>{p.description}</small>
                    </div>
                    <button
                      onClick={() => handleToggleSoldOut(p)}
                      style={{
                        backgroundColor: p.isSoldOut ? '#28a745' : '#dc3545',
                        color: 'white',
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Quick toggle status"
                    >
                      {p.isSoldOut ? 'Mark In Stock' : 'Mark Sold Out'}
                    </button>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default AddProduct;
