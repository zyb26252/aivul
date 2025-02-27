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

export const login = (data: LoginData) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data: new URLSearchParams(data)
  })
}

export const register = (data: RegisterData) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export const getUserInfo = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  })
} 