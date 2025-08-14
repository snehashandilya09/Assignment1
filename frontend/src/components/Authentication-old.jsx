/**
 * Authentication Component - Main wrapper for login/register forms
 * Beautiful design with Shadcn UI components and modern styling
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import LoginForm from '@/components/forms/LoginForm';
import RegisterForm from '@/components/forms/RegisterForm';

// Enhanced logger for authentication component
const authLogger = {
  info: (message, data = null) => {
    console.log(`🔐 [AUTH_COMPONENT] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [AUTH_COMPONENT] ${message}`, data ? { data } : '');
  },
  user: (message, data = null) => {
    console.log(`👤 [AUTH_COMPONENT] ${message}`, data ? { data } : '');
  }
};

// Authentication modes
const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register'
};

// Authentication component
export function Authentication({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN);

  authLogger.info('Authentication component rendered', { authMode });

  // Handle successful authentication
  const handleAuthSuccess = (user) => {
    authLogger.success('Authentication successful', { 
      user: user?.username,
      userId: user?.id,
      authMode 
    });
    
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
  };

  // Switch to login mode
  const switchToLogin = () => {
    authLogger.user('Switching to login mode');
    setAuthMode(AUTH_MODES.LOGIN);
  };

  // Switch to register mode
  const switchToRegister = () => {
    authLogger.user('Switching to register mode');
    setAuthMode(AUTH_MODES.REGISTER);
  };

  const isLoginMode = authMode === AUTH_MODES.LOGIN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(139,69,255,0.15)_0,rgba(139,69,255,0)_50%,rgba(139,69,255,0)_100%)]"></div>
      
      {/* LEFT SIDE - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
        <div className="max-w-md text-center space-y-8">
          {/* Large Logo */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl p-6 shadow-2xl">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">
              EduTrack Analytics
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Advanced Learning Analytics Platform
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Unlock the power of data-driven learning with comprehensive analytics, 
              personalized insights, and interactive data science modules.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="text-white font-semibold mb-1">Learning Analytics</h3>
              <p className="text-gray-400 text-sm">Real-time insights into your progress</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🧠</div>
              <h3 className="text-white font-semibold mb-1">AI-Powered</h3>
              <p className="text-gray-400 text-sm">Personalized learning recommendations</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-white font-semibold mb-1">Data Science Focus</h3>
              <p className="text-gray-400 text-sm">Specialized curriculum for data science</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-1">Interactive Learning</h3>
              <p className="text-gray-400 text-sm">Hands-on modules and assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo (shown only on small screens) */}
          <div className="lg:hidden text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-4 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">EduTrack Analytics</h1>
            <p className="text-gray-400">Advanced Learning Analytics Platform</p>
          </div>

        {/* Main Authentication Card */}
        <Card className="shadow-xl border-0 bg-white/5 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            {/* Mode Switcher */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg bg-gray-100/5 p-1 shadow-inner">
                <Button
                  variant={isLoginMode ? "default" : "ghost"}
                  size="sm"
                  onClick={switchToLogin}
                  className="rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:shadow-sm text-white"
                >
                  Sign In
                </Button>
                <Button
                  variant={!isLoginMode ? "default" : "ghost"}
                  size="sm"
                  onClick={switchToRegister}
                  className="rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white/10 data-[state=active]:shadow-sm text-white"
                >
                  Create Account
                </Button>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-semibold text-white">
                {isLoginMode ? "Welcome back!" : "Get started today"}
              </CardTitle>
              <CardDescription className="text-base text-gray-400">
                {isLoginMode 
                  ? "Sign in to continue your learning journey" 
                  : "Create your account and unlock personalized learning"
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            {/* Authentication Forms */}
            {isLoginMode ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={switchToRegister}
              />
            ) : (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={switchToLogin}
              />
            )}
            
            <Separator className="my-6 bg-white/10" />
            
            {/* Features Preview */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-center text-gray-400">
                What you'll get:
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3 text-sm text-gray-400 bg-green-500/10 rounded-lg p-3">
                  <div className="bg-green-500 text-white rounded-full p-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Interactive content with videos, quizzes & text</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-400 bg-blue-500/10 rounded-lg p-3">
                  <div className="bg-blue-500 text-white rounded-full p-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Real-time progress tracking & analytics</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-400 bg-purple-500/10 rounded-lg p-3">
                  <div className="bg-purple-500 text-white rounded-full p-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Personalized learning recommendations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <button className="text-blue-600 hover:text-blue-700 underline font-medium">Terms of Service</button>
            {' '}and{' '}
            <button className="text-blue-600 hover:text-blue-700 underline font-medium">Privacy Policy</button>
          </p>
          
          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="bg-amber-500/10 border-amber-200/20">
              <CardContent className="pt-4">
                <div className="text-xs text-amber-400 space-y-2">
                  <p className="font-semibold flex items-center justify-center gap-1">
                    🛠️ Development Mode
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-left bg-amber-100/5 rounded p-2">
                    <div className="font-medium">Mode:</div>
                    <div>{authMode}</div>
                    <div className="font-medium">API:</div>
                    <div className="text-green-600">Online ✅</div>
                    <div className="font-medium">DB:</div>
                    <div>Local JSON</div>
                    <div className="font-medium">Env:</div>
                    <div>{process.env.NODE_ENV}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Authentication;
