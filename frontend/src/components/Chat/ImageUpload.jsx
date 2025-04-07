import { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ImageUpload() {
  const [files, setFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    try {
      const res = await axios.post('http://localhost:5000/api/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Uploaded:', res.data.imageUrls);
      setUploadMessage('Images uploaded successfully! Now head over to the chat to get your beauty tips.');
      // Optionally, automatically navigate to the chat page:
      navigate('/chat');
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Upload Your Images</Typography>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          multiple
          onChange={(e) => setFiles([...e.target.files])}
          className="block w-full"
        />
        <Button type="submit" variant="contained" color="primary">
          Upload Images
        </Button>
      </form>
      {uploadMessage && <Typography sx={{ mt: 2 }}>{uploadMessage}</Typography>}
    </Box>
  );
}
