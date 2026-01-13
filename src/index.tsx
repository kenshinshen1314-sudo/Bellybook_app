import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App';
import './index.css';

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Wait for the page to load before registering SW
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[SW] Service Worker registered successfully:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available, notify user
                console.log('[SW] New version available, waiting to activate...');

                // You can add a UI notification here to prompt user to refresh
                if (window.confirm('新版本可用！点击刷新以更新。')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Listen for controlling changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Controller changed, page will reload');
          window.location.reload();
        });

      } catch (error) {
        console.error('[SW] Service Worker registration failed:', error);
      }
    });
  } else {
    console.warn('[SW] Service Worker not supported in this browser');
  }
}

// Register Service Worker
registerServiceWorker();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);
