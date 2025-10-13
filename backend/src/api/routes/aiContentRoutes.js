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
 * Generates platform-specific caption and hashtags while reusing the same core idea.
 */
const callPlatformContentAI = async (platform, universalCaption) => {
  const prompt = `
    Rewrite the following caption to be optimised for ${platform}. Keep the original meaning but adapt tone, length and formatting for the platform.
    Then produce 5-7 trending, relevant hashtags for ${platform}. Return JSON with keys: "caption" (string) and "hashtags" (array of strings, each beginning with '#').

    Caption: """${universalCaption}"""

    Only return the JSON object.
  `;
  const response = await axios.post(chatApiUrl, {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  }, { headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' } });

  const raw = JSON.parse(response.data.choices[0].message.content);
  const cleaned = {
    caption: typeof raw.caption === 'string' ? raw.caption : universalCaption,
    hashtags: Array.isArray(raw.hashtags)
      ? raw.hashtags.map(tag => String(tag).trim()).filter(Boolean)
      : [],
  };
  // Normalise hashtags to include a single leading '#'
  cleaned.hashtags = cleaned.hashtags.map(tag => {
    const t = tag.replace(/^#+/, '');
    return `#${t}`;
  });

  return cleaned;
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

    // --- Step 3: For each platform, tailor caption + hashtags ---
    const platformPromises = platforms.map(platform => callPlatformContentAI(platform, postContent));
    const platformResults = await Promise.all(platformPromises);

    // --- Step 4: Combine everything into the final response ---
    const finalResponse = {
      imageUrl: finalImageUrl,
      platforms: {},
    };

    platforms.forEach((platform, index) => {
      finalResponse.platforms[platform] = {
        caption: platformResults[index].caption,
        hashtags: platformResults[index].hashtags,
      };
    });

    res.status(200).json(finalResponse);

  } catch (error) {
    console.error('Error in the full content pipeline:', error);
    res.status(500).json({ error: 'Failed to generate content.' });
  }
});

module.exports = router;