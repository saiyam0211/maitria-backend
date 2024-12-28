const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, phoneNumber, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phoneNumber }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      phoneNumber,
      password: hashedPassword,
      name
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error during registration' });
  }
};