import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      navigate('/chat');
    } catch (err) {
      console.error('Login Error:', err);
      alert(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url(/bg.jpg)', // Ensure this image is in your public folder
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: '98vw',
        minHeight: '93vh',
        bgcolor: 'rgba(255, 230, 230, 0.7)', // Light pink with transparency
        backdropFilter: 'blur(8px)', // Apply blur effect
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: { xs: '95%', sm: '400px' },
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ color: '#b30000', textAlign: 'center', mb: 2 }}>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ bgcolor: '#b30000', mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#b30000' }} /> : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/signup" style={{ color: '#b30000', textDecoration: 'none' }}>
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
