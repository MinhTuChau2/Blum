import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddArticle.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

const AddArticle = () => {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data.imageUrl);
      setMessage('✅ Image uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err);
      setMessage('❌ Failed to upload image');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article._id);
    setTitle(article.title || '');
    setAuthor(article.author || '');
    setContent(article.content || '');
    setImage(article.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setContent('');
    setImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      setMessage('⏳ Please wait until the image is done uploading...');
      return;
    }

    const articleData = {
      title,
      content,
      author,
      image: image || '',
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={styles.input}
        />
        {isUploading && <p style={{ fontSize: '0.9rem', color: 'orange' }}>⏳ Uploading image...</p>}
        {image && !isUploading && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'green' }}>✅ Image set</p>
            <img src={image} alt="Preview" style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
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

      <h3>Articles List</h3>
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {[...articles]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((article) => (
              <li key={article._id} style={styles.article}>
                <h4>{article.title}</h4>
                <p><strong>Author:</strong> {article.author}</p>
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    style={{
                      width: '100%',
                      maxHeight: '250px',
                      objectFit: 'cover',
                      marginBottom: '1rem',
                      borderRadius: '4px',
                    }}
                  />
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
            ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
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
