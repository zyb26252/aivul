<template>
  <div class="topology-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <el-button-group>
        <el-button @click="handleZoomIn">
          <el-icon><ZoomIn /></el-icon>
          放大
        </el-button>
        <el-button @click="handleZoomOut">
          <el-icon><ZoomOut /></el-icon>
          缩小
        </el-button>
        <el-button @click="handleFitContent">
          <el-icon><FullScreen /></el-icon>
          适应画布
        </el-button>
      </el-button-group>
      <el-button-group class="ml-2">
        <el-button @click="handleCreateGroup" :disabled="!canCreateGroup">
          <el-icon><FolderAdd /></el-icon>
          {{ groupButtonText }}
        </el-button>
        <el-button @click="handleUngroup" :disabled="!canUngroup">
          <el-icon><FolderRemove /></el-icon>
          取消分组
        </el-button>
      </el-button-group>
      <el-button-group class="ml-2">
        <el-button 
          :type="isConnecting ? 'primary' : 'default'"
          @click="toggleConnecting"
        >
          <el-icon><Connection /></el-icon>
          连线模式
        </el-button>
      </el-button-group>
      <el-button-group class="ml-2">
        <el-button 
          @click="handleDelete" 
          :disabled="!canDelete"
        >
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </el-button-group>
    </div>

    <div class="editor-main">
      <!-- 左侧元素面板 -->
      <div class="left-panel">
        <h3 class="panel-title">网元</h3>
        <element-panel />
      </div>

      <!-- 中间画布容器 -->
      <div ref="container" class="editor-container" @dragover="handleDragOver" @drop="handleDrop" />

      <!-- 右侧属性面板 -->
      <div class="right-panel">
        <h3 class="panel-title">属性</h3>
        <property-panel 
          :selected-node="selectedNode" 
          :selected-edge="selectedEdge" 
          @update:node="handleNodeUpdate" 
          @update:edge="handleEdgeUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  FolderAdd, 
  FolderRemove, 
  ZoomIn, 
  ZoomOut, 
  FullScreen, 
  Connection, 
  Delete
} from '@element-plus/icons-vue'
import { Graph, Cell } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import ElementPanel from './ElementPanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import containerIcon from '@/assets/icons/container.svg'
import switchIcon from '@/assets/icons/switch.svg'

// 定义节点数据接口
interface NodeData {
  type: 'container' | 'switch' | 'group'
  properties: Record<string, any>
  parent?: string
  name?: string
}

// 定义边数据接口
interface EdgeData {
  properties: Record<string, any>
}

// 定义分组数据接口
interface GroupData {
  id: string
  name: string
  children: string[]
}

// 定义拓扑数据接口
interface TopologyData {
  nodes: Array<{
    id: string
    type: string
    x: number
    y: number
    data: NodeData
    attrs: Record<string, any>
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    data: EdgeData
    attrs: Record<string, any>
  }>
  groups: GroupData[]
}

// 注册自定义节点
register({
  shape: 'custom-node',
  width: 100,
  height: 40,
  component: {
    template: '<div>Custom Node</div>'
  }
})

// 状态
const container = ref<HTMLElement>()
const selectedNode = ref<Cell>()
const selectedEdge = ref<any>(null)
const selectedCells = ref<any[]>([])
const isConnecting = ref(false)
const sourceNode = ref<any>(null)
const isGrouping = ref(false)
const groupName = ref('')
const groupingNodes = ref<Cell[]>([])

// 计算属性
const canCreateGroup = computed(() => {
  if (isGrouping.value) {
    // 如果正在创建分组，则需要至少选择了一个节点才能完成创建
    return groupingNodes.value.length > 0
  }
  // 如果不在创建分组状态，则始终可以点击开始创建
  return true
})

const canUngroup = computed(() => {
  return selectedCells.value.length === 1 && selectedCells.value[0].isNode() && selectedCells.value[0].data?.type === 'group'
})

const canDelete = computed(() => {
  return selectedCells.value.length > 0
})

// 画布实例
let graph: Graph | null = null

// 获取拓扑数据
const getData = (): TopologyData => {
  if (!graph) {
    throw new Error('图形实例未初始化')
  }

  const nodes = graph.getNodes().map(node => {
    const pos = node.getBBox()
    return {
      id: node.id,
      type: node.getData()?.type || '',
      x: pos.x,
      y: pos.y,
      data: node.getData() as NodeData,
      attrs: node.getAttrs()
    }
  })

  const edges = graph.getEdges().map(edge => {
    const sourceId = (edge as any).getSourceCell()?.id || ''
    const targetId = (edge as any).getTargetCell()?.id || ''
    return {
      id: edge.id,
      source: sourceId,
      target: targetId,
      data: edge.getData() as EdgeData,
      attrs: edge.getAttrs()
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

// 设置拓扑数据
const setData = (data: TopologyData) => {
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
      const config = nodeConfig[nodeData.type as keyof typeof nodeConfig]
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
      graph.addEdge({
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        data: edgeData.data,
        router: {
          name: 'orth',
          args: {
            padding: 10,
            direction: 'H'
          }
        },
        connector: {
          name: 'rounded',
          args: {
            radius: 8
          }
        },
        attrs: edgeData.attrs
      })
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

// 节点配置类型
interface NodeConfig {
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

// 节点配置
const nodeConfig: Record<string, NodeConfig> = {
  container: {
    width: 40,
    height: 60,
    shape: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'image',
        selector: 'image',
      },
      {
        tagName: 'text',
        selector: 'label',
      }
    ],
    attrs: {
      body: {
        fill: 'none',
        stroke: 'none',
        strokeWidth: 0,
        rx: 4,
        ry: 4,
      },
      image: {
        'xlink:href': containerIcon,
        width: 40,
        height: 40,
        x: 0,
        y: 0,
      },
      label: {
        text: '容器',
        fontSize: 12,
        fill: '#333',
        refX: '50%',
        refY: '100%',
        textAnchor: 'middle',
        textVerticalAnchor: 'top',
        y: 4,
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#333',
              strokeWidth: 1,
              fill: '#fff',
              cursor: 'crosshair',
              event: 'node:port:click',
              visibility: 'visible',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#333',
              strokeWidth: 1,
              fill: '#fff',
              cursor: 'crosshair',
              event: 'node:port:click',
              visibility: 'visible',
            },
          },
        },
      },
    },
  },
  switch: {
    width: 40,
    height: 60,
    shape: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'image',
        selector: 'image',
      },
      {
        tagName: 'text',
        selector: 'label',
      }
    ],
    attrs: {
      body: {
        fill: 'none',
        stroke: 'none',
        strokeWidth: 0,
        rx: 4,
        ry: 4,
      },
      image: {
        'xlink:href': switchIcon,
        width: 40,
        height: 40,
        x: 0,
        y: 0,
      },
      label: {
        text: '交换机',
        fontSize: 12,
        fill: '#333',
        refX: '50%',
        refY: '100%',
        textAnchor: 'middle',
        textVerticalAnchor: 'top',
        y: 4,
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#333',
              strokeWidth: 1,
              fill: '#fff',
              cursor: 'crosshair',
              event: 'node:port:click',
              visibility: 'visible',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#333',
              strokeWidth: 1,
              fill: '#fff',
              cursor: 'crosshair',
              event: 'node:port:click',
              visibility: 'visible',
            },
          },
        },
      },
    },
  },
  group: {
    shape: 'rect',
    attrs: {
      body: {
        fill: 'rgba(24, 144, 255, 0.1)',
        stroke: '#1890ff',
        strokeWidth: 1,
        strokeDasharray: '5 5',
        rx: 8,
        ry: 8
      },
      label: {
        text: '分组',
        fontSize: 12,
        fill: '#1890ff',
        refX: 8,
        refY: 8
      }
    },
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'text',
        selector: 'label'
      }
    ],
    width: 200,
    height: 100,
    movable: false
  },
}

// 创建分组
const handleCreateGroup = () => {
  if (!graph) return

  if (isGrouping.value) {
    // 如果已经在创建分组状态，且有选中的节点，则完成分组创建
    if (groupingNodes.value.length > 0) {
      // 计算分组的边界
      const bbox = graph.getCellsBBox(groupingNodes.value)
      if (bbox) {
        // 创建分组节点
        const group = graph.addNode({
          ...nodeConfig.group,
          x: bbox.x - 16,
          y: bbox.y - 16,
          width: bbox.width + 32,
          height: bbox.height + 32,
          data: {
            type: 'group',
            name: groupName.value,
            properties: {},
          },
          attrs: {
            ...nodeConfig.group.attrs,
            label: {
              ...nodeConfig.group.attrs.label,
              text: groupName.value
            }
          },
          zIndex: 0  // 设置分组节点为最底层
        })

        // 将选中的节点添加到分组中
        groupingNodes.value.forEach(node => {
          node.setData({
            ...node.data,
            parent: group.id,
          })
          node.setZIndex(1)  // 确保节点在分组之上
          // 清除节点的高亮效果
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        })

        // 重置分组状态
        isGrouping.value = false
        groupName.value = ''
        groupingNodes.value = []
        
        // 取消所有选中状态
        groupingNodes.value.forEach(cell => {
          cell.setData({
            ...cell.data,
            selected: false
          })
        })
        // 选中分组节点
        group.setData({
          ...group.data,
          selected: true
        })

        ElMessage.success('分组创建成功')
      }
    } else {
      ElMessage.warning('请至少选择一个节点')
    }
  } else {
    // 开始创建分组
    ElMessageBox.prompt('请输入分组名称', '创建分组', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '分组名称不能为空'
    }).then(({ value: name }) => {
      groupName.value = name
      isGrouping.value = true
      groupingNodes.value = []
      ElMessage.info('请点击要添加到分组的节点，完成后再次点击创建分组按钮')
    }).catch(() => {
      // 用户取消输入，不做任何操作
    })
  }
}

// 创建分组按钮文本计算属性
const groupButtonText = computed(() => {
  if (isGrouping.value) {
    return `完成创建(${groupingNodes.value.length})`
  }
  return '创建分组'
})

// 取消分组
const handleUngroup = () => {
  if (!graph) return

  const selected = selectedCells.value
  if (selected.length !== 1) return

  const group = selected[0]
  if (!group.isNode() || group.data?.type !== 'group') return

  // 获取分组中的所有节点
  const children = graph.getNodes().filter(node => node.data?.parent === group.id)

  // 移除父节点引用
  children.forEach(node => {
    node.setData({
      ...node.data,
      parent: undefined,
    })
    node.setZIndex(1)  // 设置为普通节点层级
  })

  // 删除分组节点
  graph.removeCell(group)
}

// 缩放控制
const handleZoomIn = () => {
  if (graph) {
    const zoom = graph.zoom()
    if (zoom < 2) {
      graph.zoom(0.1)
    }
  }
}

const handleZoomOut = () => {
  if (graph) {
    const zoom = graph.zoom()
    if (zoom > 0.2) {
      graph.zoom(-0.1)
    }
  }
}

const handleFitContent = () => {
  if (graph) {
    graph.zoomToFit({ padding: 20 })
  }
}

// 拖拽处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
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
        const children = graph.getNodes().filter(n => n.getData()?.parent === group.id)
        if (children.length > 0) {
          const bbox = graph.getCellsBBox(children)
          if (bbox) {
            const padding = 16
            group.resize(bbox.width + padding * 2, bbox.height + padding * 2)
            group.position(bbox.x - padding, bbox.y - padding)
          }
        }
        
        break
      }
    }
  } catch (error) {
    console.error('Failed to create node:', error)
  }
}

// 节点更新处理
const handleNodeUpdate = (node: Cell) => {
  if (!graph) return

  const target = graph.getCellById(node.id!)
  if (target) {
    target.setAttrs(node.attrs ?? {})
    target.setData(node.data ?? {})
  }
}

// 切换连线模式
const toggleConnecting = () => {
  isConnecting.value = !isConnecting.value
  if (!isConnecting.value) {
    sourceNode.value = null
  }
}

// 处理连线更新
const handleEdgeUpdate = (edge: any) => {
  if (!graph) return

  const target = graph.getCellById(edge.id)
  if (target) {
    target.setAttrs(edge.attrs)
    target.setConnector(edge.connector)
    target.setData({
      ...target.getData(),
      attrs: edge.attrs
    })
  }
}

// 删除处理
const handleDelete = async () => {
  if (!graph) return
  
  try {
    // 获取选中的元素
    const cells = selectedCells.value
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
        const connectedEdges = graph?.getConnectedEdges(cell) || []
        // 删除相连的边
        connectedEdges.forEach(edge => graph?.removeCell(edge))
      }
      // 删除元素
      graph?.removeCell(cell)
    })

    // 清除选中状态
    selectedNode.value = undefined
    selectedEdge.value = null

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 生命周期钩子
onMounted(async () => {
  console.log('Component mounted, initializing graph...')
  try {
    await initGraph()
    console.log('Graph initialized successfully')

    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown)
  } catch (error) {
    console.error('Failed to initialize graph:', error)
    ElMessage.error('图形初始化失败，请刷新页面重试')
  }
})

onUnmounted(() => {
  if (graph) {
    graph.dispose()
  }
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', () => {})
})

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  // 如果按下Delete键且可以删除
  if (e.key === 'Delete' && canDelete.value) {
    handleDelete()
  }
}

// 对外暴露方法
defineExpose({
  getData,
  setData
})

// 初始化画布
const initGraph = async () => {
  console.log('Initializing graph...')
  console.log('Container:', container.value)
  
  if (!container.value) {
    console.error('Container not available')
    return
  }

  try {
    // 创建画布实例
    console.log('Creating graph instance...')
    graph = new Graph({
      container: container.value,
      width: container.value.clientWidth,
      height: container.value.clientHeight,
      grid: true,
      mousewheel: {
        enabled: true,
        modifiers: [],
        minScale: 0.2,
        maxScale: 2,
        passive: true
      },
      scaling: {
        min: 0.2,
        max: 2,
      },
      panning: {
        enabled: true,
        eventTypes: ['rightMouseDown'],
        modifiers: [],
        passive: true
      },
      highlighting: {
        magnetAvailable: {
          name: 'className',
          args: {
            className: 'available',
          },
        },
        nodeAvailable: {
          name: 'className',
          args: {
            className: 'available',
          },
        },
        magnetAdsorbed: {
          name: 'className',
          args: {
            className: 'adsorbed',
          },
        },
      },
      background: {
        color: '#F8F9FA',
      },
      // 添加默认的 z-index 配置
      zIndex: {
        node: 1,  // 普通节点的默认层级
        edge: 2,  // 边的默认层级
        group: 0,  // 分组节点的默认层级
      },
      interacting: {
        nodeMovable: (view) => {
          // 分组节点不可移动，其他节点可移动
          const cell = view.cell
          return cell.data?.type !== 'group'
        },
        edgeMovable: false,
        edgeLabelMovable: false,
        magnetConnectable: true,
        stopDelegateOnDragging: false,
        edgeMovableItems: [],
        rubberband: true,
        rubberEdge: false,
        rubberNode: true,
        multipleSelection: true,
        // 允许分组内节点交互（选中等）
        shouldStartSelecting: () => true,
      },
      selecting: {
        enabled: true,
        multiple: true,
        rubberband: true,
        rubberNode: true,
        showNodeSelectionBox: true,
        showRubberband: true,
        strict: false,  // 允许选择分组内的节点
        modifiers: 'shift',
        showEdgeSelectionBox: false,
        // 允许选择所有类型的节点
        filter: ['node'],
      },
      keyboard: true,
      clipboard: true,
      history: true,
      embedding: {
        enabled: true,
        findParent({ node }) {
          // 如果节点已经有父节点，且正在拖动中，不改变其父节点
          if (node.getData()?.parent) {
            return []
          }
          
          const bbox = node.getBBox()
          return this.getNodes().filter((n) => {
            const data = n.getData()
            if (data && data.type === 'group') {
              const targetBBox = n.getBBox()
              return targetBBox.containsRect(bbox)
            }
            return false
          })
        },
        validate: () => true,
      },
      // 改进 translating 配置，确保只有分组节点受限
      translating: {
        restrict: (view) => {
          const cell = view.cell
          if (cell.getData()?.type === 'group') {
            // 返回一个大范围，实际上是禁止分组移动
            return {
              x: cell.getPosition().x,
              y: cell.getPosition().y,
              width: 0,
              height: 0
            }
          }
          // 对普通节点不做限制
          return null
        }
      },
    })
    console.log('Graph instance created:', graph)

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (graph && container.value) {
        graph.resize(container.value.clientWidth, container.value.clientHeight)
      }
    }, { passive: true })

    // 监听选择状态变化
    graph.on('selection:changed', ({ selected, removed }) => {
      // 更新选中状态
      selectedCells.value = selected || []

      // 清除所有节点的高亮效果
      graph?.getNodes().forEach(node => {
        if (node.data?.type !== 'group') {
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        }
      })

      // 清除所有边的高亮效果
      graph?.getEdges().forEach(edge => {
        edge.setAttrs({
          line: {
            ...edge.getAttrs().line,
            stroke: '#333',
            strokeWidth: 1,
            strokeDasharray: ''
          }
        })
      })

      // 如果有选中的元素
      if (selected && selected.length > 0) {
        const cell = selected[0]
        
        if (cell.isEdge()) {
          // 设置边的高亮效果
          cell.setAttrs({
            line: {
              ...cell.getAttrs().line,
              stroke: '#1890ff',
              strokeWidth: 2,
              strokeDasharray: '5 5'
            }
          })
          
          selectedNode.value = undefined
          selectedEdge.value = {
            id: cell.id,
            connector: cell.getConnector()?.name || 'normal',
            attrs: cell.getAttrs()
          }
        } else if (cell.isNode() && cell.data?.type !== 'group') {
          // 设置节点的高亮效果
          cell.setAttrs({
            body: {
              ...cell.getAttrs().body,
              stroke: '#1890ff',
              strokeWidth: 2,
              strokeDasharray: '5 5'
            }
          })
          
          selectedEdge.value = null
          const nodeData = {
            id: cell.id,
            type: cell.data?.type,
            data: {
              type: cell.data?.type,
              properties: cell.data?.properties || {},
            },
            position: cell.getPosition(),
            size: cell.getSize(),
            attrs: cell.getAttrs(),
          }
          selectedNode.value = nodeData
        }
      } else {
        // 清除选中状态
        selectedNode.value = undefined
        selectedEdge.value = null
      }
    })

    // 监听节点点击事件
    graph.on('node:click', ({ node }) => {
      if (isConnecting.value) {
        if (!sourceNode.value) {
          sourceNode.value = node
          ElMessage.info('请选择目标节点')
        } else {
          if (sourceNode.value !== node) {
            try {
              graph?.addEdge({
                source: sourceNode.value,
                target: node,
                router: {
                  name: 'orth',
                  args: {
                    padding: 10,
                    direction: 'H'
                  }
                },
                connector: {
                  name: 'rounded',
                  args: {
                    radius: 8
                  }
                },
                attrs: {
                  line: {
                    stroke: '#333',
                    strokeWidth: 1,
                    targetMarker: null
                  }
                }
              })
              ElMessage.success('连线创建成功')
            } catch (error) {
              ElMessage.error('无法创建连线')
            }
          }
          isConnecting.value = false
          sourceNode.value = null
        }
      } else if (isGrouping.value) {
        // 如果正在创建分组
        if (node.data?.type !== 'group') {
          const index = groupingNodes.value.findIndex(n => n.id === node.id)
          if (index === -1) {
            // 添加到分组节点列表
            groupingNodes.value.push(node)
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
            groupingNodes.value.splice(index, 1)
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
        graph?.getNodes().forEach(n => {
          if (n.data?.type !== 'group') {
            n.setAttrs({
              body: {
                ...n.getAttrs().body,
                stroke: 'none',
                strokeWidth: 0
              }
            })
          }
        })

        // 清除所有边的高亮效果
        graph?.getEdges().forEach(edge => {
          edge.setAttrs({
            line: {
              ...edge.getAttrs().line,
              stroke: '#333',
              strokeWidth: 1,
              strokeDasharray: ''
            }
          })
        })
        
        // 设置当前节点的高亮效果
        if (node.data?.type !== 'group') {
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: '#1890ff',
              strokeWidth: 2,
              strokeDasharray: '5 5'
            }
          })
        }
        
        selectedEdge.value = null
        // 更新选中状态
        selectedCells.value = [node]
        // 构造完整的节点数据
        const nodeData = {
          id: node.id,
          type: node.data?.type,
          data: {
            type: node.data?.type,
            properties: node.data?.properties || {},
          },
          position: node.getPosition(),
          size: node.getSize(),
          attrs: node.getAttrs(),
        }
        selectedNode.value = nodeData
      }
    })

    // 监听边点击事件
    graph.on('edge:click', ({ edge }) => {
      // 清除所有节点的高亮效果
      graph?.getNodes().forEach(node => {
        if (node.data?.type !== 'group') {
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        }
      })

      // 清除所有边的高亮效果
      graph?.getEdges().forEach(e => {
        e.setAttrs({
          line: {
            ...e.getAttrs().line,
            stroke: '#333',
            strokeWidth: 1,
            strokeDasharray: ''
          }
        })
      })

      // 设置当前边的高亮效果
      edge.setAttrs({
        line: {
          ...edge.getAttrs().line,
          stroke: '#1890ff',
          strokeWidth: 2,
          strokeDasharray: '5 5'
        }
      })

      // 更新选中状态
      selectedCells.value = [edge]
      // 清除节点选中状态
      selectedNode.value = undefined
      // 设置当前选中的连线
      selectedEdge.value = {
        id: edge.id,
        connector: edge.getConnector()?.name || 'normal',
        attrs: edge.getAttrs()
      }
    })

    // 监听空白处点击事件
    graph.on('blank:click', () => {
      // 清除所有节点的高亮效果
      graph?.getNodes().forEach(node => {
        if (node.data?.type !== 'group') {
          node.setAttrs({
            body: {
              ...node.getAttrs().body,
              stroke: 'none',
              strokeWidth: 0
            }
          })
        }
      })

      // 清除所有边的高亮效果
      graph?.getEdges().forEach(edge => {
        edge.setAttrs({
          line: {
            ...edge.getAttrs().line,
            stroke: '#333',
            strokeWidth: 1,
            strokeDasharray: ''
          }
        })
      })

      // 清除选中状态
      selectedCells.value = []
      selectedNode.value = undefined
      selectedEdge.value = null
    })

    // 监听节点属性更新事件
    graph.on('node:change:attrs', ({ node }) => {
      if (selectedNode.value && selectedNode.value.id === node.id) {
        selectedNode.value = {
          ...selectedNode.value,
          type: node.data?.type,
          data: {
            type: node.data?.type,
            properties: node.data?.properties || {},
          },
          position: node.getPosition(),
          size: node.getSize(),
          attrs: node.getAttrs(),
        }
      }
    })

    // 监听节点数据更新事件
    graph.on('node:change:data', ({ node }) => {
      if (selectedNode.value && selectedNode.value.id === node.id) {
        selectedNode.value = {
          ...selectedNode.value,
          type: node.data?.type,
          data: {
            type: node.data?.type,
            properties: node.data?.properties || {},
          },
          position: node.getPosition(),
          size: node.getSize(),
          attrs: node.getAttrs(),
        }
      }
    })

    // 监听节点移动事件，重新调整分组大小
    graph.on('node:moved', ({ node }) => {
      // 如果是分组中的节点，更新分组大小
      const parentId = node.getData()?.parent
      if (parentId) {
        const parent = graph.getCellById(parentId)
        if (parent && parent.getData()?.type === 'group') {
          // 获取同一分组内的所有子节点
          const children = graph.getNodes().filter(n => n.getData()?.parent === parentId)
          if (children && children.length > 0) {
            const bbox = graph.getCellsBBox(children)
            if (bbox) {
              // 添加边距
              const padding = 16
              // 更新分组大小和位置
              parent.resize(bbox.width + padding * 2, bbox.height + padding * 2)
              parent.position(bbox.x - padding, bbox.y - padding)
              
              // 确保层级关系正确
              parent.setZIndex(0)
              children.forEach(child => {
                child.setZIndex(1)
              })
            }
          }
        }
      }
    })

    // 监听节点添加事件，当节点添加到画布时检查是否需要调整分组
    graph.on('node:added', ({ node }) => {
      const parentId = node.data?.parent
      if (parentId) {
        const parent = graph?.getCellById(parentId)
        if (parent && parent.data?.type === 'group') {
          const children = graph?.getNodes().filter(n => n.data?.parent === parentId)
          if (children && children.length > 0) {
            const bbox = graph?.getCellsBBox(children)
            if (bbox) {
              // 添加边距
              const padding = 16
              // 更新分组大小和位置
              parent.resize(bbox.width + padding * 2, bbox.height + padding * 2)
              parent.position(bbox.x - padding, bbox.y - padding)
            }
          }
        }
      }
    })

    return graph
  } catch (error) {
    console.error('Failed to initialize graph:', error)
    throw error
  }
}
</script>

<style lang="scss" scoped>
.topology-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  .editor-toolbar {
    padding: 8px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    background-color: var(--el-bg-color);
    display: flex;
    gap: 8px;
  }

  .editor-main {
    flex: 1;
    display: flex;
    overflow: hidden;

    .left-panel {
      width: 200px;
      border-right: 1px solid var(--el-border-color-light);
      background-color: var(--el-bg-color);
      display: flex;
      flex-direction: column;

      .panel-title {
        margin: 0;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 500;
        border-bottom: 1px solid var(--el-border-color-light);
      }
    }

    .editor-container {
      flex: 1;
      background-color: var(--el-fill-color-light);
      position: relative;
      overflow: hidden;
    }

    .right-panel {
      width: 300px;
      border-left: 1px solid var(--el-border-color-light);
      background-color: var(--el-bg-color);
      display: flex;
      flex-direction: column;

      .panel-title {
        margin: 0;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 500;
        border-bottom: 1px solid var(--el-border-color-light);
      }
    }
  }
}
</style> 