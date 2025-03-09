import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getConfig } from './config'

const service = axios.create({
  baseURL: getConfig().apiUrl,
  timeout: 5000,
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

export default service 