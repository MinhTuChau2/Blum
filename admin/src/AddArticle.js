import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddArticle.css';
const AddArticle = () => {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all articles
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/articles');
      setArticles(res.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newArticle = { title, content, author };

    try {
      await axios.post('http://localhost:5000/articles', newArticle);
      setMessage('✅ Article added!');
      setTitle('');
      setContent('');
      setAuthor('');
      fetchArticles();
    } catch (err) {
      console.error('Error adding article:', err);
      setMessage('❌ Could not add article');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/articles/${id}`);
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
      {message && <p style={{ color: 'green' }}>{message}</p>}

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
        <textarea
          placeholder="Content"
          value={content}
          required
          onChange={(e) => setContent(e.target.value)}
          style={styles.textarea}
        />
        <button type="submit" style={styles.button}>Add Article</button>
      </form>

      <h3>Articles List</h3>
      {articles.length === 0 ? (
        <p>No articles available.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {articles.map((article) => (
            <li key={article.id || article._id} style={styles.article}>
              <h4>{article.title}</h4>
              <p><strong>Author:</strong> {article.author}</p>
              <p>{article.content}</p>
              <button onClick={() => handleDelete(article.id || article._id)} style={styles.deleteButton}>
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
