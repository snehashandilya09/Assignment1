/**
 * Course Viewer Component
 * Displays individual course content based on type (text, video, quiz)
 * Includes progress tracking and clickstream logging
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import clickstreamService from '@/services/clickstreamService';

// Enhanced logger for course viewer
const courseLogger = {
  info: (message, data = null) => {
    console.log(`📖 [COURSE_VIEWER] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [COURSE_VIEWER] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [COURSE_VIEWER] ${message}`, error ? { error } : '');
  },
  interaction: (message, data = null) => {
    console.log(`👆 [COURSE_VIEWER] ${message}`, data ? { data } : '');
  }
};

// Text Content Component
function TextContent({ course }) {
  useEffect(() => {
    courseLogger.info('Text content displayed', { courseId: course.id });
    clickstreamService.trackTextContentView(course.id);
  }, [course.id]);

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 text-white rounded-lg p-2">
            <span className="text-xl">📄</span>
          </div>
          <div>
            <CardTitle className="text-2xl text-white">{course.title}</CardTitle>
            <CardDescription className="text-gray-400">{course.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed">
            <h3 className="text-xl font-semibold text-white mb-4">Introduction to Web Development</h3>
            <p className="mb-4">
              Web development is the process of building and maintaining websites. It involves several key technologies 
              and concepts that work together to create interactive web experiences.
            </p>
            
            <h4 className="text-lg font-semibold text-gray-200 mb-3">Core Technologies:</h4>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong className="text-blue-300">HTML</strong> - Structure and content of web pages</li>
              <li><strong className="text-green-300">CSS</strong> - Styling and layout of web pages</li>
              <li><strong className="text-yellow-300">JavaScript</strong> - Interactive behavior and functionality</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-200 mb-3">Getting Started:</h4>
            <p className="mb-4">
              Begin by understanding HTML structure, then learn CSS for styling, and finally add JavaScript 
              for interactivity. Practice building simple projects to reinforce your learning.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
              <h5 className="text-blue-300 font-semibold mb-2">💡 Pro Tip:</h5>
              <p className="text-sm text-gray-300">
                Start with small projects and gradually increase complexity. Use browser developer tools 
                to experiment and debug your code.
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-blue-500/20 text-blue-300">
            📚 Reading Material
          </Badge>
          <div className="text-sm text-gray-400">
            Estimated reading time: 5 minutes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Video Content Component
function VideoContent({ course }) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    courseLogger.info('Video content displayed', { courseId: course.id, videoUrl: course.videoUrl });
  }, [course.id]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    courseLogger.interaction('Video loaded', { courseId: course.id });
  };

  const handleVideoPlay = () => {
    courseLogger.interaction('Video play started', { courseId: course.id });
    clickstreamService.trackVideoPlay(course.id, course.videoUrl);
  };

  const handleVideoPause = () => {
    courseLogger.interaction('Video paused', { courseId: course.id });
    clickstreamService.trackVideoPause(course.id, course.videoUrl, 0); // currentTime would need to be tracked
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 text-white rounded-lg p-2">
            <span className="text-xl">🎥</span>
          </div>
          <div>
            <CardTitle className="text-2xl text-white">{course.title}</CardTitle>
            <CardDescription className="text-gray-400">{course.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {course.videoUrl ? (
            <iframe
              src={course.videoUrl.replace('watch?v=', 'embed/')}
              title={course.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoLoad}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🎬</div>
                <p>Video content will be available soon</p>
              </div>
            </div>
          )}
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-purple-500/20 text-purple-300">
            🎥 Video Content
          </Badge>
          <div className="text-sm text-gray-400">
            Interactive video learning
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quiz Content Component
function QuizContent({ course }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const questions = course.quizData?.questions || [];

  useEffect(() => {
    courseLogger.info('Quiz content displayed', { 
      courseId: course.id, 
      totalQuestions: questions.length 
    });
    
    // Track quiz start
    if (questions.length > 0) {
      clickstreamService.trackQuizStart(course.id, course.title, questions.length);
    }
  }, [course.id, questions.length]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question?.correct;
    
    courseLogger.interaction('Quiz answer selected', { 
      courseId: course.id, 
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      isCorrect
    });
    
    // Track quiz answer in clickstream
    clickstreamService.trackQuizAnswer(course.id, currentQuestion, answerIndex, isCorrect);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      courseLogger.interaction('Next question', { 
        courseId: course.id, 
        nextQuestion: currentQuestion + 1 
      });
    } else {
      // Quiz completed - calculate score and track completion
      const score = calculateScore(newAnswers);
      const timeSpent = Date.now() - parseInt(clickstreamService.sessionId.split('_')[1]);
      
      setShowResults(true);
      courseLogger.success('Quiz completed', { 
        courseId: course.id, 
        answers: newAnswers,
        score,
        timeSpent 
      });
      
      // Track quiz completion in clickstream
      clickstreamService.trackQuizComplete(course.id, score, questions.length, timeSpent);
    }
  };

  const calculateScore = (answersArray = answers) => {
    let correct = 0;
    answersArray.forEach((answer, index) => {
      if (answer === questions[index]?.correct) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
    courseLogger.info('Quiz reset', { courseId: course.id });
  };

  if (questions.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">Quiz Coming Soon</h3>
          <p className="text-gray-400">This quiz is being prepared and will be available shortly.</p>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 text-white rounded-lg p-2">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Quiz Results</CardTitle>
              <CardDescription className="text-gray-400">{course.title}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '📚'}
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">
                {score} / {questions.length}
              </div>
              <div className="text-xl text-gray-300">
                {percentage}% Correct
              </div>
            </div>
            <div className="text-gray-400">
              {percentage >= 80 ? 'Excellent work!' : 
               percentage >= 60 ? 'Good job! Keep practicing.' : 
               'Keep learning and try again!'}
            </div>
          </div>
          
          <Separator className="bg-white/10" />
          
          <div className="flex justify-center">
            <Button onClick={resetQuiz} className="bg-blue-600 hover:bg-blue-700">
              Take Quiz Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 text-white rounded-lg p-2">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <CardTitle className="text-2xl text-white">{course.title}</CardTitle>
              <CardDescription className="text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/20 text-green-300">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="flex justify-end">
          <Button 
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Course Viewer Component
export function CourseViewer({ course, onBack }) {
  useEffect(() => {
    courseLogger.info('Course viewer opened', { 
      courseId: course.id, 
      courseType: course.type,
      title: course.title 
    });
  }, [course]);

  const renderContent = () => {
    switch (course.type) {
      case 'text':
        return <TextContent course={course} />;
      case 'video':
        return <VideoContent course={course} />;
      case 'quiz':
        return <QuizContent course={course} />;
      default:
        return (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Unknown Content Type</h3>
              <p className="text-gray-400">This content type is not yet supported.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </Button>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Footer */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-white/10 text-gray-300">
                  {course.type.charAt(0).toUpperCase() + course.type.slice(1)} Content
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CourseViewer;
