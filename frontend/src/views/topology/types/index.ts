import type { Graph } from '@antv/x6'

// 拓扑数据结构
export interface Topology {
  nodes: Node[];
  edges: Edge[];
  groups: Group[];
}

// 节点
export interface NodeProperties {
  // 容器节点属性
  cpu?: number
  memory?: number
  // 交换机节点属性
  bandwidth?: string
  vlan?: number
}

export interface NodeData {
  type: 'container' | 'switch' | 'group'
  properties: NodeProperties
  name?: string
  description?: string
}

export interface Node extends Graph.Node {
  attrs?: {
    label?: {
      text: string
    }
  }
  data?: NodeData
}

// 分组
export interface Group {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
}

// 连线
export interface Edge extends Graph.Edge {
  source: string;
  target: string;
} 