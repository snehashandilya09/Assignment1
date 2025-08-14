/**
 * Video Page Component
 * Displays available video content with filtering and selection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import clickstreamService from '@/services/clickstreamService';

// Enhanced logger for video page
const videoLogger = {
  info: (message, data = null) => {
    console.log(`🎥 [VIDEO_PAGE] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [VIDEO_PAGE] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [VIDEO_PAGE] ${message}`, error ? { error } : '');
  }
};

export function VideoPage({ onBack, onSelectVideo }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  videoLogger.info('VideoPage component rendered');

  // Fetch videos from API
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      videoLogger.info('Fetching videos from API');
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
        // Filter only video content
        const videoContent = data.content.filter(item => item.type === 'video');
        setVideos(videoContent);
        videoLogger.success('Videos fetched successfully', { count: videoContent.length });
        
        // Track page view
        clickstreamService.trackPageView('videos', { videoCount: videoContent.length });
      } else {
        throw new Error(data.message || 'Failed to fetch videos');
      }
    } catch (err) {
      videoLogger.error('Failed to fetch videos', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering with search and categories
  const filteredVideos = videos.filter(video => {
    // Category filter
    if (categoryFilter !== 'all' && video.category !== categoryFilter) return false;
    
    // Level filter
    if (levelFilter !== 'all' && video.level !== levelFilter) return false;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        video.title.toLowerCase().includes(searchLower) ||
        video.description.toLowerCase().includes(searchLower) ||
        (video.tags && video.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
        (video.category && video.category.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Get unique categories and levels for filters
  const categories = ['all', ...new Set(videos.map(video => video.category).filter(Boolean))];
  const levels = ['all', ...new Set(videos.map(video => video.level).filter(Boolean))];

  // Handle video selection
  const handleVideoSelect = (video) => {
    videoLogger.info('Video selected', { videoId: video.id, title: video.title });
    clickstreamService.trackVideoPlay(video.id, video.videoUrl);
    if (onSelectVideo) {
      onSelectVideo(video);
    }
  };

  // Extract video thumbnail from YouTube URL
  const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl) return null;
    
    // Extract YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">🎥</div>
              <h2 className="text-2xl font-semibold text-white mb-3">Loading Videos...</h2>
              <p className="text-gray-400">Please wait while we fetch available videos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-red-400 mb-3">Error Loading Videos</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <Button 
                onClick={fetchVideos}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4">
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
            <h1 className="text-4xl font-bold text-white">Watch Videos</h1>
            <p className="text-xl text-gray-300">
              Learn through engaging video content
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="max-w-md">
            <Input
              placeholder="Search videos, topics, or tags..."
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

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">🎥</div>
              <h3 className="text-xl font-semibold text-gray-200 mb-3">No Videos Available</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
                  ? 'No videos match your current search criteria.'
                  : 'No videos have been created yet.'}
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setLevelFilter('all');
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const thumbnail = getVideoThumbnail(video.videoUrl);
              
              return (
                <Card 
                  key={video.id} 
                  className="bg-white/5 backdrop-blur-sm border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group overflow-hidden"
                  onClick={() => handleVideoSelect(video)}
                >
                  {/* Video Thumbnail */}
                  {thumbnail && (
                    <div className="relative overflow-hidden">
                      <img 
                        src={thumbnail} 
                        alt={video.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-colors duration-300">
                          <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-500 text-white rounded-lg p-2 shadow-lg">
                          <span className="text-xl">🎥</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="bg-white/10 text-gray-300 border-white/20 w-fit">
                            Video
                          </Badge>
                          {video.level && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/20 w-fit text-xs">
                              {video.level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {video.duration && (
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/20">
                          {video.duration}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-purple-200 transition-colors">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {video.description || 'No description available'}
                    </CardDescription>
                    
                    {/* Category and Tags */}
                    <div className="space-y-2 mt-3">
                      {video.category && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Category:</span>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/20 text-xs">
                            {video.category}
                          </Badge>
                        </div>
                      )}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {video.tags.slice(0, 3).map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-orange-500/20 text-orange-300 border-orange-500/20 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {video.tags.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="bg-gray-500/20 text-gray-300 border-gray-500/20 text-xs"
                            >
                              +{video.tags.length - 3}
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
                        Educational Video
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 group-hover:scale-105 transition-transform"
                      >
                        Watch Now
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h.01M15 6h.01M12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9z" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {filteredVideos.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{filteredVideos.length}</div>
                  <div className="text-sm text-gray-400">Available Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
                  <div className="text-sm text-gray-400">Categories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{levels.length - 1}</div>
                  <div className="text-sm text-gray-400">Difficulty Levels</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default VideoPage;
