const Profile = require('../../models/profileModel');

// @desc    Get current user's profile
// @route   GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    // Find the profile linked to the logged-in user's ID
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
  // Destructure all the expected fields from the form
  const {
    businessName,
    website,
    businessDescription,
    industry,
    companySize,
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
    // Find the profile by the user's ID and update it.
    // If it doesn't exist ('upsert: true'), create it.
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

