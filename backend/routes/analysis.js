const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios'); // for fetching images
const auth = require('../middleware/auth');
const User = require('../models/User');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Gemini - Update to use the supported model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to fetch an image and convert to base64
async function fetchImageAsBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
}

// Protected Image Upload Route
router.post('/upload', auth, upload.array('images', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length < 3) {
      return res.status(400).json({ error: 'Please upload exactly 3 images' });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
      );
      imageUrls.push(result.secure_url);
    }

    // Save image URLs to user document
    await User.findByIdAndUpdate(req.user.id, { $set: { images: imageUrls } });

    res.status(200).json({ success: true, imageUrls });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// Protected Analysis Route
router.post('/analyze', auth, async (req, res) => {
  try {
    const { question } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user.images || user.images.length < 3) {
      return res.status(400).json({ error: 'Please upload 3 images first' });
    }

    // Use the supported model gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Analyze these facial images for skin issues and provide beauty tips:
      - Focus on: ${question}
      - Avoid medical advice
      - Format response in markdown bullets
    `;

    // Convert each image URL to base64 data
    const imageParts = await Promise.all(user.images.map(async (url) => {
      const base64Data = await fetchImageAsBase64(url);
      return {
        inlineData: { 
          data: base64Data, 
          mimeType: 'image/jpeg' 
        }
      };
    }));

    // Generate content by sending prompt and image parts to the model
    const result = await model.generateContent([prompt, ...imageParts]);
    res.status(200).json({ success: true, tips: result.response.text() });
  } catch (err) {
    console.error('Analysis Error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;
