import request from '@/utils/request'
import { getApiUrl } from '@/utils/request'
import type { Scene, SceneCreate, SceneUpdate, SceneSearchParams, SceneList } from '@/types/scene'

// 获取场景列表
export const getScenes = (params: SceneSearchParams = {}) => {
  return request<SceneList>({
    url: getApiUrl('/scenes'),
    method: 'get',
    params
  })
}

// 获取单个场景
export const getScene = (id: number) => {
  return request<Scene>({
    url: getApiUrl(`/scenes/${id}`),
    method: 'get'
  })
}

// 创建场景
export const createScene = (data: Partial<Scene>) => {
  return request<Scene>({
    url: getApiUrl('/scenes'),
    method: 'post',
    data
  })
}

// 更新场景
export const updateScene = (id: number, data: Partial<Scene>) => {
  return request<Scene>({
    url: getApiUrl(`/scenes/${id}`),
    method: 'put',
    data
  })
}

// 删除场景
export const deleteScene = (id: number) => {
  return request<void>({
    url: getApiUrl(`/scenes/${id}`),
    method: 'delete'
  })
}

// 复制场景
export const copyScene = (id: number) => {
  return request<Scene>({
    url: getApiUrl(`/scenes/${id}/copy`),
    method: 'post'
  })
} 