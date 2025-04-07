import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      // Redirect to chat page after login
      navigate('/chat');
    } catch (err) {
      console.error('Login Error:', err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };
  
  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#ffe6e6', // light pink background
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
          <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#b30000', mb: 2 }}>
            Login
          </Button>
        </form>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: '#b30000', textDecoration: 'none' }}>
            Sign up
          </a>
        </Typography>
      </Paper>
    </Box>
  );
}
