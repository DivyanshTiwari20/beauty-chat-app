import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import ImageUpload from './components/Chat/ImageUpload';
import ChatInterface from './components/Chat/ChatInterface';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<ImageUpload />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
