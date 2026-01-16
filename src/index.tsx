import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Import the registered service worker
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with update handling
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[SW] New content available, refreshing...');
    // Auto-refresh or show prompt
    if (confirm('新版本可用！点击确定以更新。')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('[SW] App ready to work offline');
    // Optionally notify user that app is ready for offline use
  },
  onRegistered(registration) {
    console.log('[SW] Service Worker registered:', registration);

    // Check for updates periodically (every hour)
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error) {
    console.error('[SW] Service Worker registration error:', error);
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

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
