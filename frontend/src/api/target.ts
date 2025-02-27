import request from '@/utils/request'
import type { Target, TargetCreate, TargetUpdate } from '@/types/target'

export const getTargets = () => {
  return request<Target[]>({
    url: '/targets',
    method: 'get'
  })
}

export const createTarget = (data: TargetCreate) => {
  return request<Target>({
    url: '/targets',
    method: 'post',
    data
  })
}

export const updateTarget = (id: number, data: TargetUpdate) => {
  return request<Target>({
    url: `/targets/${id}`,
    method: 'put',
    data
  })
}

export const deleteTarget = (id: number) => {
  return request({
    url: `/targets/${id}`,
    method: 'delete'
  })
}

export const generateDockerfile = (id: number) => {
  return request<{ dockerfile: string }>({
    url: `/targets/${id}/dockerfile`,
    method: 'post'
  })
} 