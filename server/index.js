const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = http.createServer(app); // wrap express in http server for socket.io
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
];

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Debug logger for incoming API requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));

// Health check route
app.get('/', (req, res) => res.send('Dialogix API running 🚀'));

// Socket.io — typing indicator
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_chat', (chatId) => {
    socket.join(chatId); // join a room for this specific chat
  });

  socket.on('typing', (chatId) => {
    socket.to(chatId).emit('bot_typing'); // broadcast to others in room
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected ✅');
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} ✅`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));