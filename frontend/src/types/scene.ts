export interface Scene {
  id: number;
  name: string;
  description: string;
  node_count: number;
  topology?: {
    nodes: any[];
    edges: any[];
    groups: any[];
  };
  created_at: string;
  updated_at: string;
  created_by_id: number;
}

export interface SceneCreate {
  name: string;
  description: string;
  topology?: {
    nodes: any[];
    edges: any[];
    groups: any[];
  };
}

export interface SceneUpdate {
  name?: string;
  description?: string;
  topology?: {
    nodes: any[];
    edges: any[];
    groups: any[];
  };
}

export interface SceneSearchParams {
  search?: string;
}

export interface SceneList {
  items: Scene[];
  total: number;
} 