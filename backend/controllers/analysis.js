const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multer for image upload
const upload = multer({ storage: multer.memoryStorage() });

// Upload 3 images
router.post('/upload', upload.array('images', 3), async (req, res) => {
  try {
    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
      imageUrls.push(result.secure_url);
    }
    res.status(200).json({ success: true, imageUrls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze images with Gemini
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrls, question } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `
      Analyze these 3 facial images for skin issues like acne, dullness, or dryness.
      Provide beauty tips in bullet points. Avoid medical advice.
      User question: ${question}
    `;

    const imageParts = imageUrls.map(url => ({
      inlineData: { data: url, mimeType: 'image/jpeg' }
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    res.status(200).json({ success: true, tips: response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;