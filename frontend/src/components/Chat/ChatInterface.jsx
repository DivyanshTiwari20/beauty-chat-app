import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Paper,
  Avatar,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// Component to render Markdown text
function AnalysisOutput({ markdownText }) {
  return (
    <div style={{ maxWidth: '70%', wordBreak: 'break-word' }}>
      <ReactMarkdown>{markdownText}</ReactMarkdown>
    </div>
  );
}

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatListRef = useRef(null);

  // Persist chat history and auto-scroll to bottom
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle image upload (exactly 3 images)
  const handleImageUpload = async (files) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }
    if (!files || files.length !== 3) {
      alert('Please select exactly 3 images.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    try {
      await axios.post('http://localhost:5000/api/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setChatHistory((prev) => [
        ...prev,
        { type: 'system', content: 'Images uploaded successfully! You can now ask your question.' },
      ]);
    } catch (err) {
      console.error('Upload Error:', err);
      alert(err.response?.data?.error || 'Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending chat message
  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/analysis/analyze',
        { question: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', content: message },
        { type: 'ai', content: response.data.tips },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change from upload icon
  const handleFileChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: '#ffe6e6', // Light pink background
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        px: 1,
      }}
    >
      <Typography variant="h4" sx={{ color: '#b30000', mb: 2, textAlign: 'center' }}>
        Beauty Chat
      </Typography>
      <Paper
        sx={{
          // Adjust the width here to make the chat area wider (e.g., md: '800px' for wider screens)
          width: { xs: '95%', sm: '90%', md: '800px' },
          // Use a maxHeight relative to viewport height to avoid outer scrolling
          maxHeight: 'calc(100vh - 200px)',
          bgcolor: '#fff0f0', // Off-white pink
          borderRadius: 3,
          p: 2,
          mb: 2,
          overflowY: 'auto', // Scrolling only on the chat messages
        }}
        ref={chatListRef}
      >
        <List>
          {chatHistory.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
                borderRadius: 2,
                backgroundColor:
                  msg.type === 'user'
                    ? '#fde0dc'
                    : msg.type === 'ai'
                    ? '#ffebee'
                    : '#fff3e0',
                p: 1,
              }}
            >
              {msg.type !== 'system' && (
                <Avatar sx={{ bgcolor: msg.type === 'user' ? '#b71c1c' : '#757575', mr: 1 }}>
                  {msg.type === 'user' ? 'U' : 'AI'}
                </Avatar>
              )}
              {msg.type === 'user' ? (
                <Box sx={{ maxWidth: '70%', wordBreak: 'break-word' }}>{msg.content}</Box>
              ) : msg.type === 'ai' ? (
                <AnalysisOutput markdownText={msg.content} />
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
                  {msg.content}
                </Typography>
              )}
            </ListItem>
          ))}
          {loading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <CircularProgress color="secondary" />
            </ListItem>
          )}
        </List>
      </Paper>
      <Box
        sx={{
          width: { xs: '95%', sm: '90%', md: '800px' },
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          mb: 2,
        }}
      >
        <TextField
          fullWidth
          label="Ask about your skin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton component="label">
                  <PhotoCamera />
                  <input hidden accept="image/*" type="file" multiple onChange={handleFileChange} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: 1,
          }}
        />
        <Button variant="contained" onClick={handleSend} sx={{ height: '56px', bgcolor: '#b30000' }}>
          Send
        </Button>
      </Box>
    </Box>
  );
}
