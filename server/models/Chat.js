const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'bot'], // only these two values allowed
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // links to the User model
    required: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [messageSchema] // array of messages embedded directly
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);