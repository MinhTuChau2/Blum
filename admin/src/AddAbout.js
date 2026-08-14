import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAbout.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

function AddAbout() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [externalLinks, setExternalLinks] = useState(['']);
  const [loading, setLoading] = useState(false);

  // Move link up/down
  const moveLinkUp = (index) => {
    if (index === 0) return;
    setExternalLinks((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const moveLinkDown = (index) => {
    setExternalLinks((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
      return updated;
    });
  };

  const handleRemoveLink = (index) => {
    setExternalLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const getPlatformBadge = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (lower.includes('spotify.com')) return { label: '🎵 Spotify', color: '#1db954' };
    if (lower.includes('tiktok.com')) return { label: '🎥 TikTok', color: '#000000' };
    if (lower.includes('instagram.com')) return { label: '📸 Instagram', color: '#e1306c' };
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { label: '▶️ YouTube', color: '#ff0000' };
    return { label: '🔗 Link', color: '#666666' };
  };

  // Move media up/down
  const moveMediaUp = (index) => {
    if (index === 0) return;
    setMedia((prev) => {
      const updated = [...prev];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated;
    });
  };

  const moveMediaDown = (index) => {
    setMedia((prev) => {
      if (index === prev.length - 1) return prev;
      const updated = [...prev];
      [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
      return updated;
    });
  };

  // Fetch About section
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${API_BASE}/about`);
        setText(res.data.text || '');
        setMedia(res.data.media || []);
        setExternalLinks(res.data.externalLinks && res.data.externalLinks.length > 0 ? res.data.externalLinks : ['']);
      } catch (err) {
        console.error('Error loading about:', err);
      }
    };
    fetchAbout();
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', text);

    // Append existing media in current order
    media.forEach((url) => formData.append('mediaOrder', url));

    // Append new files
    newFiles.forEach((file) => formData.append('media', file));

    // Append external links in current order
    externalLinks
      .filter((link) => link.trim() !== '')
      .forEach((link) => formData.append('externalLinks', link));

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_BASE}/about`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMedia(res.data.media || []);
      setText(res.data.text || '');
      setExternalLinks(res.data.externalLinks && res.data.externalLinks.length > 0 ? res.data.externalLinks : ['']);
      setNewFiles([]);
      setLoading(false);
      alert('About section updated!');
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Error updating About section');
    }
  };

  // Delete media
  const handleDeleteMedia = async (url) => {
    try {
      await axios.delete(`${API_BASE}/about/media`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { url },
      });
      setMedia((prev) => prev.filter((item) => item !== url));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file');
    }
  };

  return (
    <div className="add-about-container">
      <h2>Edit About Section</h2>
      <form onSubmit={handleSubmit} className="about-form">
        <div className="form-group">
          <label>Introduction Text:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            cols={50}
          />
        </div>

        {/* External Links */}
        <div className="form-group external-links-section">
          <label className="section-label">External Media Links (TikTok, Instagram, Spotify, YouTube):</label>
          
          <div className="external-links-list">
            {externalLinks.map((link, index) => {
              const platform = getPlatformBadge(link);
              return (
                <div key={index} className="external-link-card">
                  <span className="link-number">#{index + 1}</span>
                  
                  <div className="link-input-wrapper">
                    <input
                      type="text"
                      placeholder="Paste link (e.g. https://open.spotify.com/..., https://tiktok.com/...)"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...externalLinks];
                        newLinks[index] = e.target.value;
                        setExternalLinks(newLinks);
                      }}
                      className="link-input"
                    />
                    {platform && link.trim() !== '' && (
                      <span className="platform-tag" style={{ backgroundColor: platform.color }}>
                        {platform.label}
                      </span>
                    )}
                  </div>

                  <div className="link-actions">
                    <button
                      type="button"
                      className="arrow-btn"
                      disabled={index === 0}
                      onClick={() => moveLinkUp(index)}
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="arrow-btn"
                      disabled={index === externalLinks.length - 1}
                      onClick={() => moveLinkDown(index)}
                      title="Move Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="delete-link-btn"
                      onClick={() => handleRemoveLink(index)}
                      title="Remove Link"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="add-link-btn"
            onClick={() => setExternalLinks([...externalLinks, ''])}
          >
            + Add Another External Link
          </button>
        </div>

        {/* Upload New Media */}
        <div className="form-group">
          <label>Upload New Gallery Images or Videos:</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Saving...' : 'Save All Changes'}
        </button>
      </form>

      <h3>Current About Section:</h3>
      <p>{text}</p>

      <h4>Current Media Gallery:</h4>
      <div className="media-grid">
        {media.map((url, index) => {
          const isVideo = url.match(/\.(mp4|webm|ogg)(\?|$)/i);
          return (
            <div key={`${url}-${index}`} className="media-item">
              {isVideo ? <video src={url} controls width="150" /> : <img src={url} alt="About media" width="150" />}
              
              <div className="media-controls">
                <button
                  type="button"
                  className="arrow-btn"
                  disabled={index === 0}
                  onClick={() => moveMediaUp(index)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="arrow-btn"
                  disabled={index === media.length - 1}
                  onClick={() => moveMediaDown(index)}
                >
                  ↓
                </button>
              </div>

              <button
                className="delete-btn"
                onClick={() => handleDeleteMedia(url)}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AddAbout;
