const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
      trim: true
  },
  description: {
      type: String,
      trim: true
  },
  admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
  },
  members: [{
      user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          unique: true
      },
      role: {
          type: String,
          enum: ['admin', 'moderator', 'member'], // Fixed the typo here
          default: 'member'
      }
  }],
  inviteCode: {
      type: String,
      unique: true
  },
  createdAt: {
      type: Date,
      default: Date.now
  }
});

roomSchema.index({ members: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
