import request from '@/utils/request'
import type { Software, SoftwareCreate, SoftwareUpdate } from '@/types/software'

export const getSoftwareList = (params?: URLSearchParams) => {
  return request<Software[]>({
    url: '/software',
    method: 'get',
    params
  })
}

export const createSoftware = (data: SoftwareCreate) => {
  return request<Software>({
    url: '/software',
    method: 'post',
    data
  })
}

export const updateSoftware = (id: number, data: SoftwareUpdate) => {
  return request<Software>({
    url: `/software/${id}`,
    method: 'put',
    data
  })
}

export const deleteSoftware = (id: number) => {
  return request({
    url: `/software/${id}`,
    method: 'delete'
  })
} 