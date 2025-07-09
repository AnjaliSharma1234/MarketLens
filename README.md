# MarketLens - AI-Powered Competitive Intelligence Platform

MarketLens is a sophisticated web application that provides AI-powered competitive analysis and market intelligence. It helps businesses understand their competitors, market positioning, and strategic opportunities through automated analysis and insights.

## 🌟 Key Features

### 1. Competitor Analysis
- Automated competitor discovery and analysis
- Detailed company overviews and profiles
- Real-time market positioning insights
- Comprehensive competitor comparison

### 2. Marketing Intelligence
- Brand messaging analysis
- Website traffic insights
- Marketing channel effectiveness
- SEO strategy analysis
- Target audience profiling

### 3. Product & Pricing Analysis
- Feature comparison
- Pricing strategy insights
- Market positioning analysis
- Technology stack evaluation

### 4. AI-Powered Insights
- Ask Me Anything (AMA) feature for custom queries
- Real-time data analysis
- Automated report generation
- Contextual recommendations

### 5. Report Management
- Save and organize competitor reports
- Export capabilities
- Historical analysis tracking
- Custom report organization

## 🛠️ Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Shadcn UI components
- Radix UI primitives
- React Router for navigation
- React Query for data fetching

### Backend
- Firebase for authentication and database
- Express.js for API handling
- Node.js runtime
- Cheerio for web scraping

### AI/ML
- GPT integration for analysis
- Custom prompt engineering
- Intelligent data processing

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Environment variables setup

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/theanjalisharmaa/marketlens-insights.git
cd marketlens-insights
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

5. Start the backend server:
```bash
npm run server
```

## 🏗️ Project Structure

```
marketlens-insights/
├── api/                  # Backend API endpoints
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and configs
│   ├── pages/           # Page components
│   └── styles/          # Global styles
├── public/              # Static assets
└── server.cjs          # Express server setup
```

## 🔒 Authentication

The application uses Firebase Authentication with the following methods:
- Email/Password authentication
- Google Sign-In
- Custom user profile management

## 💾 Database Structure

Firebase Firestore collections:
- `users`: User profiles and settings
- `savedAnalysis`: Saved competitor analyses
- `chats`: AI conversation history
- `prompts`: System prompts for AI

## 🚀 Deployment

The application can be deployed using:
- Vercel (Frontend)
- Firebase Functions (Backend)
- Custom server deployment options

## 📝 License

This project is private and proprietary. All rights reserved.

## 🤝 Contributing

This is a private repository. Contact the repository owner for contribution guidelines.

## 📧 Support

For support or inquiries, please contact the repository owner.
