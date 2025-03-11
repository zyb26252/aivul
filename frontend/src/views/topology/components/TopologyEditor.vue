/**
 * 拓扑编辑器组件
 * 
 * 功能：
 * 1. 提供画布用于编辑网络拓扑图
 * 2. 支持拖拽添加节点（容器和交换机）
 * 3. 支持节点之间创建连线
 * 4. 支持节点分组管理
 * 5. 提供缩放、适应画布等工具栏功能
 * 6. 支持属性面板编辑节点和连线的样式
 */

<template>
  <div class="topology-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <el-button-group>
        <el-tooltip :content="t('scene.topology.editor.zoomIn')" placement="bottom">
          <el-button @click="handleZoomIn">
            <el-icon><ZoomIn /></el-icon>
            {{ t('scene.topology.editor.zoomIn') }}
          </el-button>
        </el-tooltip>
        <el-tooltip :content="t('scene.topology.editor.zoomOut')" placement="bottom">
          <el-button @click="handleZoomOut">
            <el-icon><ZoomOut /></el-icon>
            {{ t('scene.topology.editor.zoomOut') }}
          </el-button>
        </el-tooltip>
        <el-tooltip :content="t('scene.topology.editor.fitView')" placement="bottom">
          <el-button @click="handleFitContent">
            <el-icon><FullScreen /></el-icon>
            {{ t('scene.topology.editor.fitView') }}
          </el-button>
        </el-tooltip>
      </el-button-group>
      <el-button-group class="ml-2">
        <el-tooltip :content="t('scene.topology.editor.group.create')" placement="bottom">
          <el-button @click="handleCreateGroup" :disabled="!canCreateGroup">
            <el-icon><FolderAdd /></el-icon>
            {{ isGrouping ? `完成创建(${groupingNodes.length})` : t('scene.topology.editor.group.create') }}
          </el-button>
        </el-tooltip>
        <el-tooltip :content="t('scene.topology.editor.group.delete')" placement="bottom">
          <el-button @click="handleUngroup" :disabled="!canUngroup">
            <el-icon><FolderRemove /></el-icon>
            {{ t('scene.topology.editor.group.delete') }}
          </el-button>
        </el-tooltip>
      </el-button-group>
      <el-button-group class="ml-2">
        <el-tooltip :content="t('scene.topology.editor.addEdge')" placement="bottom">
          <el-button 
            :type="isConnecting ? 'primary' : 'default'"
            @click="toggleConnecting"
          >
            <el-icon><Connection /></el-icon>
            {{ t('scene.topology.editor.addEdge') }}
          </el-button>
        </el-tooltip>
      </el-button-group>
      <el-button-group class="ml-2">
        <el-tooltip :content="t('scene.topology.editor.delete')" placement="bottom">
          <el-button 
            @click="handleDelete" 
            :disabled="!canDelete"
          >
            <el-icon><Delete /></el-icon>
            {{ t('scene.topology.editor.delete') }}
          </el-button>
        </el-tooltip>
      </el-button-group>
    </div>

    <div class="editor-main">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 网元部分 -->
        <h3 class="panel-title">{{ t('scene.topology.node.networkElement.title') }}</h3>
        <element-panel />
        
        <!-- 分组部分 -->
        <h3 class="panel-title">{{ t('scene.topology.editor.group.title') }}</h3>
        <div class="group-panel">
          <el-collapse accordion>
            <el-collapse-item v-for="group in groups" :key="group.id" :title="group.name || t('scene.topology.editor.group.unnamed')">
              <div class="group-nodes">
                <div 
                  v-for="node in group.nodes" 
                  :key="node.id" 
                  class="group-node"
                  @click="handleGroupNodeClick(group.id, node.id)"
                >
                  <el-icon><component :is="node.type === 'container' ? 'Box' : 'Switch'" /></el-icon>
                  <span>{{ node.name || (node.type === 'container' ? t('scene.topology.node.types.container') : t('scene.topology.node.types.switch')) }}</span>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 中间画布容器 -->
      <div class="editor-container">
        <div class="canvas-container" ref="container" @dragover="handleDragOver" @drop="handleDrop" />
        <div class="editor-status">
          <div class="status-item">
            <el-icon><Box /></el-icon>
            <span>{{ t('scene.topology.node.types.container') }}：</span>
            <span class="count">{{ containerCount }}</span>
          </div>
          <div class="divider" />
          <div class="status-item">
            <el-icon><Switch /></el-icon>
            <span>{{ t('scene.topology.node.types.switch') }}：</span>
            <span class="count">{{ switchCount }}</span>
          </div>
          <div class="divider" />
          <div class="status-item">
            <el-icon><Folder /></el-icon>
            <span>{{ t('scene.topology.editor.group.title') }}：</span>
            <span class="count">{{ groupCount }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="right-panel">
        <h3 class="panel-title">{{ t('scene.topology.node.properties.title') }}</h3>
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
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  FolderAdd, 
  FolderRemove, 
  ZoomIn, 
  ZoomOut, 
  FullScreen, 
  Connection, 
  Delete,
  Box,
  Switch,
  Folder
} from '@element-plus/icons-vue'
import { Graph } from '@antv/x6'
import { Cell, Node as X6Node, Edge as X6Edge } from '@antv/x6/lib/model'
import { CellView } from '@antv/x6/lib/view/cell'
import { Model } from '@antv/x6/lib/model/model'
import { Collection } from '@antv/x6/lib/model/collection'
import { Properties } from '@antv/x6/lib/types'
import '@antv/x6-vue-shape'
import ElementPanel from './ElementPanel.vue'
import PropertyPanel from './PropertyPanel.vue'

// 替换导入的容器图标为base64编码
const containerIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IkRvY2tlciIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3QKd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiCnJ4PSIxNSUiCmZpbGw9IiNmZmYiLz48cGF0aCBzdHJva2U9IiMwNjZkYTUiIHN0cm9rZS13aWR0aD0iMzgiIGQ9Ik0yOTYgMjI2aDQybS05MiAwaDQybS05MSAwaDQybS05MSAwaDQxbS05MSAwaDQybTgtNDZoNDFtOCAwaDQybTcgMGg0Mm0tNDItNDZoNDIiLz48cGF0aCBmaWxsPSIjMDY2ZGE1IiBkPSJtNDcyIDIyOHMtMTgtMTctNTUtMTFjLTQtMjktMzUtNDYtMzUtNDZzLTI5IDM1LTggNzRjLTYgMy0xNiA3LTMxIDdINjhjLTUgMTktNSAxNDUgMTMzIDE0NSA5OSAwIDE3My00NiAyMDgtMTMwIDUyIDQgNjMtMzkgNjMtMzkiLz48L3N2Zz4='

// 替换导入的交换机图标为新的base64编码
const switchIcon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgIHZpZXdCb3g9IjAgMCAzNiAzNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+bmV0d29yay1zd2l0Y2gtbGluZTwvdGl0bGU+CiAgICA8cGF0aCBkPSJNMzMuOTEsMTguNDcsMzAuNzgsOC40MUEyLDIsMCwwLDAsMjguODcsN0g3LjEzQTIsMiwwLDAsMCw1LjIyLDguNDFMMi4wOSwxOC40OGEyLDIsMCwwLDAtLjA5LjU5VjI3YTIsMiwwLDAsMCwyLDJIMzJhMiwyLDAsMCwwLDItMlYxOS4wNkEyLDIsMCwwLDAsMzMuOTEsMTguNDdaTTMyLDI3SDRWMTkuMDZMNy4xMyw5SDI4Ljg3TDMyLDE5LjA2WiIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTEiPjwvcGF0aD48cmVjdCB4PSI3LjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMiI+PC9yZWN0PjxyZWN0IHg9IjEyLjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMyI+PC9yZWN0PjxyZWN0IHg9IjE3LjExIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtNCI+PC9yZWN0PjxyZWN0IHg9IjIyLjEiIHk9IjIyIiB3aWR0aD0iMS44IiBoZWlnaHQ9IjMiIGNsYXNzPSJjbHItaS1vdXRsaW5lIGNsci1pLW91dGxpbmUtcGF0aC01Ij48L3JlY3Q+PHJlY3QgeD0iMjcuMSIgeT0iMjIiIHdpZHRoPSIxLjgiIGhlaWdodD0iMyIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTYiPjwvcmVjdD48cmVjdCB4PSI2LjIzIiB5PSIxOCIgd2lkdGg9IjIzLjY5IiBoZWlnaHQ9IjEuNCIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTciPjwvcmVjdD4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgZmlsbC1vcGFjaXR5PSIwIi8+Cjwvc3ZnPg=='

const { t } = useI18n()

// 定义emit事件
const emit = defineEmits<{
  (e: 'save'): void
}>()

// 定义节点数据接口data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgIHZpZXdCb3g9IjAgMCAzNiAzNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+bmV0d29yay1zd2l0Y2gtbGluZTwvdGl0bGU+CiAgICA8cGF0aCBkPSJNMzMuOTEsMTguNDcsMzAuNzgsOC40MUEyLDIsMCwwLDAsMjguODcsN0g3LjEzQTIsMiwwLDAsMCw1LjIyLDguNDFMMi4wOSwxOC40OGEyLDIsMCwwLDAtLjA5LjU5VjI3YTIsMiwwLDAsMCwyLDJIMzJhMiwyLDAsMCwwLDItMlYxOS4wNkEyLDIsMCwwLDAsMzMuOTEsMTguNDdaTTMyLDI3SDRWMTkuMDZMNy4xMyw5SDI4Ljg3TDMyLDE5LjA2WiIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTEiPjwvcGF0aD48cmVjdCB4PSI3LjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMiI+PC9yZWN0PjxyZWN0IHg9IjEyLjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMyI+PC9yZWN0PjxyZWN0IHg9IjE3LjExIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtNCI+PC9yZWN0PjxyZWN0IHg9IjIyLjEiIHk9IjIyIiB3aWR0aD0iMS44IiBoZWlnaHQ9IjMiIGNsYXNzPSJjbHItaS1vdXRsaW5lIGNsci1pLW91dGxpbmUtcGF0aC01Ij48L3JlY3Q+PHJlY3QgeD0iMjcuMSIgeT0iMjIiIHdpZHRoPSIxLjgiIGhlaWdodD0iMyIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTYiPjwvcmVjdD48cmVjdCB4PSI2LjIzIiB5PSIxOCIgd2lkdGg9IjIzLjY5IiBoZWlnaHQ9IjEuNCIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTciPjwvcmVjdD4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgZmlsbC1vcGFjaXR5PSIwIi8+Cjwvc3ZnPg==
interface NodeData {
  type: 'container' | 'switch' | 'group'
  properties: Record<string, any>
  parent?: string
  name?: string
  description?: string  // 添加描述字段
}

// 定义边数据接口
interface EdgeData {
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
    attrs: CellAttrs
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    data: EdgeData
    attrs: CellAttrs
  }>
  groups: GroupData[]
}

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

// 统计数量
const containerCount = ref(0)
const switchCount = ref(0)
const groupCount = ref(0)

// 更新统计数据的函数
const updateCounts = () => {
  if (!graph) {
    containerCount.value = 0
    switchCount.value = 0
    groupCount.value = 0
    return
  }

  const nodes = graph.getNodes()
  containerCount.value = nodes.filter(node => node.getData()?.type === 'container').length
  switchCount.value = nodes.filter(node => node.getData()?.type === 'switch').length
  groupCount.value = nodes.filter(node => node.getData()?.type === 'group').length
}

// 使用 watchEffect 监听图形实例的变化
watchEffect(() => {
  if (graph) {
    updateCounts()
  }
})

// 添加历史记录状态
const history = ref<{
  past: TopologyData[]
  future: TopologyData[]
}>({
  past: [],
  future: []
})

// 最大历史记录数
const MAX_HISTORY = 50

// 修改保存历史记录函数
const saveToHistory = () => {
  if (!graph) return
  
  try {
    const currentState = getData()
    
    // 检查是否与最后一个状态相同
    const lastState = history.value.past[history.value.past.length - 1]
    if (lastState && JSON.stringify(lastState) === JSON.stringify(currentState)) {
      return
    }
    
    // 保存当前状态到历史记录
    history.value.past.push(currentState)
    
    // 清空未来状态
    history.value.future = []
    
    // 限制历史记录数量
    if (history.value.past.length > MAX_HISTORY) {
      history.value.past.shift()
    }
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 获取拓扑数据
const getData = (): TopologyData => {
  if (!graph) {
    throw new Error('图形实例未初始化')
  }

  const nodes = graph.getNodes().map(node => {
    const pos = node.getBBox()
    const data = node.getData() as NodeData
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
    const sourceId = (edge as any).getSourceCell()?.id || ''
    const targetId = (edge as any).getTargetCell()?.id || ''
    const edgeData = edge.getData() as EdgeData
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

// 节点配置类型定义
interface NodeConfig {
  width?: number      // 节点宽度
  height?: number     // 节点高度
  shape: string       // 节点形状
  attrs: {
    body: {          // 节点主体样式
      fill: string   // 填充颜色
      stroke: string // 边框颜色
      strokeWidth: number // 边框宽度
      rx?: number    // 圆角半径 X
      ry?: number    // 圆角半径 Y
      strokeDasharray?: string // 虚线样式
    }
    image?: {        // 节点图标配置
      'xlink:href': string // 图标路径
      width: number  // 图标宽度
      height: number // 图标高度
      x: number      // 图标 X 坐标
      y: number      // 图标 Y 坐标
    }
    label: {         // 节点文本配置
      text: string   // 显示文本
      fontSize: number // 字体大小
      fill: string   // 文本颜色
      y?: number     // 文本 Y 偏移
      refX?: number  // 文本相对 X 位置
      refY?: number  // 文本相对 Y 位置
    }
  }
  markup?: Array<{   // 节点 DOM 结构
    tagName: string  // 标签名
    selector: string // 选择器
  }>
  ports?: {          // 连接桩配置
    groups: {
      [key: string]: {
        position: string // 位置
        attrs: {
          circle: {    // 连接桩样式
            r: number  // 半径
            magnet: boolean // 是否可连接
            stroke: string  // 边框颜色
            strokeWidth: number // 边框宽度
            fill: string   // 填充颜色
            cursor: string // 鼠标样式
            event: string  // 事件名
            visibility: string // 可见性
          }
        }
      }
    }
  }
  movable?: boolean  // 是否可移动
}

// 节点配置对象
const nodeConfig: Record<string, NodeConfig> = {
  // 容器节点配置
  container: {
    width: 40,
    height: 45,
    shape: 'rect',
    markup: [
      {
        tagName: 'rect',    // 矩形作为背景
        selector: 'body',
      },
      {
        tagName: 'image',   // 图片作为图标
        selector: 'image',
      },
      {
        tagName: 'text',    // 文本作为标签
        selector: 'label',
      }
    ],
    attrs: {
      body: {
        fill: 'none',       // 透明背景
        stroke: 'none',     // 无边框
        strokeWidth: 0,
        rx: 4,             // 圆角矩形
        ry: 4,
      },
      image: {
        'xlink:href': containerIcon,  // 容器图标
        width: 40,
        height: 40,
        x: 0,
        y: 0,
      },
      label: {
        text: '容器',       // 默认文本
        fontSize: 12,
        fill: '#333',
        refX: 0.5,       // 水平居中
        refY: 0.85,       // 文本位置
        textAnchor: 'middle',
        textVerticalAnchor: 'top',
        y: 0,
      }
    },
    // 定义连接桩
    ports: {
      groups: {
        // 顶部连接桩
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
        // 底部连接桩
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

  // 交换机节点配置（结构同容器节点）
  switch: {
    width: 40,
    height: 45,
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
        'xlink:href': switchIcon,  // 使用base64编码的交换机图标
        width: 40,
        height: 40,
        x: 0,
        y: 0,
      },
      label: {
        text: '交换机',
        fontSize: 12,
        fill: '#333',
        refX: 0.5,
        refY: 0.85,
        textAnchor: 'middle' as any,
        textVerticalAnchor: 'top' as any,
        y: 0,
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

  // 分组节点配置
  group: {
    shape: 'rect',
    attrs: {
      body: {
        fill: 'rgba(24, 144, 255, 0.1)',  // 半透明背景
        stroke: '#1890ff',
        strokeWidth: 1,
        strokeDasharray: '5 5',  // 虚线边框
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
    movable: false  // 分组节点不可移动
  },
}

// 快捷键配置
const shortcuts = {
  zoom_in: { key: '=', ctrl: true, label: 'Ctrl + =' },
  zoom_out: { key: '-', ctrl: true, label: 'Ctrl + -' },
  fit_content: { key: '0', ctrl: true, label: 'Ctrl + 0' },
  create_group: { key: 'g', ctrl: true, label: 'Ctrl + G' },
  ungroup: { key: 'g', ctrl: true, shift: true, label: 'Ctrl + Shift + G' },
  connect: { key: 'l', ctrl: true, label: 'Ctrl + L' },
  delete: { key: 'Delete', label: 'Delete' },
  copy: { key: 'c', ctrl: true, label: 'Ctrl + C' },
  paste: { key: 'v', ctrl: true, label: 'Ctrl + V' },
  undo: { key: 'z', ctrl: true, label: 'Ctrl + Z' },
  redo: { key: 'z', ctrl: true, shift: true, label: 'Ctrl + Shift + Z' },
  save: { key: 's', ctrl: true, label: 'Ctrl + S' },  // 添加保存快捷键配置
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
            description: '',  // 添加默认的空描述
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

  const target = graph.getCellById(edge.id) as X6Edge
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
    
    // 设置图形监听器
    setupGraphListeners()
    
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown)
  } catch (error) {
    console.error('Failed to initialize graph:', error)
    ElMessage.error('图形初始化失败，请刷新页面重试')
  }
})

onUnmounted(() => {
  if (graph) {
    graph.off('cell:added', updateCounts)
    graph.off('cell:removed', updateCounts)
    graph.off('node:change:data', updateCounts)
    graph.off('node:added', updateGroups)
    graph.off('node:removed', updateGroups)
    graph.off('node:change:data', updateGroups)
    graph.off('node:change:parent', updateGroups)
    graph.dispose()
  }
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', () => {})
})

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  // 如果正在输入，不处理快捷键
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    return
  }

  // 检查是否匹配快捷键配置
  const matchShortcut = (shortcut: typeof shortcuts[keyof typeof shortcuts]) => {
    return e.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!e.ctrlKey === !!shortcut.ctrl &&
      !!e.shiftKey === !!shortcut.shift
  }

  if (matchShortcut(shortcuts.zoom_in)) {
    e.preventDefault()
    handleZoomIn()
    ElMessage.success('放大画布')
  } else if (matchShortcut(shortcuts.zoom_out)) {
    e.preventDefault()
    handleZoomOut()
    ElMessage.success('缩小画布')
  } else if (matchShortcut(shortcuts.fit_content)) {
    e.preventDefault()
    handleFitContent()
    ElMessage.success('适应画布大小')
  } else if (matchShortcut(shortcuts.create_group)) {
    e.preventDefault()
    if (canCreateGroup.value) {
      handleCreateGroup()
      ElMessage.success(isGrouping.value ? '请选择要添加到分组的节点' : '开始创建分组')
    }
  } else if (matchShortcut(shortcuts.ungroup)) {
    e.preventDefault()
    if (canUngroup.value) {
      handleUngroup()
      ElMessage.success('取消分组成功')
    }
  } else if (matchShortcut(shortcuts.connect)) {
    e.preventDefault()
    toggleConnecting()
    ElMessage.success(isConnecting.value ? '已进入连线模式' : '已退出连线模式')
  } else if (matchShortcut(shortcuts.delete) || e.key === 'Backspace') {
    if (canDelete.value) {
      handleDelete()
    }
  } else if (matchShortcut(shortcuts.copy)) {
    e.preventDefault()
    handleCopy()
  } else if (matchShortcut(shortcuts.paste)) {
    e.preventDefault()
    handlePaste()
  } else if (matchShortcut(shortcuts.undo)) {
    e.preventDefault()
    handleUndo()
  } else if (matchShortcut(shortcuts.redo)) {
    e.preventDefault()
    handleRedo()
  } else if (matchShortcut(shortcuts.save)) {  // 添加保存快捷键处理
    e.preventDefault()
    emit('save')  // 触发保存事件
    ElMessage.success('正在保存...')
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
      grid: true,  // 显示网格
      // 鼠标滚轮缩放配置
      mousewheel: {
        enabled: true,
        modifiers: [],
        minScale: 0.2,
        maxScale: 2,
        passive: true
      },
      // 缩放范围限制
      scaling: {
        min: 0.2,
        max: 2,
      },
      // 画布平移配置
      panning: {
        enabled: true,
        eventTypes: ['rightMouseDown'],
        modifiers: [],
        passive: true
      },
      // 高亮效果配置
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
        color: '#F8F9FA',  // 背景色
      },
      // 元素层级配置
      zIndex: {
        node: 1,    // 普通节点层级
        edge: 2,    // 边的层级
        group: 0,   // 分组节点层级（最底层）
      },
      // 交互行为配置
      interacting: {
        // 节点是否可移动（分组节点不可移动）
        nodeMovable: (view) => {
          const cell = view.cell
          return cell.data?.type !== 'group'
        },
        edgeMovable: false,      // 边不可移动
        edgeLabelMovable: false, // 边的标签不可移动
        magnetConnectable: true,  // 允许连接到磁性连接桩
        stopDelegateOnDragging: false,
        edgeMovableItems: [],
        rubberband: true,        // 允许框选
        rubberEdge: false,
        rubberNode: true,
        multipleSelection: true,  // 允许多选
        shouldStartSelecting: () => true,
      },
      // 选择功能配置
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
        filter: ['node'],
      },
      keyboard: true,   // 启用键盘事件
      clipboard: {
        enabled: true,
        useLocalStorage: true
      },
      history: {
        enabled: true,
        beforeAddCommand(event: any, args: any) {
          if (args.key) {
            return args.key
          }
          return true
        }
      },
      // 嵌入功能配置（用于分组）
      embedding: {
        enabled: true,
        findParent({ node }) {
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
      // 移动限制配置
      translating: {
        restrict: (view) => {
          if (!view || !view.cell) return null
          const cell = view.cell
          if (cell.getData?.()?.type === 'group') {
            return {
              x: cell.getPosition().x,
              y: cell.getPosition().y,
              width: 0,
              height: 0
            }
          }
          return null
        }
      },
      connecting: {
        enabled: true,
        connectionPoint: {
          name: 'boundary'
        },
        connector: {
          name: 'normal'
        },
        router: {
          name: 'normal'
        },
        validateConnection({ sourceView, targetView }) {
          if (!sourceView || !targetView) return false
          const sourceNode = sourceView.cell as X6Node
          const targetNode = targetView.cell as X6Node
          return sourceNode.id !== targetNode.id
        },
        createEdge() {
          return new X6Edge({
            attrs: {
              line: {
                stroke: '#1890ff',
                strokeWidth: 2,
                targetMarker: null // 移除箭头
              }
            },
            router: {
              name: 'normal'
            },
            connector: {
              name: 'normal'
            }
          })
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

      // 如果没有选中任何元素，则恢复所有元素的默认样式
      if (!selected || selected.length === 0) {
        // 清除所有节点的高亮效果
        graph?.getNodes().forEach(node => {
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

        // 清除所有边的高亮效果
        graph?.getEdges().forEach(edge => {
          // 只有未被选中的边才重置样式
          if (!edge.getData()?.selected) {
            edge.setAttrs({
              line: {
                ...edge.getAttrs().line,
                stroke: '#333',
                strokeWidth: 1,
                strokeDasharray: ''
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
          
          selectedNode.value = undefined
          selectedEdge.value = {
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
          
          selectedEdge.value = null
          const nodeData = {
            id: cell.id,
            type: cell.getData()?.type,
            data: {
              type: cell.getData()?.type,
              name: cell.getData()?.name || '未命名分组',
              description: cell.getData()?.description || '',  // 添加描述字段
              properties: cell.getData()?.properties || {},
            },
            position: cell.getPosition(),
            size: cell.getSize(),
            attrs: cell.getAttrs(),
          }
          selectedNode.value = nodeData
        }
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
              const edge = graph?.addEdge({
                source: sourceNode.value,
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
          isConnecting.value = false
          sourceNode.value = null
        }
      } else if (isGrouping.value) {
        // 如果正在创建分组
        if (node.getData()?.type !== 'group') {
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

        // 保持选中边的高亮，只清除未选中的边
        graph?.getEdges().forEach(edge => {
          const edgeData = edge.getData()
          if (!edgeData?.selected) {
            edge.setAttrs({
              line: {
                ...edge.getAttrs().line,
                stroke: '#333',
                strokeWidth: 1,
                strokeDasharray: ''
              }
            })
          } else {
            // 确保选中的边保持其样式
            const style = edgeData.style || {
              stroke: '#1890ff',
              strokeWidth: 2,
              strokeDasharray: '5 5'
            }
            
            edge.setAttrs({
              line: {
                ...edge.getAttrs().line,
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
                strokeDasharray: style.strokeDasharray
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
        }
        
        selectedEdge.value = null
        // 更新选中状态
        selectedCells.value = [node]
        // 构造完整的节点数据
        const nodeData = {
          id: node.id,
          type: node.getData()?.type,
          data: {
            type: node.getData()?.type,
            name: node.getData()?.name || '未命名分组',
            description: node.getData()?.description || '',  // 添加描述字段
            properties: node.getData()?.properties || {},
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
      selectedCells.value = [edge]
      selectedNode.value = undefined
      selectedEdge.value = {
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

    // 监听空白处点击事件
    graph.on('blank:click', () => {
      // 清除所有节点的高亮效果
      graph?.getNodes().forEach(node => {
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
      graph?.getEdges().forEach(edge => {
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
            name: node.data?.name || '未命名分组',
            description: node.data?.description || '',  // 添加描述字段
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
            name: node.data?.name || '未命名分组',
            description: node.data?.description || '',  // 添加描述字段
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

    // 监听节点变化，更新分组数据
    graph.on('node:added', updateGroups)
    graph.on('node:removed', updateGroups)
    graph.on('node:change:data', updateGroups)
    graph.on('node:change:parent', updateGroups)

    // 在创建图形实例后添加事件监听
    graph.on('node:added', updateGroups)
    graph.on('node:removed', updateGroups)
    graph.on('node:change:data', updateGroups)
    graph.on('node:change:parent', updateGroups)
    graph.on('node:change:attrs', updateGroups)
    
    // 初始化时调用一次更新
    updateGroups()

    return graph
  } catch (error) {
    console.error('Failed to initialize graph:', error)
    throw error
  }
}

// 添加分组数据计算属性
const groups = ref([])

// 添加更新分组的函数
const updateGroups = () => {
  if (!graph) return
  
  const allNodes = graph.getNodes()
  const groupNodes = allNodes.filter(node => node.getData()?.type === 'group')
  
  groups.value = groupNodes.map(group => {
    const children = allNodes.filter(node => node.getData()?.parent === group.id)
    return {
      id: group.id,
      name: group.getData()?.name || '未命名分组',
      nodes: children.map(node => ({
        id: node.id,
        type: node.getData()?.type,
        name: node.getAttrs()?.label?.text || (node.getData()?.type === 'container' ? '容器' : '交换机')
      }))
    }
  })
}

// 添加分组面板的点击处理函数
const handleGroupNodeClick = (groupId: string, nodeId: string) => {
  if (!graph) return
  
  const node = graph.getCellById(nodeId)
  if (node) {
    // 定位到节点
    graph.scrollToCell(node)
    
    // 选中节点
    graph.cleanSelection()
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

// 修改复制粘贴的处理函数
const handleCopy = () => {
  if (!graph || selectedCells.value.length === 0) return
  
  const cells = selectedCells.value
  if (cells.length > 0) {
    // 过滤掉分组节点，只复制普通节点
    const validCells = cells.filter(cell => {
      if (cell.isNode()) {
        const data = cell.getData()
        return data?.type !== 'group'
      }
      return true
    })
    
    if (validCells.length > 0) {
      // 收集节点数据
      const copiedData = validCells.map(cell => {
        if (cell.isNode()) {
          const pos = cell.getPosition()
          const size = cell.getSize()
          const data = cell.getData()
          const attrs = cell.getAttrs()
          
          return {
            type: 'node',
            nodeType: data?.type,
            position: pos,
            size: size,
            data: data,
            attrs: attrs
          }
        } else {
          // 如果是边，则保存源节点和目标节点的信息
          const source = cell.getSource()
          const target = cell.getTarget()
          return {
            type: 'edge',
            source: source,
            target: target,
            attrs: cell.getAttrs(),
            data: cell.getData()
          }
        }
      })
      
      // 保存到 localStorage
      localStorage.setItem('topology-clipboard', JSON.stringify(copiedData))
      ElMessage.success('已复制选中元素')
    }
  }
}

const handlePaste = () => {
  if (!graph) return
  
  try {
    const clipboardData = localStorage.getItem('topology-clipboard')
    if (clipboardData) {
      const copiedElements = JSON.parse(clipboardData)
      
      // 计算偏移量
      const dx = 20
      const dy = 20
      
      // 创建新元素
      const newCells = copiedElements.map((element: any) => {
        if (element.type === 'node') {
          // 获取对应的节点配置
          const config = nodeConfig[element.nodeType]
          if (!config) return null

          // 创建新节点
          return graph.addNode({
            ...config,
            x: element.position.x + dx,
            y: element.position.y + dy,
            width: element.size.width,
            height: element.size.height,
            attrs: element.attrs,
            data: element.data,
            zIndex: 1
          })
        } else {
          // 暂存边的信息，等节点都创建完后再创建边
          return element
        }
      }).filter(Boolean)
      
      // 添加边
      const edges = copiedElements.filter((cell: any) => cell.type === 'edge')
      edges.forEach((edge: any) => {
        // 创建新的边
        graph.addEdge({
          source: edge.source,
          target: edge.target,
          attrs: edge.attrs,
          data: edge.data,
          router: {
            name: 'normal'
          },
          connector: {
            name: 'normal'
          }
        })
      })
      
      graph.resetSelection()
      graph.select(newCells)
    }
    
    ElMessage.success('已粘贴元素')
  } catch (error) {
    console.error('粘贴失败:', error)
    ElMessage.error('粘贴失败')
  }
}

// 修改撤销功能
const handleUndo = () => {
  if (!graph || history.value.past.length === 0) {
    ElMessage.info('没有可撤销的操作')
    return
  }
  
  try {
    // 获取上一个状态
    const previousState = history.value.past.pop()
    if (previousState) {
      // 获取当前状态并保存到 future
      const currentState = getData()
      history.value.future.push(currentState)
      
      // 立即应用上一个状态
      setData(previousState)
      
      // 清除选中状态
      selectedNode.value = undefined
      selectedEdge.value = null
      selectedCells.value = []
      
      ElMessage.success('撤销成功')
    }
  } catch (error) {
    console.error('撤销失败:', error)
    ElMessage.error('撤销失败')
    // 发生错误时恢复历史记录状态
    if (history.value.future.length > 0) {
      history.value.past.push(history.value.future.pop()!)
    }
  }
}

// 修改重做功能
const handleRedo = () => {
  if (!graph || history.value.future.length === 0) {
    ElMessage.info('没有可重做的操作')
    return
  }
  
  try {
    // 获取下一个状态
    const nextState = history.value.future.pop()
    if (nextState) {
      // 获取当前状态并保存到 past
      const currentState = getData()
      history.value.past.push(currentState)
      
      // 立即应用下一个状态
      setData(nextState)
      
      // 清除选中状态
      selectedNode.value = undefined
      selectedEdge.value = null
      selectedCells.value = []
      
      ElMessage.success('重做成功')
    }
  } catch (error) {
    console.error('重做失败:', error)
    ElMessage.error('重做失败')
    // 发生错误时恢复历史记录状态
    if (history.value.past.length > 0) {
      history.value.future.push(history.value.past.pop()!)
    }
  }
}

// 修改图形监听器设置
const setupGraphListeners = () => {
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
}
</script>

<style lang="scss" scoped>
.topology-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  overflow: hidden;

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
      overflow: hidden;

      .panel-title {
        margin: 0;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 500;
        border-bottom: 1px solid var(--el-border-color-light);

        &:not(:first-child) {
          border-top: 1px solid var(--el-border-color-light);
        }
      }
      
      :deep(.panel-content) {
        flex: 0 0 auto;  // 修改为固定高度
        overflow: auto;
      }

      .group-panel {
        flex: 1;
        overflow: auto;
        padding: 8px;

        :deep(.el-collapse) {
          border: none;
          --el-collapse-header-height: 48px;  // 增加标题高度

          .el-collapse-item__header {
            font-size: 14px;
            font-weight: 500;  // 加粗标题
            color: var(--el-text-color-primary);
            padding: 0 12px;
            transition: all 0.3s ease;
            border: 1px solid var(--el-border-color-lighter);
            border-radius: 6px;
            margin-bottom: 8px;
            background-color: var(--el-bg-color-page);
            
            &:hover {
              background-color: var(--el-fill-color-light);
              border-color: var(--el-border-color);
            }
            
            &.is-active {
              color: var(--el-color-primary);
              background-color: var(--el-color-primary-light-9);
              border-color: var(--el-color-primary-light-5);
              border-bottom-right-radius: 0;
              border-bottom-left-radius: 0;
              margin-bottom: 0;
            }

            .el-collapse-item__arrow {
              margin-right: 4px;
              transition: transform 0.3s ease;
            }
          }

          .el-collapse-item__wrap {
            border: none;
            
            .el-collapse-item__content {
              padding: 0;
              border: 1px solid var(--el-border-color-lighter);
              border-top: none;
              border-bottom-right-radius: 6px;
              border-bottom-left-radius: 6px;
              margin-bottom: 8px;
            }
          }
        }

        .group-nodes {
          padding: 8px;

          .group-node {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 4px;
            border: 1px solid transparent;

            &:last-child {
              margin-bottom: 0;
            }

            &:hover {
              background-color: var(--el-fill-color-light);
              border-color: var(--el-border-color);
            }

            &:active {
              transform: scale(0.98);
            }

            .el-icon {
              font-size: 16px;
              color: var(--el-color-primary);
              flex-shrink: 0;
            }

            span {
              font-size: 13px;
              color: var(--el-text-color-regular);
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }

    .editor-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--el-fill-color-light);
      position: relative;
      overflow: hidden;

      // 添加画布容器
      .canvas-container {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      // 添加底部统计栏
      .editor-status {
        height: 40px;
        border-top: 1px solid var(--el-border-color-light);
        background-color: var(--el-bg-color);
        display: flex;
        align-items: center;
        padding: 0 24px;
        color: var(--el-text-color-regular);
        font-size: 13px;
        gap: 24px;

        .status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 4px;
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--el-fill-color-light);
          }

          .el-icon {
            font-size: 16px;
            color: var(--el-color-primary);
          }

          .count {
            color: var(--el-color-primary);
            font-weight: 600;
            font-size: 14px;
            min-width: 24px;
            text-align: center;
          }
        }

        .divider {
          width: 1px;
          height: 16px;
          background-color: var(--el-border-color-light);
        }
      }
    }

    .right-panel {
      width: 300px;
      border-left: 1px solid var(--el-border-color-light);
      background-color: var(--el-bg-color);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .panel-title {
        margin: 0;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 500;
        border-bottom: 1px solid var(--el-border-color-light);
      }
      
      :deep(.panel-content) {
        flex: 1;
        overflow: auto;
      }
    }
  }
}
</style> 