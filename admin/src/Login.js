import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setAuth }) => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    setLoginSuccess('');

    try {
      const res = await axios.post('http://localhost:5000/login', {
        username: loginUsername.trim(),
        password: loginPassword.trim(),
      });

      localStorage.setItem('token', res.data.token);
      setAuth(true);
      setLoginUsername('');
      setLoginPassword('');
      setLoginSuccess('Login successful!');
    } catch (err) {
      if (err.response?.status === 401) {
        setLoginError('Invalid username or password');
      } else {
        setLoginError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formStyle = {
    maxWidth: 600,
    margin: 'auto',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
  };

  const inputStyle = {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: 16,
    cursor: loading ? 'not-allowed' : 'pointer',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: 4,
  };

  return (
    <div style={formStyle}>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
          autoComplete="username"
          style={inputStyle}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {loginError && <p style={{ color: 'red', marginTop: 10 }}>{loginError}</p>}
        {loginSuccess && <p style={{ color: 'green', marginTop: 10 }}>{loginSuccess}</p>}
      </form>
    </div>
  );
};

export default Login;
