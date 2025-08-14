/**
 * Main Application Component for EduTrack Analytics Platform
 * Manages authentication flow and provides central dashboard navigation
 * Features comprehensive logging and advanced state management
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Authentication from '@/components/Authentication';
import CoursesPage from '@/components/pages/CoursesPage';
import CourseViewer from '@/components/pages/CourseViewer';
import AnalyticsDashboard from '@/components/pages/AnalyticsDashboard';
import LearningProgress from '@/components/pages/LearningProgress';
import QuizPage from '@/components/pages/QuizPage';
import VideoPage from '@/components/pages/VideoPage';
import clickstreamService from '@/services/clickstreamService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Enhanced application logger for comprehensive tracking
const edutrackLogger = {
  info: (message, data = null) => {
    console.log(`🎓 [EDUTRACK] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [EDUTRACK] ${message}`, data ? { data } : '');
  },
  user: (message, data = null) => {
    console.log(`👤 [EDUTRACK] ${message}`, data ? { data } : '');
  }
};

// Main Learning Dashboard Component (displayed after authentication)
function LearningDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Dashboard analytics state
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalLearningModules: 0,
    completedModules: 0,
    totalStudyHours: 0,
    earnedBadges: 0,
    recentProgress: [],
    weeklyEngagement: 0,
    learningStreak: 0,
    proficiencyLevel: 'Novice',
    progressPercentage: 0
  });

  edutrackLogger.info('Learning dashboard component rendered', { user: user?.username, activePage });

  // Initialize analytics tracking and load dashboard data when component mounts
  useEffect(() => {
    if (user) {
      clickstreamService.initialize(user);
      edutrackLogger.info('Analytics tracking initialized for learner', { 
        user: user?.username,
        userId: user?.id 
      });
      
      // Add delay to ensure tracking service is fully initialized
      setTimeout(() => {
        loadLearningAnalytics();
      }, 500);
    }
  }, [user]);

  // Function to load learner analytics from API
  const loadLearningAnalytics = async () => {
    try {
      const userId = user?.username || user?.id;
      edutrackLogger.info('Loading learner analytics', { 
        userId: userId,
        endpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/clickstream/user/${userId}` 
      });
      
      // Fetch learner's interaction data to calculate analytics
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/clickstream/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const learnerData = await response.json();
      
      edutrackLogger.info('Analytics data received', { 
        success: learnerData.success,
        totalInteractions: learnerData.totalActions,
        dataLength: learnerData.data?.length 
      });
      
      if (learnerData.success && learnerData.data) {
        const userInteractions = learnerData.data;
        
        // Calculate analytics from learner interactions
        const moduleViews = userInteractions.filter(action => action.action === 'course_view');
        const assessmentStarts = userInteractions.filter(action => action.action === 'quiz_start');
        const assessmentCompletes = userInteractions.filter(action => action.action === 'quiz_complete');
        const mediaPlays = userInteractions.filter(action => action.action === 'video_play');
        
        // Get unique learning modules accessed
        const uniqueModules = [...new Set(moduleViews.map(action => action.details?.courseId).filter(Boolean))];
        
        // Calculate engagement time from session data (estimated)
        const sessionTimestamps = new Map();
        let totalEngagementMinutes = 0;
        
        userInteractions.forEach(action => {
          const sessionId = action.sessionId;
          if (!sessionTimestamps.has(sessionId)) {
            sessionTimestamps.set(sessionId, new Date(action.timestamp));
          }
        });
        
        // Estimate 35 minutes per learning module accessed
        totalEngagementMinutes = uniqueModules.length * 35;
        
        // Get recent learning progress (last 10 interactions)
        const recentProgress = userInteractions
          .slice(-10)
          .reverse()
          .map(action => ({
            id: action.id,
            action: action.action,
            details: action.details,
            timestamp: action.timestamp
          }));
        
        // Calculate earned badges based on learning milestones
        let earnedBadges = 0;
        if (uniqueModules.length >= 1) earnedBadges++; // First Module Explorer
        if (assessmentStarts.length >= 1) earnedBadges++; // Assessment Taker
        if (mediaPlays.length >= 1) earnedBadges++; // Media Learner
        if (assessmentCompletes.length >= 1) earnedBadges++; // Quiz Master
        if (uniqueModules.length >= 5) earnedBadges++; // Learning Explorer
        
        // Calculate weekly engagement (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyInteractions = userInteractions.filter(action => 
          new Date(action.timestamp) >= weekAgo
        );
        const weeklyEngagement = Math.floor(weeklyInteractions.length * 6 / 60); // 6 minutes per interaction approx
        
        // Calculate learning streak (consecutive days with activity)
        const dailyEngagement = new Map();
        userInteractions.forEach(action => {
          const date = new Date(action.timestamp).toDateString();
          dailyEngagement.set(date, true);
        });
        
        let learningStreak = 0;
        const today = new Date();
        let currentDate = new Date(today);
        
        while (dailyEngagement.has(currentDate.toDateString())) {
          learningStreak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        // Determine proficiency level based on achievements
        let proficiencyLevel = 'Novice';
        if (earnedBadges >= 3) proficiencyLevel = 'Learner';
        if (earnedBadges >= 5) proficiencyLevel = 'Skilled';
        if (earnedBadges >= 7) proficiencyLevel = 'Expert';
        
        // Calculate progress percentage (based on module completion)
        const progressPercentage = Math.min(100, Math.floor((assessmentCompletes.length / Math.max(uniqueModules.length, 1)) * 100));
        
        setAnalyticsSummary({
          totalLearningModules: uniqueModules.length,
          completedModules: assessmentCompletes.length,
          totalStudyHours: Math.floor(totalEngagementMinutes / 60),
          earnedBadges,
          recentProgress,
          weeklyEngagement,
          learningStreak,
          proficiencyLevel,
          progressPercentage
        });
        
        edutrackLogger.success('Learning analytics loaded successfully', {
          totalLearningModules: uniqueModules.length,
          earnedBadges,
          totalStudyHours: Math.floor(totalEngagementMinutes / 60)
        });
      } else {
        // Display sample progress for new learners
        const sampleProgress = [
          {
            id: 'sample-1',
            action: 'course_view',
            details: { courseTitle: 'Welcome to EduTrack Analytics' },
            timestamp: new Date().toISOString()
          }
        ];
        
        setAnalyticsSummary(prev => ({
          ...prev,
          recentProgress: sampleProgress
        }));
      }
    } catch (error) {
      edutrackLogger.info('Error loading analytics, using defaults', { error: error.message });
      
      // Show welcome progress for new learners
      const welcomeProgress = [
        {
          id: 'welcome-1',
          action: 'course_view',
          details: { courseTitle: 'Welcome to EduTrack Analytics' },
          timestamp: new Date().toISOString()
        }
      ];
      
      setAnalyticsSummary(prev => ({
        ...prev,
        recentProgress: welcomeProgress
      }));
    }
  };

  // Function to refresh analytics after learner actions
  const refreshAnalytics = () => {
    if (user) {
      setTimeout(() => {
        loadLearningAnalytics();
      }, 1000); // Small delay to ensure backend has processed the action
    }
  };

  const handleLogout = () => {
    edutrackLogger.user('Learner initiated logout');
    clickstreamService.trackEvent('logout', { user: user?.username });
    logout();
  };

  // Navigation handlers for learning platform
  const handleExploreCourses = () => {
    edutrackLogger.info('Navigating to learning modules');
    clickstreamService.trackNavigation('home', 'courses');
    clickstreamService.trackButtonClick('explore_courses', { from: 'home' });
    setActivePage('courses');
    refreshAnalytics();
  };

  const handleBackToHome = () => {
    edutrackLogger.info('Navigating back to home dashboard');
    clickstreamService.trackNavigation(activePage, 'home');
    clickstreamService.trackButtonClick('back_to_home', { from: activePage });
    setActivePage('home');
    setSelectedCourse(null);
    refreshAnalytics();
  };

  const handleBackToCourses = () => {
    edutrackLogger.info('Navigating back to learning modules');
    clickstreamService.trackNavigation(activePage, 'courses');
    clickstreamService.trackButtonClick('back_to_courses', { from: activePage });
    setActivePage('courses');
    setSelectedCourse(null);
    refreshAnalytics();
  };

  const handleSelectCourse = (course) => {
    edutrackLogger.info('Learning module selected', { courseId: course.id });
    clickstreamService.trackNavigation('courses', 'course-view');
    clickstreamService.trackCourseView(course.id, course.title, course.type);
    clickstreamService.trackButtonClick('select_course', { 
      courseId: course.id, 
      courseTitle: course.title,
      courseType: course.type 
    });
    setSelectedCourse(course);
    setActivePage('course-view');
    refreshAnalytics();
  };

  const handleViewAnalytics = () => {
    edutrackLogger.info('Navigating to analytics dashboard');
    clickstreamService.trackNavigation('home', 'analytics');
    clickstreamService.trackButtonClick('view_analytics', { from: 'home' });
    setActivePage('analytics');
    refreshAnalytics();
  };

  const handleViewProgress = () => {
    edutrackLogger.info('Navigating to learning progress');
    clickstreamService.trackNavigation('home', 'progress');
    clickstreamService.trackButtonClick('view_progress', { from: 'home' });
    setActivePage('progress');
    refreshAnalytics();
  };

  const handleTakeQuiz = () => {
    edutrackLogger.info('Navigating to assessment section');
    clickstreamService.trackNavigation('home', 'quiz');
    clickstreamService.trackButtonClick('take_quiz', { from: 'home' });
    setActivePage('quiz');
    refreshAnalytics();
  };

  const handleWatchVideos = () => {
    edutrackLogger.info('Navigating to video learning section');
    clickstreamService.trackNavigation('home', 'videos');
    clickstreamService.trackButtonClick('watch_videos', { from: 'home' });
    setActivePage('videos');
    refreshAnalytics();
  };

  // Render different pages based on activePage state
  if (activePage === 'courses') {
    return (
      <CoursesPage 
        onBack={handleBackToHome}
        onSelectCourse={handleSelectCourse}
      />
    );
  }

  if (activePage === 'course-view' && selectedCourse) {
    return (
      <CourseViewer 
        course={selectedCourse}
        onBack={handleBackToCourses}
      />
    );
  }

  if (activePage === 'analytics') {
    return (
      <AnalyticsDashboard 
        onBack={handleBackToHome}
      />
    );
  }

  if (activePage === 'progress') {
    return (
      <LearningProgress 
        onBack={handleBackToHome}
      />
    );
  }

  if (activePage === 'quiz') {
    return (
      <QuizPage 
        onBack={handleBackToHome}
        onSelectQuiz={handleSelectCourse}
      />
    );
  }

  if (activePage === 'videos') {
    return (
      <VideoPage 
        onBack={handleBackToHome}
        onSelectVideo={handleSelectCourse}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(139,69,255,0.15)_0,rgba(139,69,255,0)_50%,rgba(139,69,255,0)_100%)]"></div>
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-2 shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">EduTrack Analytics</h1>
                <p className="text-xs text-gray-400">Hello, {user?.username || 'learner'}!</p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                🎓 {user?.role || 'learner'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                        {(user?.username || 'L')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800/90 backdrop-blur-sm border-white/10 text-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user?.username}</p>
                      <p className="text-xs leading-none text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Progress Analytics
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Learning Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer focus:bg-red-500/20 focus:text-red-300">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">Learning Analytics Hub</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Monitor your educational journey, discover new content, and accelerate your learning with intelligent analytics.
            </p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-purple-300 text-sm font-medium">Learning Modules</p>
                  <p className="text-3xl font-bold">{analyticsSummary.totalLearningModules}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-green-300 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{analyticsSummary.completedModules}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-blue-300 text-sm font-medium">Study Hours</p>
                  <p className="text-3xl font-bold">{analyticsSummary.totalStudyHours}h</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-pink-300 text-sm font-medium">Earned Badges</p>
                  <p className="text-3xl font-bold">{analyticsSummary.earnedBadges}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Learning Actions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Actions Card */}
              <Card className="shadow-xl border-0 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3 text-2xl">
                    <span className="text-3xl">🎯</span>
                    <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Learning Actions</span>
                  </CardTitle>
                  <CardDescription className="text-base text-gray-400">
                    Explore learning opportunities and track your educational progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      onClick={handleExploreCourses}
                      className="h-24 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📚</div>
                        <div className="text-sm font-semibold">Explore Modules</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={handleTakeQuiz}
                      className="h-24 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🧠</div>
                        <div className="text-sm font-semibold">Take Assessment</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={handleWatchVideos}
                      className="h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">�</div>
                        <div className="text-sm font-semibold">Watch Content</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={handleViewAnalytics}
                      className="h-24 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">�</div>
                        <div className="text-sm font-semibold">View Analytics</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={handleViewProgress}
                      className="h-24 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="text-center space-y-2">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">📊</div>
                        <div className="text-sm font-semibold">Progress Tracking</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Progress */}
              <Card className="shadow-xl border-0 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <span className="text-2xl">⚡</span>
                    <span>Recent Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsSummary.recentProgress.length > 0 ? (
                    <div className="space-y-3">
                      {analyticsSummary.recentProgress.slice(0, 6).map((activity, index) => (
                        <div key={activity.id || index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-lg">
                              {activity.action === 'course_view' && '📚'}
                              {activity.action === 'quiz_start' && '🧠'}
                              {activity.action === 'quiz_complete' && '✅'}
                              {activity.action === 'video_play' && '🎬'}
                              {activity.action === 'navigation' && '🧭'}
                              {activity.action === 'button_click' && '👆'}
                              {!['course_view', 'quiz_start', 'quiz_complete', 'video_play', 'navigation', 'button_click'].includes(activity.action) && '⚡'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-300">
                                {activity.action === 'course_view' && `Explored module: ${activity.details?.courseTitle || 'Unknown'}`}
                                {activity.action === 'quiz_start' && `Started assessment: ${activity.details?.courseTitle || 'Unknown'}`}
                                {activity.action === 'quiz_complete' && `Completed assessment: ${activity.details?.courseTitle || 'Unknown'}`}
                                {activity.action === 'video_play' && `Watched content: ${activity.details?.courseTitle || 'Unknown'}`}
                                {activity.action === 'navigation' && `Navigated to ${activity.details?.to || 'section'}`}
                                {activity.action === 'button_click' && `Interacted: ${activity.details?.buttonId || 'action'}`}
                                {!['course_view', 'quiz_start', 'quiz_complete', 'video_play', 'navigation', 'button_click'].includes(activity.action) && `Activity: ${activity.action}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 opacity-50">�</div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-300">Ready to begin your journey?</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">Your learning progress will be displayed here as you engage with modules and complete assessments.</p>
                      <Button 
                        onClick={handleExploreCourses}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Start Learning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Analytics & Insights */}
            <div className="space-y-8">
              {/* Analytics Section */}
              <Card className="shadow-xl border-0 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <span className="text-2xl">�</span>
                    <span>Learning Analytics</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor your educational journey and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Learning Progress</span>
                      <span className="text-sm text-gray-400">{analyticsSummary.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${analyticsSummary.progressPercentage}%`}}
                      ></div>
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                        <span className="text-sm font-medium">Weekly Engagement</span>
                        <span className="text-sm text-purple-300 font-semibold">{analyticsSummary.weeklyEngagement} hours</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-pink-500/10 rounded-lg">
                        <span className="text-sm font-medium">Learning Streak</span>
                        <span className="text-sm text-pink-300 font-semibold">{analyticsSummary.learningStreak} days</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-indigo-500/10 rounded-lg">
                        <span className="text-sm font-medium">Proficiency Level</span>
                        <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300">{analyticsSummary.proficiencyLevel}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Insights */}
              <Card className="shadow-xl border-0 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <span className="text-2xl">💡</span>
                    <span>Learning Insights</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Optimize your learning experience with these insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <p className="text-sm text-purple-300 font-medium mb-1">📚 Consistent Learning</p>
                      <p className="text-xs text-gray-400">Maintain 45 minutes daily for optimal knowledge retention</p>
                    </div>
                    
                    <div className="p-3 bg-pink-500/10 rounded-lg">
                      <p className="text-sm text-pink-300 font-medium mb-1">🎯 Goal Setting</p>
                      <p className="text-xs text-gray-400">Complete 2 learning modules per week for steady progress</p>
                    </div>
                    
                    <div className="p-3 bg-indigo-500/10 rounded-lg">
                      <p className="text-sm text-indigo-300 font-medium mb-1">📝 Active Learning</p>
                      <p className="text-xs text-gray-400">Take detailed notes while engaging with video content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// App Content Component (handles authentication state)
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  edutrackLogger.info('AppContent rendered', { 
    isAuthenticated, 
    isLoading, 
    user: user?.username 
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-purple-300">Loading your educational analytics platform...</p>
        </div>
      </div>
    );
  }

  // Show learning dashboard if authenticated, otherwise show authentication
  return isAuthenticated ? <LearningDashboard /> : <Authentication />;
}

// Main App Component
function App() {
  edutrackLogger.info('EduTrack Analytics platform initialized');

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
