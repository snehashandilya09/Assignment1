/**
 * Learning Progress Component
 * Tracks and displays user learning progress and achievements
 * Shows course completion, quiz scores, and learning milestones
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

// Enhanced logger for progress tracking
const progressLogger = {
  info: (message, data = null) => {
    console.log(`📈 [PROGRESS] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [PROGRESS] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [PROGRESS] ${message}`, error ? { error } : '');
  }
};

export function LearningProgress({ onBack }) {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user progress data
  const fetchProgress = async () => {
    try {
      setLoading(true);
      progressLogger.info('Fetching learning progress data', { userId: user?.username });
      
      // Fetch clickstream data for this user
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/analytics/clickstream?userId=${user?.username || user?.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const processedProgress = processProgressData(data.data || []);
      setProgressData(processedProgress);
      progressLogger.success('Progress data loaded successfully', processedProgress);
      
    } catch (error) {
      progressLogger.error('Failed to fetch progress data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Process clickstream data into learning progress
  const processProgressData = (clickstream) => {
    if (!clickstream || clickstream.length === 0) {
      return {
        totalSessions: 0,
        coursesViewed: [],
        quizzesTaken: [],
        videoWatched: [],
        textContentViewed: [],
        achievements: [],
        learningStreak: 0,
        totalTimeSpent: 0
      };
    }

    const sessions = [...new Set(clickstream.map(event => event.sessionId))];
    const coursesViewed = new Set();
    const quizzesTaken = [];
    const videoWatched = [];
    const textContentViewed = [];
    const achievements = [];

    // Process events
    clickstream.forEach(event => {
      const eventType = event.eventType || event.action || 'unknown';
      
      // Track course views
      if (eventType === 'course_view' && event.eventData?.courseId) {
        coursesViewed.add(event.eventData.courseId);
      }
      
      // Track quiz completions
      if (eventType === 'quiz_complete') {
        quizzesTaken.push({
          courseId: event.eventData?.courseId,
          courseTitle: event.eventData?.courseTitle,
          score: event.eventData?.score || 0,
          totalQuestions: event.eventData?.totalQuestions || 0,
          percentage: event.eventData?.percentage || 0,
          timestamp: event.timestamp
        });
      }
      
      // Track video interactions
      if (eventType === 'video_play') {
        videoWatched.push({
          courseId: event.eventData?.courseId,
          timestamp: event.timestamp
        });
      }
      
      // Track text content
      if (eventType === 'text_content_view') {
        textContentViewed.push({
          courseId: event.eventData?.courseId,
          timestamp: event.timestamp
        });
      }
    });

    // Calculate achievements
    if (coursesViewed.size >= 1) {
      achievements.push({
        title: 'First Steps',
        description: 'Viewed your first course',
        icon: '🎯',
        earned: true
      });
    }
    
    if (quizzesTaken.length >= 1) {
      achievements.push({
        title: 'Quiz Master',
        description: 'Completed your first quiz',
        icon: '🧠',
        earned: true
      });
    }
    
    if (quizzesTaken.some(quiz => quiz.percentage >= 80)) {
      achievements.push({
        title: 'High Achiever',
        description: 'Scored 80% or higher on a quiz',
        icon: '⭐',
        earned: true
      });
    }
    
    if (coursesViewed.size >= 3) {
      achievements.push({
        title: 'Explorer',
        description: 'Explored 3 different courses',
        icon: '🔍',
        earned: true
      });
    }

    // Calculate learning streak (simplified: number of different days with activity)
    const activityDates = [...new Set(clickstream.map(event => 
      new Date(event.timestamp).toDateString()
    ))];

    return {
      totalSessions: sessions.length,
      coursesViewed: Array.from(coursesViewed),
      quizzesTaken,
      videoWatched,
      textContentViewed,
      achievements,
      learningStreak: activityDates.length,
      totalTimeSpent: sessions.length * 15 // Rough estimate
    };
  };

  useEffect(() => {
    fetchProgress();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin text-4xl">📈</div>
              <p className="text-gray-300">Loading your learning progress...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
          </div>
          
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Progress</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="space-x-4">
                <Button onClick={fetchProgress} className="bg-red-600 hover:bg-red-700">
                  Try Again
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Your Learning Progress</h1>
              <p className="text-gray-400">Track your achievements and milestones</p>
            </div>
          </div>
          <Button onClick={fetchProgress} className="bg-blue-600 hover:bg-blue-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Learning Sessions</CardTitle>
              <CardDescription className="text-gray-400">Total study sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-300">{progressData?.totalSessions || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Courses Explored</CardTitle>
              <CardDescription className="text-gray-400">Different courses viewed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300">{progressData?.coursesViewed?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Quizzes Completed</CardTitle>
              <CardDescription className="text-gray-400">Assessments finished</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300">{progressData?.quizzesTaken?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Learning Streak</CardTitle>
              <CardDescription className="text-gray-400">Days with activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300">{progressData?.learningStreak || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {progressData?.achievements && progressData.achievements.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">🏆 Achievements</CardTitle>
              <CardDescription className="text-gray-400">Your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <div className="font-semibold text-white">{achievement.title}</div>
                      <div className="text-sm text-gray-400">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Performance */}
        {progressData?.quizzesTaken && progressData.quizzesTaken.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">📊 Quiz Performance</CardTitle>
              <CardDescription className="text-gray-400">Your assessment results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.quizzesTaken.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">{quiz.courseTitle || `Course ${quiz.courseId}`}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(quiz.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {quiz.score}/{quiz.totalQuestions}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          quiz.percentage >= 80 ? 'bg-green-500/20 text-green-300' :
                          quiz.percentage >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {quiz.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Progress State */}
        {(!progressData || (progressData.totalSessions === 0 && progressData.coursesViewed.length === 0)) && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">Start Your Learning Journey!</h3>
              <p className="text-gray-400 mb-4">
                Begin exploring courses and taking quizzes to track your progress here.
              </p>
              <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default LearningProgress;
