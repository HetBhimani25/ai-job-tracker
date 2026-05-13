# AI-Powered Job Application Tracker

A full-stack web application to track job applications with an integrated
AI assistant that analyzes job descriptions, suggests resume improvements,
and sends follow-up reminders.

## 🚀 Features

- Track job applications with status pipelines (Applied → Interview → Offer)
- AI-powered JD analyzer using OpenAI API — suggests skill gaps and resume improvements
- Secure JWT-based authentication and protected routes
- Email reminders via Node.js cron jobs for follow-ups and interviews
- React.js dashboard with real-time status updates

## 🛠️ Tech Stack

**Frontend:** React.js, Axios, React Context API  
**Backend:** Node.js, Express.js, JWT  
**Database:** MongoDB  
**AI Integration:** OpenAI API, Prompt Engineering  

## 📁 Project Structure

ai-job-tracker/
├── client/          # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
├── server/          # Node.js + Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── services/    # AI integration & cron jobs
└── README.md

## ⚙️ Setup & Installation

### Prerequisites
- Node.js >= 18.x
- MongoDB (local or Atlas)
- OpenAI API Key

### Backend
```bash
cd server
npm install
cp .env.example .env
# Add your MONGODB_URI, JWT_SECRET, OPENAI_API_KEY in .env
npm run dev
```

### Frontend
```bash
cd client
npm install
npm start
```

## 🔑 Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

## 🗺️ Roadmap

- [x] Project setup & folder structure
- [ ] User auth (JWT)
- [ ] Job CRUD APIs
- [ ] AI JD Analyzer integration
- [ ] React dashboard
- [ ] Cron job email reminders

## 👤 Author

**Het Bhimani**  
[LinkedIn](https://linkedin.com/in/hetbhimani) • [GitHub](https://github.com/HetBhimani25)
