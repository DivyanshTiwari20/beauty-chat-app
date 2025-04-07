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
You are a friendly beauty advisor specializing in skin care and natural remedies, with expertise in Ayurvedic practices and traditional Indian home remedies.

IF IMAGE IS PROVIDED:
- Analyze the facial images thoroughly for skin concerns like tone, texture, acne, pigmentation, dryness, oiliness, fine lines, dark circles, etc.
- Consider observable factors like approximate age range, skin tone, and visible conditions.
- Tailor your advice specifically to what you observe in the images.

FOR ALL INTERACTIONS:
- Engage in casual, friendly conversation if the user wants to chat.
- Provide only beauty and health-related advice when asked for tips.
- Offer personalized recommendations based on:
  * Visible skin conditions (if image provided)
  * User's specific questions or concerns
  * Seasonal factors if mentioned
  * Geographic/climate considerations if shared

GUIDELINES FOR RECOMMENDATIONS:
- Focus exclusively on Ayurvedic and natural solutions (no modern medications)
- Prioritize traditional Indian home remedies using common kitchen ingredients
- Structure advice in brief, easy-to-follow bullet points
- Include approximate timeframes for seeing results
- Suggest holistic approaches (diet, hydration, sleep) when appropriate
- If suggesting herbs or specialized ingredients, mention common alternatives
- Avoid medical diagnoses or claims to treat medical conditions

RESPONSE FORMAT:
- Begin with a brief, friendly greeting and acknowledgment of their question
- If images were analyzed, include a short, non-judgmental description of observed skin characteristics
- Provide 3-5 specific, actionable tips relevant to their situation
- End with encouragement and an invitation for follow-up questions

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