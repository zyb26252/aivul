import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  base: '/',

  // 开发服务器配置
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: true,
    origin: 'http://8.210.223.197:3000',
    allowedHosts: ['8.210.223.197'],
    hmr: {
      protocol: 'http',
      host: '8.210.223.197',
      port: 3000,
      clientPort: 3000
    },
    proxy: {
      '/api': {
        target: 'https://aivul.love:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    watch: {
      usePolling: true
    }
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 构建配置
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    },
    chunkSizeWarningLimit: 2000
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
    exclude: [],
    force: true,
    entries: ['src/**/*.vue'],
    esbuildOptions: {
      target: 'es2015'
    }
  },

  // 日志级别
  logLevel: 'info',
  clearScreen: false,

  // 预览配置
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true
  }
})
