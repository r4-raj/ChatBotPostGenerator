// --- Your Routes ---
const express = require('express');
const cors = require('cors');
const authRoutes = require('./api/routes/authRoutes');
const profileRoutes = require('./api/routes/profileRoutes');
const aiContentRoutes = require('./api/routes/aiContentRoutes');
const postRoutes = require('./api/routes/postRoutes'); // Import the new routes
const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
// Increase the limit for URL-encoded payloads (often used with forms)
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Handle malformed JSON bodies gracefully (e.g., GET requests with invalid JSON body)
app.use((err, req, res, next) => {
  // Body-parser/express.json set this type on parse failure
  if (err && (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err))) {
    return res.status(400).json({
      error: 'Invalid JSON payload',
      message: 'Request body could not be parsed as valid JSON.'
    });
  }
  return next(err);
});


app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', aiContentRoutes);
// ... app.use(cors()), app.use(express.json())
// ... your other routes (auth, profile, aiContentRoutes)
app.use('/api', postRoutes); // Add the new post routes


// Simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// This function will catch any errors that occur in your routes
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({
    error: 'An unexpected error occurred.',
    message: err.message // Send a clean message to the client
  });
});
// ----------------------------------------------------


module.exports = app;