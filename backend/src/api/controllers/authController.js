const User = require('../../models/userModel.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const serviceAccount = require('../../config/serviceAccountKey.json');

// ✅ Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 🧩 Register User
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // 1️⃣ Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2️⃣ Create new user
    user = new User({ firstName, lastName, email, password });

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4️⃣ Save user
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 🧩 Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3️⃣ Create token
    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 🧩 Google Login
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1️⃣ Verify Google token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { name, email, uid } = decodedToken;

    // 2️⃣ Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      const [firstName, ...lastNameParts] = name.split(' ');
      user = new User({
        email,
        firstName,
        lastName: lastNameParts.join(' '),
        googleId: uid,
      });
      await user.save();
    }

    // 3️⃣ Create JWT
    const payload = { id: user.id };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid or expired token. Please sign in again.' });
  }
};
