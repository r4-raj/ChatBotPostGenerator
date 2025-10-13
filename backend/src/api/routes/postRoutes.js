const express = require('express');
const router = express.Router();
const Post = require('../../models/postModel'); 
const authMiddleware = require('../middlewares/authMiddleware');

// --- GET /api/posts - Get all posts for the current user ---
// (This route is correct, no changes needed)
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: 'User ID not found after authentication.' });
    }
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});


// --- POST /api/posts - Save a new generated post (UPDATED LOGIC) ---
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const generatedContent = req.body;

    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: 'User ID not found after authentication.' });
    }

    // --- NEW LOGIC TO FIX DATA STRUCTURE ---
    // DESTRUCTURE the main content text from the incoming body.
    const { postContent, platforms } = generatedContent;

    // VERY IMPORTANT: Iterate over the platforms and add the 'caption'.
    if (postContent && platforms) {
        Object.keys(platforms).forEach(platformKey => {
            if (platforms[platformKey]) {
                // This line creates the 'caption' field the frontend needs.
                platforms[platformKey].caption = postContent;
            }
        });
    }
    // --- END OF NEW LOGIC ---

    const newPost = new Post({
      userId: req.user.id,
      // SAVE THE MODIFIED content object with the new caption fields.
      content: generatedContent, 
    });

    await newPost.save();
    res.status(201).json({ message: 'Post saved successfully!', post: newPost });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save the post.' });
  }
});


// --- GET /api/posts/:id - Get a single post by id for the current user ---
// (This route is correct, no changes needed)
router.get('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: 'User ID not found after authentication.' });
    }
    const post = await Post.findOne({ _id: id, userId: req.user.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post by id:', error);
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
});

// --- PUT /api/posts/:id - Update an existing post ---
// ADD THIS ROUTE TO HANDLE SAVING EDITS FROM THE POSTEDITOR
router.put('/posts/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body; // The frontend will send the updated content object

        if (!content) {
            return res.status(400).json({ error: 'Content is required for update.' });
        }

        const updatedPost = await Post.findOneAndUpdate(
            { _id: id, userId: req.user.id }, // Ensure user can only update their own posts
            { $set: { content: content } }, // Set the new content
            { new: true } // Return the updated document
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found or you do not have permission to edit it.' });
        }

        res.status(200).json({ message: 'Post updated successfully!', post: updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update the post.' });
    }
});


module.exports = router;