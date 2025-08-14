/**
 * Quiz Page Component
 * Displays available quizzes with filtering and selection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import clickstreamService from '@/services/clickstreamService';

// Enhanced logger for quiz page
const quizLogger = {
  info: (message, data = null) => {
    console.log(`📝 [QUIZ_PAGE] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [QUIZ_PAGE] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [QUIZ_PAGE] ${message}`, error ? { error } : '');
  }
};

export function QuizPage({ onBack, onSelectQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  quizLogger.info('QuizPage component rendered');

  // Fetch quizzes from API
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      quizLogger.info('Fetching quizzes from API');
      setLoading(true);
      setError(null);

      const timestamp = new Date().getTime();
      const response = await fetch(`https://assignment-sneha-production.up.railway.app/api/content?t=${timestamp}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();

      if (data.success) {
        // Filter only quiz content
        const quizContent = data.content.filter(item => item.type === 'quiz');
        setQuizzes(quizContent);
        quizLogger.success('Quizzes fetched successfully', { count: quizContent.length });
        
        // Track page view
        clickstreamService.trackPageView('quiz', { quizCount: quizContent.length });
      } else {
        throw new Error(data.message || 'Failed to fetch quizzes');
      }
    } catch (err) {
      quizLogger.error('Failed to fetch quizzes', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering with search and categories
  const filteredQuizzes = quizzes.filter(quiz => {
    // Category filter
    if (categoryFilter !== 'all' && quiz.category !== categoryFilter) return false;
    
    // Level filter
    if (levelFilter !== 'all' && quiz.level !== levelFilter) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        quiz.title.toLowerCase().includes(searchLower) ||
        quiz.description.toLowerCase().includes(searchLower) ||
        (quiz.tags && quiz.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (quiz.category && quiz.category.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Get unique categories and levels for filters
  const categories = ['all', ...new Set(quizzes.map(quiz => quiz.category).filter(Boolean))];
  const levels = ['all', ...new Set(quizzes.map(quiz => quiz.level).filter(Boolean))];

  // Handle quiz selection
  const handleQuizSelect = (quiz) => {
    quizLogger.info('Quiz selected', { quizId: quiz.id, title: quiz.title });
    clickstreamService.trackQuizStart(quiz.id, quiz.title, quiz.quizData?.questions?.length || 0);
    if (onSelectQuiz) {
      onSelectQuiz(quiz);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-spin">🎯</div>
              <h2 className="text-2xl font-semibold text-white mb-3">Loading Quizzes...</h2>
              <p className="text-gray-400">Please wait while we fetch available quizzes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-red-400 mb-3">Error Loading Quizzes</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <Button 
                onClick={fetchQuizzes}
                className="bg-red-600 hover:bg-red-700 mr-4"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
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
            <h1 className="text-4xl font-bold text-white">Take a Quiz</h1>
            <p className="text-xl text-gray-300">
              Test your knowledge with interactive quizzes
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="max-w-md">
            <Input
              placeholder="Search quizzes, topics, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 min-w-48"
            >
              <option value="all" className="bg-gray-800">All Categories</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
            
            {/* Level Filter */}
            <select 
              value={levelFilter} 
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 min-w-40"
            >
              <option value="all" className="bg-gray-800">All Levels</option>
              {levels.slice(1).map((level) => (
                <option key={level} value={level} className="bg-gray-800">
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📝</div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">No Quizzes Available</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
                  ? 'No quizzes match your current search criteria.'
                  : 'No quizzes have been created yet.'}
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setLevelFilter('all');
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card 
                key={quiz.id} 
                className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => handleQuizSelect(quiz)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 text-white rounded-lg p-2 shadow-lg">
                        <span className="text-xl">📝</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="bg-white/10 text-gray-300 border-white/20 w-fit">
                          Quiz
                        </Badge>
                        {quiz.level && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/20 w-fit text-xs">
                            {quiz.level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {quiz.duration && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/20">
                        {quiz.duration}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-indigo-200 transition-colors">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {quiz.description || 'No description available'}
                  </CardDescription>
                  
                  {/* Category and Tags */}
                  <div className="space-y-2 mt-3">
                    {quiz.category && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Category:</span>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/20 text-xs">
                          {quiz.category}
                        </Badge>
                      </div>
                    )}
                    {quiz.tags && quiz.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {quiz.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-orange-500/20 text-orange-300 border-orange-500/20 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {quiz.tags.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="bg-gray-500/20 text-gray-300 border-gray-500/20 text-xs"
                          >
                            +{quiz.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Separator className="mb-4 bg-white/10" />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {quiz.quizData && quiz.quizData.questions ? 
                        `${quiz.quizData.questions.length} Questions` : 
                        'Interactive Quiz'
                      }
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700 group-hover:scale-105 transition-transform"
                    >
                      Start Quiz
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredQuizzes.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{filteredQuizzes.length}</div>
                  <div className="text-sm text-gray-400">Available Quizzes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {filteredQuizzes.reduce((total, quiz) => 
                      total + (quiz.quizData?.questions?.length || 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Total Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
                  <div className="text-sm text-gray-400">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
