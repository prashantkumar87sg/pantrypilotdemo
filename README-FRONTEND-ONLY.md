# PantryPilot - Frontend-Only Architecture

This branch contains the frontend-only version of PantryPilot that eliminates the backend server and uses Supabase + Gemini AI directly from the client.

## Architecture Changes

- **Database**: Supabase (replaces Neon + Express backend)
- **AI Processing**: Direct Gemini API calls (replaces backend API routes)
- **Deployment**: Vercel only (no Railway needed)
- **Authentication**: Supabase Auth (optional, can be added later)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. In the SQL Editor, run the schema from `supabase-schema.sql`
4. Get your project URL and anon key from Settings > API

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. **Important**: Configure domain restrictions in Google Cloud Console:
   - Go to Google Cloud Console > APIs & Services > Credentials
   - Edit your API key
   - Add Application restrictions > HTTP referrers
   - Add your Vercel domain (e.g., `yourdomain.vercel.app/*`)

### 3. Environment Variables

Create `frontend/.env.local` with your credentials:

```bash
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_public_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Install Dependencies

```bash
cd frontend
npm install
```

### 5. Run Locally

```bash
npm start
```

### 6. Deploy to Vercel

1. Push this branch to GitHub
2. Connect your GitHub repo to Vercel
3. Set the same environment variables in Vercel dashboard
4. Deploy!

## Security Considerations

### API Key Protection

1. **Domain Restrictions**: Always configure your Gemini API key with domain restrictions
2. **Rate Limiting**: Monitor your Gemini API usage in Google Cloud Console
3. **Supabase RLS**: Row Level Security policies are enabled by default
4. **Environment Variables**: Never commit actual keys to git

### Recommended Security Setup

1. **Gemini API Key**:
   - Restrict to your production domain
   - Set up usage quotas
   - Monitor API calls regularly

2. **Supabase**:
   - Review and tighten RLS policies as needed
   - Enable additional auth providers if needed
   - Monitor database usage

## Features

- ✅ Audio recording and transcription
- ✅ AI-powered item extraction
- ✅ Shopping list management
- ✅ Real-time updates (via Supabase)
- ✅ PWA functionality
- ✅ Responsive design
- ✅ No server maintenance needed

## Migration from Backend Version

If you're migrating data from the previous backend version:

1. Export data from your Neon database
2. Transform the data format (change `_id` to `id`, etc.)
3. Import into Supabase using the SQL Editor or CSV import

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that `.env.local` exists in the frontend directory
   - Verify variable names match exactly (including `REACT_APP_` prefix)

2. **"Missing Gemini API key"**
   - Ensure your API key is valid and active
   - Check domain restrictions aren't blocking localhost during development

3. **Database connection errors**
   - Verify your Supabase URL and anon key
   - Check that the schema has been applied correctly

4. **CORS errors**
   - Should not occur with this architecture since everything runs client-side

### Development vs Production

- **Development**: Uses `localhost:3000` for testing
- **Production**: Uses your Vercel domain with proper API key restrictions

## Benefits of This Architecture

1. **No Server Costs**: Only pay for Supabase database and Gemini API usage
2. **Automatic Scaling**: Vercel and Supabase handle all scaling automatically
3. **Faster Development**: No backend deployment pipeline needed
4. **Built-in Features**: Get auth, real-time, and database features from Supabase
5. **Global CDN**: Your app loads fast worldwide via Vercel's edge network

## Future Enhancements

- Add Supabase Auth for user accounts
- Implement real-time collaborative features
- Add file upload to Supabase Storage
- Set up Supabase Edge Functions for complex server-side logic if needed 