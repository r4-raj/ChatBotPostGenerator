const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // --- From Step 1 ---
  businessName: { type: String, trim: true },
  website: { type: String, trim: true },

  // --- From Step 2 ---
  businessDescription: { type: String },
  industry: { type: String },
  companySize: { type: String },

  // --- From Step 3 ---
  // Storing the logo URL. The actual file upload is handled separately.
  businessLogo: { type: String }, 
  primaryBrandColor: { type: String },
  secondaryBrandColor: { type: String },
  brandTone: { type: String },

  // --- From Step 4 ---
  targetAudience: { type: String },
  keyMessages: { type: String },
  contentThemes: { type: String },

  // --- From Step 5 ---
  postingFrequency: { type: String },
  timezone: { type: String },
  
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;