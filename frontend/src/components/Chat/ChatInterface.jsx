import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import '../../../src/index.css'; // We'll create this file below

// Component to render Markdown text
function AnalysisOutput({ markdownText }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown>{markdownText}</ReactMarkdown>
    </div>
  );
}

// Typing animation component for AI responses
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

export default function BeautySkinAI({ userProfile }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
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
      setChatHistory(prev => [
        ...prev,
        { type: 'system', content: 'Please login first to upload images.' }
      ]);
      return;
    }
    
    if (!files || files.length !== 3) {
      setChatHistory(prev => [
        ...prev, 
        { type: 'system', content: 'Please select exactly 3 images of your skin for the best analysis.' }
      ]);
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
        { type: 'system', content: 'Images uploaded successfully! You can now ask for your personalized skin analysis.' },
      ]);
    } catch (err) {
      console.error('Upload Error:', err);
      setChatHistory(prev => [
        ...prev,
        { type: 'system', content: err.response?.data?.error || 'Image upload failed. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending chat message
  const handleSend = async () => {
    if (!message.trim()) return;
    
    // Add user message
    setChatHistory(prev => [
      ...prev,
      { type: 'user', content: message }
    ]);
    
    const userQuery = message;
    setMessage('');
    setLoading(true);
    
    // Add temporary loading message that will be replaced
    setChatHistory(prev => [
      ...prev,
      { type: 'ai-loading', content: '...' }
    ]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analysis/analyze`,
        { question: userQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Replace loading message with actual response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { type: 'ai', content: response.data.tips };
        return newHistory;
      });
    } catch (error) {
      console.error('Error:', error);
      // Replace loading message with error
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { 
          type: 'system', 
          content: error.response?.data?.error || 'Analysis failed. Please try again.' 
        };
        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file input change from upload button
  const handleFileChange = (e) => {
    const files = e.target.files;
    handleImageUpload(files);
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <h1>kaya-BeautySkinAI</h1>
        </div>
      </header>

      {/* Chat Window */}
      <main className="chat-window" ref={chatListRef}>
        {chatHistory.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-bubble"></div>
            <h2>Welcome to BeautySkinAI</h2>
            <p>Your personal Ayurvedic skin advisor powered by AI</p>
            <div className="welcome-cards">
              <div className="welcome-card">
                <div className="card-icon upload-icon"></div>
                <h3>Upload Photos</h3>
                <p>Share 3 photos of your skin for analysis</p>
              </div>
              <div className="welcome-card">
                <div className="card-icon analyze-icon"></div>
                <h3>Get Analysis</h3>
                <p>Receive personalized Ayurvedic skin guidance</p>
              </div>
              <div className="welcome-card">
                <div className="card-icon routine-icon"></div>
                <h3>Daily Routine</h3>
                <p>Follow your customized skincare regimen</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`message-container ${msg.type}-container`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* AI message avatar */}
                {msg.type === 'ai' && (
                  // You can use either a simple span replacement...
                  // <div className="avatar ai-avatar"></div>
                  
                  // ...or with an image URL:
                  <div 
                    className="avatar ai-avatar"
                    style={{ backgroundImage: `url('https://x.com/divyansh_ai/photo')` }}
                  >
                    {/* there should be avatar for ai */}
                    <span></span>
                  </div>
                )}

                {/* User message avatar */}
                {msg.type === 'user' && (
                  // If you have a userProfile.avatarUrl you can use it:
                  <div 
                    className="avatar user-avatar"
                    style={{ backgroundImage: `url('${userProfile && userProfile.avatarUrl ? userProfile.avatarUrl : '/logo.png'}')` }}
                  >{/* there should be avatar for user below */}
                    <span></span>
                  </div>
                )}

                <div className={`message ${msg.type}`}>
                  {msg.type === 'ai-loading' ? (
                    <TypingIndicator />
                  ) : msg.type === 'ai' ? (
                    <AnalysisOutput markdownText={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="input-area">
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your skin..."
            disabled={loading}
          />
          
          <label className="upload-button">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
            <svg viewBox="0 0 24 24" className="camera-icon">
              <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"></path>
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"></path>
            </svg>
          </label>
          
          <button 
            className="send-button" 
            onClick={handleSend}
            disabled={!message.trim() || loading}
          >
            <svg viewBox="0 0 24 24" className="send-icon">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
        
        {loading && (
          <div className="progress-bar">
            <div className="progress-value"></div>
          </div>
        )}
      </footer>
    </div>
  );
}
