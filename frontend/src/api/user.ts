import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'
import type { User } from '@/types/user'

export const getUsers = () => {
  return request<User[]>({
    url: getApiUrl('/users'),
    method: 'get'
  })
}

export const getUser = (id: number) => {
  return request<User>({
    url: getApiUrl(`/users/${id}`),
    method: 'get'
  })
}

export const createUser = (data: User) => {
  return request({
    url: getApiUrl('/users'),
    method: 'post',
    data
  })
}

export const updateUser = (id: number, data: User) => {
  return request({
    url: getApiUrl(`/users/${id}`),
    method: 'put',
    data
  })
}

export const deleteUser = (id: number) => {
  return request({
    url: getApiUrl(`/users/${id}`),
    method: 'delete'
  })
} 