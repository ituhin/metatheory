const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { userLoggedInEntry, userLoggedOutEntry } = require('../lib/usersLog');
const { userObjResponse } = require('../helper/utils');

const registerUser = async (req, res) => {
    try {
      const { fullName, email, password, role } = req.body;
  
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      user = new User({ fullName, email, password: hashedPassword, role: role || "user" });
      await user.save();
  
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      const ipAddress = req.ip || req.connection.remoteAddress;
      await userLoggedInEntry(user, token, ipAddress);
  
      res.json({ token, user: userObjResponse(user) });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  const loginUser = async (req, res) => {
    try {
      const { email, password, role } = req.body; 
  
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });
  
      if (role && user.role !== role) {
        return res.status(403).json({ message: "Unauthorized login attempt" });
      }
  
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      // ideally there should be a session module on the server side to handle this things
  
      const ipAddress = req.ip || req.connection.remoteAddress;
      console.log(req.ip, 222, req.connection.remoteAddress);
      await userLoggedInEntry(user, token, ipAddress);
  
      res.json({ token, user: userObjResponse(user) });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  const logout = async (req, res) => {
    try {
      await userLoggedOutEntry(req.user.userId, req.headers.authorization?.split(' ')[1]);
  
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };


module.exports = { registerUser, loginUser, logout };
