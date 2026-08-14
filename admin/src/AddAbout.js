import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddAbout.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://blum-backend.onrender.com';

function AddAbout() {
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [externalLinks, setExternalLinks] = useState(['']);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // New project state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [isUploadingProjectImg, setIsUploadingProjectImg] = useState(false);

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
        const res = await axios.get(`${API_BASE}/about`);
        setText(res.data.text || '');
        setMedia(res.data.media || []);
        setExternalLinks(res.data.externalLinks || ['']);
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error('Error loading about:', err);
      }
    };
    fetchAbout();
  }, []);

  // Upload image for project
  const handleProjectImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    setIsUploadingProjectImg(true);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProjectImage(res.data.imageUrl);
    } catch (err) {
      console.error('Project image upload failed:', err);
      alert('Failed to upload project image');
    } finally {
      setIsUploadingProjectImg(false);
    }
  };

  // Add project to list
  const handleAddProject = () => {
    if (!projectTitle.trim()) {
      alert('Please enter a project title');
      return;
    }
    const newProj = {
      title: projectTitle,
      description: projectDesc,
      link: projectLink,
      image: projectImage,
    };
    setProjects(prev => [...prev, newProj]);
    setProjectTitle('');
    setProjectDesc('');
    setProjectLink('');
    setProjectImage('');
  };

  const handleDeleteProject = (index) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

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

    // Append projects as JSON string
    formData.append('projects', JSON.stringify(projects));

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
      setExternalLinks(res.data.externalLinks || []);
      setProjects(res.data.projects || []);
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

        {/* My Projects Section */}
        <div className="form-group" style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>🎨 My Projects (Displays Above Gallery)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
            <textarea
              placeholder="Project Description..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              rows={3}
            />
            <input
              type="text"
              placeholder="Project External Link / Website (optional)"
              value={projectLink}
              onChange={(e) => setProjectLink(e.target.value)}
            />
            <div>
              <label style={{ fontSize: '0.85rem' }}>Project Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProjectImageUpload}
                disabled={isUploadingProjectImg}
              />
              {isUploadingProjectImg && <p style={{ color: 'orange', fontSize: '0.85rem' }}>Uploading...</p>}
              {projectImage && (
                <img src={projectImage} alt="Project Preview" style={{ width: '80px', height: '60px', objectFit: 'cover', marginTop: '5px', borderRadius: '4px' }} />
              )}
            </div>
            <button type="button" onClick={handleAddProject} disabled={isUploadingProjectImg} style={{ backgroundColor: '#28a745', color: '#fff', padding: '0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              + Add Project
            </button>
          </div>

          {/* Current Projects List */}
          {projects.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Current Added Projects ({projects.length}):</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {projects.map((proj, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0.5rem', borderRadius: '4px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {proj.image && <img src={proj.image} alt={proj.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div>
                        <strong>{proj.title}</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{proj.description}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleDeleteProject(idx)} style={{ background: 'red', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          <label>Upload New Gallery Images or Videos:</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
          />
        </div>

        <button type="submit" disabled={loading}>
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
