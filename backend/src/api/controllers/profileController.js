const Profile = require('../../models/profileModel');

// @desc    Get current user's profile
// @route   GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['firstName', 'email']);

    if (!profile) {
      return res.status(404).json({ message: 'This user has not created a profile yet.' });
    }
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create or update a user's profile
// @route   POST /api/profile
exports.createOrUpdateProfile = async (req, res) => {
  // Destructure all expected fields, including the new businessLogo
  const {
    businessName,
    website,
    businessDescription,
    industry,
    companySize,
    businessLogo, // <-- ADDED THIS LINE
    primaryBrandColor,
    secondaryBrandColor,
    brandTone,
    targetAudience,
    keyMessages,
    contentThemes,
    postingFrequency,
    timezone
  } = req.body;

  // Build the profile object to save to the database
  const profileFields = {
    user: req.user.id,
    businessName,
    website,
    businessDescription,
    industry,
    companySize,
    businessLogo, // <-- ADDED THIS LINE
    primaryBrandColor,
    secondaryBrandColor,
    brandTone,
    targetAudience,
    keyMessages,
    contentThemes,
    postingFrequency,
    timezone,
    onboardingComplete: true,
  };

  try {
    // Find and update the profile, or create it if it doesn't exist
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    );
    res.status(201).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
};
