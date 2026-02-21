# ◈ SalesIQ — AI Sales & CRM Assistant

An AI-powered web app that analyzes sales conversations and provides structured CRM insights using Google Gemini.

---

## Features

- 📊 Conversation sentiment analysis
- 🚧 Objection detection
- ✅ Buying signal identification
- 🎯 Deal closing probability
- ⚡ Recommended next action
- ✉️ Suggested follow-up message

---

## Tech Stack

- **Backend** — Node.js + Express
- **Frontend** — Vanilla JavaScript (no frameworks)
- **AI Model** — Google Gemini via `@google/genai`

---

## Project Structure

```
├── index.js          # Express server & Gemini API logic
├── package.json
├── .env              # API keys (never commit this)
└── public/
    ├── index.html    # App layout & UI
    ├── script.js     # Frontend logic
    └── style.css     # Styling
```

---

## Getting Started

**1. Clone and install dependencies**
```bash
npm install
```

**2. Create a `.env` file in the root folder**
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
PORT=3000
```

**3. Run the app**
```bash
# Production
npm start

# Development (auto-restart on file change)
npm run dev
```

**4. Open in browser**
```
http://localhost:3000
```

---

## Usage

1. Paste or type a sales conversation in the input box
2. Press **Enter** to submit (or **Shift+Enter** for a new line)
3. SalesIQ will return a full analysis of the conversation

---

## Notes

- Add `.env` to your `.gitignore` to keep your API key safe
- Conversation language supports **English** and **Bahasa Indonesia**
- Requires Node.js v18 or higher