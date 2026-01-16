/**
 * Authentication Views (Login & Register)
 * Enhanced with Vibe Design System
 * - Neumorphic design language with 3-layer shadows
 * - Apple Spring animations
 * - All colors use CSS variables
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, Eye, EyeOff, LogOut, User, Lock, Mail } from 'lucide-react';
import { Language, Theme } from '../types';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// Spring Animation Presets
// ============================================================================

const spring = {
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  gentle: { type: "spring", stiffness: 300, damping: 35 },
  bouncy: { type: "spring", stiffness: 500, damping: 25 },
  smooth: { type: "spring", stiffness: 200, damping: 40 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: spring.gentle }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

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
// Neumorphic Button Component (uses CSS variables)
// ============================================================================

interface NeumorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
}

function NeumorphicButton({
  children,
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'primary',
  type = 'button',
  className = '',
}: NeumorphicButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 active:scale-[0.97] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12 px-6";

  // Get CSS variables
  const getStyles = () => {
    const primaryColor = 'var(--primary)';
    const primaryForeground = 'var(--primary-foreground)';
    const secondaryBg = 'var(--secondary)';
    const secondaryFg = 'var(--secondary-foreground)';

    if (variant === 'primary') {
      return {
        background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 85%, black) 50%, color-mix(in srgb, ${primaryColor} 70%, black) 100%)`,
        color: primaryForeground,
        boxShadow: isHovered
          ? `0 8px 24px color-mix(in srgb, ${primaryColor} 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)`
          : `0 4px 16px color-mix(in srgb, ${primaryColor} 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)`,
      };
    }

    if (variant === 'secondary') {
      return {
        background: `linear-gradient(135deg, ${secondaryBg} 0%, color-mix(in srgb, ${secondaryBg} 85%, black) 100%)`,
        color: secondaryFg,
        boxShadow: isHovered
          ? `0 6px 20px color-mix(in srgb, ${secondaryBg} 50%, transparent), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1)`
          : `0 4px 12px color-mix(in srgb, ${secondaryBg} 40%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.05)`,
      };
    }

    if (variant === 'outline') {
      return {
        background: 'transparent',
        color: primaryColor,
        boxShadow: 'none',
        border: `2px solid ${primaryColor}`,
      };
    }

    // ghost
    return {
      background: 'transparent',
      color: primaryForeground,
      boxShadow: 'none',
    };
  };

  const style = getStyles();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={baseStyle}
      style={{
        background: style.background,
        color: style.color,
        boxShadow: style.boxShadow,
        border: style.border || 'none',
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.96 }}
      transition={spring.snappy}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

// ============================================================================
// Neumorphic Input Component (uses CSS variables)
// ============================================================================

interface NeumorphicInputProps {
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onPasswordToggle?: () => void;
  label: string;
  theme: Theme;
}

function NeumorphicInput({
  type,
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  icon,
  showPasswordToggle,
  showPassword,
  onPasswordToggle,
  label,
  theme,
}: NeumorphicInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputBg = 'var(--card)';
  const textColor = 'var(--card-foreground)';
  const placeholderColor = 'var(--muted-foreground)';
  const iconColor = 'var(--muted-foreground)';
  const ringColor = 'var(--ring)';

  const boxShadow = isFocused
    ? `inset 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(0,0,0,0.05), 0 0 0 3px color-mix(in srgb, ${ringColor} 30%, transparent)`
    : 'inset 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(0,0,0,0.03)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <label className="block text-sm font-medium mb-2" style={{ color: textColor }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: iconColor }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all duration-200"
          style={{
            background: inputBg,
            color: textColor,
            boxShadow,
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingLeft: icon ? '40px' : '16px',
            paddingRight: showPasswordToggle ? '48px' : '16px',
          }}
        />
        {showPasswordToggle && onPasswordToggle && (
          <button
            type="button"
            onClick={onPasswordToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-transform active:scale-90"
            style={{ color: iconColor }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </motion.div>
  );
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
    usernamePlaceholder: language === Language.ZH ? '请输入用户名' : 'Enter username',
    passwordPlaceholder: language === Language.ZH ? '请输入密码' : 'Enter password',
  };

  const bgColor = 'var(--background)';
  const textColor = 'var(--foreground)';
  const secondaryColor = 'var(--muted-foreground)';
  const backBtnBg = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const primaryColor = 'var(--primary)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bgColor }}>
      {/* Header with Neumorphic Back Button */}
      <motion.div
        className="flex items-center p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.gentle}
      >
        <motion.button
          onClick={onBack}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200"
          style={{ background: backBtnBg }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring.snappy}
        >
          <ChevronLeft size={26} style={{ color: textColor }} />
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section with Gradient Text */}
          <motion.div variants={fadeInUp} className="mb-10">
            <h1
              className="text-4xl font-bold mb-3"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 75%, black) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.title}
            </h1>
            <p style={{ color: secondaryColor, fontSize: '15px' }}>{t.subtitle}</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={fadeInUp}>
              <NeumorphicInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                label={t.username}
                placeholder={t.usernamePlaceholder}
                required
                icon={<User size={20} />}
                theme={theme}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <NeumorphicInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={t.password}
                placeholder={t.passwordPlaceholder}
                required
                icon={<Lock size={20} />}
                showPasswordToggle
                showPassword={showPassword}
                onPasswordToggle={() => setShowPassword(!showPassword)}
                theme={theme}
              />
            </motion.div>

            {/* Error Message with Animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={spring.bouncy}
                  className="p-4 rounded-2xl border"
                  style={{
                    background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--destructive) 30%, transparent)',
                    boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--destructive)' }}>
                    ⚠️ {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Button */}
            <motion.div variants={fadeInUp}>
              <NeumorphicButton
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                variant="primary"
                className="w-full"
              >
                {isLoading ? (language === Language.ZH ? '登录中...' : 'Logging in...') : t.login}
              </NeumorphicButton>
            </motion.div>
          </form>

          {/* Register Link */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 text-center"
          >
            <p style={{ color: secondaryColor }}>
              {t.noAccount}{' '}
              <motion.button
                type="button"
                onClick={onRegisterClick}
                className="font-semibold transition-colors"
                style={{ color: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring.snappy}
              >
                {t.register}
              </motion.button>
            </p>
          </motion.div>
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
    usernamePlaceholder: language === Language.ZH ? '请输入用户名（至少3个字符）' : 'Enter username (min 3 characters)',
    displayNamePlaceholder: language === Language.ZH ? '请输入显示名称（可选）' : 'Enter display name (optional)',
    passwordPlaceholder: language === Language.ZH ? '请输入密码（至少6个字符）' : 'Enter password (min 6 characters)',
    confirmPasswordPlaceholder: language === Language.ZH ? '请再次输入密码' : 'Enter password again',
  };

  const bgColor = 'var(--background)';
  const textColor = 'var(--foreground)';
  const secondaryColor = 'var(--muted-foreground)';
  const backBtnBg = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const primaryColor = 'var(--primary)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bgColor }}>
      {/* Header */}
      <motion.div
        className="flex items-center p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.gentle}
      >
        <motion.button
          onClick={onBack}
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200"
          style={{ background: backBtnBg }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={spring.snappy}
        >
          <ChevronLeft size={26} style={{ color: textColor }} />
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-8 overflow-y-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Title */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h1
              className="text-4xl font-bold mb-3"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, color-mix(in srgb, ${primaryColor} 75%, black) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t.title}
            </h1>
            <p style={{ color: secondaryColor, fontSize: '15px' }}>{t.subtitle}</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={fadeInUp}>
              <NeumorphicInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                label={`${t.username} *`}
                placeholder={t.usernamePlaceholder}
                required
                minLength={3}
                icon={<User size={20} />}
                theme={theme}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <NeumorphicInput
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                label={t.displayName}
                placeholder={t.displayNamePlaceholder}
                icon={<Mail size={20} />}
                theme={theme}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <NeumorphicInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={`${t.password} *`}
                placeholder={t.passwordPlaceholder}
                required
                minLength={6}
                icon={<Lock size={20} />}
                showPasswordToggle
                showPassword={showPassword}
                onPasswordToggle={() => setShowPassword(!showPassword)}
                theme={theme}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <NeumorphicInput
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label={`${t.confirmPassword} *`}
                placeholder={t.confirmPasswordPlaceholder}
                required
                icon={<Lock size={20} />}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                theme={theme}
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={spring.bouncy}
                  className="p-4 rounded-2xl border"
                  style={{
                    background: 'color-mix(in srgb, var(--destructive) 8%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--destructive) 30%, transparent)',
                    boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--destructive)' }}>
                    ⚠️ {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Register Button */}
            <motion.div variants={fadeInUp}>
              <NeumorphicButton
                type="submit"
                disabled={isLoading}
                isLoading={isLoading}
                variant="primary"
                className="w-full"
              >
                {isLoading ? (language === Language.ZH ? '注册中...' : 'Registering...') : t.register}
              </NeumorphicButton>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 text-center"
          >
            <p style={{ color: secondaryColor }}>
              {t.hasAccount}{' '}
              <motion.button
                type="button"
                onClick={onLoginClick}
                className="font-semibold transition-colors"
                style={{ color: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring.snappy}
              >
                {t.login}
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
