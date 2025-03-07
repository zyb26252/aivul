import request from '@/utils/request';
import type { Scene, SceneSearchParams, SceneListResponse } from '@/types/scene';

export const getSceneList = async (params: SceneSearchParams = {}) => {
  return request<SceneListResponse>('/api/v1/scenes', {
    method: 'GET',
    params,
  });
};

export const createScene = async (data: Partial<Scene>) => {
  const response = await request<Scene>('/api/v1/scenes', {
    method: 'POST',
    data,
  });
  return response.data;
};

export const deleteScene = (id: number) => {
  return request<void>(`/api/v1/scenes/${id}`, {
    method: 'DELETE',
  });
};

export const copyScene = (id: number) => {
  return request<Scene>(`/api/v1/scenes/${id}/copy`, {
    method: 'POST',
  });
};

export const updateScene = (id: number, data: Partial<Scene>) => {
  return request<Scene>(`/api/v1/scenes/${id}`, {
    method: 'PUT',
    data,
  });
}; 