import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Send } from '@mui/icons-material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// Component to render Markdown text
function AnalysisOutput({ markdownText }) {
  return (
    <div style={{ width: '100%', wordBreak: 'break-word' }}>
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/analysis/upload`, formData, {
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
        `${import.meta.env.VITE_API_URL}/api/analysis/analyze`,
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
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff5f5',
        maxWidth: '800px',
        margin: '0 auto',
        // borderLeft: { xs: 'none', md: '1px solid #f0f0f0' },
        // borderRight: { xs: 'none', md: '1px solid #f0f0f0' },
      }}
    >
      {/* Header */}
      <Box
  sx={{
    p: 2,
    borderBottom: '1px solid #f2f2f2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#ffffff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}
>
  <Typography
    variant="h6"
    sx={{ 
      color: '#e91e63', 
      fontWeight: 600,
      fontSize: '1.1rem',
      textAlign: 'center' 
    }}
  >
    Kaya_AI
  </Typography>
</Box>

      {/* Chat area */}
      <Box
        ref={chatListRef}
        sx={{
          fflexGrow: 1,
          p: 2,
          pb: '70px', // Add padding at bottom to account for fixed input area
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#ffffff',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {chatHistory.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              opacity: 0.7,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #f2f2f2',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#ffffff',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
              }}
            >
              <Typography variant="h5" sx={{ color: 'white' }}>KA</Typography>
            </Box>
            <Typography variant="body1" sx={{ color: '#666' }}>
              How can I assist with your skin today?
            </Typography>
          </Box>
        )}

        {chatHistory.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <Box
              sx={{
                maxWidth: '75%',
                p: 2,
                borderRadius: 2,
                bgcolor: 
                  msg.type === 'user'
                    ? '#ffe6ea'
                    : msg.type === 'ai'
                    ? '#f8f9fa'
                    : '#fff8e1',
                boxShadow: msg.type !== 'system' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                border: msg.type === 'ai' ? '1px solid #eaeaea' : 'none',
              }}
            >
              {msg.type === 'user' ? (
                <Typography variant="body1" sx={{ color: '#333' }}>
                  {msg.content}
                </Typography>
              ) : msg.type === 'ai' ? (
                <AnalysisOutput markdownText={msg.content} />
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                  {msg.content}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} sx={{ color: '#e91e63' }} />
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #f2f2f2',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#ffffff',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          maxWidth: '700px',
          margin: '0 auto',
          zIndex: 10,
          boxSizing: 'border-box'
        }}
      >
        <TextField
          fullWidth
          placeholder="Ask about your skin..."
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          InputProps={{
            endAdornment: (
              <IconButton component="label" sx={{ color: '#e91e63' }}>
                <PhotoCamera />
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />
              </IconButton>
            ),
            sx: {
              borderRadius: '24px',
              bgcolor: '#f8f9fa',
              '&.MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#e91e63',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e91e63',
                },
              },
            },
          }}
          sx={{
            '& .MuiFormLabel-root.Mui-focused': {
              color: '#e91e63',
            },
          }}
        />
        <IconButton 
          onClick={handleSend} 
          disabled={!message.trim() || loading}
          sx={{ 
            bgcolor: '#e91e63',
            color: 'white',
            width: 44,
            height: 44,
            '&:hover': {
              bgcolor: '#d81b60',
            },
            '&.Mui-disabled': {
              bgcolor: '#fce4ec',
              color: '#f8bbd0',
            }
          }}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
}