/**
 * Book Routes
 * 
 * Routes for managing books in the library system.
 * - Public: GET /api/books (browse all books)
 * - Protected (Admin): POST /api/books (add book)
 * - Protected (Admin): DELETE /api/books/:id (delete book)
 */

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

/**
 * GET /api/books
 * Public route - Browse all books
 */
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).populate('addedBy', 'username');
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

/**
 * GET /api/books/:id
 * Public route - Get single book details
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'username');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

/**
 * POST /api/books
 * Protected route (Admin only) - Add a new book
 */
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, author, isbn, description, genre } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Title and author are required'
      });
    }

    const book = new Book({
      title,
      author,
      isbn,
      description: description || '',
      genre: genre || 'General',
      addedBy: req.user.id
    });

    await book.save();
    
    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding book',
      error: error.message
    });
  }
});

/**
 * DELETE /api/books/:id
 * Protected route (Admin only) - Delete a book
 */
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

/**
 * PUT /api/books/:id
 * Protected route (Admin only) - Update a book
 */
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, author, isbn, description, genre, available } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (description !== undefined) book.description = description;
    if (genre) book.genre = genre;
    if (available !== undefined) book.available = available;

    await book.save();

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  }
});

module.exports = router;

