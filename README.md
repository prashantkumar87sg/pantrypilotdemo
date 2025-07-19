# 🎤 PantryPilot - Voice-Powered Pantry Management

A Progressive Web App (PWA) that lets you quickly voice-record items running low in your pantry and uses AI to intelligently extract and organize them into a smart shopping list.

## ✨ Features

### 🎯 Core Features
- **🎤 Push-to-Record Interface**: Prominent voice recording button for quick pantry updates
- **🤖 AI Item Extraction**: OpenAI-powered intelligent parsing of voice notes
- **📱 Progressive Web App**: Installable on mobile devices, works offline
- **🔔 Smart Urgency Detection**: Automatically categorizes items as Critical/Medium/Low priority
- **📋 Dynamic Shopping Lists**: Sortable, filterable lists with lifecycle management
- **📸 Photo Support**: Add photos to items for visual reference
- **📊 Quick Stats Dashboard**: Overview of pantry status and shopping needs

### 🏗️ Architecture
- **Frontend**: React 18 + Redux Toolkit + Material-UI
- **Backend**: Node.js + Express + PostgreSQL (Neon DB)
- **AI**: Google Gemini 2.5 Flash for ultra-fast natural language processing
- **PWA**: Service Worker + Web App Manifest for native-like experience

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Neon DB account (PostgreSQL cloud database)
- Google Gemini API key

### Installation

1. **Clone and Install Dependencies**
```bash
git clone <your-repo-url>
cd PantryPilotDemo
npm run install:all
```

2. **Environment Setup**
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (Neon DB - PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-1.aws.neon.tech/neondb?sslmode=require

# AI (Required - Google Gemini 2.5 Flash)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Start Development Servers (Two Terminals)

**Terminal 1: Start Backend**
```bash
# From project root
npm run start:backend
```
*This will start the backend server on port 5001.*

**Terminal 2: Start Frontend**
```bash
# Open a new terminal from the project root
npm run start:frontend
```
*This will start the React frontend on port 3000 and open it in your browser.*

## 📱 Usage

### Quick Voice Recording
1. **Open the app** and you'll see the prominent voice recording interface
2. **Press and hold** the large microphone button
3. **Speak naturally**: "Milk is almost out, we need more olive oil, sugar is getting low"
4. **Release** to stop recording
5. **AI processes** your speech and automatically creates organized shopping list items

### Managing Items
- **Mark as Restocked**: ✅ Click the green checkmark when you've replenished an item
- **Edit Items**: ✏️ Adjust urgency, add notes, or upload photos
- **Sort & Filter**: 🔍 Organize by urgency, date, or search by name
- **View History**: 📈 Track your shopping patterns and restocked items

## 🏗️ Project Structure

```
PantryPilotDemo/
├── frontend/                 # React PWA
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   └── index.html       # Main HTML file
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── audio/       # Voice recording components
│   │   │   ├── dashboard/   # Stats and overview
│   │   │   ├── items/       # Item management
│   │   │   ├── modals/      # Modal dialogs
│   │   │   └── navigation/  # App navigation
│   │   ├── pages/           # Main page components
│   │   ├── store/           # Redux state management
│   │   │   └── slices/      # Redux slices
│   │   ├── theme/           # Material-UI theming
│   │   └── App.js           # Main app component
├── backend/                 # Node.js API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   │   ├── items.js        # Item CRUD operations
│   │   └── ai.js           # AI processing endpoints
│   └── server.js           # Express server setup
└── package.json            # Root package configuration
```

## 🎯 Key Components

### Frontend Highlights

#### `PushToRecordButton` - The Hero Feature
- Large, prominent recording interface
- Touch/mouse press-and-hold functionality
- Real-time audio visualization
- Integrated speech-to-text
- Mobile-optimized UX

#### `HomePage` - Central Dashboard
- Voice recording interface front and center
- Quick stats overview
- Recent items preview
- Fast navigation to full lists

#### PWA Features
- **Installable**: Add to home screen on mobile
- **Offline Support**: Service worker caching
- **Native Feel**: Full-screen, app-like experience

### Backend Highlights

#### AI-Powered Item Extraction
```javascript
// Example: "Milk is almost out, olive oil running low"
// Becomes:
[
  { name: "Milk", urgency: "critical", notes: "Almost finished" },
  { name: "Olive Oil", urgency: "medium", notes: "Running low" }
]
```

#### Smart Data Model
- **Lifecycle Management**: active → restocked → historical
- **Rich Metadata**: urgency, photos, voice notes, timestamps
- **Search & Filter**: Full-text search, category filtering
- **User-Ready**: Prepared for multi-user expansion

## 🔮 Roadmap

### Phase 1: Core Foundation ✅
- [x] PWA setup with prominent voice interface
- [x] AI-powered item extraction
- [x] Basic item management
- [x] Mobile-first responsive design

### Phase 2: Enhanced Features
- [ ] Advanced shopping list management
- [ ] Photo capture and editing
- [ ] Push notifications
- [ ] Offline synchronization
- [ ] Shopping list sharing

### Phase 3: Intelligence
- [ ] Shopping pattern analysis
- [ ] Smart reorder suggestions
- [ ] Price tracking integration
- [ ] Meal planning connections

### Phase 4: Multi-User & Social
- [ ] User authentication
- [ ] Household sharing
- [ ] Community features
- [ ] Store integrations

## 🛠️ Development

### API Endpoints

#### Items
- `GET /api/items` - Fetch all items (active/restocked)
- `POST /api/items` - Create new item
- `POST /api/items/process-audio` - AI-powered voice processing
- `PUT /api/items/:id` - Update item
- `PUT /api/items/:id/restock` - Mark as restocked
- `DELETE /api/items/:id` - Delete item

#### AI
- `POST /api/ai/extract-items` - Extract items from text

### Tech Stack Details
- **React 18**: Modern React with hooks and concurrent features
- **Redux Toolkit**: Simplified Redux with excellent dev tools
- **Material-UI v5**: Comprehensive component library
- **Express.js**: Fast, minimalist web framework
- **Neon DB**: Serverless PostgreSQL database with edge capabilities
- **Google Gemini 2.5 Flash**: Latest AI model for lightning-fast intelligent text processing

## 📄 License

MIT License - Feel free to use this project as a foundation for your own pantry management solutions!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**PantryPilot** - Never forget what you need at the store again! 🛒✨ 