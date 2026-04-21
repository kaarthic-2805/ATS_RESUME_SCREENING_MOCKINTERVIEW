# 🧠 AI CareerCoach

**AI CareerCoach** is an intelligent web application that provides personalized career guidance based on a user’s skills, interests, and aspirations. Powered by AI, it generates custom career roadmaps, recommends skill-building resources, and offers 1-on-1 guidance through an interactive chatbot.

> Helping individuals navigate their career paths with clarity and confidence.


## 🚀 Features

- 🔍 **Career Path Discovery** – Get role suggestions tailored to your background and goals.
- 📊 **Resume/Skill Analyzer** – Extracts relevant skills and recommends improvement areas.
- 🛣️ **Personalized Roadmaps** – Generates step-by-step learning plans to reach your target career.
- 📚 **AI-curated Resources** – Courses, articles, tools, and videos based on your goals.
- 💬 **AI Career Coach Chatbot** – Ask questions and receive instant career guidance.
- 📈 **Progress Tracker** – Monitor your learning milestones and career journey.

---

## 🛠️ Tech Stack

| Layer         | Technology                          |
|---------------|--------------------------------------|
| **Frontend**  | Next.js, Tailwind CSS                |
| **Backend**   | Next.js API Routes, Inngest          |
| **Database**  | Neon DB (PostgreSQL), Prisma ORM     |
| **Authentication** | Clerk                          |
| **AI Integration** | Gemini API (Google AI)          |
| **Hosting**   | Vercel                               |

---

## 📁 Project Structure

```
ai-careercoach/
├── components/              # Reusable UI components
│   ├── dashboard/           # Dashboard-related components
│   ├── forms/               # Form inputs (e.g., skill input, goal input)
│   ├── roadmap/             # Timeline/roadmap rendering components
├── pages/                   # Next.js routes (Frontend + API)
│   ├── api/                 # Backend API endpoints
│   │   ├── recommend.js     # Career recommendation endpoint
│   │   ├── roadmap.js       # Roadmap generation API
│   │   └── ... (other APIs)
│   ├── dashboard.jsx        # User dashboard
│   ├── index.jsx            # Landing/home page
│   ├── login.jsx            # Auth login page (Clerk)
│   ├── signup.jsx           # Auth signup page
├── lib/                     # Utility functions and integrations
│   ├── ai/                  # Gemini API interaction logic
│   ├── db.js                # Prisma DB client configuration
│   └── helpers.js           # Reusable helper functions
├── prisma/                  # Prisma schema and migrations
│   ├── schema.prisma        # Prisma schema file
│   └── seed.js              # Optional DB seeding script
├── public/                  # Static files (images, icons, etc.)
│   ├── screenshots/         # Screenshots for documentation
│   ├── favicon.ico
│   └── logo.png
├── styles/                  # Tailwind CSS and global styles
│   └── globals.css
├── .env.local               # Local environment variables
├── tailwind.config.js       # Tailwind CSS configuration
├── package.json             # Project dependencies and scripts
├── next.config.js           # Next.js configuration
└── README.md                # Project documentation
```


## 📞 Contact

For inquiries or support, please reach out:
- 👨‍💼 **Name**: Kaarthic I.R
- 📧 **Email**: kaarthicir28@gmail.com
- 🌐 **GitHub**: https://github.com/kaarthic-2805/ATS_RESUME_SCREENING_MOCKINTERVIEW

---

🙌 I hope this project helps you create exceptional resumes, develop your career and land your dream job!
