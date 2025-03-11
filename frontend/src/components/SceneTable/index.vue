<template>
  <div class="scene-table">
    <el-table
      v-loading="loading"
      :data="scenes"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" :label="$t('table.name')" min-width="150">
        <template #default="{ row }">
          <div class="name-column">
            <span class="name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" :label="$t('table.description')" min-width="200" show-overflow-tooltip />
      
      <el-table-column :label="$t('scene.topology.preview')" width="200" align="center">
        <template #default="{ row }">
          <div class="topology-thumbnail" @click="handlePreview(row)">
            <div v-if="row.topology" class="thumbnail-container">
              <div 
                :id="`thumbnail-${row.id}`" 
                class="thumbnail-content"
                style="position: relative;"
              ></div>
            </div>
            <el-empty v-else :description="$t('scene.topology.noTopology')" :image-size="50" />
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="nodeCount"
        :label="$t('scene.nodeCount')"
        align="center"
        width="150px"
      >
        <template #default="scope">
          <el-tag type="success" effect="light">
            {{ getActualNodeCount(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" :label="$t('table.createdAt')" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" width="240" fixed="right">
        <template #default="{ row }">
          <div class="operation-column">
            <el-button type="primary" link @click="$emit('edit', row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button type="primary" link @click="$emit('topology', row)">
              {{ $t('scene.topology.title') }}
            </el-button>
            <el-button type="danger" link @click="$emit('delete', row)">
              {{ $t('common.delete') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="selectedRows.length > 0" class="batch-operation">
      <span class="selected-count">{{ $t('common.selected') }} {{ selectedRows.length }} {{ $t('common.items') }}</span>
      <el-button type="danger" @click="$emit('batch-delete', selectedRows)">
        <el-icon><Delete /></el-icon>{{ $t('common.batchDelete') }}
      </el-button>
    </div>

    <el-dialog
      v-model="previewVisible"
      :title="$t('scene.topology.preview')"
      width="800px"
      destroy-on-close
      class="preview-dialog"
    >
      <div class="preview-container" ref="previewContainer"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewVisible = false">{{ $t('common.cancel') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { Graph } from '@antv/x6'
import { Delete } from '@element-plus/icons-vue'
import type { Scene } from '@/types/scene'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getScenes, deleteScene } from '@/api/scene'
import TableSkeleton from '@/components/TableSkeleton.vue'

// 容器图标 base64
const containerIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IkRvY2tlciIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3QKd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiCnJ4PSIxNSUiCmZpbGw9IiNmZmYiLz48cGF0aCBzdHJva2U9IiMwNjZkYTUiIHN0cm9rZS13aWR0aD0iMzgiIGQ9Ik0yOTYgMjI2aDQybS05MiAwaDQybS05MSAwaDQybS05MSAwaDQxbS05MSAwaDQybTgtNDZoNDFtOCAwaDQybTcgMGg0Mm0tNDItNDZoNDIiLz48cGF0aCBmaWxsPSIjMDY2ZGE1IiBkPSJtNDcyIDIyOHMtMTgtMTctNTUtMTFjLTQtMjktMzUtNDYtMzUtNDZzLTI5IDM1LTggNzRjLTYgMy0xNiA3LTMxIDdINjhjLTUgMTktNSAxNDUgMTMzIDE0NSA5OSAwIDE3My00NiAyMDgtMTMwIDUyIDQgNjMtMzkgNjMtMzkiLz48L3N2Zz4='

// 交换机图标 base64
const switchIcon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgIHZpZXdCb3g9IjAgMCAzNiAzNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+bmV0d29yay1zd2l0Y2gtbGluZTwvdGl0bGU+CiAgICA8cGF0aCBkPSJNMzMuOTEsMTguNDcsMzAuNzgsOC40MUEyLDIsMCwwLDAsMjguODcsN0g3LjEzQTIsMiwwLDAsMCw1LjIyLDguNDFMMi4wOSwxOC40OGEyLDIsMCwwLDAtLjA5LjU5VjI3YTIsMiwwLDAsMCwyLDJIMzJhMiwyLDAsMCwwLDItMlYxOS4wNkEyLDIsMCwwLDAsMzMuOTEsMTguNDdaTTMyLDI3SDRWMTkuMDZMNy4xMyw5SDI4Ljg3TDMyLDE5LjA2WiIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTEiPjwvcGF0aD48cmVjdCB4PSI3LjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMiI+PC9yZWN0PjxyZWN0IHg9IjEyLjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMyI+PC9yZWN0PjxyZWN0IHg9IjE3LjExIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtNCI+PC9yZWN0PjxyZWN0IHg9IjIyLjEiIHk9IjIyIiB3aWR0aD0iMS44IiBoZWlnaHQ9IjMiIGNsYXNzPSJjbHItaS1vdXRsaW5lIGNsci1pLW91dGxpbmUtcGF0aC01Ij48L3JlY3Q+PHJlY3QgeD0iMjcuMSIgeT0iMjIiIHdpZHRoPSIxLjgiIGhlaWdodD0iMyIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTYiPjwvcmVjdD48cmVjdCB4PSI2LjIzIiB5PSIxOCIgd2lkdGg9IjIzLjY5IiBoZWlnaHQ9IjEuNCIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTciPjwvcmVjdD4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgZmlsbC1vcGFjaXR5PSIwIi8+Cjwvc3ZnPg=='

const props = defineProps<{
  loading: boolean
  scenes: Scene[]
}>()

const selectedRows = ref<Scene[]>([])
const previewVisible = ref(false)
const previewContainer = ref<HTMLElement>()
const graphInstances = new Map<number, any>()

const { t } = useI18n()

// 计算实际节点数量（不包含分组节点）
const getActualNodeCount = (scene: Scene) => {
  if (!scene.topology) return 0;
  
  try {
    const topologyData = typeof scene.topology === 'string' 
      ? JSON.parse(scene.topology) 
      : scene.topology;
      
    const nodes = topologyData.nodes || [];
    
    // 过滤掉类型为group的节点
    const nonGroupNodes = nodes.filter(node => node.type !== 'group');
    
    console.log(`[节点计数] 场景ID: ${scene.id}, 名称: ${scene.name}, 总节点: ${nodes.length}, 非分组节点: ${nonGroupNodes.length}`);
    
    return nonGroupNodes.length;
  } catch (error) {
    console.error('计算节点数量时出错:', error);
    return 0;
  }
}

const updateThumbnail = async (scene: Scene) => {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const containerId = `thumbnail-${scene.id}`
  const container = document.getElementById(containerId)
  
  if (!container || !scene.topology) return

  try {
    let graph = graphInstances.get(scene.id)
    
    if (!graph) {
      container.innerHTML = ''
      container.style.width = '180px'
      container.style.height = '100px'
      
      graph = new Graph({
        container,
        width: 180,
        height: 100,
        background: {
          color: '#F8F9FA',
        },
        grid: {
          visible: true,
          type: 'doubleMesh',
          args: [
            {
              color: '#EBEEF5',
              thickness: 0.5
            },
            {
              color: '#DCDFE6',
              thickness: 0.5,
              factor: 4
            }
          ]
        },
        interacting: false,
        connecting: false,
        mousewheel: false,
        preventDefaultContextMenu: false,
        preventDefaultBlankAction: false,
        options: {
          passive: true
        },
        zIndex: {
          node: 2,
          edge: 1
        }
      })
      
      graphInstances.set(scene.id, graph)
    }

    graph.clearCells()

    const topologyData = typeof scene.topology === 'string' 
      ? JSON.parse(scene.topology) 
      : scene.topology

    const nodes = topologyData.nodes || []
    const edges = topologyData.edges || []
    const groups = topologyData.groups || []
    
    console.log(`[预览] 场景ID: ${scene.id}, 名称: ${scene.name}`)
    console.log(`[预览] 原始节点数量: ${nodes.length}, 边数量: ${edges.length}, 分组数量: ${groups.length}`)
    
    // 找出所有独立节点和分组节点 (顶级节点)
    const topLevelNodes = nodes.filter(node => !node.data?.parent || node.type === 'group')
    console.log(`[预览] 顶级节点数量: ${topLevelNodes.length}`)
    
    // 用于跟踪实际渲染的节点ID
    const renderedNodeIds = new Set()
    
    // 先渲染分组节点，确保在最底层
    nodes
      .filter(node => node.type === 'group')
      .forEach(node => {
        // 获取这个分组的子节点
        const childNodes = nodes.filter(n => n.data?.parent === node.id)
        
        // 创建精确匹配编辑器的分组节点
        graph.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
          width: node.attrs?.width || 200,
          height: node.attrs?.height || 100,
          shape: 'rect',
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
          attrs: {
            body: {
              fill: 'rgba(24, 144, 255, 0.1)',
              stroke: '#1890ff',
              strokeWidth: 1,
              strokeDasharray: '5 5',
              rx: 8,
              ry: 8,
              refWidth: '100%',
              refHeight: '100%',
            },
            label: {
              text: node.data?.name || '分组',
              fontSize: 8, // 缩略图中使用更小的字体
              fill: '#1890ff',
              refX: 8,   // 靠左上角，与编辑器一致
              refY: 8,
              textAnchor: 'start',
              textVerticalAnchor: 'top',
            },
          },
          zIndex: 0
        })
        
        renderedNodeIds.add(node.id)
      })
    
    // 然后渲染非分组、没有父节点的独立节点
    nodes
      .filter(node => node.type !== 'group' && !node.data?.parent)
      .forEach(node => {
        graph.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
          width: 30,  // 缩略图中使用更小的尺寸
          height: 40,
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
            },
          ],
          attrs: {
            body: {
              fill: 'none',
              stroke: 'none',
              refWidth: '100%',
              refHeight: '100%',
            },
            image: {
              'xlink:href': node.type === 'container' 
                ? containerIcon
                : switchIcon,
              width: 24,
              height: 24,
              x: 3,
              y: 0,
            },
            label: {
              text: node.type === 'container' ? '容器' : '交换机',
              fontSize: 7,
              fill: '#333',
              refX: 0.5,
              refY: 0.95,
              textAnchor: 'middle',
              textVerticalAnchor: 'top',
            },
          },
          zIndex: 1
        })
        
        renderedNodeIds.add(node.id)
      })

    console.log(`[预览] 实际渲染节点数量: ${renderedNodeIds.size}`)

    // 添加边的渲染
    let renderedEdgeCount = 0
    edges.forEach((edge: any) => {
      try {
        // 确保源节点和目标节点存在
        if (!edge.source || !edge.target) {
          console.warn(`[预览] 跳过无效边，缺少源节点或目标节点ID: ${JSON.stringify(edge)}`)
          return
        }
        
        // 验证源节点和目标节点是否已渲染
        if (!renderedNodeIds.has(edge.source) || !renderedNodeIds.has(edge.target)) {
          console.warn(`[预览] 跳过边 ${edge.id || '未知'}: 连接节点未渲染 (源: ${edge.source}, 目标: ${edge.target})`)
          return
        }
        
        // 进一步检查源节点和目标节点是否真的存在于图中
        const sourceNode = graph.getCellById(edge.source)
        const targetNode = graph.getCellById(edge.target)
        
        if (!sourceNode || !targetNode) {
          console.warn(`[预览] 跳过边 ${edge.id || '未知'}: 无法在图中找到节点 (源: ${edge.source} ${sourceNode ? '存在' : '不存在'}, 目标: ${edge.target} ${targetNode ? '存在' : '不存在'})`)
          return
        }
        
        // 从原始数据中提取边的样式
        const lineStyle = edge.attrs?.line || {}
        const router = edge.data?.router || { name: 'orth', args: { padding: 10, direction: 'H' } }
        const connector = edge.data?.connector || { name: 'rounded', args: { radius: 5 } }
        
        // 创建和原始边完全相同样式的边
        graph.addEdge({
          source: {
            cell: edge.source,
            anchor: 'center',
          },
          target: {
            cell: edge.target,
            anchor: 'center',
          },
          attrs: {
            line: {
              stroke: lineStyle.stroke || '#333333',
              strokeWidth: Math.max(1, (lineStyle.strokeWidth || 1) * 0.5), // 缩小线宽比例
              strokeDasharray: lineStyle.strokeDasharray || '',
              targetMarker: null,
            },
          },
          router: router,
          connector: connector,
          zIndex: 2
        })
        
        renderedEdgeCount++;
      } catch (error) {
        console.error(`[预览] 添加边时发生错误:`, error)
      }
    })

    // 应用适当的缩放和居中
    if (renderedNodeIds.size > 0) {
      // 等待元素渲染完成
      setTimeout(() => {
        // 计算适当的缩放比例
        const scaleFactor = 0.85; // 留出一些边距
        
        // 应用缩放和居中
        graph.zoomToFit({
          padding: 2,
          maxScale: 0.8,
          minScale: 0.1, // 允许更小的缩放比例，确保所有内容可见
          scaleGrid: 0.1,
          useContentBox: true
        })
        graph.centerContent()
        
        // 获取当前缩放
        const currentScale = graph.zoom();
        if (currentScale > 0.8) {
          // 如果缩放太大，减小它
          graph.zoom(-0.2);
        }
      }, 50)
    }
  } catch (error) {
    console.error('更新缩略图时出错:', error)
  }
}

watch(() => props.scenes, (newScenes) => {
  setTimeout(async () => {
    for (const scene of newScenes) {
      await updateThumbnail(scene)
    }
  }, 100)
}, { immediate: true, deep: true })

onMounted(() => {
  setTimeout(async () => {
    for (const scene of props.scenes) {
      await updateThumbnail(scene)
    }
  }, 100)
})

onBeforeUnmount(() => {
  graphInstances.forEach(graph => {
    try {
      graph.dispose()
    } catch (error) {
      console.error('清理图形实例失败:', error)
    }
  })
  graphInstances.clear()
})

const handleSelectionChange = (rows: Scene[]) => {
  selectedRows.value = rows
  emit('selection-change', rows)
}

const handlePreview = (scene: Scene) => {
  if (!scene.topology) return
  previewVisible.value = true
  nextTick(() => {
    if (!previewContainer.value) return
    
    const graph = new Graph({
      container: previewContainer.value,
      width: 760,
      height: 500,
      background: {
        color: '#F8F9FA',
      },
      grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#EBEEF5',
            thickness: 1
          },
          {
            color: '#DCDFE6',
            thickness: 1,
            factor: 4
          }
        ]
      },
      interacting: false,
      connecting: false,
      mousewheel: false,
      zIndex: {
        node: 2,
        edge: 1
      }
    })

    const topologyData = typeof scene.topology === 'string' 
      ? JSON.parse(scene.topology) 
      : scene.topology

    const nodes = topologyData.nodes || []
    const edges = topologyData.edges || []
    const groups = topologyData.groups || []
    
    console.log(`[预览对话框] 场景ID: ${scene.id}, 名称: ${scene.name}`)
    console.log(`[预览对话框] 原始节点数量: ${nodes.length}, 边数量: ${edges.length}, 分组数量: ${groups.length}`)
    
    // 用于跟踪实际渲染的节点ID
    const renderedNodeIds = new Set()
    
    // 先渲染分组节点
    nodes
      .filter(node => node.type === 'group')
      .forEach(node => {
        // 完全复制原始分组节点的属性
        graph.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
          width: node.attrs?.width || 200,
          height: node.attrs?.height || 100,
          shape: 'rect',
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
          attrs: {
            ...node.attrs,
            body: {
              fill: 'rgba(24, 144, 255, 0.1)',
              stroke: '#1890ff',
              strokeWidth: 1,
              strokeDasharray: '5 5',
              rx: 8,
              ry: 8,
              refWidth: '100%',
              refHeight: '100%',
              ...node.attrs?.body
            },
            label: {
              text: node.data?.name || '分组',
              fontSize: 12,
              fill: '#1890ff',
              refX: 8,
              refY: 8,
              textAnchor: 'start',
              textVerticalAnchor: 'top',
              ...node.attrs?.label
            },
          },
          zIndex: 0
        })
        
        renderedNodeIds.add(node.id)
      })
    
    // 渲染非分组、没有父节点的独立节点
    nodes
      .filter(node => node.type !== 'group' && !node.data?.parent)
      .forEach(node => {
        // 完全复制原始节点的属性
        graph.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
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
            },
          ],
          attrs: {
            ...node.attrs,
            body: {
              fill: 'none',
              stroke: 'none',
              refWidth: '100%',
              refHeight: '100%',
              ...node.attrs?.body
            },
            image: {
              'xlink:href': node.type === 'container' 
                ? containerIcon
                : switchIcon,
              width: 40,
              height: 40,
              x: 0,
              y: 0,
              ...node.attrs?.image
            },
            label: {
              text: node.type === 'container' ? '容器' : '交换机',
              fontSize: 12,
              fill: '#333',
              refX: 0.5,
              refY: 0.85,
              textAnchor: 'middle',
              textVerticalAnchor: 'top',
              ...node.attrs?.label
            },
          },
          zIndex: 1
        })
        
        renderedNodeIds.add(node.id)
      })

    // 渲染边，完全保留原始样式
    edges.forEach((edge: any) => {
      try {
        // 确保源节点和目标节点都存在
        if (!edge.source || !edge.target) {
          console.warn(`[预览对话框] 跳过无效边，缺少源节点或目标节点ID: ${JSON.stringify(edge)}`)
          return
        }
        
        // 验证源节点和目标节点是否已渲染
        if (!renderedNodeIds.has(edge.source) || !renderedNodeIds.has(edge.target)) {
          console.warn(`[预览对话框] 跳过边 ${edge.id || '未知'}: 连接节点未渲染 (源: ${edge.source}, 目标: ${edge.target})`)
          return
        }
        
        // 进一步检查源节点和目标节点是否真的存在于图中
        const sourceNode = graph.getCellById(edge.source)
        const targetNode = graph.getCellById(edge.target)
        
        if (!sourceNode || !targetNode) {
          console.warn(`[预览对话框] 跳过边 ${edge.id || '未知'}: 无法在图中找到节点 (源: ${edge.source} ${sourceNode ? '存在' : '不存在'}, 目标: ${edge.target} ${targetNode ? '存在' : '不存在'})`)
          return
        }
        
        // 尽可能保留原始边的所有属性
        graph.addEdge({
          id: edge.id,
          source: {
            cell: edge.source,
            anchor: 'center',
          },
          target: {
            cell: edge.target,
            anchor: 'center',
          },
          attrs: {
            ...edge.attrs,
            line: {
              ...edge.attrs?.line,
              targetMarker: null,
            }
          },
          router: edge.data?.router || {
            name: 'orth',
            args: {
              padding: 20,
              direction: 'H'
            }
          },
          connector: edge.data?.connector || {
            name: 'rounded',
            args: {
              radius: 8
            }
          },
          zIndex: 2
        })
      } catch (error) {
        console.error(`[预览对话框] 添加边时发生错误:`, error)
      }
    })

    // 适当缩放并居中
    if (renderedNodeIds.size > 0) {
      setTimeout(() => {
        graph.zoomToFit({ 
          padding: 20,
          maxScale: 1.2
        })
        graph.centerContent()
      }, 50)
    }
  })
}

const emit = defineEmits<{
  (e: 'selection-change', rows: Scene[]): void
  (e: 'edit', row: Scene): void
  (e: 'topology', row: Scene): void
  (e: 'delete', row: Scene): void
  (e: 'batch-delete', rows: Scene[]): void
}>()
</script>

<style lang="scss" scoped>
.scene-table {
  .el-table {
    --el-table-border-color: var(--border-light);
    --el-table-header-bg-color: var(--bg-light);
    --el-table-row-hover-bg-color: var(--primary-light);
    
    .name-column {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .name {
        color: var(--text-primary);
        font-weight: 500;
      }
    }
  }
}

.operation-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.batch-operation {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  margin-top: var(--spacing-base);
  padding: var(--spacing-base);
  background: var(--bg-light);
  border-radius: var(--border-radius-base);
  
  .selected-count {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}

.topology-thumbnail {
  width: 180px;
  height: 100px;
  background: var(--el-bg-color-page);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary-light-5);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  .thumbnail-container {
    width: 100%;
    height: 100%;
    position: relative;
    
    .thumbnail-content {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}

.preview-dialog {
  :deep(.el-dialog__body) {
    padding: var(--spacing-large);
  }
}

.preview-container {
  width: 760px;
  height: 500px;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  overflow: hidden;
  background: var(--bg-lighter);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-base);
}

// 响应式布局
@media screen and (max-width: 768px) {
  .topology-thumbnail {
    width: 140px;
    height: 80px;
  }
  
  .preview-container {
    width: 100%;
    height: 300px;
  }
}
</style> 
