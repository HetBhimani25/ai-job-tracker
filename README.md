# 🔍 JobLens — AI-Powered Job Application Tracker

> Track every job application with AI assistance — analyze JDs, generate cover letters, and prep for interviews

🔗 **GitHub:** https://github.com/HetBhimani25/ai-job-tracker

---

## ✨ Features

- 📋 Full job application pipeline (Applied → Interview → Offer → Rejected)
- 🤖 AI Job Description Analyzer — match score, skill gaps, resume tips
- ✉️ AI Cover Letter Generator — personalized per company and role
- 🎯 AI Interview Prep — technical + behavioral questions + tips
- 📄 PDF/TXT resume upload with auto skill extraction
- 📁 PDF/TXT JD upload with auto text extraction
- 🔔 Follow-up date reminders with overdue warnings
- 🔍 Search, filter, and sort applications
- 📊 Stats dashboard (Applied, Interview, Offer, Rejected counts)
- 📥 CSV export of all applications
- 🎛️ AI Bottom Drawer — minimize/maximize AI panel
- 🔐 JWT Authentication

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Context API, React Router |
| **Backend** | Node.js, Express.js |
| **AI/LLM** | Groq API (llama-3.3-70b-versatile) |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **File Upload** | Multer (memory storage) |
| **PDF Parsing** | pdf-parse |

---

## 🤖 AI Features

- **JD Analyzer** — Compares job description against your resume, returns match score (0-100), strong matches, skill gaps, and resume improvement tips
- **Cover Letter Generator** — Writes a personalized 3-paragraph cover letter based on JD + your skills
- **Interview Prep** — Generates 5 technical questions, 3 behavioral questions, and 3 preparation tips specific to the role
- **Auto Skill Extraction** — Uploads your resume PDF → AI extracts skills automatically → used for all AI analysis
---

## 🚀 Run Locally

### Backend
```bash
cd server
npm install

# Create .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-job-tracker
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
ALLOWED_ORIGINS=http://localhost:3000

node index.js
```

### Frontend
```bash
cd client
npm install
npm start
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/jobs` | Get all jobs |
| POST | `/api/jobs` | Create job + upload files |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |
| POST | `/api/ai/analyze` | Analyze JD vs resume |
| POST | `/api/ai/cover-letter` | Generate cover letter |
| POST | `/api/ai/interview-prep` | Generate interview questions |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update skills |

---

## 👨‍💻 Author

**Het Bhimani**  
[GitHub](https://github.com/HetBhimani25) · [LinkedIn](https://www.linkedin.com/in/hetbhimani)
