# 🚀 PantryPilot Setup Guide

Complete setup guide for PantryPilot with **Google Gemini 2.0 Flash** and **Neon DB**.

## 📋 Prerequisites

1. **Node.js 16+** and npm
2. **Neon DB Account** (free tier available)
3. **Google AI Studio Account** (free tier available)

## 🛠️ Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd PantryPilotDemo

# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2. Set Up Neon DB (PostgreSQL)

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech) and sign up (free tier available)

2. **Create Database**:
   - Click "Create Project"
   - Choose a name like "pantrypilot"
   - Select your preferred region
   - Copy the connection string

3. **Get Connection String**: It will look like:
   ```
   postgresql://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Set Up Google Gemini 2.0 Flash

1. **Get Gemini API Key**:
   - Go to [ai.google.dev](https://ai.google.dev)
   - Click "Get API key in Google AI Studio"
   - Create a new API key
   - Copy the key (starts with "AIza...")
   - **Note**: Gemini 2.0 Flash is the latest model with superior speed and accuracy

### 4. Configure Environment Variables

```bash
# In the backend directory
cd backend
cp env.example .env
```

Edit `.env` file:
```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (Replace with your Neon DB connection string)
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# Google Gemini 2.0 Flash (Replace with your API key)
GEMINI_API_KEY=AIza...your-gemini-api-key-here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 5. Start the Application (Two Terminals)

**Terminal 1: Start the Backend Server**
```bash
# From the project's root directory
npm run start:backend
```
*You should see a confirmation that the server is running on port 5001.*

**Terminal 2: Start the Frontend Application**
```bash
# Open a new terminal from the project's root directory
npm run start:frontend
```
*This will automatically open the PantryPilot app in your web browser at `http://localhost:3000`.*

## 🎯 First Run

When you start the backend for the first time, it will automatically:
1. ✅ Connect to your Neon database
2. ✅ Create the required tables (`items`, `users`)
3. ✅ Set up indexes for optimal performance
4. ✅ Create database triggers for automatic timestamps

## 🧪 Test the Setup

### 1. Test Voice Recording
1. Open http://localhost:3000
2. Press and hold the large microphone button
3. Say: *"Milk is almost out, olive oil is running low"*
4. Release the button
5. Watch as Gemini 2.0 Flash extracts items automatically!

### 2. Verify Database
Check your Neon dashboard to see the items being stored in real-time.

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if DATABASE_URL is correct
echo $DATABASE_URL

# Test connection manually (install psql if needed)
psql "postgresql://your-connection-string"
```

### Gemini API Issues
- Verify your API key is correct
- Check [AI Studio quotas](https://aistudio.google.com)
- Ensure billing is set up if using beyond free tier

### Audio Recording Issues
- Ensure HTTPS in production (required for microphone access)
- Check browser permissions for microphone
- Test in Chrome/Firefox (best Web Speech API support)

## 📊 Database Schema

The app automatically creates these tables:

### `items` Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(100))
- urgency (critical|medium|low)
- notes (TEXT)
- quantity (VARCHAR(50))
- estimated_time_to_run_out (VARCHAR(100))
- category (VARCHAR(50))
- photo_url (TEXT)
- audio_url (TEXT)
- transcription (TEXT)
- status (active|restocked|deleted)
- date_added (TIMESTAMP)
- date_restocked (TIMESTAMP)
- ai_extracted (BOOLEAN)
- ai_confidence (DECIMAL)
- tags (TEXT[])
- created_at/updated_at (TIMESTAMP)
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your-production-neon-url
GEMINI_API_KEY=your-production-gemini-key
FRONTEND_URL=https://your-domain.com
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: Railway, Render, or AWS ECS
- **Database**: Neon DB (already cloud-ready)

## 🎨 Customization

### Adding New Urgency Levels
1. Update database enum: `ALTER TYPE urgency_enum ADD VALUE 'new_level';`
2. Update frontend theme in `frontend/src/theme/theme.js`
3. Update AI prompts in `backend/routes/items.js`

### Modifying AI Prompts
Edit the prompt in `backend/routes/items.js` → `extractItemsFromTranscription()` function.

## 📝 API Endpoints

- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `POST /api/items/process-audio` - Process voice recording
- `PUT /api/items/:id` - Update item
- `PUT /api/items/:id/restock` - Mark as restocked
- `DELETE /api/items/:id` - Delete item

## 🔗 Useful Links

- [Neon DB Docs](https://neon.tech/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Ready to use!** 🎉 Your voice-powered pantry management app is now running with cutting-edge AI and serverless database technology. 