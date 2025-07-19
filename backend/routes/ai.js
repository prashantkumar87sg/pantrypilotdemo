const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Configure Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// POST /api/ai/extract-items - Extract items from text (standalone endpoint)
router.post('/extract-items', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Similar extraction logic as in items route
    const prompt = `
Extract grocery/pantry items from this text: "${text}"

Return a JSON array with items containing:
- name: item name
- urgency: "critical", "medium", or "low"
- notes: additional context
- estimatedTimeToRunOut: time estimate if mentioned
- quantity: quantity if mentioned

Return only valid JSON, no other text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    const extractedItems = JSON.parse(content);
    
    res.json({
      extractedItems,
      originalText: text,
    });
  } catch (error) {
    console.error('Error in AI extraction:', error);
    res.status(500).json({ 
      error: 'Failed to extract items',
      details: error.message 
    });
  }
});

module.exports = router; 