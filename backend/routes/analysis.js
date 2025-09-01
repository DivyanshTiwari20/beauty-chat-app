const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

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

// Configure Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store uploaded images temporarily for this session
let sessionImages = [];

// Helper function to fetch an image and convert to base64
async function fetchImageAsBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  return buffer.toString('base64');
}

// 🚀 Public Image Upload Route
router.post('/upload', upload.array('images', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length !== 3) {
      return res.status(400).json({ error: 'Please upload exactly 3 images' });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
      );
      imageUrls.push(result.secure_url);
    }

    // Store images in session for later analysis
    sessionImages = imageUrls;

    res.status(200).json({ 
      success: true, 
      message: 'Images uploaded successfully! You can now ask for analysis.',
      imageCount: imageUrls.length 
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// 🚀 Public Analysis Route (with concise, media-style prompt)
router.post('/analyze', async (req, res) => {
  try {
    const { question } = req.body; // Only expecting question from frontend

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Please provide a question for analysis' });
    }

    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Updated prompt: Very concise, to-the-point, media-representative style with friendly advice
    let prompt = `
      You are Maano, a witty, friendly beauty and skin care advisor who speaks like a media representative—super concise, to the point, and no fluff.
      Keep answers very short, clear, and impactful—think tweet-length tips anyone can quickly read.
      Use friendly advice, humor, and light sarcasm sparingly to keep it real and relatable.

      Key instructions:
      - Respond only with concise answers (1-3 short sentences max).
      - Personalize advice based on the user’s question.
      - If images are provided, briefly mention skin state with a short fun comment.
      - Structure your answer briefly, no long paragraphs.
      - Encourage user to ask follow-ups, but keep it snappy.
      - No medical claims or jargon.
      - End with a quick friendly nudge like "Got more questions? Hit me up!"

      User question: ${question}
    `;

    // Optional: Add image-specific instructions if images exist
    let imageParts = [];
    if (sessionImages && sessionImages.length === 3) {
      prompt += `
      Analyze the 3 uploaded skin images briefly:
      - Include a quick fun score (0-10) and short comment on tone/texture/concerns.
      `;

      // Convert each image URL to base64
      imageParts = await Promise.all(sessionImages.map(async (url) => {
        const base64Data = await fetchImageAsBase64(url);
        return {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg'
          }
        };
      }));
    } else {
      prompt += `\nNo images provided—keep advice text-based and suggest uploading if helpful.`;
    }

    // Generate response
    const result = await model.generateContent([prompt, ...imageParts]);

    res.status(200).json({
      success: true,
      tips: result.response.text(),
      analyzedImages: sessionImages ? sessionImages.length : 0
    });
  } catch (err) {
    console.error('Analysis Error:', err);
    res.status(500).json({ 
      error: 'Analysis failed. Please try again.' 
    });
  }
});

// Optional: Clear session images endpoint
router.post('/clear-session', (req, res) => {
  sessionImages = [];
  res.json({ success: true, message: 'Session cleared' });
});

module.exports = router;
