const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  // This links the post to the user who created it
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes you have a 'User' model
    required: true,
  },
  // This will store the generated content for all platforms
  // e.g., { instagram: { postContent: '...', imageUrl: '...' }}
  content: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;