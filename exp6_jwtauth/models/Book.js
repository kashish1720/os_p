/**
 * Book Model
 * 
 * This model defines the structure for book documents in the library.
 */

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  genre: {
    type: String,
    trim: true,
    default: 'General'
  },
  available: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);

