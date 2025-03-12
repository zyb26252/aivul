import { isDevelopment, isProduction, ENV_CONFIG } from './env'
import type { RuntimeConfig, EnvConfig, ApiConfig, AppConfig, DevConfig } from '@/types/config'

// 声明全局配置类型
declare global {
  interface Window {
    APP_CONFIG?: Partial<RuntimeConfig>
  }
}

// 环境特定的配置
const envConfig: Record<string, EnvConfig> = {
  development: {
    API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 5000,
    DEV_PORT: 3000,
    DEV_HOST: '0.0.0.0'
  },
  production: {
    API_TIMEOUT: 30000
  }
}

// 获取当前环境的配置
const currentEnv = isDevelopment ? 'development' : 'production'
const currentEnvConfig = envConfig[currentEnv]

// 获取运行时配置
const getRuntimeConfig = (): Partial<RuntimeConfig> | null => {
  if (isProduction && window.APP_CONFIG) {
    return window.APP_CONFIG
  }
  return null
}

// API 配置
export const API_CONFIG: ApiConfig = {
  BASE_URL: (window as any).CONFIG?.API_URL || '',
  VERSION: 'v1',
  get PATH() {
    return `/api/${this.VERSION}`
  },
  TIMEOUT: getRuntimeConfig()?.API_TIMEOUT || currentEnvConfig.API_TIMEOUT,
  ENABLE_CACHE: getRuntimeConfig()?.ENABLE_CACHE ?? true,
  MAX_RETRIES: getRuntimeConfig()?.MAX_RETRIES ?? 3,
  get URL() {
    return `${this.BASE_URL}${this.PATH}`
  }
}

// 应用配置
export const APP_CONFIG: AppConfig = {
  // 应用信息
  NAME: 'AI VUL Platform',
  VERSION: '1.0.0',
  
  // 本地存储键名
  STORAGE_KEYS: {
    TOKEN: 'token',
    THEME: 'theme',
    LOCALE: 'locale'
  },

  // 默认设置
  DEFAULTS: {
    LOCALE: 'zh-CN',
    THEME: 'light'
  },

  // 环境标志
  ENV: {
    CURRENT: currentEnv as 'development' | 'production',
    IS_DEV: isDevelopment,
    IS_PROD: isProduction
  }
}

// 开发环境特定配置
export const DEV_CONFIG: DevConfig | null = isDevelopment && currentEnvConfig.DEV_PORT && currentEnvConfig.DEV_HOST
  ? {
      PORT: currentEnvConfig.DEV_PORT,
      HOST: currentEnvConfig.DEV_HOST
    }
  : null

// 导出配置获取函数（用于请求库等）
export const getConfig = () => ({
  apiUrl: API_CONFIG.URL
})

// 默认导出所有配置
export default {
  api: API_CONFIG,
  app: APP_CONFIG,
  dev: DEV_CONFIG,
  getConfig
}

// 开发环境下的调试信息
if (ENV_CONFIG.IS_DEV) {
  console.log('API Config:', API_CONFIG)
  console.log('App Config:', APP_CONFIG)
  console.log('Dev Config:', DEV_CONFIG)
}