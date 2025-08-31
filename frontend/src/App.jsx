import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatInterface from './components/Chat/ChatInterface';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* If user hits '/', navigate them to '/chat' by default */}
        <Route path="/" element={<Navigate to="/chat" />} />

        {/* Chat page (combined image upload + AI chat) */}
        <Route path="/chat" element={<ChatInterface />} />

        {/* 404 fallback */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
