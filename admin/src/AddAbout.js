import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAbout.css';

function AddAbout() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [externalLinks, setExternalLinks] = useState(['']);

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

 const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  formData.append('text', text);

  // NEW: send media order
  media.forEach((url) => {
    formData.append('mediaOrder', url);
  });

  for (let i = 0; i < newFiles.length; i++) {
    formData.append('media', newFiles[i]);
  }

  externalLinks
    .filter(link => link.trim() !== '')
    .forEach(link => {
      formData.append('externalLinks', link);
    });

  try {
    await axios.put(
      'https://blum-backend.onrender.com/about',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    alert('About section updated!');
const res = await axios.get('https://blum-backend.onrender.com/about');
setMedia(res.data.media || []);

  } catch (error) {
    console.error(error);
    alert('Error updating about section');
  }
};



const handleDeleteMedia = async (url) => {
  try {
    await axios.delete(
      'https://blum-backend.onrender.com/about/media',
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        data: { url }, // <-- IMPORTANT: axios.delete needs data here
      }
    );

    setMedia((prev) => prev.filter((item) => item !== url));
  } catch (error) {
    console.error('Delete error:', error.response?.data || error);
    alert('Failed to delete file');
  }
};
 


  return (
    <div className="add-about-container">
      <h2 className="section-title">Edit About Section</h2>
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
        <div className="form-group">
  <label>Add external media links:</label>
  {externalLinks.map((link, index) => (
    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
      <input
        type="text"
        placeholder="link..."
        value={link}
        onChange={(e) => {
          const newLinks = [...externalLinks];
          newLinks[index] = e.target.value;
          setExternalLinks(newLinks);
        }}
        style={{ flex: 1, marginRight: '0.5rem' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          type="button"
          disabled={index === 0}
          onClick={() => {
            const newLinks = [...externalLinks];
            [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
            setExternalLinks(newLinks);
          }}
          style={{ marginBottom: '2px', fontSize: '0.75rem' }}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={index === externalLinks.length - 1}
          onClick={() => {
            const newLinks = [...externalLinks];
            [newLinks[index + 1], newLinks[index]] = [newLinks[index], newLinks[index + 1]];
            setExternalLinks(newLinks);
          }}
          style={{ fontSize: '0.75rem' }}
        >
          ↓
        </button>
      </div>
    </div>
  ))}
  <button
    type="button"
    onClick={() => setExternalLinks([...externalLinks, ''])}
    style={{ marginTop: '0.5rem' }}
  >
    + Add Another Link
  </button>
</div>



        <div className="form-group">
          <label>Upload New Images or Videos:</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setNewFiles(e.target.files)}
          />
        </div>

        <button type="submit" className="submit-button">
          Save
        </button>
      </form>

      <h3 className="section-subtitle">Current About Section:</h3>
      <p className="about-text">{text}</p>
        <h4 className="section-subtitle">Current External Links:</h4>
<ul className="external-links-list">
  {externalLinks.filter(link => link.trim() !== '').map((link, index) => (
    <li key={index}>
      <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
    </li>
  ))}
</ul>

    <h4 className="section-subtitle">Current Media:</h4>

<div className="media-grid">
  {media.map((url, index) => {
    const isVideo = url.match(/\.(mp4|webm|ogg)(\?|$)/i);

    return (
      <div key={url} className="media-item">
        {isVideo ? (
          <video src={url} controls width="150" />
        ) : (
          <img src={url} alt="About media" width="150" />
        )}

        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => moveMediaUp(index)}
          >
            ↑
          </button>

          <button
            type="button"
            disabled={index === media.length - 1}
            onClick={() => moveMediaDown(index)}
          >
            ↓
          </button>
        </div>

        <button
          onClick={() => handleDeleteMedia(url)}
          className="delete-button"
          style={{ marginTop: '0.5rem' }}
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
