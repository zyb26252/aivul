import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  // 开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: true,
    allowedHosts: ['8.210.223.197'],
    hmr: {
      clientPort: 3000
    },
    proxy: {
      '/api': {
        target: 'http://8.210.223.197:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // 强制预构建依赖
    force: true,
    // 预构建依赖配置
    optimizeDeps: {
      entries: ['src/**/*.vue'],
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        '@antv/x6',
        '@antv/x6-vue-shape',
        'axios'
      ]
    }
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // 构建配置
  build: {
    target: 'es2015',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) {
              return 'element-plus-vendor'
            }
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            if (id.includes('@antv')) {
              return 'antv-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  },

  // 依赖优化配置
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@antv/x6',
      '@antv/x6-vue-shape',
      'axios'
    ],
    force: true,
    entries: [
      './src/**/*.vue'
    ]
  },

  // 日志级别
  logLevel: 'info',
  clearScreen: false
})
