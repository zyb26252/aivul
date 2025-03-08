import { ENV_CONFIG } from './env'

// 服务器配置
export const SERVER_CONFIG = {
  // API服务器地址
  API_BASE_URL: `${ENV_CONFIG.API_BASE_URL}${ENV_CONFIG.API_PATH}`,
  // API超时时间
  API_TIMEOUT: ENV_CONFIG.API_TIMEOUT,
  // API版本
  API_VERSION: 'v1'
}

// 开发环境配置
export const DEV_CONFIG = {
  // 开发服务器端口
  PORT: ENV_CONFIG.DEV_PORT,
  // 开发服务器主机
  HOST: ENV_CONFIG.DEV_HOST
}

// 其他全局配置
export const APP_CONFIG = {
  // 应用名称
  APP_NAME: 'AI VUL Platform',
  // 默认语言
  DEFAULT_LOCALE: 'zh-CN',
  // Token 存储键名
  TOKEN_KEY: 'token',
  // 主题存储键名
  THEME_KEY: 'theme'
}

export default {
  server: SERVER_CONFIG,
  dev: DEV_CONFIG,
  app: APP_CONFIG
} 