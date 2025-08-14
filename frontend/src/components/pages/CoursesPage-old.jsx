/**
 * Learning Modules Page Component
 * Displays available educational content and learning materials
 * Includes advanced filtering, search functionality and interactive module cards
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

// Enhanced logger for learning modules page
const modulesLogger = {
  info: (message, data = null) => {
    console.log(`📚 [LEARNING_MODULES] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [LEARNING_MODULES] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [LEARNING_MODULES] ${message}`, error ? { error } : '');
  }
};

export function CoursesPage({ onBack, onSelectCourse }) {
  const [learningModules, setLearningModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  modulesLogger.info('Learning modules page component rendered');

  // Fetch learning modules from API
  useEffect(() => {
    fetchLearningModules();
  }, []);

  const fetchLearningModules = async () => {
    try {
      modulesLogger.info('Fetching learning modules from API');
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/content`);
      const data = await response.json();

      if (data.success) {
        setLearningModules(data.content || []);
        modulesLogger.success('Learning modules fetched successfully', { count: data.content?.length });
      } else {
        throw new Error(data.message || 'Failed to fetch learning modules');
      }
    } catch (err) {
      modulesLogger.error('Failed to fetch learning modules', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering with search and categories
  const filteredModules = learningModules.filter(module => {
    // Type filter
    if (filter !== 'all' && module.type !== filter) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && module.category !== categoryFilter) return false;
    
    // Level filter
    if (levelFilter !== 'all' && module.level !== levelFilter) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        module.title.toLowerCase().includes(searchLower) ||
        module.description.toLowerCase().includes(searchLower) ||
        (module.tags && module.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (module.category && module.category.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Get unique categories and levels for filters
  const categories = ['all', ...new Set(learningModules.map(module => module.category).filter(Boolean))];
  const levels = ['all', ...new Set(learningModules.map(module => module.level).filter(Boolean))];

  // Get content type icon and color
  const getContentTypeInfo = (type) => {
    switch (type) {
      case 'text':
        return { icon: '�', color: 'bg-purple-500', label: 'Article' };
      case 'video':
        return { icon: '�', color: 'bg-pink-500', label: 'Video' };
      case 'quiz':
        return { icon: '🧠', color: 'bg-indigo-500', label: 'Assessment' };
      default:
        return { icon: '📚', color: 'bg-gray-500', label: 'Module' };
    }
  };

  // Handle module selection
  const handleModuleSelect = (module) => {
    modulesLogger.info('Learning module selected', { moduleId: module.id, title: module.title });
    if (onSelectCourse) {
      onSelectCourse(module);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin text-4xl">📚</div>
              <p className="text-purple-300">Loading learning modules...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Card className="bg-red-50/10 border-red-200/20 max-w-md">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">❌</div>
                <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Learning Modules</h3>
                <p className="text-red-400 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button onClick={fetchLearningModules} className="bg-red-600 hover:bg-red-700">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-purple-300 hover:text-white hover:bg-white/10"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Analytics Hub
              </Button>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Explore Learning Modules</h1>
            <p className="text-xl text-gray-300">
              Discover interactive educational content and assessments
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="max-w-md">
            <Input
              placeholder="Search modules, topics, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'text', 'video', 'quiz'].map((filterType) => (
                <Button
                  key={filterType}
                  variant={filter === filterType ? "default" : "outline"}
                  onClick={() => setFilter(filterType)}
                  className={`${
                    filter === filterType
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {filterType === 'all' ? '📚 All Modules' : 
                   filterType === 'text' ? '� Articles' :
                   filterType === 'video' ? '� Videos' : '🧠 Assessments'}
                </Button>
              ))}
            </div>
            
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

        {/* Learning Modules Grid */}
        {filteredModules.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">No Learning Modules Available</h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'No learning modules have been created yet.' 
                  : `No ${filter} content available for learning.`}
              </p>
              <Button 
                onClick={() => setFilter('all')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                View All Modules
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => {
              const typeInfo = getContentTypeInfo(module.type);
              return (
                <Card 
                  key={module.id} 
                  className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                  onClick={() => handleModuleSelect(module)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${typeInfo.color} text-white rounded-lg p-2 shadow-lg`}>
                          <span className="text-xl">{typeInfo.icon}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="bg-white/10 text-gray-300 border-white/20 w-fit">
                            {typeInfo.label}
                          </Badge>
                          {module.level && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/20 w-fit text-xs">
                              {module.level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {module.duration && (
                        <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/20">
                          {module.duration}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-purple-200 transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {module.description || 'No description available'}
                    </CardDescription>
                    
                    {/* Category and Tags */}
                    <div className="space-y-2 mt-3">
                      {module.category && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Category:</span>
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/20 text-xs">
                            {module.category}
                          </Badge>
                        </div>
                      )}
                      {module.tags && module.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {module.tags.slice(0, 3).map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-indigo-500/20 text-indigo-300 border-indigo-500/20 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {module.tags.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="bg-gray-500/20 text-gray-300 border-gray-500/20 text-xs"
                            >
                              +{module.tags.length - 3}
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
                        Created: {new Date(module.createdAt).toLocaleDateString()}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 group-hover:scale-105 transition-transform"
                      >
                        Begin Learning
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Module Statistics */}
        {filteredModules.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{filteredModules.length}</div>
                  <div className="text-sm text-gray-400">
                    {filter === 'all' ? 'Total Modules' : `${filter} Content`}
                  </div>
                </div>
                <Separator orientation="vertical" className="h-12 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-white">
                    {learningModules.filter(m => m.type === 'video').length}
                  </div>
                  <div className="text-sm text-gray-400">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {learningModules.filter(m => m.type === 'quiz').length}
                  </div>
                  <div className="text-sm text-gray-400">Assessments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {learningModules.filter(m => m.type === 'text').length}
                  </div>
                  <div className="text-sm text-gray-400">Articles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
