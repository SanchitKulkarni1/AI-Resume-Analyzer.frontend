# 📄 AI Resume Analyzer: Frontend

**Live demo:** https://ai-resume-analyzer-frontend-wheat.vercel.app/

React frontend for the **AI Resume Analyzer**. Upload a resume and paste a job description to get a **match score**, detailed feedback and a personalised career roadmap.

Backend (FastAPI · LangChain · ChromaDB): [AI-Resume-Analyzer.backend](https://github.com/SanchitKulkarni1/AI-Resume-Analyzer.backend)

## Tech stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui

## Run locally

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
```

The app calls `POST {VITE_API_BASE_URL}/analyze` on the backend.
