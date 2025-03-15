import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'
import type { Software, SoftwareCreate, SoftwareUpdate } from '@/types/software'

export const getSoftware = (params?: URLSearchParams) => {
  // 如果没有传入params，创建一个新的URLSearchParams对象
  const queryParams = params || new URLSearchParams()
  
  return request<Software[]>({
    url: getApiUrl('/software'),
    method: 'get',
    params: queryParams
  })
}

export const createSoftware = (data: SoftwareCreate) => {
  return request<Software>({
    url: getApiUrl('/software'),
    method: 'post',
    data
  })
}

export const updateSoftware = (id: number, data: SoftwareUpdate) => {
  return request<Software>({
    url: getApiUrl(`/software/${id}`),
    method: 'put',
    data
  })
}

export const deleteSoftware = (id: number) => {
  return request({
    url: getApiUrl(`/software/${id}`),
    method: 'delete'
  })
}

export const checkCompatibility = (baseImageId: number, softwareIds: number[]) => {
  return request<any>({
    url: getApiUrl('/ai/check_compatibility'),
    method: 'post',
    data: {
      base_image_id: baseImageId,
      software_ids: softwareIds
    }
  })
} 