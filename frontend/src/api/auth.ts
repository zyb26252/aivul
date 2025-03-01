import request from '@/utils/request'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export const login = (data: LoginData) => {
  const formData = new URLSearchParams()
  formData.append('username', data.username)
  formData.append('password', data.password)
  
  return request<LoginResponse>({
    url: '/api/v1/auth/login',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const register = (data: RegisterData) => {
  return request({
    url: '/api/v1/auth/register',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/api/v1/auth/me',
    method: 'get'
  })
} 