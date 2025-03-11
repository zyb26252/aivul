import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getConfig } from './config'
import { API_CONFIG } from '@/config'

declare global {
  interface Window {
    APP_CONFIG: {
      API_URL: string
      API_TIMEOUT: number
      appTitle: string
      appDescription: string
    }
  }
}

export const getApiUrl = (path: string) => `${API_CONFIG.PATH}${path}`

// 创建 axios 实例
const service = axios.create({
  // 从运行时配置获取 baseURL
  baseURL: window.APP_CONFIG?.API_URL || 'http://localhost:8000',
  timeout: window.APP_CONFIG?.API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        // 如果是登录接口返回401，说明用户名或密码错误
        if (error.config.url.includes('/auth/login')) {
          ElMessage.error(error.response.data.detail || '用户名或密码错误')
        } else {
          // 其他接口返回401，说明token过期
          localStorage.removeItem('token')
          ElMessage.error('登录已过期，请重新登录')
          router.push('/login')
        }
      } else {
        ElMessage.error(error.response.data.detail || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)

const request = <T = any>(config: any) => {
  return service(config) as Promise<T>
}

export default request 