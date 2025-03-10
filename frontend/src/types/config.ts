// 运行时配置类型
export interface RuntimeConfig {
  API_URL?: string
  API_TIMEOUT?: number
  ENABLE_CACHE?: boolean
  MAX_RETRIES?: number
}

// 环境配置类型
export interface EnvConfig {
  API_BASE_URL: string
  API_TIMEOUT: number
  DEV_PORT?: number
  DEV_HOST?: string
}

// API 配置类型
export interface ApiConfig {
  BASE_URL: string
  PATH: string
  TIMEOUT: number
  VERSION: string
  URL: string
  ENABLE_CACHE: boolean
  MAX_RETRIES: number
}

// 应用配置类型
export interface AppConfig {
  NAME: string
  VERSION: string
  STORAGE_KEYS: {
    TOKEN: string
    THEME: string
    LOCALE: string
  }
  DEFAULTS: {
    LOCALE: string
    THEME: string
  }
  ENV: {
    CURRENT: 'development' | 'production'
    IS_DEV: boolean
    IS_PROD: boolean
  }
}

// 开发环境配置类型
export interface DevConfig {
  PORT: number
  HOST: string
} 