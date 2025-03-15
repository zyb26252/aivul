import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'
import type { Target } from '@/types/target'

export const getTargets = (params?: URLSearchParams) => {
  // 如果没有传入params，创建一个新的URLSearchParams对象
  const queryParams = params || new URLSearchParams()
  
  return request<Target[]>({
    url: getApiUrl('/targets'),
    method: 'get',
    params: queryParams
  })
}

export const getTarget = (id: number) => {
  return request<Target>({
    url: getApiUrl(`/targets/${id}`),
    method: 'get'
  })
}

export const createTarget = (data: Target) => {
  return request({
    url: getApiUrl('/targets'),
    method: 'post',
    data
  })
}

export const updateTarget = (id: number, data: Target) => {
  return request({
    url: getApiUrl(`/targets/${id}`),
    method: 'put',
    data
  })
}

export const deleteTarget = (id: number) => {
  return request({
    url: getApiUrl(`/targets/${id}`),
    method: 'delete'
  })
}

export const generateDockerfile = (id: number) => {
  return request({
    url: getApiUrl(`/targets/${id}/dockerfile`),
    method: 'get'
  })
} 