import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './About.css';

const About = () => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get('http://localhost:5000/about');
        setText(res.data.text || '');
        setMedia(res.data.media || []);
        setExternalLinks(res.data.externalLinks || []);
      } catch (err) {
        console.error('Error loading about content:', err);
      }
    };
    fetchAbout();
  }, []);

  // Re-load embed scripts whenever links are updated
  useEffect(() => {
    const loadScript = (src, id) => {
      if (document.getElementById(id)) return;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.id = id;
      document.body.appendChild(script);
    };

    if (externalLinks.some((link) => link.includes('tiktok.com'))) {
      loadScript('https://www.tiktok.com/embed.js', 'tiktok-embed-script');
    }
    if (externalLinks.some((link) => link.includes('instagram.com'))) {
      loadScript('https://www.instagram.com/embed.js', 'instagram-embed-script');
    }
  }, [externalLinks]);

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  const renderTikTokEmbed = (url) => {
    const match = url.match(/\/video\/(\d+)/);
    const videoId = match ? match[1] : null;
    if (!videoId) return null;

    return (
      <blockquote
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        style={{ width: '325px', margin: '1rem 0' }}
      >
        <section></section>
      </blockquote>
    );
  };

  const renderYouTubeEmbed = (url) => {
  let videoId = '';

  // Handle both standard and shortened YouTube URLs
  if (url.includes('youtube.com/watch?v=')) {
    videoId = new URL(url).searchParams.get('v');
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }

  if (!videoId) return null;

  return (
    <div style={{ marginTop: '1rem' }}>
      <iframe
        width="360"
        height="215"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};


  const renderInstagramEmbed = (url) => {
    return (
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          margin: '1rem 0',
          padding: 0,
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <a href={url} target="_blank" rel="noreferrer">
          View Instagram Post
        </a>
      </blockquote>
    );
  };

  return (
    <div className="about-container">
      <h2>About Blum</h2>
      <p style={{ whiteSpace: 'pre-line' }}>{text}</p>

      {/* Gallery Section */}
      {media.length > 0 && (
        <>
          <h3 style={{ marginTop: '2rem' }}>Gallery</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {media.map((item, index) => {
              const fileUrl = item.startsWith('http')
                ? item
                : `http://localhost:5000/uploads/about/${item}`;

              return (
                <div key={index}>
                  {isVideo(item) ? (
                    <video src={fileUrl} controls width="300" />
                  ) : (
                    <img src={fileUrl} alt="" width="300" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* External Links and Embeds */}
      {externalLinks.length > 0 && (
        <>
          <h3 style={{ marginTop: '2rem' }}>Digital Footprints</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <ul className="embed-grid">
            {externalLinks.map((link, index) => {
              const cleanLink = link.replace(/^"+|"+$/g, '');
              return (
                <li key={index} style={{ marginBottom: '2rem' }}>
                  
                  {cleanLink.includes('tiktok.com') && renderTikTokEmbed(cleanLink)}
                  {cleanLink.includes('instagram.com') && renderInstagramEmbed(cleanLink)}
                {(cleanLink.includes('youtube.com') || cleanLink.includes('youtu.be')) &&
              renderYouTubeEmbed(cleanLink)}
                </li>
              );
            })}
            </ul>
            </ul>
        </>
      )}
    </div>
  );
};

export default About;
