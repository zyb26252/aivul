declare global {
  interface Window {
    APP_CONFIG: {
      API_URL: string
    }
  }
}

export const getConfig = () => {
  // 开发环境优先使用环境变量
  if (import.meta.env.DEV) {
    return {
      apiUrl: import.meta.env.VITE_API_URL
    }
  }
  
  // 生产环境使用运行时配置
  return {
    apiUrl: window.APP_CONFIG?.API_URL || 'http://aivul.love:5000'
  }
}

export default getConfig 