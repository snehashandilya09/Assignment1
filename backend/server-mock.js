require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Mock database connection status
let dbConnectionStatus = 'Connected (Mock)';

// Basic CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock database connection
console.log('✅ Using Mock Database for Development');

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Learning Website API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbConnectionStatus,
    note: 'Using mock database - MongoDB Atlas connection needs to be fixed'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    database: 'Mock database active'
  });
});

// Mock user routes for testing
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  res.json({
    success: true,
    message: 'User registered successfully (mock)',
    user: { id: 1, username, email },
    note: 'This is a mock response - replace with real MongoDB later'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    success: true,
    message: 'Login successful (mock)',
    user: { id: 1, email },
    token: 'mock-jwt-token',
    note: 'This is a mock response - replace with real authentication later'
  });
});

// Mock clickstream tracking
app.post('/api/clickstream', (req, res) => {
  const clickData = req.body;
  console.log('📊 Mock Clickstream Data:', clickData);
  res.json({
    success: true,
    message: 'Clickstream data recorded (mock)',
    data: clickData,
    timestamp: new Date().toISOString()
  });
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
  console.log(`📝 Note: MongoDB Atlas connection needs to be fixed`);
  console.log(`💡 Using mock database for development`);
});
