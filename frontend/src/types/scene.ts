export interface Scene {
  id: number;
  name: string;
  description: string;
  nodeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SceneCreate {
  name: string;
  description: string;
}

export interface SceneUpdate {
  name?: string;
  description?: string;
}

export interface SceneSearchParams {
  search?: string;
}

export interface SceneListResponse {
  items: Scene[];
  total: number;
} 