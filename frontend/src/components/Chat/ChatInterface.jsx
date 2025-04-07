import { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Avatar,
  Box,
  Typography
} from '@mui/material';
import axios from 'axios';

export default function ChatInterface() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  // Optionally, if you need to store image URLs locally (e.g., if not using the user document), you can add state for that.
  // const [images, setImages] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/analysis/analyze',
        { question: message },  // only send the question
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatHistory((prev) => [
        ...prev,
        { type: 'user', content: message },
        { type: 'ai', content: response.data.tips }
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Analysis failed');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Beauty Chat</Typography>
      <Paper elevation={3} sx={{ p: 2, height: '60vh', overflowY: 'auto' }}>
        <List>
          {chatHistory.map((msg, index) => (
            <ListItem key={index} sx={{ 
              justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: msg.type === 'user' ? '#e3f2fd' : '#f5f5f5',
              mb: 1,
              borderRadius: 2
            }}>
              <Avatar sx={{ 
                bgcolor: msg.type === 'user' ? '#1976d2' : '#757575',
                mr: 1, 
                ml: 1 
              }}>
                {msg.type === 'user' ? 'U' : 'AI'}
              </Avatar>
              <ListItemText 
                primary={msg.content} 
                sx={{ maxWidth: '70%', wordBreak: 'break-word' }} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          fullWidth
          label="Ask about your skin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button 
          variant="contained" 
          onClick={handleSend}
          sx={{ height: '56px' }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}
