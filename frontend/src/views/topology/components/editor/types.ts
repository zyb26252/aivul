/**
 * 拓扑编辑器类型定义
 */

// 节点数据接口
export interface NodeData {
  type: 'container' | 'switch' | 'group'
  properties: Record<string, any>
  parent?: string
  name?: string
  description?: string
  movable?: boolean
  preventDrag?: boolean
  selected?: boolean
}

// 边数据接口
export interface EdgeData {
  properties: Record<string, any>
  router?: {
    name: string
    args?: {
      padding?: number
      direction?: string
    }
  }
  connector?: {
    name: string
    args?: {
      radius?: number
    }
  }
  customStyle?: boolean
  customAttrs?: {
    line?: {
      stroke?: string
      strokeWidth?: number
      strokeDasharray?: string
    }
  }
  selected?: boolean
}

// 分组数据接口
export interface GroupData {
  id: string
  name: string
  children: string[]
}

// 拓扑数据接口
export interface TopologyData {
  nodes: Array<{
    id: string
    type: string
    x: number
    y: number
    data: NodeData
    attrs: any
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    data: EdgeData
    attrs: any
  }>
  groups: GroupData[]
}

// 历史记录接口
export interface HistoryState {
  past: TopologyData[]
  future: TopologyData[]
}

// 节点配置接口
export interface NodeConfig {
  width?: number
  height?: number
  shape: string
  attrs: {
    body: {
      fill: string
      stroke: string
      strokeWidth: number
      rx?: number
      ry?: number
      strokeDasharray?: string
    }
    image?: {
      'xlink:href': string
      width: number
      height: number
      x: number
      y: number
    }
    label: {
      text: string
      fontSize: number
      fill: string
      y?: number
      refX?: number
      refY?: number
      textAnchor?: string
      textVerticalAnchor?: string
    }
  }
  markup?: Array<{
    tagName: string
    selector: string
  }>
  ports?: {
    groups: {
      [key: string]: {
        position: string
        attrs: {
          circle: {
            r: number
            magnet: boolean
            stroke: string
            strokeWidth: number
            fill: string
            cursor: string
            event: string
            visibility: string
          }
        }
      }
    }
  }
  movable?: boolean
}

// 快捷键配置接口
export interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  label: string
} 