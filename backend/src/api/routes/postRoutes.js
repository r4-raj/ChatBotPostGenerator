const express = require('express');
const router = express.Router();
const Post = require('../../models/postModel');
// You will need an authentication middleware to get the logged-in user's ID
// const authMiddleware = require('../middleware/auth'); 

// POST /api/posts - Save a new generated post
// We'll add a placeholder for auth middleware for now
router.post('/posts', /* authMiddleware, */ async (req, res) => {
  try {
    const generatedContent = req.body;
    // const userId = req.user.id; // You'll get this from your auth middleware

    const newPost = new Post({
      // userId: userId,
      userId: "60d5ec49e0f3e4a3b8c3d8e2", // Replace with a real user ID from your DB for testing
      content: generatedContent,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post saved successfully!', post: newPost });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post.' });
  }
});

module.exports = router;