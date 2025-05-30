import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAbout.css';

function AddAbout() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [externalLinks, setExternalLinks] = useState(['']);


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
  
  for (let i = 0; i < newFiles.length; i++) {
    formData.append('media', newFiles[i]);
  }

  // Append externalLinks as multiple entries (not as a JSON string)
  externalLinks.filter(link => link.trim() !== '').forEach(link => {
    formData.append('externalLinks', link);
  });

  try {
    await axios.put('https://blum-backend.onrender.com/about', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    alert('About section updated!');
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert('Error updating about section');
  }
};


  const handleDeleteMedia = async (filename) => {
    try {
      await axios.delete(`https://blum-backend.onrender.com/about/media/${filename}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMedia(media.filter((item) => item !== filename));
    } catch (error) {
      console.error('Error deleting media:', error);
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
        {media.map((file) => {
          const isVideo = file.match(/\.(mp4|webm|ogg)$/i);
          return (
            <div key={file} className="media-item">
              {isVideo ? (
                <video src={`https://blum-backend.onrender.com/uploads/about/${file}`} controls width="150" />
              ) : (
                <img src={`https://blum-backend.onrender.com/uploads/about/${file}`} alt="" width="150" />
              )}
              <button onClick={() => handleDeleteMedia(file)} className="delete-button">
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
