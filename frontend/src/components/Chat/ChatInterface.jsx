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

export default function BeautySkinAI() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const chatListRef = useRef(null);

  // Persist chat history and auto-scroll to bottom with a small delay to ensure content is rendered
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    if (chatListRef.current) {
      setTimeout(() => {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  // Handle resize events (including keyboard appearance on mobile)
  useEffect(() => {
    function handleResize() {
      if (chatListRef.current) {
        chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
      }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle image upload (exactly 3 images)
  const handleImageUpload = async (files) => {
    if (!files || files.length !== 3) {
      setChatHistory(prev => [
        ...prev, 
        { type: 'system', content: 'Optional: Please select exactly 3 images if you want image-based analysis. You can chat without uploading!' }
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
        },
      });
      setChatHistory((prev) => [
        ...prev,
        { type: 'system', content: 'Images uploaded successfully! You can now ask for your personalized skin analysis.' },
      ]);
    } catch (err) {
      console.error('Upload Error:', err);
      const errorMsg = err.response?.status === 401 
        ? 'Server requires authentication—contact support if this persists (no login needed here).' 
        : err.response?.data?.error || 'Image upload failed. Please try again.';
      setChatHistory(prev => [
        ...prev,
        { type: 'system', content: errorMsg }
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
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/analysis/analyze`,
        { question: userQuery }
      );
      
      // Replace loading message with actual response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { type: 'ai', content: response.data.tips };
        return newHistory;
      });
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.response?.status === 401 
        ? 'Server requires authentication—contact support if this persists (no login needed here).' 
        : error.response?.data?.error || 'Analysis failed. Please try again.';
      // Replace loading message with error
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { 
          type: 'system', 
          content: errorMsg 
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

  // Handle keyboard press enter to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend();
      e.preventDefault();
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon "></div>
          {/* <h1>Manno : Your beauty Advisor</h1> */}
        </div>
      </header>

      {/* Chat Window */}
      <main className="chat-window" ref={chatListRef}>
        {chatHistory.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-bubble"></div>
            <h2>Hi I'm Maano</h2>
            <p>Your personal skin advisor powered by Askus— Upload 3 photos for personalized analysis (optional).</p>
            <div className="welcome-cards">
              <div className="welcome-card">
                <div className="card-icon upload-icon"></div>
                <h3>Upload Photos</h3>
                <p>Share 3 photos of your skin for detailed analysis</p>
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
                  <div 
                    className="avatar ai-avatar"
                    style={{ backgroundImage: `url('https://x.com/divyansh_ai/photo')` }}
                  >
                    <span></span>
                  </div>
                )}

                {/* User message avatar */}
                {msg.type === 'user' && (
                  <div 
                    className="avatar user-avatar"
                    style={{ backgroundImage: `url('/logo.png')` }}
                  >
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
            {/* Spacer div to ensure content doesn't get hidden behind input area */}
            <div className="message-spacer"></div>
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
            onKeyDown={handleKeyPress}
            placeholder="Talk to Manno😊..."
            // placeholder="Ask about your skin..."
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
