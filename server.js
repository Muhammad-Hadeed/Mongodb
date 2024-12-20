const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Item = require('./models/model');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');


// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser()); // To parse cookies

// Configure Session
app.use(session({
  secret: 'Hadeed', // Replace with a secure, random string in production
  resave: false,             // Prevents session being saved if it hasn't changed
  saveUninitialized: false,  // Prevents saving uninitialized sessions
  cookie: {
    maxAge: 1000 * 60 * 60,  // Session duration (1 hour)
    httpOnly: true,          // Makes the cookie inaccessible to client-side JavaScript
    secure: false,           // Set to true if using HTTPS
  },
}));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch(err => console.error(err));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Test route to set session data and cookies
app.get('/set-session-cookie', (req, res) => {
  // Set session data
  req.session.user = {
    name: 'Hadeed',
    role: 'Student',
  };
  req.session.visited = req.session.visited ? req.session.visited + 1 : 1;

  // Set a cookie
  res.cookie('customCookie', 'This is a custom cookie value', {
    maxAge: 1000 * 60 * 60,  // Cookie duration (1 hour)
    httpOnly: true,          // Prevent access by client-side JavaScript
    secure: false,           // Set to true if using HTTPS
  });

  res.status(200).json({
    message: 'Session and cookie set successfully',
    sessionData: req.session,
  });
});
// Test route to get session and cookie data
app.get('/get-session-cookie', (req, res) => {
  // Retrieve session data
  const sessionData = req.session.user || 'No session data found';
  const visited = req.session.visited || 0;

  // Retrieve cookie data
  const cookieData = req.cookies.customCookie || 'No cookie found';

  res.status(200).json({
    session: sessionData,
    visitedCount: visited,
    cookie: cookieData,
  });
});

// Test route to destroy session and clear cookies
app.get('/destroy-session-cookie', (req, res) => {
  // Destroy session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Failed to destroy session' });
    }
    // Clear the session cookie
    res.clearCookie('connect.sid'); 
    // Clear the custom cookie
    res.clearCookie('customCookie');
    res.status(200).json({ message: 'Session and cookies cleared successfully' });
  });
});



// Create
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
