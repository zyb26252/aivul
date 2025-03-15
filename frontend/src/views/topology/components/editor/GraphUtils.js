/**
 * 图形操作工具函数
 */
import { nodeConfig } from './GraphConfig'

/**
 * 获取拓扑数据
 * @param {Object} graph 图形实例
 * @returns {Object} 拓扑数据
 */
export const getData = (graph) => {
  if (!graph) {
    throw new Error('图形实例未初始化')
  }

  const nodes = graph.getNodes().map(node => {
    const pos = node.getBBox()
    const data = node.getData()
    const attrs = node.getAttrs()
    
    // 如果是分组节点，确保保存名称
    if (data?.type === 'group') {
      return {
        id: node.id,
        type: data.type,
        x: pos.x,
        y: pos.y,
        data: {
          ...data,
          name: attrs.label?.text || data.name || '未命名分组'  // 从标签文本或原有名称中获取
        },
        attrs: node.getAttrs()
      }
    }
    
    return {
      id: node.id,
      type: data?.type || '',
      x: pos.x,
      y: pos.y,
      data: data,
      attrs: attrs
    }
  })

  const edges = graph.getEdges().map(edge => {
    const sourceId = edge.getSourceCell()?.id || ''
    const targetId = edge.getTargetCell()?.id || ''
    const edgeData = edge.getData()
    const attrs = edge.getAttrs()
    
    // 保存边的路由器和连接器配置
    const router = edge.getRouter()
    const connector = edge.getConnector()
    
    return {
      id: edge.id,
      source: sourceId,
      target: targetId,
      data: {
        ...edgeData,
        router: router ? {
          name: router.name,
          args: router.args
        } : undefined,
        connector: connector ? {
          name: connector.name,
          args: connector.args
        } : undefined
      },
      attrs: attrs
    }
  })

  const allNodes = graph.getNodes()
  const groups = allNodes
    .filter(node => node.getData()?.type === 'group')
    .map(group => ({
      id: group.id,
      name: group.getData()?.name || '未命名分组',
      children: allNodes
        .filter(node => node.getData()?.parent === group.id)
        .map(node => node.id)
    }))

  return { nodes, edges, groups }
}

/**
 * 设置拓扑数据
 * @param {Object} graph 图形实例
 * @param {Object} data 拓扑数据
 */
export const setData = (graph, data) => {
  if (!graph) {
    throw new Error('图形实例未初始化')
  }

  // 清空画布
  graph.removeCell(graph.getCells())

  // 先创建所有节点（分组和普通节点），但先不建立父子关系
  const nodeMap = new Map()
  
  // 先添加分组节点
  const groupNodes = data.nodes.filter(node => node.data.type === 'group')
  groupNodes.forEach(nodeData => {
    if (graph) {
      const group = graph.addNode({
        id: nodeData.id,
        x: nodeData.x,
        y: nodeData.y,
        width: 200, // 初始大小，稍后会根据子节点调整
        height: 100, // 初始大小，稍后会根据子节点调整
        ...nodeConfig.group,
        attrs: {
          ...nodeConfig.group.attrs,
          label: {
            ...nodeConfig.group.attrs.label,
            text: nodeData.data.name || '未命名分组'
          }
        },
        data: nodeData.data,
        zIndex: 0 // 分组在底层
      })
      
      nodeMap.set(nodeData.id, group)
    }
  })

  // 再添加普通节点
  const normalNodes = data.nodes.filter(node => node.data.type !== 'group')
  normalNodes.forEach(nodeData => {
    if (graph) {
      const config = nodeConfig[nodeData.type]
      if (config) {
        const node = graph.addNode({
          id: nodeData.id,
          x: nodeData.x,
          y: nodeData.y,
          ...config,
          attrs: nodeData.attrs,
          data: nodeData.data,
          zIndex: 1 // 普通节点在上层
        })
        
        nodeMap.set(nodeData.id, node)
      }
    }
  })
  
  // 建立节点的父子关系
  normalNodes.forEach(nodeData => {
    if (nodeData.data.parent) {
      const node = nodeMap.get(nodeData.id)
      const parent = nodeMap.get(nodeData.data.parent)
      
      if (node && parent) {
        // 设置父子关系
        node.setData({
          ...node.getData(),
          parent: parent.id
        })
      }
    }
  })

  // 最后添加边
  data.edges.forEach(edgeData => {
    if (edgeData.source && edgeData.target && graph) {
      const edge = graph.addEdge({
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        data: edgeData.data,
        attrs: edgeData.attrs,
        // 使用保存的路由器和连接器配置
        router: edgeData.data?.router || {
          name: 'normal'
        },
        connector: edgeData.data?.connector || {
          name: 'normal'
        }
      })
      
      // 如果有自定义样式，应用它
      if (edgeData.data?.customStyle && edgeData.data?.customAttrs) {
        edge.setAttrs(edgeData.data.customAttrs)
      }
    }
  })

  // 调整分组大小以适应其子节点
  groupNodes.forEach(groupData => {
    if (graph) {
      const group = nodeMap.get(groupData.id)
      if (group) {
        const children = graph.getNodes().filter(node => node.getData()?.parent === groupData.id)
        if (children.length > 0) {
          const bbox = graph.getCellsBBox(children)
          if (bbox) {
            // 添加边距
            const padding = 16
            // 更新分组大小和位置
            group.resize(bbox.width + padding * 2, bbox.height + padding * 2)
            group.position(bbox.x - padding, bbox.y - padding)
          }
        }
      }
    }
  })
}

/**
 * 调整分组边界以适应其子节点
 * @param {Object} graph 图形实例
 * @param {string} groupId 分组ID
 */
export const adjustGroupBounds = (graph, groupId) => {
  if (!graph || !groupId) return
  
  const group = graph.getCellById(groupId)
  if (!group || group.getData()?.type !== 'group') return
  
  // 获取分组内的所有子节点
  const children = graph.getNodes().filter(node => node.getData()?.parent === groupId)
  if (children.length === 0) return
  
  const bbox = graph.getCellsBBox(children)
  if (!bbox) return
  
  // 添加边距
  const padding = 16
  // 更新分组大小和位置
  group.resize(bbox.width + padding * 2, bbox.height + padding * 2)
  group.position(bbox.x - padding, bbox.y - padding)
  
  // 确保层级关系正确
  group.setZIndex(0)
  children.forEach(child => {
    child.setZIndex(1)
  })
  
  console.log(`调整了分组[${groupId}]的边界, 包含${children.length}个子节点`)
}

/**
 * 禁用所有分组节点的移动功能
 * @param {Object} graph 图形实例
 */
export const disableGroupMovement = (graph) => {
  if (!graph) return
  
  const groupNodes = graph.getNodes().filter(node => node.getData()?.type === 'group')
  groupNodes.forEach(group => {
    // 设置不可移动属性
    group.setProp('draggable', false)
    group.setProp('movable', false)
    
    // 添加数据标记
    group.setData({
      ...group.getData(),
      movable: false,
      preventDrag: true
    })
    
    // 设置分组节点的Z轴位置
    group.setZIndex(0)
  })
} 