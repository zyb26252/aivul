import request from '@/utils/request'
import type { Instance, InstanceCreate, InstanceUpdate } from '@/types/instance'

export const getInstances = () => {
  return request<Instance[]>({
    url: '/api/v1/instances',
    method: 'get'
  })
}

export const createInstance = (data: InstanceCreate) => {
  return request<Instance>({
    url: '/api/v1/instances',
    method: 'post',
    data
  })
}

export const updateInstance = (id: number, data: InstanceUpdate) => {
  return request<Instance>({
    url: `/api/v1/instances/${id}`,
    method: 'put',
    data
  })
}

export const deleteInstance = (id: number) => {
  return request({
    url: `/api/v1/instances/${id}`,
    method: 'delete'
  })
}

export const startInstance = (id: number) => {
  return request<Instance>({
    url: `/api/v1/instances/${id}/start`,
    method: 'post'
  })
}

export const stopInstance = (id: number) => {
  return request<Instance>({
    url: `/api/v1/instances/${id}/stop`,
    method: 'post'
  })
} 