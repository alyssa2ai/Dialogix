const Chat = require('../models/Chat');
const Groq = require('groq-sdk').default;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get all chat sessions for the logged-in user
exports.getSessions = async (req, res) => {
  try {
    // Only return id + title + timestamps, not all messages (faster load)
    const chats = await Chat.find({ userId: req.user.userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 }); // most recent first
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new empty chat session
exports.createSession = async (req, res) => {
  try {
    const chat = await Chat.create({ userId: req.user.userId, title: 'New Chat', messages: [] });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get one full chat with all messages
exports.getSession = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message and get AI reply
exports.sendMessage = async (req, res) => {
  try {
    console.log(`[CHAT] sendMessage hit for session ${req.params.id} by user ${req.user.userId}`);
    const { message, systemPrompt } = req.body;
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Missing GROQ_API_KEY in server .env' });
    }

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Save user message
    chat.messages.push({ sender: 'user', text: message });

    // Auto-generate title from first message
    if (chat.messages.length === 1) {
      chat.title = message.length > 40 ? message.substring(0, 40) + '...' : message;
    }

    // Build conversation history for context (last 10 messages)
    const history = chat.messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    // Call Groq API
    const completion = await Promise.race([
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              systemPrompt ||
              'You are Synapse Core - an interstellar AI assistant. Be pragmatic, calm, and precise. Use space metaphors sparingly. Never start with "I". Avoid filler phrases like "Certainly!" or "Great question!"',
          },
          ...history
        ],
        max_tokens: 1024
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Groq request timed out after 30 seconds')), 30000);
      })
    ]);

    const botReply = completion.choices[0].message.content;

    // Save bot reply
    chat.messages.push({ sender: 'bot', text: botReply });
    await chat.save();

    res.json({
      userMessage: chat.messages[chat.messages.length - 2],
      botMessage: chat.messages[chat.messages.length - 1],
      chatTitle: chat.title
    });
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Rename a session
exports.renameSession = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { title: req.body.title },
      { returnDocument: 'after' }
    );
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};