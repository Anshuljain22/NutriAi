<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" alt="Logo" width="80" height="80">
  
  # NutriAI 🏋️‍♂️🥗
  
  **Where Fitness Meets Intelligence & Community**
  
  [Features](#features) • [Installation](#installation) • [Privacy Details](#privacy--security-note) 
</div>

---

## What is NutriAI?
**NutriAI** is a comprehensive, modern Social Fitness & Nutrition platform built with Next.js and TailwindCSS. It brings together workout tracking, social networking, gamification, and AI-driven nutrition insights into one sleek, premium application.

With seamless daily activity heatmaps, live PR tracking, and Reddit-style community forums, NutriAI changes how individuals interact with their fitness journey.

---

## 🚀 Features

### 🧠 AI Nutrition Intelligence
* **Gemini-Powered Logging**: Log your meals (e.g., "Grandma's Lasagna") and let AI instantly calculate calories, protein, carbs, and fats.
* **Smart Targets**: Employs Mifflin-St Jeor equations to automatically set daily goals.
* **Weekly Insights**: Your AI coach analyzes your weekly macros and workout progression, giving actionable advice.

### 🏋️‍♂️ Workout Tracker & History
* **Real-time Logging**: Track sets, reps, and weights.
* **Volume History**: Automatic progressive overload charting and PR celebrations.

### 👥 The Social Network
* **Follower Ecosystem**: Follow your favorite athletes, like their workouts, and cheer them on.
* **Reddit-style Communities**: Create public or private hubs (e.g., `c/Powerlifting`). Post form-check videos, ask for advice, and upvote/downvote discussions.
* **Granular Privacy**: Choose exactly who sees a workout: Public, Followers Only, or Private.

### 🎮 Gamification & Streaks
* **GitHub-style Heatmaps**: Visualize your dedication.
* **Achievement Badges**: Unlock milestones like the *"10,000kg Club"* or *"7-Day Streak"*.
* **Global Leaderboards**: Compare your Weekly Volume or Longest Streaks worldwide.

---

## 🛠 Tech Stack
- **Framework**: [Next.js 16 (React 19)](https://nextjs.org/)
- **UI & Styling**: [TailwindCSS v4](https://tailwindcss.com/), Framer Motion
- **Database**: [Better SQLite3](https://github.com/WiseLibs/better-sqlite3) (Local `nutriai.db`)
- **Authentication**: Custom JWT with `jose` + bcrypt
- **AI Integration**: [Google Generative AI](https://ai.google.dev/) (`@google/generative-ai`)

---

## 💻 Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/gym2-app.git
   cd gym2-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables**
   Create a \`.env.local\` file in the root directory. 
   \`\`\`env
   # Used for JWT Authentication encryption
   JWT_SECRET="your_super_secret_key_here"
   
   # Required for the AI Nutrition insights and natural language food logging
   GEMINI_API_KEY="your_google_gemini_api_key_here"
   \`\`\`

4. **Initialize Database & Run Application**
   The application intercepts standard `next dev` to generate a local SQLite database (`nutriai.db`) on boot automatically.
   \`\`\`bash
   npm run dev
   \`\`\`
   <br>
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔒 Privacy & Security Note
* **.env Protection**: Your `.env.local` containing the `GEMINI_API_KEY` and `JWT_SECRET` is explicitly ignored by GitHub via `.gitignore`. Your keys will never be published to the public repository.
* **Local DB**: User data, passwords (hashed), and workout sessions are all stored locally in the `nutriai.db` SQLite file. This file is **not** currently `.gitignore`d so you can retain state across deployments, but be aware this means pushing the DB pushes the hashed users. If you wish to protect user data from the public repo, add `nutriai.db` to your `.gitignore` before committing.

---

<div align="center">
  <i>Built with ❤️ using Next.js & React 19</i>
</div>
