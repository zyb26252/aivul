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
          创建分组
        </el-button>
        <el-button @click="handleUngroup" :disabled="!canUngroup">
          <el-icon><FolderRemove /></el-icon>
          取消分组
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
          @update:node="handleNodeUpdate" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { FolderAdd, FolderRemove, ZoomIn, ZoomOut, FullScreen } from '@element-plus/icons-vue'
import { Graph, Shape } from '@antv/x6'
import type { Node } from '../types'
import ElementPanel from './ElementPanel.vue'
import PropertyPanel from './PropertyPanel.vue'

// 状态
const container = ref<HTMLElement>()
const selectedNode = ref<Node>()
const selectedCells = ref<any[]>([])

// 计算属性
const canCreateGroup = computed(() => {
  return selectedCells.value.length > 1 && selectedCells.value.every(cell => cell.isNode())
})

const canUngroup = computed(() => {
  return selectedCells.value.length === 1 && selectedCells.value[0].isNode() && selectedCells.value[0].data?.type === 'group'
})

// 画布实例
let graph: Graph | null = null

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
}

// 节点配置
const nodeConfig: Record<string, NodeConfig> = {
  container: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#fff',
        stroke: '#1890ff',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
      },
      image: {
        'xlink:href': '/public/icons/container.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 12,
      },
      label: {
        text: '容器',
        fontSize: 12,
        fill: '#333',
        y: 65,
      },
    },
  },
  switch: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#fff',
        stroke: '#13c2c2',
        strokeWidth: 2,
        rx: 8,
        ry: 8,
      },
      image: {
        'xlink:href': '/public/icons/switch.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 12,
      },
      label: {
        text: '交换机',
        fontSize: 12,
        fill: '#333',
        y: 65,
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
        ry: 8,
      },
      label: {
        text: '分组',
        fontSize: 12,
        fill: '#1890ff',
        refX: 8,
        refY: 8,
      },
    },
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
  },
}

// 创建分组
const handleCreateGroup = () => {
  if (!graph) return

  const selected = selectedCells.value
  if (selected.length < 2) return

  // 计算分组的边界
  const bbox = graph.getCellsBBox(selected)
  if (!bbox) return

  // 创建分组节点
  const group = graph.addNode({
    ...nodeConfig.group,
    x: bbox.x - 16,
    y: bbox.y - 16,
    width: bbox.width + 32,
    height: bbox.height + 32,
    data: {
      type: 'group',
      properties: {},
    },
  })

  // 将选中的节点添加到分组中
  selected.forEach(node => {
    if (node.isNode()) {
      node.setData({
        ...node.data,
        parent: group.id,
      })
      node.setZIndex(1)
    }
  })

  // 选中分组节点
  graph.clearSelection()
  graph.select(group)
}

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
    node.setZIndex(0)
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
    })

    // 触发节点选中事件
    graph.clearSelection()
    graph.select(node)
  } catch (error) {
    console.error('Failed to create node:', error)
  }
}

// 节点更新处理
const handleNodeUpdate = (node: Node) => {
  if (!graph) return

  const target = graph.getCellById(node.id!)
  if (target) {
    target.setAttrs(node.attrs ?? {})
    target.setData(node.data ?? {})
  }
}

// 初始化画布
const initGraph = () => {
  if (!container.value) return

  // 创建画布
  graph = new Graph({
    container: container.value,
    width: container.value.clientWidth,
    height: container.value.clientHeight,
    grid: {
      visible: true,
      type: 'dot',
      size: 20,
      color: '#ddd',
    },
    connecting: {
      snap: true,
      allowBlank: false,
      allowLoop: false,
      highlight: true,
      connector: 'rounded',
      connectionPoint: 'boundary',
      router: {
        name: 'er',
        args: {
          direction: 'H',
        },
      },
    },
    selecting: {
      enabled: true,
      multiple: true,
      rubberband: true,
      showNodeSelectionBox: true,
    },
    keyboard: true,
    clipboard: true,
    history: true,
    interacting: {
      nodeMovable: true,
      edgeMovable: true,
      edgeLabelMovable: false,
      magnetConnectable: true,
      stopDelegateOnDragging: false,
    },
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (graph && container.value) {
      graph.resize(container.value.clientWidth, container.value.clientHeight)
    }
  })

  // 监听节点选中事件
  graph.on('node:selected', ({ node }: { node: any }) => {
    // 转换节点数据为所需格式
    selectedNode.value = {
      id: node.id,
      attrs: node.getAttrs(),
      data: node.getData(),
      position: node.position(),
      size: node.size()
    } as Node
  })

  // 监听节点取消选中事件
  graph.on('node:unselected', () => {
    selectedNode.value = undefined
  })

  // 监听节点属性更新事件
  graph.on('node:change:attrs', ({ node }: { node: any }) => {
    if (selectedNode.value && selectedNode.value.id === node.id) {
      selectedNode.value = {
        id: node.id,
        attrs: node.getAttrs(),
        data: node.getData(),
        position: node.position(),
        size: node.size()
      } as Node
    }
  })

  // 监听节点数据更新事件
  graph.on('node:change:data', ({ node }: { node: any }) => {
    if (selectedNode.value && selectedNode.value.id === node.id) {
      selectedNode.value = {
        id: node.id,
        attrs: node.getAttrs(),
        data: node.getData(),
        position: node.position(),
        size: node.size()
      } as Node
    }
  })

  // 监听选中变化事件
  graph.on('selection:changed', () => {
    selectedCells.value = graph?.getSelectedCells() ?? []
  })

  // 监听节点移动事件
  graph.on('node:moved', ({ node, current }: { node: any; current: { x: number; y: number } }) => {
    // 如果是分组中的节点，更新分组大小
    const parentId = node.data?.parent
    if (parentId) {
      const parent = graph?.getCellById(parentId)
      if (parent) {
        const children = graph?.getNodes().filter(n => n.data?.parent === parentId)
        if (children && children.length > 0) {
          const bbox = graph?.getCellsBBox(children)
          if (bbox) {
            parent.resize(bbox.width + 32, bbox.height + 32)
            parent.position(bbox.x - 16, bbox.y - 16)
          }
        }
      }
    }
  })
}

// 生命周期钩子
onMounted(() => {
  initGraph()
})

onUnmounted(() => {
  if (graph) {
    graph.dispose()
  }
  window.removeEventListener('resize', () => {})
})

// 对外暴露方法
defineExpose({
  graph,
})
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