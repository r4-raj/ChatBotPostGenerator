const express = require('express');
const router = express.Router();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// --- Configurations ---
const openaiApiKey = process.env.OPENAI_API_KEY;
const chatApiUrl = 'https://api.openai.com/v1/chat/completions';
const imageApiUrl = 'https://api.openai.com/v1/images/generations';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =================================================================
// --- HELPER FUNCTIONS ---
// =================================================================

/**
 * Calls the image generation AI (DALL-E 3).
 */
const callImageAI = async (prompt) => {
  const response = await axios.post(
    imageApiUrl,
    {
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    },
    { headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' } }
  );
  return response.data.data[0].url; // Returns the temporary image URL
};

/**
 * Uploads an image from a URL to Cloudinary.
 */
const uploadImageToCloudinary = async (imageUrl) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "post-generator-images", // Organizes images in a Cloudinary folder
    });
    return result.secure_url; // Returns the permanent HTTPS URL
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

/**
 * A specialized helper to get only hashtags for a specific platform.
 */
const callHashtagAI = async (platform, postContent) => {
  const prompt = `
    Based on the following social media post, generate a JSON object with a single key "hashtags".
    The value should be an array of 5-7 viral and trending hashtags tailored specifically for the ${platform} platform.
    
    Post Content: """${postContent}"""
    
    Your final output must be only the JSON object.
  `;
  const response = await axios.post(chatApiUrl, {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  }, { headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' } });
  
  let result = JSON.parse(response.data.choices[0].message.content);
  // Data cleaning for hashtags
  if (result.hashtags && typeof result.hashtags === 'string') {
    result.hashtags = result.hashtags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag).map(tag => `#${tag}`);
  }
  return result;
};


// =================================================================
// --- MAIN API ENDPOINT ---
// =================================================================
router.post('/create-content-plan', async (req, res) => {
  const { brief, platforms } = req.body;

  if (!brief || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'A brief and at least one platform are required.' });
  }
  
  try {
    // --- Step 1: Generate the main content and image prompt ONCE ---
    const mainContentPrompt = `
      Based on the following creative brief, generate a JSON object with two keys: "postContent" and "aiImagePrompt".
      The "postContent" should be a universally engaging caption suitable for multiple social media platforms.
      Creative Brief: "${brief}"
      Your final output must be only the JSON object.
    `;
    const mainContentResponse = await axios.post(chatApiUrl, {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: mainContentPrompt }],
        response_format: { type: 'json_object' },
    }, { headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' } });
    
    const { postContent, aiImagePrompt } = JSON.parse(mainContentResponse.data.choices[0].message.content);

    // --- Step 2: Generate and upload the single image ONCE ---
    const tempImageUrl = await callImageAI(aiImagePrompt);
    const finalImageUrl = await uploadImageToCloudinary(tempImageUrl);

    // --- Step 3: Loop through platforms to get unique hashtags ---
    const hashtagPromises = platforms.map(platform => callHashtagAI(platform, postContent));
    const hashtagResults = await Promise.all(hashtagPromises);

    // --- Step 4: Combine everything into the final response ---
    const finalResponse = {
      postContent: postContent,
      imageUrl: finalImageUrl,
      platforms: {},
    };

    platforms.forEach((platform, index) => {
      finalResponse.platforms[platform] = {
        hashtags: hashtagResults[index].hashtags,
      };
    });

    res.status(200).json(finalResponse);

  } catch (error) {
    console.error('Error in the full content pipeline:', error);
    res.status(500).json({ error: 'Failed to generate content.' });
  }
});

module.exports = router;