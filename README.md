# SkillBridge AI - Frontend

SkillBridge AI is an advanced semantic skill matching platform designed to bridge the gap between job seekers and top recruiters using artificial intelligence and precise algorithmic matching.

## 🚀 Tech Stack

- **Framework**: React (Bootstrapped with Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Deployment**: Vercel

## ✨ Key Features

- **Role-Based Portals**: Dedicated, distinct dashboards for Job Seekers and HR/Recruiters.
- **Robust Authentication**: 
  - Login/Register with dynamic role validation.
  - Silent token refresh (JWT) to ensure uninterrupted user sessions without forced logouts.
  - Automatic error handling (clearing fields) and show/hide password toggles.
- **Modern "Hyper-Precision" UI**: 
  - Designed with depth, surface hierarchy, and minimal 1px borders.
  - Interactive micro-animations and seamless transitions.
- **API Proxy Integration**: Configured to flawlessly connect to the Railway backend avoiding CORS issues, both locally (`vite.config.js`) and in production (`vercel.json`).

## 🛠 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SkillBridge-AI-Semantic-Skill-Matching/Frontend.git
   cd Frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will typically run on `http://localhost:5173`.

## 🔗 Backend Configuration

During development, the frontend automatically routes any `/api` requests to the live Railway backend using the proxy configured in `vite.config.js`. 
In production, `vercel.json` handles the Single Page Application (SPA) routing and API reverse proxying.

---
*Note: This is a temporary README created for the Capstone Project submission and development tracking.*
