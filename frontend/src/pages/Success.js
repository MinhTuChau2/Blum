// src/pages/Success.js
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import soulfulSong from '../assets/1.wav';
import './Success.css'; // Import the CSS

const Success = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`success-container ${isPlaying ? 'playing-bg' : ''}`}>
      <h1>Order Successful!</h1>
      <p>Your order just hit the high note and is rocking its way to us! Thanks for jamming with our shop!</p>

      <Link to="/" style={{ textDecoration: 'none', color: '#4CAF50', fontWeight: 'bold' }}>
        Back to Home
      </Link>

      <audio ref={audioRef} src={soulfulSong} />

      <button
  onClick={togglePlay}
  style={{
   
   marginTop: '20px',
    padding: '10px 20px',
    fontSize: '20px',
    backgroundColor: '#6A4C93',
    color: 'white',
    border: '2px solid black',
    borderRadius: '10px',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  }}
>
  {isPlaying ? 'Pause 🔇' : 'Play 🔊'}
</button>

    </div>
  );
};

export default Success;
