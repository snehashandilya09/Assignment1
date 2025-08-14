/**
 * Clickstream Tracking Service
 * Captures and logs user interactions for learning analytics
 * Follows best logging practices with detailed interaction tracking
 */

// Enhanced clickstream logger
const clickstreamLogger = {
  info: (message, data = null) => {
    console.log(`📊 [CLICKSTREAM] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [CLICKSTREAM] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [CLICKSTREAM] ${message}`, error ? { error } : '');
  },
  interaction: (message, data = null) => {
    console.log(`👆 [CLICKSTREAM] ${message}`, data ? { data } : '');
  },
  api: (message, data = null) => {
    console.log(`🌐 [CLICKSTREAM] ${message}`, data ? { data } : '');
  }
};

class ClickstreamService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isInitialized = false;
    
    clickstreamLogger.info('Clickstream service initialized', { 
      sessionId: this.sessionId,
      timestamp: new Date().toISOString() 
    });
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize clickstream tracking with user context
   */
  initialize(user) {
    // Prefer username for consistency, fallback to id, then anonymous
    this.userId = user?.username || user?.id || 'anonymous';
    this.isInitialized = true;
    
    clickstreamLogger.success('Clickstream tracking initialized', {
      userId: this.userId,
      userObject: user,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });

    // Track session start
    this.trackEvent('session_start', {
      user: this.userId,
      userUsername: user?.username,
      userId: user?.id,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track user interaction events
   */
  async trackEvent(eventType, eventData = {}) {
    if (!this.isInitialized && eventType !== 'session_start') {
      clickstreamLogger.error('Clickstream not initialized. Call initialize() first.');
      return;
    }

    const clickstreamEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      eventType,
      action: eventType, // Add action field for backward compatibility
      eventData,
      details: eventData, // Add details field for easier access
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    clickstreamLogger.interaction(`Event tracked: ${eventType}`, clickstreamEvent);

    try {
      const response = await fetch(`${this.baseURL}/clickstream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clickstreamEvent)
      });

      if (response.ok) {
        const result = await response.json();
        clickstreamLogger.api('Event sent to server successfully', { 
          eventType, 
          eventId: result.id 
        });
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      clickstreamLogger.error('Failed to send clickstream event', {
        error: error.message,
        eventType,
        eventData
      });
      
      // Store failed events in localStorage for retry
      this.storeFailedEvent(clickstreamEvent);
    }
  }

  /**
   * Store failed events for retry
   */
  storeFailedEvent(event) {
    try {
      const failedEvents = JSON.parse(localStorage.getItem('failed_clickstream_events') || '[]');
      failedEvents.push(event);
      localStorage.setItem('failed_clickstream_events', JSON.stringify(failedEvents));
      clickstreamLogger.info('Failed event stored for retry', { eventType: event.eventType });
    } catch (error) {
      clickstreamLogger.error('Failed to store event in localStorage', error);
    }
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents() {
    try {
      const failedEvents = JSON.parse(localStorage.getItem('failed_clickstream_events') || '[]');
      if (failedEvents.length === 0) return;

      clickstreamLogger.info(`Retrying ${failedEvents.length} failed events`);

      const retryPromises = failedEvents.map(event => 
        fetch(`${this.baseURL}/clickstream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        })
      );

      await Promise.allSettled(retryPromises);
      
      // Clear failed events after retry
      localStorage.removeItem('failed_clickstream_events');
      clickstreamLogger.success('Failed events retry completed');
    } catch (error) {
      clickstreamLogger.error('Error during failed events retry', error);
    }
  }

  // Specific tracking methods for different interaction types

  /**
   * Track navigation events
   */
  trackNavigation(from, to, data = {}) {
    return this.trackEvent('navigation', {
      from,
      to,
      ...data
    });
  }

  /**
   * Track page view events
   */
  trackPageView(pageName, data = {}) {
    return this.trackEvent('page_view', {
      page: pageName,
      timestamp: new Date().toISOString(),
      ...data
    });
  }

  /**
   * Track course interactions
   */
  trackCourseView(courseId, courseTitle, courseType) {
    return this.trackEvent('course_view', {
      courseId,
      courseTitle,
      courseType,
      viewStartTime: new Date().toISOString()
    });
  }

  /**
   * Track quiz interactions
   */
  trackQuizStart(courseId, courseTitle, totalQuestions) {
    return this.trackEvent('quiz_start', {
      courseId,
      courseTitle,
      totalQuestions,
      startTime: new Date().toISOString()
    });
  }

  trackQuizAnswer(courseId, questionIndex, selectedAnswer, isCorrect) {
    return this.trackEvent('quiz_answer', {
      courseId,
      questionIndex,
      selectedAnswer,
      isCorrect,
      answerTime: new Date().toISOString()
    });
  }

  trackQuizComplete(courseId, score, totalQuestions, timeSpent) {
    return this.trackEvent('quiz_complete', {
      courseId,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      timeSpent,
      completedAt: new Date().toISOString()
    });
  }

  /**
   * Track video interactions
   */
  trackVideoPlay(courseId, videoUrl) {
    return this.trackEvent('video_play', {
      courseId,
      videoUrl,
      playTime: new Date().toISOString()
    });
  }

  trackVideoPause(courseId, videoUrl, currentTime) {
    return this.trackEvent('video_pause', {
      courseId,
      videoUrl,
      currentTime,
      pauseTime: new Date().toISOString()
    });
  }

  /**
   * Track text content interactions
   */
  trackTextContentView(courseId, scrollDepth = 0) {
    return this.trackEvent('text_content_view', {
      courseId,
      scrollDepth,
      viewTime: new Date().toISOString()
    });
  }

  /**
   * Track button clicks
   */
  trackButtonClick(buttonName, context = {}) {
    return this.trackEvent('button_click', {
      buttonName,
      context,
      clickTime: new Date().toISOString()
    });
  }

  /**
   * Track search/filter actions
   */
  trackFilter(filterType, filterValue, resultsCount) {
    return this.trackEvent('filter_applied', {
      filterType,
      filterValue,
      resultsCount,
      filterTime: new Date().toISOString()
    });
  }

  /**
   * Track session end
   */
  trackSessionEnd() {
    return this.trackEvent('session_end', {
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1]),
      endTime: new Date().toISOString()
    });
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    const sessionStart = parseInt(this.sessionId.split('_')[1]);
    const currentTime = Date.now();
    const duration = currentTime - sessionStart;

    return {
      sessionId: this.sessionId,
      userId: this.userId,
      duration: duration,
      durationFormatted: this.formatDuration(duration),
      startTime: new Date(sessionStart).toISOString(),
      currentTime: new Date(currentTime).toISOString()
    };
  }

  /**
   * Format duration in seconds to readable format
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Create singleton instance
const clickstreamService = new ClickstreamService();

// Auto-retry failed events on page load
window.addEventListener('load', () => {
  clickstreamService.retryFailedEvents();
});

// Track session end on page unload
window.addEventListener('beforeunload', () => {
  clickstreamService.trackSessionEnd();
});

export default clickstreamService;
