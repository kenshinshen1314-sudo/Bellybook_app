/**
 * Authentication Views (Login & Register)
 * Simple, clean UI for user authentication
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Language, Theme } from '../types';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// Types
// ============================================================================

interface LoginViewProps {
  language: Language;
  theme: Theme;
  onBack: () => void;
  onRegisterClick: () => void;
  onLoginSuccess: () => void;
}

interface RegisterViewProps {
  language: Language;
  theme: Theme;
  onBack: () => void;
  onLoginClick: () => void;
  onRegisterSuccess: () => void;
}

// ============================================================================
// Login View
// ============================================================================

export function LoginView({ language, theme, onBack, onRegisterClick, onLoginSuccess }: LoginViewProps) {
  const { login, migrateOfflineData } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const session = await login({ username, password });

      // Migrate offline data after successful login
      await migrateOfflineData(session.userId);

      onLoginSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : (language === Language.ZH ? '登录失败' : 'Login failed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    title: language === Language.ZH ? '欢迎回来' : 'Welcome Back',
    subtitle: language === Language.ZH ? '登录您的账户继续记录美食' : 'Login to continue your food journey',
    username: language === Language.ZH ? '用户名' : 'Username',
    password: language === Language.ZH ? '密码' : 'Password',
    login: language === Language.ZH ? '登录' : 'Login',
    noAccount: language === Language.ZH ? '还没有账户？' : "Don't have an account?",
    register: language === Language.ZH ? '立即注册' : 'Register now',
    required: language === Language.ZH ? '必填项' : 'Required',
  };

  const bgColor = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  const cardBg = theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-gray-50';
  const inputBg = theme === 'dark' ? 'bg-[#3C3C3E]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center p-4">
        <button
          onClick={onBack}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/5'
          }`}
        >
          <ChevronLeft size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${textColor} mb-2`}>{t.title}</h1>
            <p className={secondaryColor}>{t.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                placeholder={language === Language.ZH ? '请输入用户名' : 'Enter username'}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                  placeholder={language === Language.ZH ? '请输入密码' : 'Enter password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={20} className={secondaryColor} />
                  ) : (
                    <Eye size={20} className={secondaryColor} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === Language.ZH ? '登录中...' : 'Logging in...'}
                </>
              ) : (
                t.login
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className={secondaryColor}>
              {t.noAccount}{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-orange-500 font-semibold"
              >
                {t.register}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// Register View
// ============================================================================

export function RegisterView({ language, theme, onBack, onLoginClick, onRegisterSuccess }: RegisterViewProps) {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (username.length < 3) {
      setError(language === Language.ZH ? '用户名至少需要3个字符' : 'Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError(language === Language.ZH ? '密码至少需要6个字符' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === Language.ZH ? '两次输入的密码不一致' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username,
        password,
        displayName: displayName || undefined,
      });

      onRegisterSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : (language === Language.ZH ? '注册失败' : 'Registration failed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    title: language === Language.ZH ? '创建账户' : 'Create Account',
    subtitle: language === Language.ZH ? '开始您的美食记录之旅' : 'Start your food journey',
    username: language === Language.ZH ? '用户名' : 'Username',
    displayName: language === Language.ZH ? '显示名称' : 'Display Name',
    password: language === Language.ZH ? '密码' : 'Password',
    confirmPassword: language === Language.ZH ? '确认密码' : 'Confirm Password',
    register: language === Language.ZH ? '注册' : 'Register',
    hasAccount: language === Language.ZH ? '已有账户？' : 'Already have an account?',
    login: language === Language.ZH ? '立即登录' : 'Login now',
  };

  const bgColor = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-[#3C3C3E]' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgColor} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center p-4">
        <button
          onClick={onBack}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/5'
          }`}
        >
          <ChevronLeft size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${textColor} mb-2`}>{t.title}</h1>
            <p className={secondaryColor}>{t.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t.username} *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                placeholder={language === Language.ZH ? '请输入用户名（至少3个字符）' : 'Enter username (min 3 characters)'}
                required
                minLength={3}
              />
            </div>

            {/* Display Name Input */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t.displayName}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                placeholder={language === Language.ZH ? '请输入显示名称（可选）' : 'Enter display name (optional)'}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t.password} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                  placeholder={language === Language.ZH ? '请输入密码（至少6个字符）' : 'Enter password (min 6 characters)'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={20} className={secondaryColor} />
                  ) : (
                    <Eye size={20} className={secondaryColor} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                {t.confirmPassword} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl ${inputBg} ${textColor} outline-none focus:ring-2 focus:ring-orange-500 transition-all`}
                  placeholder={language === Language.ZH ? '请再次输入密码' : 'Enter password again'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className={secondaryColor} />
                  ) : (
                    <Eye size={20} className={secondaryColor} />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <p className="text-sm text-red-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === Language.ZH ? '注册中...' : 'Registering...'}
                </>
              ) : (
                t.register
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className={secondaryColor}>
              {t.hasAccount}{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-orange-500 font-semibold"
              >
                {t.login}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
