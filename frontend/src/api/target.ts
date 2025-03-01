import request from '@/utils/request'
import type { Target } from '@/types/target'

export const getTargets = () => {
  return request<Target[]>({
    url: '/api/v1/targets',
    method: 'get'
  })
}

export const getTarget = (id: number) => {
  return request<Target>({
    url: `/api/v1/targets/${id}`,
    method: 'get'
  })
}

export const createTarget = (data: Target) => {
  return request({
    url: '/api/v1/targets',
    method: 'post',
    data
  })
}

export const updateTarget = (id: number, data: Target) => {
  return request({
    url: `/api/v1/targets/${id}`,
    method: 'put',
    data
  })
}

export const deleteTarget = (id: number) => {
  return request({
    url: `/api/v1/targets/${id}`,
    method: 'delete'
  })
}

export const generateDockerfile = (id: number) => {
  return request({
    url: `/api/v1/targets/${id}/dockerfile`,
    method: 'get'
  })
} 