import request from '@/utils/request'
import type { Software, SoftwareCreate, SoftwareUpdate } from '@/types/software'

export const getSoftware = () => {
  return request<Software[]>({
    url: '/api/v1/software',
    method: 'get'
  })
}

export const createSoftware = (data: SoftwareCreate) => {
  return request<Software>({
    url: '/api/v1/software',
    method: 'post',
    data
  })
}

export const updateSoftware = (id: number, data: SoftwareUpdate) => {
  return request<Software>({
    url: `/api/v1/software/${id}`,
    method: 'put',
    data
  })
}

export const deleteSoftware = (id: number) => {
  return request({
    url: `/api/v1/software/${id}`,
    method: 'delete'
  })
}

export const checkCompatibility = (baseImageId: number, softwareIds: number[]) => {
  return request<any>({
    url: '/api/v1/ai/check_compatibility',
    method: 'post',
    data: {
      base_image_id: baseImageId,
      software_ids: softwareIds
    }
  })
} 