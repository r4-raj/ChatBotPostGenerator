const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ADD THESE TWO LINES ---
const authRoutes = require('./api/routes/authRoutes');
app.use('/api/auth', authRoutes); // Any URL starting with /api/auth will be handled by this router
// -------------------------

// Simple test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

module.exports = app;