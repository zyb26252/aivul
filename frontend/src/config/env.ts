// 环境变量配置

// 环境判断
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// 环境特定的配置
const envConfig = {
  development: {
    API_TIMEOUT: 5000,
  },
  production: {
    API_TIMEOUT: 30000,
  }
}

const getEnvConfig = () => {
  const currentEnv = isDevelopment ? 'development' : 'production'
  const envSpecificConfig = envConfig[currentEnv]

  return {
    ENV: currentEnv,
    API_TIMEOUT: envSpecificConfig.API_TIMEOUT,
    DEV_PORT: 3000,
    DEV_HOST: '0.0.0.0',
    IS_DEV: isDevelopment,
    IS_PROD: isProduction
  }
}

export const ENV_CONFIG = getEnvConfig()