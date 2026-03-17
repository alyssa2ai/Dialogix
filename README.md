# Dialogix — Full-Stack AI Chat Platform

A modern, production-ready AI chat application built with **React**, **Node.js**, **MongoDB**, and **Groq AI**.

## 🚀 Features

- **Real-time Chat**: Instant messaging with live typing indicators via Socket.io
- **AI-Powered Responses**: Integrated with Groq's LLaMA 3.3 70B model for intelligent context-aware replies
- **Session Management**: Create, organize, and manage multiple chat sessions with auto-titling
- **Markdown Support**: Bot responses render formatted text, lists, bold text, and inline code
- **User Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Dark-Mode UI**: Modern, responsive design built with Tailwind CSS
- **Auto-Resizing Input**: Textarea grows as you type, up to 4 lines
- **User Avatars**: Shows username initials in message bubbles

## 📋 Tech Stack

### Backend

- **Express.js** — Web server & REST API routing
- **MongoDB** + **Mongoose** — NoSQL database with schema validation
- **Socket.io** — WebSocket for real-time typing indicators
- **Groq SDK** — Calls LLaMA 3.3 70B for AI responses
- **JWT** — Stateless authentication tokens
- **bcryptjs** — Password hashing for security

### Frontend

- **React 19** — UI framework with hooks
- **React Router** — Client-side routing (login/signup/chat)
- **Axios** — HTTP client with JWT interceptors
- **Tailwind CSS** — Utility-first styling
- **React Markdown** — Renders formatted bot messages

## 🛠️ Installation

### Prerequisites

- Node.js v22+
- MongoDB Atlas account (free tier fine)
- Groq API key (free at https://console.groq.com)

### Backend Setup

```bash
cd server
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dialogix
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=gsk_your_groq_key_here
```

Run:

```bash
npm run dev
```

Server will start on `http://localhost:5000` ✅

### Frontend Setup

```bash
cd client
npm install
```

Run:

```bash
npm run dev
```

Frontend will start on `http://localhost:5173` ✅

## 📖 API Endpoints

### Auth

- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login user, get JWT

### Chat

All routes require `Authorization: Bearer <token>` header.

- `GET /api/chat/sessions` — List all user's chat sessions
- `POST /api/chat/sessions` — Create new empty session
- `GET /api/chat/sessions/:id` — Get full session with messages
- `POST /api/chat/sessions/:id/message` — Send message, get AI reply
- `PATCH /api/chat/sessions/:id/rename` — Rename session title
- `DELETE /api/chat/sessions/:id` — Delete session

## 🔄 Database Schema

### User

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Chat

```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  messages: [{
    sender: 'user' | 'bot',
    text: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Project Structure

```
dialogix/
├── client/
│   ├── src/
│   │   ├── api/axios.js              # HTTP client with JWT interceptor
│   │   ├── context/AuthContext.jsx   # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Chat.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Chat session list
│   │   │   ├── ChatWindow.jsx        # Main chat UI
│   │   │   ├── MessageBubble.jsx     # With markdown rendering
│   │   │   └── TypingIndicator.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── chatController.js
│   ├── middleware/auth.js            # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   └── Chat.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── chat.js
│   ├── index.js                      # Express app + Socket.io setup
│   ├── .env                          # (ignored, use as template)
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
# Upload `dist/` folder to Vercel
```

### Backend (Railway/Render)

Push `main` branch to git. Set these environment variables in your host:

- `MONGO_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`
- `PORT` (default 5000)

## 🔐 Security Notes

1. **Never commit `.env`** — It's in `.gitignore` but double-check before pushing
2. **Rotate API keys** if exposed in git history
3. **CORS is limited** to `localhost:5173/5174` in development — update for production
4. **JWT expires in 7 days** — Adjust `expiresIn` in `authController.js` as needed
5. **Passwords hashed with bcrypt** — Never store plain text

## 📝 Todo / Future Features

- [ ] Email verification on signup
- [ ] Forgot password flow
- [ ] Chat export (PDF/JSON)
- [ ] User profile page
- [ ] System prompts / custom personas
- [ ] Rate limiting on API
- [ ] Refresh token rotation
- [ ] Search across chats

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Groq API Docs](https://console.groq.com/docs)
- [Tailwind CSS](https://tailwindcss.com)

## 📧 Questions?

Open an issue on GitHub or reach out!

---

Built with ❤️ by alyssa2ai | March 2026
