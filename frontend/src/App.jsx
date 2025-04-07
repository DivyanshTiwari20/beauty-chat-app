import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import ChatInterface from './components/Chat/ChatInterface';

export default function App() {
  return (
    <BrowserRouter>
      {/* <Layout> */}
        <Routes>
          {/* If user hits '/', navigate them to '/login' by default */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Chat page (combined image upload + AI chat) */}
          <Route path="/chat" element={<ChatInterface />} />

          {/* 404 fallback */}
          <Route path="*" element={<div>404 - Page not found</div>} />
        </Routes>
      {/* </Layout> */}
    </BrowserRouter>
  );
}
