import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const transcribeAudio = async (audioBlob) => {
  try {
    // Convert audio blob to base64
    const audioBase64 = await blobToBase64(audioBlob);
    
    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type,
        data: audioBase64,
      },
    };

    const prompt = 'Please transcribe this audio. The user is listing items they are running low on for a shopping list.';
    
    const result = await model.generateContent([prompt, audioPart]);
    const transcription = result.response.text().trim();
    
    return transcription;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

export const extractItemsFromText = async (text) => {
  try {
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
    const response = result.response.text().trim();
    
    // Try to extract JSON from the response
    let jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonMatch[0] = `[${jsonMatch[0]}]`;
      }
    }
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    
    const extractedItems = JSON.parse(jsonMatch[0]);
    return Array.isArray(extractedItems) ? extractedItems : [extractedItems];
  } catch (error) {
    console.error('Error extracting items:', error);
    throw error;
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the data:audio/webm;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}; 