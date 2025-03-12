import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'

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
    url: getApiUrl('/auth/login'),
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

export const register = (data: RegisterData) => {
  return request({
    url: getApiUrl('/auth/register'),
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: getApiUrl('/auth/me'),
    method: 'get'
  })
}

export interface PasswordChangeData {
  old_password: string
  new_password: string
  confirm_password: string
}

export const changePassword = (data: PasswordChangeData) => {
  return request({
    url: getApiUrl('/auth/change-password'),
    method: 'post',
    data
  })
}