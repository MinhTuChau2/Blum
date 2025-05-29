import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get('https://blum-backend.onrender.com/articles');
        const processedArticles = res.data
          .map(article => ({
            ...article,
            image: article.image && !article.image.startsWith('http')
              ? `https://blum-backend.onrender.com/${article.image}`
              : article.image
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // ✅ Sort by newest
        setArticles(processedArticles);
      } catch (err) {
        console.error(err);
        setError('Failed to load articles');
      }
    };

    fetchArticles();
  }, []);

  const toggleExpand = (id) => {
    setExpandedArticleId(prevId => (prevId === id ? null : id));
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '1rem' }}>
      <h2 style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '1rem' }}>Articles</h2>

      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '0.6rem',
          marginBottom: '2rem',
          fontSize: '1rem',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {filteredArticles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        filteredArticles.map(article => {
          const isExpanded = expandedArticleId === article._id;
          const previewContent = article.content.slice(0, 200) + (article.content.length > 200 ? '...' : '');

          return (
            <div key={article._id} style={styles.article}>
              <h3 style={styles.title}>{article.title}</h3>
              <p style={styles.author}><strong>Author:</strong> {article.author}</p>

              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  style={styles.image}
                />
              )}

              <p style={styles.content}>
                {isExpanded ? article.content : previewContent}
              </p>
              {article.content.length > 200 && (
                <button onClick={() => toggleExpand(article._id)} style={styles.readMoreBtn}>
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

const styles = {
  article: {
    border: '2px solid #333',
    borderRadius: '8px',
    backgroundColor: 'white',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  author: {
    fontSize: '0.95rem',
    marginBottom: '1rem',
    color: '#555',
  },
  content: {
    fontSize: '1rem',
    lineHeight: '1.6',
    textAlign: 'justify',
    color: '#444',
  },
  readMoreBtn: {
    marginTop: '1rem',
    backgroundColor: 'black',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: 'auto',
    marginBottom: '1rem',
    borderRadius: '8px',
    objectFit: 'cover',
  }
};

export default ArticlesList;
