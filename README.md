# CommunityConnect — Smart Volunteer Coordination System

Smart Volunteer Coordination System for NGOs and social groups. Uses AI to score urgency and match volunteers to community needs.

## Features
- **AI Urgency Scoring**: Uses Google Gemini to analyze reports and rank urgency (1-10).
- **AI Volunteer Matching**: Matches volunteers to tasks based on skills and location.
- **Live Dashboard**: Interactive map (Leaflet) and trend charts (Chart.js).
- **Role-Based Access**: Separate views for Field Workers and Coordinators.
- **Mobile Friendly**: Fully responsive design using Tailwind CSS.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file (or set in AI Studio Secrets) with the following:
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `VITE_HUGGINGFACE_API_KEY`: Your Hugging Face Inference API key.
- `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`: For email notifications.

### 2. Firebase Setup
The app uses Firebase Firestore and Authentication.
- Ensure `firebase-applet-config.json` is present with your project details.
- Firestore rules are defined in `firestore.rules`.

### 3. Running Locally
```bash
npm install
npm run dev
```

### 4. Deployment
```bash
npm run build
# Deploy to Firebase Hosting
firebase deploy
```

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Framer Motion.
- **Backend**: Firebase (Firestore, Auth).
- **AI**: Google Gemini (@google/genai), Hugging Face (facebook/bart-large-mnli).
- **Maps**: Leaflet.js.
- **Charts**: Chart.js.
