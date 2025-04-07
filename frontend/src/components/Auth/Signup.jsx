// components/Auth/Signup.jsx
import { useState } from 'react';
import { TextField, Button, Box, Stack } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData, {
        headers: {
          'Content-Type': 'application/json' // Explicitly set JSON header
        }
      });
      console.log('Signup successful:', res.data);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Username"
          required
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <Button type="submit" variant="contained" fullWidth>
          Sign Up
        </Button>
      </Stack>
    </Box>
  );
}