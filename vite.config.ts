import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg'],
          manifest: {
            name: '胃之书 - Bellybook',
            short_name: 'Bellybook',
            description: '智能食物记录与分析App，通过拍照或上传菜品图片，AI智能分析菜品构成和营养成分',
            theme_color: '#10B981',
            background_color: '#F2F2F7',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'icon.svg',
                sizes: '192x192 512x512',
                purpose: 'any maskable'
              }
            ],
            shortcuts: [
              {
                name: '拍照记录',
                short_name: '拍照',
                description: '打开相机拍摄食物照片',
                url: '/?action=camera',
                icons: [{ src: 'icon.svg', sizes: '192x192' }]
              },
              {
                name: '历史记录',
                short_name: '历史',
                description: '查看食物记录历史',
                url: '/?tab=history',
                icons: [{ src: 'icon.svg', sizes: '192x192' }]
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 // 24 hours
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'image-cache',
                  expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  }
                }
              }
            ],
            navigateFallback: 'index.html',
            navigateFallbackDenylist: [/^https?:\/\/|^http:\/\/localhost/]
          },
          devOptions: {
            enabled: true,
            type: 'module'
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'framer-motion'],
              'ui-vendor': ['recharts', 'lucide-react']
            }
          }
        }
      }
    };
});
