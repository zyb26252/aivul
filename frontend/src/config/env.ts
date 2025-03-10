// 环境变量配置

// 环境判断
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// 环境特定的配置
const envConfig = {
  development: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://aivul.love:8000',
    API_TIMEOUT: 5000,
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://aivul.love:8000',
    API_TIMEOUT: 30000,
  }
}

const getEnvConfig = () => {
  const currentEnv = isDevelopment ? 'development' : 'production'
  const envSpecificConfig = envConfig[currentEnv]

  return {
    // 当前环境
    ENV: currentEnv,
    // API服务器地址（优先使用环境变量）
    API_BASE_URL: envSpecificConfig.API_BASE_URL.replace(/\/+$/, ''),
    // API超时时间
    API_TIMEOUT: envSpecificConfig.API_TIMEOUT,
    // 开发服务器配置（仅开发环境使用）
    DEV_PORT: 3000,
    DEV_HOST: '0.0.0.0',
    // 是否为开发环境
    IS_DEV: isDevelopment,
    // 是否为生产环境
    IS_PROD: isProduction
  }
}

export const ENV_CONFIG = getEnvConfig() 