/**
 * 拓扑编辑器事件处理函数
 */
import { ElMessage, ElMessageBox } from 'element-plus'
import { nodeConfig } from './GraphConfig'

// 导入GroupUtils中的函数
import { updateAllGroups, updateGroupBoundaryById, disableGroupMovement } from '../GroupUtils'

/**
 * 设置图形事件监听器
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 * @param {Function} saveToHistory 保存历史记录函数
 * @param {Function} updateCounts 更新统计数据函数
 * @param {Function} updateGroups 更新分组数据函数
 */
export const setupGraphListeners = (graph, state, saveToHistory, updateCounts, updateGroups) => {
  if (!graph) return

  // 监听所有可能改变状态的事件
  const events = [
    'cell:added',
    'cell:removed',
    'node:moved',
    'edge:connected',
    'node:change:data',
    'edge:change:data',
    'node:change:position',
    'node:change:size',
    'edge:change:vertices',
    'edge:change:source',
    'edge:change:target'
  ]

  // 立即保存初始状态
  saveToHistory()

  // 为每个事件添加监听器
  events.forEach(event => {
    graph.on(event, () => {
      // 直接保存状态，不使用防抖
      saveToHistory()
    })
  })

  // 更新统计数据的监听器
  graph.on('cell:added', updateCounts)
  graph.on('cell:removed', updateCounts)
  graph.on('node:change:data', updateCounts)

  // 监听节点变化，更新分组数据
  graph.on('node:added', updateGroups)
  graph.on('node:removed', updateGroups)
  graph.on('node:change:data', updateGroups)
  graph.on('node:change:parent', updateGroups)
  graph.on('node:change:attrs', updateGroups)
  
  // 监听节点位置变化，更新分组
  graph.on('node:change:position', () => {
    setTimeout(() => {
      updateAllGroups(graph)
    }, 50)
  })
}

/**
 * 设置选择状态变化事件处理
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 */
export const setupSelectionChangeHandler = (graph, state) => {
  if (!graph) return

  graph.on('selection:changed', ({ selected, removed }) => {
    // 更新选中状态
    state.selectedCells.value = selected || []

    // 如果没有选中任何元素，则恢复所有元素的默认样式
    if (!selected || selected.length === 0) {
      // 清除所有节点的高亮效果
      graph.getNodes().forEach(node => {
        if (node.getData()?.type !== 'group') {
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        } else {
          // 确保分组节点不可移动
          node.setProp('draggable', false)
          node.setProp('movable', false)
          
          // 更新数据标记
          node.setData({
            ...node.getData(),
            movable: false,
            preventDrag: true
          })
        }
      })

      // 清除所有边的高亮效果
      graph.getEdges().forEach(edge => {
        const edgeData = edge.getData()
        // 清除选中状态
        edge.setData({
          ...edgeData,
          selected: false
        })
        
        // 恢复边的样式，保留自定义样式
        if (edgeData?.customStyle) {
          // 如果有自定义样式，使用自定义样式
          edge.setAttrs(edgeData.customAttrs)
        } else {
          // 否则使用默认样式
          edge.setAttrs({
            line: {
              stroke: '#333',
              strokeWidth: 1,
              strokeDasharray: '',  // 使用空字符串表示实线
              targetMarker: null    // 移除箭头
            }
          })
        }
      })
    }

    // 处理选中的元素
    if (selected && selected.length > 0) {
      const cell = selected[0]
      
      if (cell.isEdge()) {
        // 获取当前边的样式
        const currentStyle = cell.getAttrs().line || {}
        const edgeData = cell.getData()
        
        // 如果边有自定义样式，使用自定义样式
        if (edgeData?.customStyle) {
          cell.setAttrs(edgeData.customAttrs)
        } else {
          // 保持当前样式，只增加线条宽度
          cell.setAttrs({
            line: {
              ...currentStyle,
              strokeWidth: (currentStyle.strokeWidth || 1) + 1 // 只增加线条宽度
            }
          })
        }
        
        // 在数据中标记为选中状态
        cell.setData({
          ...cell.getData(),
          selected: true
        })
        
        state.selectedNode.value = undefined
        state.selectedEdge.value = {
          id: cell.id,
          connector: cell.getConnector()?.name || 'normal',
          attrs: cell.getAttrs()
        }
      } else if (cell.isNode() && cell.getData()?.type === 'group') {
        // 设置分组节点的高亮效果
        cell.setAttrs({
          body: {
            ...cell.getAttrs().body,
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '5 5'
          }
        })
        
        // 确保分组节点不可移动
        cell.setProp('draggable', false)
        cell.setProp('movable', false)
        
        // 更新数据标记
        cell.setData({
          ...cell.getData(),
          movable: false,
          preventDrag: true,
          selected: true
        })
        
        state.selectedEdge.value = null
        const nodeData = {
          id: cell.id,
          type: cell.getData()?.type,
          data: {
            type: cell.getData()?.type,
            name: cell.getData()?.name || '未命名分组',
            description: cell.getData()?.description || '',
            properties: cell.getData()?.properties || {},
          },
          position: cell.getPosition(),
          size: cell.getSize(),
          attrs: cell.getAttrs(),
        }
        state.selectedNode.value = nodeData
      }
    }
  })
}

/**
 * 设置节点点击事件处理
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 */
export const setupNodeClickHandler = (graph, state) => {
  if (!graph) return

  graph.on('node:click', ({ node }) => {
    if (state.isConnecting.value) {
      if (!state.sourceNode.value) {
        state.sourceNode.value = node
        ElMessage.info('请选择目标节点')
      } else {
        if (state.sourceNode.value !== node) {
          try {
            const edge = graph.addEdge({
              source: state.sourceNode.value,
              target: node,
              attrs: {
                line: {
                  stroke: '#1890ff',
                  strokeWidth: 2,
                  targetMarker: null // 移除箭头
                }
              }
            })

            if (edge) {
              edge.setRouter({
                name: 'orth',
                args: {
                  padding: 20,
                  direction: 'H'
                }
              })
              edge.setConnector({
                name: 'rounded',
                args: {
                  radius: 8
                }
              })
            }

            ElMessage.success('连线创建成功')
          } catch (error) {
            ElMessage.error('无法创建连线')
          }
        }
        state.isConnecting.value = false
        state.sourceNode.value = null
      }
    } else if (state.isGrouping.value) {
      // 如果正在创建分组
      if (node.getData()?.type !== 'group') {
        const index = state.groupingNodes.value.findIndex(n => n.id === node.id)
        if (index === -1) {
          // 添加到分组节点列表
          state.groupingNodes.value.push(node)
          // 设置节点高亮效果
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: '#1890ff',
              strokeWidth: 2,
              strokeDasharray: '5 5'
            }
          })
        } else {
          // 从分组节点列表中移除
          state.groupingNodes.value.splice(index, 1)
          // 移除节点高亮效果
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        }
      }
    } else {
      // 清除所有节点的高亮效果
      graph.getNodes().forEach(n => {
        if (n.getData()?.type !== 'group') {
          n.setAttrs({
            body: {
              ...n.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        }
      })

      // 保持边的自定义样式，只清除选中状态
      graph.getEdges().forEach(edge => {
        const edgeData = edge.getData()
        
        // 清除选中状态
        edge.setData({
          ...edgeData,
          selected: false
        })
        
        // 保留自定义样式
        if (edgeData?.customStyle) {
          edge.setAttrs(edgeData.customAttrs)
        } else {
          edge.setAttrs({
            line: {
              stroke: '#333',
              strokeWidth: 1,
              strokeDasharray: '',
              targetMarker: null
            }
          })
        }
      })
      
      // 设置当前节点的高亮效果
      if (node.getData()?.type !== 'group') {
        node.setAttrs({
          body: {
            ...node.getAttrs().body,
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '5 5'
          }
        })
      } else {
        // 如果是分组节点，确保它不能被移动
        node.setProp('draggable', false)
        node.setProp('movable', false)
        
        // 更新数据标记
        node.setData({
          ...node.getData(),
          movable: false,
          preventDrag: true,
          selected: true
        })
      }
      
      state.selectedEdge.value = null
      // 更新选中状态
      state.selectedCells.value = [node]
      // 构造完整的节点数据
      const nodeData = {
        id: node.id,
        type: node.getData()?.type,
        data: {
          type: node.getData()?.type,
          name: node.getData()?.name || '未命名分组',
          description: node.getData()?.description || '',
          properties: node.getData()?.properties || {},
        },
        position: node.getPosition(),
        size: node.getSize(),
        attrs: node.getAttrs(),
      }
      state.selectedNode.value = nodeData
    }
  })
}

/**
 * 设置边点击事件处理
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 */
export const setupEdgeClickHandler = (graph, state) => {
  if (!graph) return

  graph.on('edge:click', ({ edge }) => {
    // 清除所有节点的高亮效果
    graph.getNodes().forEach(node => {
      if (node.getData()?.type !== 'group') {
        node.setAttrs({
          body: {
            ...node.getAttrs().body,
            stroke: 'none',
            strokeWidth: 0
          }
        })
      }
    })

    // 获取当前边的数据和样式
    const edgeData = edge.getData()
    const currentStyle = edge.getAttrs().line || {}

    // 设置选中状态
    edge.setData({
      ...edgeData,
      selected: true
    })

    // 应用选中效果，同时保持原始样式
    if (edgeData?.customStyle) {
      // 如果有自定义样式，使用自定义样式并增加线宽
      const customAttrs = edgeData.customAttrs
      edge.setAttrs({
        line: {
          ...customAttrs.line,
          strokeWidth: (customAttrs.line.strokeWidth || 1) + 1  // 选中时增加线宽
        }
      })
    } else {
      // 否则在当前样式基础上增加线宽
      edge.setAttrs({
        line: {
          ...currentStyle,
          stroke: '#1890ff',  // 选中时改变颜色
          strokeWidth: (currentStyle.strokeWidth || 1) + 1  // 选中时增加线宽
        }
      })
    }

    // 更新选中状态
    state.selectedCells.value = [edge]
    state.selectedNode.value = undefined
    state.selectedEdge.value = {
      id: edge.id,
      connector: edge.getConnector()?.name || 'normal',
      attrs: {
        line: {
          ...currentStyle,  // 使用原始样式
          strokeDasharray: currentStyle.strokeDasharray || ''  // 保持原始的线条样式
        }
      }
    }
  })
}

/**
 * 设置空白处点击事件处理
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 */
export const setupBlankClickHandler = (graph, state) => {
  if (!graph) return

  graph.on('blank:click', () => {
    // 清除所有节点的高亮效果
    graph.getNodes().forEach(node => {
      if (node.getData()?.type !== 'group') {
        node.setAttrs({
          body: {
            ...node.getAttrs().body,
            stroke: 'none',
            strokeWidth: 0
          }
        })
      }
    })

    // 处理所有边
    graph.getEdges().forEach(edge => {
      const edgeData = edge.getData()
      
      // 清除选中状态
      edge.setData({
        ...edgeData,
        selected: false
      })
      
      // 恢复边的样式
      if (edgeData?.customStyle) {
        // 如果有自定义样式，使用自定义样式
        edge.setAttrs(edgeData.customAttrs)
      } else {
        // 否则使用默认样式
        edge.setAttrs({
          line: {
            stroke: '#333',
            strokeWidth: 1,
            strokeDasharray: '',  // 使用空字符串表示实线
            targetMarker: null    // 移除箭头
          }
        })
      }
    })

    // 清除选中状态
    state.selectedCells.value = []
    state.selectedNode.value = undefined
    state.selectedEdge.value = null
  })
}

/**
 * 设置节点拖动相关事件处理
 * @param {Object} graph 图形实例
 */
export const setupNodeDragHandlers = (graph) => {
  if (!graph) return

  // 监听节点拖动开始事件
  graph.on('node:dragstart', ({ node }) => {
    // 处理分组节点
    if (node.getData()?.type === 'group') {
      // 如果是分组节点，禁止拖动
      return false
    }
    
    // 记录拖动开始时的位置
    node._dragStartPosition = { ...node.getPosition() }
  })

  // 监听节点拖动中事件
  graph.on('node:drag', ({ node }) => {
    // 如果是分组节点，立即阻止拖动
    if (node.getData()?.type === 'group') {
      return false
    }
    
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent
      if (parentId) {
        // 实时更新分组边界
        updateGroupBoundaryById(graph, parentId)
      }
    }
  })

  // 监听节点拖动结束事件
  graph.on('node:dragend', ({ node }) => {
    // 如果是分组节点，确保它不能被移动
    if (node.getData()?.type === 'group') {
      node.setProp('draggable', false)
      node.setProp('movable', false)
      return
    }
    
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent
      if (parentId) {
        // 拖动结束时更新分组边界
        updateGroupBoundaryById(graph, parentId)
      } else {
        // 检查节点是否拖入了某个分组
        const nodePos = node.getPosition()
        const nodeBBox = node.getBBox()
        
        // 检查是否落在某个分组内
        const groups = graph.getNodes().filter(n => n.getData()?.type === 'group')
        for (const group of groups) {
          const groupBBox = group.getBBox()
          
          if (groupBBox.containsRect(nodeBBox) || groupBBox.containsPoint(nodePos)) {
            // 设置父子关系
            node.setData({
              ...node.getData(),
              parent: group.id
            })
            
            // 确保层级关系正确
            group.setZIndex(0)
            node.setZIndex(1)
            
            // 调整分组大小
            updateGroupBoundaryById(graph, group.id)
            break
          }
        }
      }
    }
    
    // 清除拖动开始位置
    delete node._dragStartPosition
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph)
      // 确保所有分组节点不可移动
      disableGroupMovement(graph)
    }, 100)
  })

  // 监听节点位置变化事件
  graph.on('node:change:position', ({ node }) => {
    // 如果是分组节点，恢复到原始位置
    if (node.getData()?.type === 'group') {
      // 获取原始位置
      const originalPos = node._originalPosition
      if (originalPos) {
        // 恢复到原始位置
        node.setPosition(originalPos.x, originalPos.y)
      }
      return
    }
    
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent
      if (parentId) {
        // 位置变化时更新分组边界
        updateGroupBoundaryById(graph, parentId)
      }
    }
  })

  // 监听节点移动事件
  graph.on('node:moved', ({ node }) => {
    // 如果是分组节点，确保它不能被移动
    if (node.getData()?.type === 'group') {
      node.setProp('draggable', false)
      node.setProp('movable', false)
      return
    }
    
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent
      if (parentId) {
        // 移动结束时更新分组边界
        updateGroupBoundaryById(graph, parentId)
      }
    }
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph)
      // 确保所有分组节点不可移动
      disableGroupMovement(graph)
    }, 100)
  })
}

/**
 * 设置节点添加事件处理
 * @param {Object} graph 图形实例
 */
export const setupNodeAddedHandler = (graph) => {
  if (!graph) return

  graph.on('node:added', ({ node }) => {
    if (node.getData()?.type === 'group') {
      // 为分组节点设置样式和属性
      node.setAttrs({
        body: {
          ...node.getAttrs().body,
          cursor: 'default',
          opacity: 0.6,
          stroke: '#5F95FF',
          strokeWidth: 2,
          strokeDasharray: '5 5'
        },
        label: {
          ...node.getAttrs().label,
          textAnchor: 'start',
          textVerticalAnchor: 'top',
          x: 10,
          y: 10,
          fontSize: 14,
          fontWeight: 500,
          fill: '#5F95FF'
        }
      })
      
      // 设置标签位置
      node.prop('attrs/label/textAnchor', 'start', { silent: false })
      node.prop('attrs/label/textVerticalAnchor', 'top', { silent: false })
      node.prop('attrs/label/x', 10, { silent: false })
      node.prop('attrs/label/y', 10, { silent: false })
      
      // 禁用分组节点的拖动功能
      node.setProp('draggable', false)
      node.setProp('movable', false)
      
      // 添加数据标记
      node.setData({
        ...node.getData(),
        movable: false,
        preventDrag: true
      })
      
      // 设置分组节点的Z轴位置
      node.setZIndex(0)
      
      // 保存原始位置
      node._originalPosition = { ...node.getPosition() }
    } else {
      // 如果是普通节点，检查是否需要添加到分组
      setTimeout(() => {
        const nodePos = node.getPosition()
        const nodeBBox = node.getBBox()
        
        // 检查是否落在某个分组内
        const groups = graph.getNodes().filter(n => n.getData()?.type === 'group')
        for (const group of groups) {
          const groupBBox = group.getBBox()
          
          if (groupBBox.containsRect(nodeBBox) || groupBBox.containsPoint(nodePos)) {
            // 设置父子关系
            node.setData({
              ...node.getData(),
              parent: group.id
            })
            
            // 确保层级关系正确
            group.setZIndex(0)
            node.setZIndex(1)
            
            // 调整分组大小
            updateGroupBoundaryById(graph, group.id)
            break
          }
        }
      }, 50)
    }
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph)
      // 确保所有分组节点不可移动
      disableGroupMovement(graph)
    }, 100)
  })
}

/**
 * 设置拖放处理函数
 * @param {Object} graph 图形实例
 * @param {Function} handleDrop 拖放处理函数
 */
export const setupDropHandlers = (graph, handleDrop) => {
  if (!graph) return

  // 监听拖拽事件
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  document.addEventListener('drop', (e) => {
    if (!graph) return
    
    const container = graph.container
    if (!container.contains(e.target)) return
    
    handleDrop(e)
  })
}

/**
 * 处理拖放事件
 * @param {Object} graph 图形实例
 * @param {Event} e 拖放事件
 */
export const handleDrop = (graph, e) => {
  e.preventDefault()
  if (!graph || !e.dataTransfer) return

  const data = e.dataTransfer.getData('element')
  if (!data) return

  try {
    const element = JSON.parse(data)
    const config = nodeConfig[element.type]
    if (!config) return

    const point = graph.clientToLocal({
      x: e.clientX,
      y: e.clientY,
    })

    const node = graph.addNode({
      ...config,
      x: point.x - (config.width ?? 0) / 2,
      y: point.y - (config.height ?? 0) / 2,
      data: {
        type: element.type,
        properties: {},
      },
      zIndex: 1
    })

    // 检查是否落在分组内
    const groups = graph.getNodes().filter(n => n.getData()?.type === 'group')
    for (const group of groups) {
      const groupBBox = group.getBBox()
      const nodeBBox = node.getBBox()
      
      if (groupBBox.containsRect(nodeBBox)) {
        // 设置父子关系
        node.setData({
          ...node.getData(),
          parent: group.id
        })
        
        // 确保层级关系正确
        group.setZIndex(0)
        node.setZIndex(1)
        
        // 调整分组大小
        updateGroupBoundaryById(graph, group.id)
        
        break
      }
    }
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph)
      // 确保所有分组节点不可移动
      disableGroupMovement(graph)
    }, 100)
  } catch (error) {
    console.error('Failed to create node:', error)
  }
}

/**
 * 处理节点更新
 * @param {Object} graph 图形实例
 * @param {Object} node 节点数据
 */
export const handleNodeUpdate = (graph, node) => {
  if (!graph) return

  const target = graph.getCellById(node.id)
  if (target) {
    target.setAttrs(node.attrs ?? {})
    target.setData(node.data ?? {})
    
    // 检查是否需要调整分组
    const parentId = target.getData()?.parent
    if (parentId) {
      updateGroupBoundaryById(graph, parentId)
    }
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph)
      // 确保所有分组节点不可移动
      disableGroupMovement(graph)
    }, 100)
  }
}

/**
 * 处理边更新
 * @param {Object} graph 图形实例
 * @param {Object} edge 边数据
 */
export const handleEdgeUpdate = (graph, edge) => {
  if (!graph) return

  const target = graph.getCellById(edge.id)
  if (target) {
    // 保存边的样式信息
    const customAttrs = {
      line: {
        stroke: edge.attrs?.line?.stroke || '#1890ff',
        strokeWidth: edge.attrs?.line?.strokeWidth || 2,
        strokeDasharray: edge.attrs?.line?.strokeDasharray || ''
      }
    }
    
    // 应用新的样式
    target.setAttrs(customAttrs)
    
    // 保存路由器和连接器配置
    const routerConfig = {
      name: edge.connector === 'rounded' ? 'orth' : 'normal',
      args: edge.connector === 'rounded' ? {
        padding: 20,
        direction: 'H'
      } : undefined
    }
    
    const connectorConfig = {
      name: edge.connector || 'normal',
      args: edge.connector === 'rounded' ? {
        radius: 8
      } : undefined
    }
    
    // 设置路由器和连接器
    target.setRouter(routerConfig)
    target.setConnector(connectorConfig)
    
    // 保存完整的边数据
    target.setData({
      ...target.getData(),
      router: routerConfig,
      connector: connectorConfig,
      customStyle: true,
      customAttrs: customAttrs
    })
  }
}

/**
 * 处理删除操作
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 */
export const handleDelete = async (graph, state) => {
  if (!graph) return
  
  try {
    // 获取选中的元素
    const cells = state.selectedCells.value
    if (cells.length === 0) return

    // 弹出确认对话框
    await ElMessageBox.confirm(
      '确定要删除选中的元素吗？此操作不可恢复',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 删除选中的元素
    cells.forEach(cell => {
      // 如果是节点,需要同时删除相连的边
      if (cell.isNode()) {
        // 获取相连的边
        const connectedEdges = graph.getConnectedEdges(cell) || []
        // 删除相连的边
        connectedEdges.forEach(edge => graph.removeCell(edge))
      }
      // 删除元素
      graph.removeCell(cell)
    })

    // 清除选中状态
    state.selectedNode.value = undefined
    state.selectedEdge.value = null
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph)
      // 确保所有分组节点不可移动
      disableGroupMovement(graph)
    }, 100)

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

/**
 * 处理分组节点点击
 * @param {Object} graph 图形实例
 * @param {string} groupId 分组ID
 * @param {string} nodeId 节点ID
 */
export const handleGroupNodeClick = (graph, groupId, nodeId) => {
  if (!graph) return
  
  const node = graph.getCellById(nodeId)
  if (node) {
    // 定位到节点
    graph.scrollToCell(node)
    
    // 选中节点
    graph.clearSelection()
    graph.select(node)
    
    // 高亮显示
    graph.getNodes().forEach(n => {
      if (n.getData()?.type !== 'group') {
        n.setAttrs({
          body: {
            ...n.getAttrs().body,
            stroke: 'none',
            strokeWidth: 0
          }
        })
      }
    })
    
    node.setAttrs({
      body: {
        ...node.getAttrs().body,
        stroke: '#1890ff',
        strokeWidth: 2,
        strokeDasharray: '5 5'
      }
    })
  }
} 