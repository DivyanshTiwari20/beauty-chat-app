import { useState } from 'react';
import { TextField, Button, Box, Stack } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login successful:', response.data);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect to upload page
      navigate('/upload');
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Stack spacing={3}>
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
          Login
        </Button>
      </Stack>
    </Box>
  );
}