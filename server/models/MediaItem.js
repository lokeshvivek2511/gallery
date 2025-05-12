const mongoose = require('mongoose');

const MediaItemSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  filepath: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MediaItem', MediaItemSchema);