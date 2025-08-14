# EduTrack Analytics Platform

A comprehensive learning management system with advanced analytics capabilities, designed to provide an interactive educational experience with detailed user behavior tracking.

## 🌟 Features

### Learning Management
- **Diverse Course Catalog**: Access to multiple learning modules covering various topics including Digital Marketing Analytics, Cybersecurity, UX/UI Design, Blockchain, Project Management, and more
- **Multiple Content Types**: Support for text articles, video content, and interactive quizzes
- **Advanced Filtering**: Filter courses by type, category, difficulty level, and search functionality
- **Progress Tracking**: Monitor learning progress across different modules and content types

### Interactive Content
- **Rich Text Articles**: In-depth educational content with comprehensive explanations
- **Video Learning**: Embedded video content for visual learners
- **Interactive Quizzes**: Multiple-choice assessments with immediate feedback
- **Content Categorization**: Organized learning materials by subject and difficulty

### Analytics Dashboard
- **User Behavior Analytics**: Comprehensive tracking of user interactions and learning patterns
- **Clickstream Analysis**: Detailed logging of user actions, page views, and engagement metrics
- **Performance Metrics**: Visual charts and graphs showing learning progress and completion rates
- **Session Tracking**: Monitor user sessions and time spent on different content types

### User Experience
- **Modern UI/UX**: Clean, responsive design built with Tailwind CSS and shadcn/ui components
- **Authentication System**: Secure user registration and login functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Dynamic content loading with live progress updates

## 🚀 Technology Stack

### Frontend
- **React.js**: Modern JavaScript framework for building user interfaces
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality component library
- **Chart.js**: Data visualization for analytics

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web application framework
- **JSON Database**: Local file-based data storage for simplicity
- **CORS**: Cross-origin resource sharing for API access

### Deployment
- **Vercel**: Frontend hosting and deployment
- **Railway**: Backend API hosting
- **Environment Variables**: Secure configuration management

## 🎯 Key Capabilities

### Learning Analytics
- Track user learning patterns and preferences
- Monitor course completion rates and engagement
- Generate insights on content effectiveness
- Analyze user journey through learning materials

### Content Management
- Dynamic content loading from backend API
- Support for multiple media types
- Categorized learning paths
- Searchable course catalog

### User Engagement
- Interactive quiz system with scoring
- Progress indicators and achievements
- Personalized learning recommendations
- Session persistence and user profiles

### Data Insights
- Real-time analytics dashboard
- Clickstream data visualization
- User behavior heatmaps
- Learning progress reports

## 📊 Dashboard Features

### Overview Metrics
- Total users and active learners
- Course completion statistics
- Popular content analysis
- Engagement rate tracking

### Visual Analytics
- Interactive charts and graphs
- Progress visualization
- Trend analysis over time
- Comparative performance metrics

### User Journey Tracking
- Page view analytics
- Time spent on content
- Click-through rates
- Learning path optimization

## 🌐 Live Demo

The application is deployed and accessible online with a modern, responsive interface that works seamlessly across all devices.

## 🔧 Setup and Configuration

The application uses environment variables for configuration and supports both development and production environments. The backend API provides RESTful endpoints for content management, user authentication, and analytics data.

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- Desktop computers
- Tablets and iPads
- Mobile phones
- Various screen sizes and orientations

## 🎨 User Interface

- Clean, modern design with intuitive navigation
- Dark theme with purple accents for better visual appeal
- Consistent component styling throughout the application
- Accessible design following web standards

## 📈 Analytics Capabilities

The platform provides comprehensive analytics including:
- User engagement metrics
- Learning progress tracking
- Content popularity analysis
- Session duration and frequency
- Click-through rate analysis
- User behavior patterns

## 🔒 Security Features

- Secure user authentication
- CORS protection for API endpoints
- Rate limiting for API calls
- Input validation and sanitization
- Environment-based configuration

## 🚀 Performance Optimization

- Optimized build process with Vite
- Efficient API caching strategies
- Responsive image loading
- Minimized bundle sizes
- Fast deployment pipeline

---

*Built with modern web technologies to provide an exceptional learning experience with powerful analytics insights.*

- Secure user authentication and authorization
- Multi-format learning materials (articles, videos, assessments)
- Advanced user interaction analytics
- Comprehensive learning analytics dashboard
- Progress monitoring and achievement tracking
- Modern responsive UI with ShadcnUI components

## � Technology Stack

- **Frontend**: React.js with Vite bundler, ShadcnUI components
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB Atlas cloud database
- **Authentication**: JSON Web Tokens (JWT)
- **Deployment**: Vercel (frontend) & Railway (backend)

## � Application Structure

```
├── frontend/          # React client application
├── backend/           # Express.js API server
├── documentation/     # Project documentation
└── README.md         # Application overview
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ET617-Assignment1
```

2. Backend Setup:
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment

This project is deployed on Vercel: [Live Demo](#)

## 📊 Clickstream Data

The application tracks various user interactions including:
- Page views and navigation
- Video play/pause/seek actions
- Quiz attempts and submissions
- Click events and user engagement
- Session duration and patterns

## 🤝 Contributing

This is a course assignment project for ET617.

## 📝 License

This project is for educational purposes only.
