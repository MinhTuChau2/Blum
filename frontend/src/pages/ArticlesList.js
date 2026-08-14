import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ArticleList.css';
import Orange from "../assets/ORNGE.png";

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

const ArticleImageCarousel = ({ images, title }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  if (!images || images.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 30) {
      setActiveIdx((prev) => (prev + 1) % images.length);
    } else if (diff < -30) {
      setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ marginBottom: '1rem' }}
    >
      <div className="carousel-main-image-wrapper">
        <img
          src={images[activeIdx]}
          alt={`${title} - view ${activeIdx + 1}`}
          style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="carousel-arrow left-arrow"
              onClick={handlePrev}
              title="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className="carousel-arrow right-arrow"
              onClick={handleNext}
              title="Next image"
            >
              ›
            </button>

            <div className="carousel-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`carousel-dot ${idx === activeIdx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(idx);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE}/articles`);

        const processedArticles = res.data
          .map(article => {
            const rawImages = article.images && article.images.length > 0
              ? article.images
              : (article.image ? [article.image] : []);

            const formattedImages = rawImages.map(img =>
              img && !img.startsWith('http') ? `${API_BASE}/${img}` : img
            );

            return {
              ...article,
              images: formattedImages
            };
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setArticles(processedArticles);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load articles');
        setLoading(false);
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <img
            src={Orange}
            alt="Loading..."
            className="flower-spinner"
          />
          <p>Waking up Render server... please wait 🌼</p>
        </div>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : filteredArticles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        filteredArticles.map(article => {
          const isExpanded = expandedArticleId === article._id;
          const previewContent = article.content.slice(0, 200) + (article.content.length > 200 ? '...' : '');

          return (
            <div key={article._id} style={styles.article}>
              <h3 style={styles.title}>{article.title}</h3>
              <p style={styles.author}><strong>Author:</strong> {article.author}</p>

              <ArticleImageCarousel images={article.images} title={article.title} />

              <div style={styles.content}>
                {(isExpanded ? article.content : previewContent)
                  .split('\n')
                  .map((para, index) => (
                    <p key={index} style={{ marginBottom: '1em' }}>
                      {para}
                    </p>
                  ))}
              </div>

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
};

export default ArticlesList;
