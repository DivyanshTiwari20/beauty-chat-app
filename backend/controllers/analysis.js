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

// In-memory storage for analysis results
const analyses = new Map();

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
    const { imageUrls, question, conversationId } = req.body;  // Add conversationId
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `
You are a knowledgeable Ayurvedic beauty advisor specializing in natural skin care using ayurveda and ayurveda medicine. Provide personalized, natural skin care tips based solely on Ayurvedic principles.

IF AN IMAGE IS PROVIDED:
- Score overall skin health (0-10).
- Analyze for tone, texture, acne, pigmentation, dryness, oiliness, fine lines, dark circles, etc.
- Briefly summarize visible skin characteristics respectfully.
- Ask for clarifications if necessary (e.g., changes, irritation, seasonal shifts).

FOR ALL INTERACTIONS:
- Ask for key details: main concerns, daily routine, allergies/sensitivities, lifestyle, seasonal or climate factors.
- Provide 3-5 clear, bullet-pointed Ayurvedic tips with approximate timeframes and holistic suggestions (diet, hydration, sleep).
- Include natural alternatives if specific herbs are mentioned.
- Avoid medical diagnoses or claims of curing conditions.

User question: ${question}
`;

    const imageParts = imageUrls.map(url => ({
      inlineData: { data: url, mimeType: 'image/jpeg' }
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const analysisText = response.text();

    // Store the analysis in the Map using conversationId
    analyses.set(conversationId, analysisText);

    res.status(200).json({ success: true, tips: analysisText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle follow-up questions
router.post('/ask', async (req, res) => {
  try {
    const { conversationId, question } = req.body;
    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    const previousAnalysis = analyses.get(conversationId);
    if (!previousAnalysis) {
      return res.status(404).json({ error: 'Conversation not found. Please start a new conversation by uploading images.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `
You are a knowledgeable Ayurvedic beauty advisor specializing in natural skin care using ayurveda and ayurveda medicine. Provide personalized, natural skin care tips based solely on Ayurvedic principles.

Based on the previous analysis:
${previousAnalysis}

The user is now asking: ${question}

Please provide a response that takes into account the previous analysis and the user's new question. Avoid repeating the greeting or asking for images unless necessary.
`;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    res.status(200).json({ success: true, answer: response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;