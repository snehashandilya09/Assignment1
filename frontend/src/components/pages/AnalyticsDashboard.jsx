/**
 * Analytics Dashboard Component
 * Displays clickstream data and learning analytics
 * Provides insights into user behavior and learning patterns
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Enhanced logger for analytics
const analyticsLogger = {
  info: (message, data = null) => {
    console.log(`📊 [ANALYTICS] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [ANALYTICS] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [ANALYTICS] ${message}`, error ? { error } : '');
  }
};

export function AnalyticsDashboard({ onBack }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      analyticsLogger.info('Fetching clickstream analytics data');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/analytics/clickstream`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
      analyticsLogger.success('Analytics data loaded successfully', { 
        totalEvents: data.data?.length || 0 
      });
      
    } catch (error) {
      analyticsLogger.error('Failed to fetch analytics data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (!analyticsData?.data) return;
    
    const csvContent = [
      ['Event ID', 'User ID', 'Session ID', 'Event Type', 'Timestamp', 'Course ID', 'Additional Data'],
      ...analyticsData.data.map(event => [
        event.id,
        event.userId,
        event.sessionId,
        event.eventType || event.action || 'unknown',
        event.timestamp,
        event.eventData?.courseId || '',
        JSON.stringify(event.eventData || {})
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    analyticsLogger.success('Data exported to CSV');
  };

  const exportToJSON = () => {
    if (!analyticsData?.data) return;
    
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalEvents: analyticsData.data.length,
      analytics: analytics,
      rawData: analyticsData.data
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning_analytics_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    analyticsLogger.success('Data exported to JSON');
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Process analytics data for display
  const processAnalytics = (clickstream) => {
    if (!clickstream || clickstream.length === 0) {
      return {
        totalEvents: 0,
        uniqueSessions: 0,
        eventTypes: {},
        recentEvents: [],
        topCourses: {},
        quizCompletions: []
      };
    }

    const uniqueSessions = [...new Set(clickstream.map(event => event.sessionId))];
    const eventTypes = {};
    const topCourses = {};
    const quizCompletions = [];

    clickstream.forEach(event => {
      // Count event types
      const eventType = event.eventType || event.action || 'unknown';
      eventTypes[eventType] = (eventTypes[eventType] || 0) + 1;

      // Track course interactions
      if (event.eventData?.courseId) {
        const courseKey = `${event.eventData.courseId} - ${event.eventData.courseTitle || 'Unknown'}`;
        topCourses[courseKey] = (topCourses[courseKey] || 0) + 1;
      }

      // Track quiz completions
      if (eventType === 'quiz_complete') {
        quizCompletions.push({
          courseId: event.eventData?.courseId,
          courseTitle: event.eventData?.courseTitle,
          score: event.eventData?.score,
          totalQuestions: event.eventData?.totalQuestions,
          percentage: event.eventData?.percentage,
          timestamp: event.timestamp
        });
      }
    });

    return {
      totalEvents: clickstream.length,
      uniqueSessions: uniqueSessions.length,
      eventTypes,
      recentEvents: clickstream.slice(-10).reverse(),
      topCourses,
      quizCompletions
    };
  };

  const analytics = analyticsData?.data ? processAnalytics(analyticsData.data) : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin text-4xl">📊</div>
              <p className="text-gray-300">Loading analytics...</p>
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
              <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Analytics</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="space-x-4">
                <Button onClick={fetchAnalytics} className="bg-red-600 hover:bg-red-700">
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
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
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
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-white">Learning Analytics</h1>
              <p className="text-gray-400">Insights from clickstream data</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={fetchAnalytics} className="bg-blue-600 hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </Button>
            <Button onClick={exportToJSON} variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export JSON
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Total Events</CardTitle>
              <CardDescription className="text-gray-400">All tracked interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-300">{analytics?.totalEvents || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Unique Sessions</CardTitle>
              <CardDescription className="text-gray-400">Different user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300">{analytics?.uniqueSessions || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Quiz Completions</CardTitle>
              <CardDescription className="text-gray-400">Completed assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300">{analytics?.quizCompletions?.length || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Event Types</CardTitle>
              <CardDescription className="text-gray-400">Different interaction types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300">
                {analytics?.eventTypes ? Object.keys(analytics.eventTypes).length : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Types Breakdown */}
        {analytics?.eventTypes && Object.keys(analytics.eventTypes).length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Event Types Breakdown</CardTitle>
              <CardDescription className="text-gray-400">Distribution of user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.eventTypes).map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <Badge variant="outline" className="bg-white/10 text-gray-300">
                      {eventType.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="text-xl font-semibold text-white">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Results */}
        {analytics?.quizCompletions && analytics.quizCompletions.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Quiz Performance</CardTitle>
              <CardDescription className="text-gray-400">Recent quiz completion results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.quizCompletions.slice(0, 5).map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">{quiz.courseTitle || `Course ${quiz.courseId}`}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(quiz.timestamp).toLocaleString()}
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

        {/* Recent Events */}
        {analytics?.recentEvents && analytics.recentEvents.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Latest user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentEvents.slice(0, 8).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300">
                        {(event.eventType || event.action || 'unknown').replace('_', ' ')}
                      </Badge>
                      <div>
                        <div className="text-sm text-white">
                          User: {event.userId || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Session: {event.sessionId?.substring(0, 12)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {(!analytics || analytics.totalEvents === 0) && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data Yet</h3>
              <p className="text-gray-400 mb-4">
                Start interacting with courses to generate analytics data. 
                Try browsing courses, viewing content, or taking quizzes!
              </p>
              <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
                Explore Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
