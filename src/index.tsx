import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { logger } from './utils/logger';

// Global Error Handler for "Blank Page" debugging
window.onerror = function (message, source, lineno, colno, error) {
  // Ignore null errors (false positives from some libraries)
  if (!message && !error) return;

  // Ignore harmless ResizeObserver warnings (common with Radix UI components)
  if (message === 'ResizeObserver loop completed with undelivered notifications.' ||
      message === 'ResizeObserver loop limit exceeded') {
    return;
  }

  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
  errorDiv.style.color = 'white';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '99999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.innerText = `Runtime Error:\n${message}\nSource: ${source}:${lineno}:${colno}\nStack: ${error?.stack || 'No stack'}`;
  document.body.appendChild(errorDiv);
  logger.error('Global Error:', message, error);
};

window.onunhandledrejection = function (event) {
  // Ignore null rejections (false positives)
  if (!event.reason) return;

  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.bottom = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.backgroundColor = 'rgba(255, 165, 0, 0.9)';
  errorDiv.style.color = 'black';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '99999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.innerText = `Unhandled Rejection:\n${event.reason}\nStack: ${event.reason?.stack || 'No stack'}`;
  document.body.appendChild(errorDiv);
  logger.error('Unhandled Rejection:', event.reason);
};

// Import the registered service worker
// Wrapped in try-catch implicitly by module system, but if this fails, the script stops.
// We hope the global onerror above catches it if it's a runtime error.
import { registerSW } from 'virtual:pwa-register';

try {
  // Register Service Worker with update handling
  const updateSW = registerSW({
    onNeedRefresh() {
      logger.info('New content available, refreshing...');
      // Auto-refresh or show prompt
      if (confirm('新版本可用！点击确定以更新。')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      logger.info('App ready to work offline');
      // Optionally notify user that app is ready for offline use
    },
    onRegistered(registration) {
      logger.info('Service Worker registered:', registration);

      // Check for updates periodically (every hour)
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      logger.error('Service Worker registration error:', error);
    }
  });
} catch (e) {
  logger.error('Service Worker registration failed:', e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </MotionConfig>
    </React.StrictMode>
  );
} catch (e) {
  logger.error('Render failed:', e);
  if (e instanceof Error) {
    const errorDiv = document.createElement('div');
    errorDiv.innerText = `Render Error: ${e.message}\n${e.stack}`;
    document.body.appendChild(errorDiv);
  }
}