const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ItemService = require('../models/Item');

const router = express.Router();

// Configure Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Configure multer for file uploads in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      // Allow image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for photos'), false);
      }
    } else if (file.fieldname === 'audio') {
      // Allow audio files
      if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for audio'), false);
      }
    } else {
      cb(new Error('Invalid field name'), false);
    }
  }
});

// GET /api/items - Get all items (active and restocked)
router.get('/', async (req, res) => {
  try {
    const { status, urgency, search, page = 1, limit = 50 } = req.query;
    
    const activeItems = await ItemService.getActiveItems();
    const restockedItems = await ItemService.getRestockedItems();
    
    res.json({
      activeItems,
      restockedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalActive: activeItems.length,
        totalRestocked: restockedItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// POST /api/items - Create a new item
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const itemData = {
      name: req.body.name,
      urgency: req.body.urgency || 'medium',
      notes: req.body.notes,
      quantity: req.body.quantity,
      estimatedTimeToRunOut: req.body.estimatedTimeToRunOut,
      category: req.body.category,
      transcription: req.body.transcription,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    };
    
    // Add photo URL if uploaded
    if (req.file) {
      itemData.photoUrl = `/uploads/${req.file.filename}`;
    }
    
    const item = await ItemService.createItem(itemData);
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ 
      error: 'Failed to create item',
      details: error.message 
    });
  }
});

// POST /api/items/process-audio - Process audio transcription with AI
router.post('/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // Convert audio buffer to base64 for Gemini
    const audioBase64 = req.file.buffer.toString('base64');

    const audioPart = {
      inlineData: {
        mimeType: req.file.mimetype,
        data: audioBase64,
      },
    };

    const prompt =
      'Please transcribe this audio. The user is listing items they are running low on for a shopping list.';

    const result = await model.generateContent([prompt, audioPart]);
    const transcription = result.response.text().trim();
    
    console.log('Processing transcription:', transcription);
    
    // Use OpenAI to extract items from transcription
    const extractedItems = await extractItemsFromTranscription(transcription);
    
    // Save extracted items to database
    const savedItems = [];
    for (const itemData of extractedItems) {
      const item = await ItemService.createItem({
        ...itemData,
        transcription,
        aiExtracted: true,
        // audioUrl is removed as we are not saving the file to disk
      });
      savedItems.push(item);
    }
    
    res.json({
      message: 'Audio processed successfully',
      extractedItems: savedItems,
      originalTranscription: transcription,
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ 
      error: 'Failed to process audio',
      details: error.message 
    });
  }
});

// PUT /api/items/:id - Update an item
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      urgency: req.body.urgency,
      notes: req.body.notes,
      quantity: req.body.quantity,
      estimatedTimeToRunOut: req.body.estimatedTimeToRunOut,
      category: req.body.category,
      tags: req.body.tags ? JSON.parse(req.body.tags) : undefined,
    };
    
    // Add photo URL if uploaded
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const item = await ItemService.updateItem(req.params.id, updateData);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({ 
      error: 'Failed to update item',
      details: error.message 
    });
  }
});

// PUT /api/items/:id/restock - Mark item as restocked
router.put('/:id/restock', async (req, res) => {
  try {
    const item = await ItemService.markAsRestocked(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error marking item as restocked:', error);
    res.status(500).json({ 
      error: 'Failed to mark item as restocked',
      details: error.message 
    });
  }
});

// PUT /api/items/:id/reactivate - Mark item as active again
router.put('/:id/reactivate', async (req, res) => {
  try {
    const item = await ItemService.markAsActive(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error reactivating item:', error);
    res.status(500).json({ 
      error: 'Failed to reactivate item',
      details: error.message 
    });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', async (req, res) => {
  try {
    // Get item first to access file URLs
    const item = await ItemService.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete the item
    await ItemService.deleteItem(req.params.id);
    
    // Clean up uploaded files
    if (item.photo_url) {
      try {
        await fs.unlink(path.join(__dirname, '..', item.photo_url));
      } catch (error) {
        console.log('Could not delete photo file:', error.message);
      }
    }
    
    if (item.audio_url) {
      try {
        await fs.unlink(path.join(__dirname, '..', item.audio_url));
      } catch (error) {
        console.log('Could not delete audio file:', error.message);
      }
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ 
      error: 'Failed to delete item',
      details: error.message 
    });
  }
});

// AI function to extract items from transcription using Google Gemini
async function extractItemsFromTranscription(transcription) {
  try {
    const prompt = `
You are an AI assistant helping with pantry management. 
Analyze the following voice transcription and extract pantry/grocery items mentioned, along with their urgency levels.

Transcription: "${transcription}"

Extract items and return a JSON array where each item has:
- name: the item name (e.g., "Milk", "Sugar", "Bread")
- urgency: "critical" (almost out, urgent), "medium" (running low), or "low" (getting low)
- notes: any additional context mentioned
- estimatedTimeToRunOut: time estimate if mentioned (e.g., "couple of weeks", "few days")
- quantity: any quantity mentioned (e.g., "half gallon", "1 bag")

Rules:
- Only extract food/household items, not general words
- Infer urgency from phrases like "almost out" (critical), "running low" (medium), "getting low" (low)
- If no urgency clues, default to "medium"
- Keep names simple and standardized (e.g., "Olive Oil" not "olive oil bottle")
- Return a valid JSON array only. Do not include any other text, explanations, or markdown formatting.

Example output:
[
  {
    "name": "Milk",
    "urgency": "critical",
    "notes": "Almost finished",
    "estimatedTimeToRunOut": "1-2 days",
    "quantity": null
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    
    // Add detailed logging to see the raw AI response
    console.log('--- Gemini Raw Response ---');
    console.log(content);
    console.log('---------------------------');

    let extractedItems;
    try {
      // First, try to find JSON within markdown code blocks (e.g., ```json ... ```)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        extractedItems = JSON.parse(jsonMatch[1]);
      } else {
        // If no markdown, try parsing the whole string directly
        extractedItems = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON. Will attempt regex fallback.', parseError.message);
      // Fallback: try to find a raw array string in the response
      const arrayMatch = content.match(/(\[[\s\S]*\])/);
      if (arrayMatch && arrayMatch[0]) {
        try {
          extractedItems = JSON.parse(arrayMatch[0]);
        } catch (regexParseError) {
          console.error('Regex fallback also failed to parse JSON.', regexParseError.message);
          throw new Error('Could not extract valid JSON from Gemini response after multiple attempts.');
        }
      } else {
        throw new Error('Could not find any valid JSON in the Gemini response.');
      }
    }
    
    if (!Array.isArray(extractedItems)) {
      console.error("Gemini response was valid JSON but not an array:", extractedItems);
      throw new Error('Expected an array of items from AI response.');
    }
    
    return extractedItems.map(item => ({
      name: item.name || 'Unknown Item',
      urgency: ['critical', 'medium', 'low'].includes(item.urgency) ? item.urgency : 'medium',
      notes: item.notes || '',
      estimatedTimeToRunOut: item.estimatedTimeToRunOut || '',
      quantity: item.quantity || '',
      category: item.category || '',
      aiConfidence: 0.95,
    }));
  } catch (error) {
    console.error('Error in AI extraction process:', error);
    
    return [{
      name: transcription.slice(0, 50) + (transcription.length > 50 ? '...' : ''),
      urgency: 'medium',
      notes: 'AI extraction failed - manual review needed',
      transcription: transcription,
      aiConfidence: 0.1,
    }];
  }
}

module.exports = router; 