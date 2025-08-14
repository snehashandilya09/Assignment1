require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize local JSON database files
const dbFiles = {
  users: path.join(dataDir, 'users.json'),
  content: path.join(dataDir, 'content.json'),
  clickstream: path.join(dataDir, 'clickstream.json')
};

// Initialize database files if they don't exist
Object.entries(dbFiles).forEach(([name, filePath]) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    console.log(`✅ Created ${name} database file`);
  }
});

// Helper functions for database operations
const readDB = (dbName) => {
  try {
    const data = fs.readFileSync(dbFiles[dbName], 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${dbName} database:`, error);
    return [];
  }
};

const writeDB = (dbName, data) => {
  try {
    fs.writeFileSync(dbFiles[dbName], JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${dbName} database:`, error);
    return false;
  }
};

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:5173',
  'http://localhost:5174', // Additional Vite ports
  'https://your-app-name.vercel.app', // Replace with your actual Vercel domain
  'https://*.vercel.app' // Allow all Vercel preview deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches Vercel pattern
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // For development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

console.log('✅ Local JSON Database initialized');

// Health check route
app.get('/api/health', (req, res) => {
  const users = readDB('users');
  const content = readDB('content');
  const clickstream = readDB('clickstream');
  
  res.status(200).json({ 
    message: 'EduTrack Analytics Platform API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Local JSON Database',
    stats: {
      users: users.length,
      content: content.length,
      clickstream: clickstream.length
    }
  });
});

// User Authentication Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }
    
    const users = readDB('users');
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password, // In real app, hash this password
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    users.push(newUser);
    writeDB('users', users);
    
    // Return user without password
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token: `mock-jwt-token-${newUser.id}` // Add token for auto-login after registration
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const users = readDB('users');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex] = user;
    writeDB('users', users);
    
    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token: `mock-jwt-token-${user.id}` // Mock token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Content Routes
app.get('/api/content', (req, res) => {
  try {
    const content = readDB('content');
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
});

app.post('/api/content', (req, res) => {
  try {
    const { title, type, description, videoUrl, quizData } = req.body;
    
    const content = readDB('content');
    const newContent = {
      id: content.length + 1,
      title,
      type, // 'text', 'video', 'quiz'
      description,
      videoUrl,
      quizData,
      createdAt: new Date().toISOString()
    };
    
    content.push(newContent);
    writeDB('content', content);
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      content: newContent
    });
    
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content'
    });
  }
});

// Clickstream tracking
app.post('/api/clickstream', (req, res) => {
  try {
    const clickData = {
      id: Date.now(),
      sessionId: req.body.sessionId,
      userId: req.body.userId,
      eventType: req.body.eventType,
      eventData: req.body.eventData,
      timestamp: req.body.timestamp || new Date().toISOString(),
      url: req.body.url,
      userAgent: req.body.userAgent || req.headers['user-agent'],
      viewport: req.body.viewport,
      ip: req.ip,
      // Keep backward compatibility with old format
      action: req.body.action || req.body.eventType,
      elementId: req.body.elementId,
      page: req.body.page,
      additionalData: req.body.additionalData,
      // Add details field for event context
      details: req.body.details || req.body.eventData
    };
    
    const clickstream = readDB('clickstream');
    clickstream.push(clickData);
    writeDB('clickstream', clickstream);
    
    console.log(`📊 Clickstream recorded: ${clickData.eventType || clickData.action} (Session: ${clickData.sessionId?.substring(0, 8)}...)`);
    
    res.json({
      success: true,
      message: 'Clickstream data recorded',
      id: clickData.id
    });
    
  } catch (error) {
    console.error('Clickstream error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record clickstream data'
    });
  }
});

// Get clickstream analytics
app.get('/api/analytics/clickstream', (req, res) => {
  try {
    const clickstream = readDB('clickstream');
    const { userId, page, startDate, endDate } = req.query;
    
    let filteredData = clickstream;
    
    if (userId) {
      filteredData = filteredData.filter(item => item.userId == userId);
    }
    
    if (page) {
      filteredData = filteredData.filter(item => item.page === page);
    }
    
    if (startDate) {
      filteredData = filteredData.filter(item => new Date(item.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      filteredData = filteredData.filter(item => new Date(item.timestamp) <= new Date(endDate));
    }
    
    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Get user-specific clickstream data
app.get('/api/clickstream/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const clickstream = readDB('clickstream');
    
    // Filter data for specific user
    const userData = clickstream.filter(item => 
      item.userId === userId || item.userId == userId
    );
    
    // Sort by timestamp descending (most recent first)
    userData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      userId,
      totalActions: userData.length,
      data: userData
    });
    
  } catch (error) {
    console.error('Error fetching user clickstream data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
});

// Seed some initial data
app.post('/api/seed', (req, res) => {
  try {
    // Seed content
    const sampleContent = [
      {
        id: 1,
        title: 'Introduction to Web Development',
        type: 'text',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'JavaScript Fundamentals',
        type: 'video',
        description: 'Master JavaScript concepts with practical examples',
        videoUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'HTML Basics Quiz',
        type: 'quiz',
        description: 'Test your HTML knowledge',
        quizData: {
          questions: [
            {
              question: 'What does HTML stand for?',
              options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'],
              correct: 0
            }
          ]
        },
        createdAt: new Date().toISOString()
      }
    ];
    
    writeDB('content', sampleContent);
    
    res.json({
      success: true,
      message: 'Sample data seeded successfully'
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed data'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: Local JSON files in ./data/`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
});
