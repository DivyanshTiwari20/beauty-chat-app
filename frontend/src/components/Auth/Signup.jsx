import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', {
        username,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      console.error('Signup Error:', err);
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#ffe6e6',
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
          Signup
        </Typography>
        <form onSubmit={handleSignup}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
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
            Signup
          </Button>
        </form>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#b30000', textDecoration: 'none' }}>
            Login
          </a>
        </Typography>
      </Paper>
    </Box>
  );
}
