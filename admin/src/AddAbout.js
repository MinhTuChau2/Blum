import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAbout.css';

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
        const res = await axios.get('https://blum-backend.onrender.com/about');
        setText(res.data.text || '');
        setMedia(res.data.media || []);
        setExternalLinks(res.data.externalLinks || ['']);
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
        'https://blum-backend.onrender.com/about',
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
      setExternalLinks(res.data.externalLinks || []);
      setNewFiles([]);
      setLoading(false);
      alert('About section updated!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Error updating About section');
    }
  };

  // Delete media
  const handleDeleteMedia = async (url) => {
    try {
      await axios.delete('https://blum-backend.onrender.com/about/media', {
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
        <div className="form-group">
          <label>Add external media links:</label>
          {externalLinks.map((link, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder="link..."
                value={link}
                onChange={(e) => {
                  const newLinks = [...externalLinks];
                  newLinks[index] = e.target.value;
                  setExternalLinks(newLinks);
                }}
                style={{ flexGrow: 1 }}
              />
              <button type="button" disabled={index === 0} onClick={() => moveLinkUp(index)}>↑</button>
              <button type="button" disabled={index === externalLinks.length - 1} onClick={() => moveLinkDown(index)}>↓</button>
            </div>
          ))}
          <button type="button" onClick={() => setExternalLinks([...externalLinks, ''])}>
            + Add Another Link
          </button>
        </div>

        {/* Upload New Media */}
        <div className="form-group">
          <label>Upload New Images or Videos:</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>

      <h3>Current About Section:</h3>
      <p>{text}</p>

      <h4>Current External Links:</h4>
      <ul>
        {externalLinks.filter((link) => link.trim() !== '').map((link, index) => (
          <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
        ))}
      </ul>

      <h4>Current Media:</h4>
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
