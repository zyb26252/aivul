import request from '@/utils/request'
import type { Image, ImageCreate, ImageUpdate } from '@/types/image'

export const getImages = (params?: URLSearchParams) => {
  return request<Image[]>({
    url: '/images',
    method: 'get',
    params: params
  })
}

export const createImage = (data: ImageCreate) => {
  return request<Image>({
    url: '/images',
    method: 'post',
    data
  })
}

export const updateImage = (id: number, data: ImageUpdate) => {
  return request<Image>({
    url: `/images/${id}`,
    method: 'put',
    data
  })
}

export const deleteImage = (id: number) => {
  return request({
    url: `/images/${id}`,
    method: 'delete'
  })
} 