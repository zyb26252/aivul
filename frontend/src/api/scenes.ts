import request from '@/utils/request'
import type { Scene, SceneCreate, SceneUpdate } from '@/types/scene'

export const getScenes = (params?: any) => {
  return request({
    url: '/api/v1/scenes/',
    method: 'get',
    params
  })
}

export const getScene = (id: number) => {
  return request<Scene>({
    url: `/api/v1/scenes/${id}`,
    method: 'get'
  })
}

export const createScene = (data: SceneCreate) => {
  return request<Scene>({
    url: '/api/v1/scenes/',
    method: 'post',
    data
  })
}

export const updateScene = (id: number, data: SceneUpdate) => {
  return request<Scene>({
    url: `/api/v1/scenes/${id}`,
    method: 'put',
    data
  })
}

export const deleteScene = (id: number) => {
  return request({
    url: `/api/v1/scenes/${id}`,
    method: 'delete'
  })
}

export const copyScene = (id: number) => {
  return request<Scene>({
    url: `/api/v1/scenes/${id}/copy`,
    method: 'post'
  })
} 