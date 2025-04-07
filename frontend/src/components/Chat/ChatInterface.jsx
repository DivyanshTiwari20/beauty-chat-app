import { useState } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  Paper,
  Avatar,
  Box,
  Typography
} from '@mui/material';
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
  const [chatHistory, setChatHistory] = useState([]);

  const handleSend = async () => {
    if (!message.trim()) return; // Prevent sending empty messages
    try {
      const token = localStorage.getItem('token'); // Retrieve token for authorization
      const response = await axios.post(
        'http://localhost:5000/api/analysis/analyze',
        { question: message },  
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update chat history with user message and AI response
      setChatHistory((prev) => [
        ...prev,
        { type: 'user', content: message }, // User's input
        { type: 'ai', content: response.data.tips } // AI's Markdown-formatted response
      ]);
      setMessage(''); // Clear input field after sending
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
              {msg.type === 'user' ? (
                // Render user message as plain text
                <div style={{ maxWidth: '70%', wordBreak: 'break-word' }}>
                  {msg.content}
                </div>
              ) : (
                // Render AI response using Markdown
                <AnalysisOutput markdownText={msg.content} />
              )}
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
          onKeyPress={(e) => e.key === 'Enter' && handleSend()} // Send on Enter key press
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
