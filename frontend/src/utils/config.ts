import { ENV_CONFIG } from '@/config/env'

declare global {
  interface Window {
    APP_CONFIG: {
      API_URL: string
    }
  }
}

export const getConfig = () => {
  // 开发环境和生产环境统一使用 ENV_CONFIG
  return {
    apiUrl: ENV_CONFIG.API_BASE_URL
  }
}

export default getConfig 