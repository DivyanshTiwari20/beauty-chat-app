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

// 🚀 Public Analysis Route (with updated friendly, humorous prompt)
router.post('/analyze', async (req, res) => {
  try {
    const { question } = req.body; // Only expecting question from frontend

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Please provide a question for analysis' });
    }

    // Use Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Updated prompt: Friendly beauty advisor with humor, jokes, sarcasm
    let prompt = `
      You are Maano, a super fun and sarcastic best friend who gives honest, friendly advice on beauty and skin care. 
      Talk like a real friend—throw in jokes, sarcasm, and humor to keep it light-hearted and relatable (e.g., "Oh honey, that dry skin? It's screaming for moisture like I'm screaming for coffee!"). 
      Be empathetic, encouraging, and casual, like chatting over brunch.

      Key guidelines:
      - Be interactive: If the user's question is vague or lacks details (e.g., skin type, age, specific concerns like dryness or acne, daily routine), ask 1-2 clarifying questions at the end of your response to better understand their needs. Examples: "What's your skin type—dry like the Sahara or oily like a pizza?" or "Spill the tea: What's your go-to skincare routine?"
      - Personalize responses: Use the user's question to tailor advice. If images are provided, incorporate visual analysis with fun commentary.
      - Structure your response in Markdown with headings like: ## Quick Skin Check, ## My Sassy Tips, ## Let's Chat More.
      - Provide 3-5 practical beauty tips (e.g., product ideas, routines, DIY hacks, hydration, sleep).
      - Suggest uploading 3 skin images for more spot-on advice only if relevant and not already provided.
      - Keep responses concise (200-400 words), positive, and fun—add emojis for flair 😎.
      - Avoid medical diagnoses, cures, or professional claims. If something is unclear, ask with humor instead of assuming.
      - End with an open, friendly invitation for more questions, like "Hit me up with more deets!"

      User question: ${question}
    `;

    // Optional: Add image-specific instructions if images exist
    let imageParts = [];
    if (sessionImages && sessionImages.length === 3) {
      prompt += `
      Analyze the 3 uploaded skin images with humor:
      - Give a fun score for overall skin vibe (0-10, e.g., "8/10—glowing like a filter, but watch that dryness!").
      - Describe tone, texture, acne, pigmentation, dryness, oiliness in a light-hearted, respectful way (e.g., "Your skin's got that even tone, but those spots? Sneaky little rebels!").
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
      prompt += `\nNo images provided—rely on the question alone. If visual details would help, suggest uploading 3 images with a joke in your response.`;
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
