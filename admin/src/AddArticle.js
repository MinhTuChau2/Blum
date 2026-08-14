import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddArticle.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

const AddArticle = () => {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/articles`);
      setArticles(res.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newUrls = res.data.imageUrls || [];
      setImages(prev => [...prev, ...newUrls]);
      setMessage('✅ Image(s) uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err);
      setMessage('❌ Failed to upload image(s)');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEdit = (article) => {
    setEditingId(article._id);
    setTitle(article.title || '');
    setAuthor(article.author || '');
    setContent(article.content || '');
    const existing = article.images && article.images.length > 0
      ? article.images
      : (article.image ? [article.image] : []);
    setImages(existing);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setContent('');
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      setMessage('⏳ Please wait until images finish uploading...');
      return;
    }

    const articleData = {
      title,
      content,
      author,
      image: images[0] || '',
      images: images,
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/articles/${editingId}`, articleData);
        setMessage('✅ Article updated successfully!');
      } else {
        await axios.post(`${API_BASE}/articles`, articleData);
        setMessage('✅ Article added!');
      }
      cancelEdit();
      fetchArticles();
    } catch (err) {
      console.error('Error saving article:', err);
      setMessage(editingId ? '❌ Could not update article' : '❌ Could not add article');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await axios.delete(`${API_BASE}/articles/${id}`);
      setMessage('🗑️ Article deleted');
      fetchArticles();
    } catch (err) {
      console.error('Error deleting article:', err);
      setMessage('❌ Could not delete article');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const moveArticleUp = async (index) => {
    if (index === 0) return;
    const updated = [...articles];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setArticles(updated);

    try {
      const orderedIds = updated.map(a => a._id);
      await axios.put(`${API_BASE}/articles/reorder`, { orderedIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Failed to save order:', err);
      fetchArticles();
    }
  };

  const moveArticleDown = async (index) => {
    if (index === articles.length - 1) return;
    const updated = [...articles];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    setArticles(updated);

    try {
      const orderedIds = updated.map(a => a._id);
      await axios.put(`${API_BASE}/articles/reorder`, { orderedIds }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Failed to save order:', err);
      fetchArticles();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>{editingId ? 'Edit Article' : 'Add Article'}</h2>
      {message && (
        <p style={{ color: message.startsWith('✅') ? 'green' : message.startsWith('🗑️') ? 'orange' : 'red' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          required
          onChange={(e) => setAuthor(e.target.value)}
          style={styles.input}
        />

        <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px', display: 'block' }}>
          Article Images (Upload Multiple):
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultipleImageUpload}
          style={styles.input}
          disabled={isUploading}
        />
        {isUploading && <p style={{ fontSize: '0.9rem', color: 'orange' }}>⏳ Uploading image(s)...</p>}

        {images.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
            {images.map((imgUrl, idx) => (
              <div key={idx} style={{ position: 'relative', width: '70px', height: '70px' }}>
                <img
                  src={imgUrl}
                  alt={`Preview ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: idx === 0 ? '2px solid #007bff' : '1px solid #ccc' }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
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

        <textarea
          placeholder="Content"
          value={content}
          required
          onChange={(e) => setContent(e.target.value)}
          style={styles.textarea}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={styles.button} disabled={isUploading}>
            {isUploading ? 'Uploading...' : editingId ? 'Update Article' : 'Add Article'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={styles.cancelButton}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3>Articles List (Use ↑ and ↓ to Reorder)</h3>
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {articles.map((article, index) => {
            const itemImages = article.images && article.images.length > 0
              ? article.images
              : (article.image ? [article.image] : []);

            return (
              <li key={article._id} style={styles.article}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 'bold', background: '#eee', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      #{index + 1}
                    </span>
                    <h4 style={{ margin: 0 }}>{article.title}</h4>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveArticleUp(index)}
                      style={{ ...styles.moveBtn, opacity: index === 0 ? 0.4 : 1, cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                      title="Move Article Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === articles.length - 1}
                      onClick={() => moveArticleDown(index)}
                      style={{ ...styles.moveBtn, opacity: index === articles.length - 1 ? 0.4 : 1, cursor: index === articles.length - 1 ? 'not-allowed' : 'pointer' }}
                      title="Move Article Down"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Author:</strong> {article.author}</p>
                
                {itemImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '1rem' }}>
                    {itemImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${article.title} ${idx + 1}`}
                        style={{
                          width: '120px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #eee'
                        }}
                      />
                    ))}
                  </div>
                )}

                  {article.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <button
                      onClick={() => handleEdit(article)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
};

const styles = {
  moveBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    height: '120px',
    marginBottom: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  article: {
    border: '1px solid #ddd',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
};

export default AddArticle;
