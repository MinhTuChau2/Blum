import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddArticle.css';

const AddArticle = () => {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get('https://blum-backend.onrender.com/articles');
      setArticles(res.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await axios.post('https://blum-backend.onrender.com/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data.imageUrl); // assuming the backend returns { imageUrl: '...' }
      setMessage('✅ Image uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err);
      setMessage('❌ Failed to upload image');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) {
      setMessage('⏳ Please wait until the image is done uploading...');
      return;
    }

    const newArticle = {
      title,
      content,
      author,
      image: image || '', // Always include image, even if empty
    };

    try {
      await axios.post('https://blum-backend.onrender.com/articles', newArticle);
      setMessage('✅ Article added!');
      setTitle('');
      setContent('');
      setAuthor('');
      setImage('');
      fetchArticles();
    } catch (err) {
      console.error('Error adding article:', err);
      setMessage('❌ Could not add article');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://blum-backend.onrender.com/articles/${id}`);
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
      <h2>Add Article</h2>
      {message && <p style={{ color: message.startsWith('✅') ? 'green' : message.startsWith('🗑️') ? 'orange' : 'red' }}>{message}</p>}

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
          <p style={{ fontSize: '0.9rem', color: 'green' }}>✅ Image uploaded</p>
        )}
        <textarea
          placeholder="Content"
          value={content}
          required
          onChange={(e) => setContent(e.target.value)}
          style={styles.textarea}
        />
        <button type="submit" style={styles.button} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Add Article'}
        </button>
      </form>

      <h3>Articles List</h3>
     {articles.length === 0 ? (
  <p>No articles available.</p>
) : (
  <ul style={{ listStyle: 'none', padding: 0 }}>
    {[...articles]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
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
              }}
            />
          )}
          {article.content.split('\n\n').map((paragraph, idx) => (
  <p key={idx}>{paragraph}</p>
))}

          <button
            onClick={() => handleDelete(article._id)}
            style={styles.deleteButton}
          >
            Delete
          </button>
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
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    height: '100px',
    marginBottom: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
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
