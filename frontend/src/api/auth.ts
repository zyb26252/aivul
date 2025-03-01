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
  const params = new URLSearchParams()
  params.append('grant_type', 'password')
  params.append('username', data.username)
  params.append('password', data.password)
  
  return request({
    url: '/auth/login',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
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