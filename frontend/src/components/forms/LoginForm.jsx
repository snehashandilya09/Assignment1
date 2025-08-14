/**
 * Login Form Component for Learning Website
 * Built with Shadcn UI components and React Hook Form
 * Includes comprehensive form validation and error handling
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

// Enhanced logger for form events
const formLogger = {
  info: (message, data = null) => {
    console.log(`📝 [LOGIN_FORM] ${message}`, data ? { data } : '');
  },
  success: (message, data = null) => {
    console.log(`✅ [LOGIN_FORM] ${message}`, data ? { data } : '');
  },
  error: (message, error = null) => {
    console.error(`❌ [LOGIN_FORM] ${message}`, error ? { error } : '');
  },
  validation: (message, data = null) => {
    console.log(`🔍 [LOGIN_FORM] ${message}`, data ? { data } : '');
  }
};

// Login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(255, { message: 'Email must be less than 255 characters' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(100, { message: 'Password must be less than 100 characters' })
});

export function LoginForm({ onSuccess, onSwitchToRegister }) {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  formLogger.info('LoginForm component rendered');

  // Initialize form with react-hook-form
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange' // Validate on change for better UX
  });

  // Handle form submission
  const onSubmit = async (values) => {
    formLogger.info('Form submission started', { email: values.email });
    clearError(); // Clear any previous errors

    try {
      formLogger.validation('Form validation passed', values);
      
      const result = await login(values.email, values.password);
      
      if (result.success) {
        formLogger.success('Login successful', { user: result.user });
        form.reset(); // Clear form on success
        if (onSuccess) {
          onSuccess(result.user);
        }
      } else {
        formLogger.error('Login failed', result.error);
        // Error is handled by AuthContext and displayed via error state
      }
    } catch (error) {
      formLogger.error('Unexpected error during login', error);
    }
  };

  // Handle form errors
  const onError = (errors) => {
    formLogger.validation('Form validation failed', errors);
  };

  // Clear errors when user starts typing
  const handleInputChange = (field) => (e) => {
    if (error) {
      clearError();
    }
    field.onChange(e);
  };

  formLogger.info('Rendering form with state', { 
    isLoading, 
    hasError: !!error,
    formValid: form.formState.isValid
  });

  return (
    <div className="w-full space-y-6">
      {/* Display authentication error */}
      {error && (
        <div className="flex items-center space-x-3 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          <svg className="flex-shrink-0 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Authentication failed</p>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit, onError)} 
          className="space-y-5"
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      disabled={isLoading}
                      {...field}
                      onChange={handleInputChange(field)}
                      className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-400">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      {...field}
                      onChange={handleInputChange(field)}
                      className="pl-10 pr-12 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 border-white/10 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-white"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing In...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>Sign In</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default LoginForm;
