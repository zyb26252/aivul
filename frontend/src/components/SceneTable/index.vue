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

      <el-table-column prop="nodeCount" :label="$t('table.nodeCount')" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.nodeCount }}</el-tag>
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
const containerIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGQ9Ik04MzIgNjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjk2YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgODI0SDIzMlY2ODdoOTcuOWMxMS42IDMyLjggMzIgNjIuMyA1OS4xIDg0LjcgMzQuNSAyOC41IDc4LjIgNDQuMyAxMjMgNDQuM3M4OC41LTE1LjcgMTIzLTQ0LjNjMjcuMS0yMi40IDQ3LjUtNTEuOSA1OS4xLTg0LjdINzkydi02M0g2NDMuNmwtNS4yIDI0LjdDNjI2LjQgNzA4LjUgNTczLjIgNzUyIDUxMiA3NTJzLTExNC40LTQzLjUtMTI2LjUtMTAzLjNsLTUuMi0yNC43SDIzMlYxMzZoNTYwdjc1MnoiIGZpbGw9IiMxODkwZmYiLz48cGF0aCBkPSJNMzIwIDM0MWgzODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMzIwYy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4em0wIDE2MGgzODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMzIwYy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4eiIgZmlsbD0iIzE4OTBmZiIvPjwvc3ZnPg=='

// 交换机图标 base64
const switchIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGQ9Ik04ODAgMTEySDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2NzM2YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDczNmMxNy43IDAgMzItMTQuMyAzMi0zMlYxNDRjMC0xNy43LTE0LjMtMzItMzItMzJ6TTUxMiA4MDBjLTg4LjQgMC0xNjAtNzEuNi0xNjAtMTYwczcxLjYtMTYwIDE2MC0xNjAgMTYwIDcxLjYgMTYwIDE2MC03MS42IDE2MC0xNjAgMTYwek01MTIgNTQ0Yy01My4wMiAwLTk2IDQyLjk4LTk2IDk2czQyLjk4IDk2IDk2IDk2IDk2LTQyLjk4IDk2LTk2LTQyLjk4LTk2LTk2LTk2eiIgZmlsbD0iIzEzYzJjMiIvPjwvc3ZnPg=='

const props = defineProps<{
  loading: boolean
  scenes: Scene[]
}>()

const selectedRows = ref<Scene[]>([])
const previewVisible = ref(false)
const previewContainer = ref<HTMLElement>()
const graphInstances = new Map<number, any>()

const { t } = useI18n()

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
        grid: false,
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
    
    // 用于跟踪实际渲染的节点ID
    const renderedNodeIds = new Set()
    
    // 先渲染节点
    nodes.forEach((node: any) => {
      // 处理分组节点
      if (node.type === 'group') {
        graph.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
          width: 120,
          height: 80,
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
              fontSize: 12,
              fill: '#1890ff',
              refX: 0.5,
              refY: 0.5,
              textAnchor: 'middle',
              textVerticalAnchor: 'middle',
            },
          },
          zIndex: 1 // 分组应该在底层
        })
        // 记录已渲染的节点ID
        renderedNodeIds.add(node.id)
        return
      }
      
      // 跳过有父节点的节点，避免重复渲染
      if (node.data?.parent) {
        return
      }
      
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
          body: {
            fill: '#fff',
            stroke: 'none',
            refWidth: '100%',
            refHeight: '100%',
          },
          image: {
            'xlink:href': node.type === 'container' 
              ? containerIcon
              : switchIcon,
            width: 32,
            height: 32,
            x: 4,
            y: 4,
          },
          label: {
            text: node.type === 'container' ? '容器' : '交换机',
            fontSize: 12,
            fill: '#333',
            refX: 0.5,
            refY: 0.8,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
          },
        },
        zIndex: 2
      })
      // 记录已渲染的节点ID
      renderedNodeIds.add(node.id)
    })

    // 添加边的渲染
    edges.forEach((edge: any) => {
      // 只渲染连接到已渲染节点的边
      if (!renderedNodeIds.has(edge.source) || !renderedNodeIds.has(edge.target)) {
        return
      }
      
      graph.addEdge({
        source: {
          cell: edge.source,
          anchor: {
            name: 'center',
            args: {
              dx: 0,
              dy: 0
            }
          }
        },
        target: {
          cell: edge.target,
          anchor: {
            name: 'center',
            args: {
              dx: 0,
              dy: 0
            }
          }
        },
        attrs: {
          line: {
            stroke: edge.attrs?.line?.stroke || '#333333',
            strokeWidth: edge.attrs?.line?.strokeWidth || 1,
            strokeDasharray: edge.attrs?.line?.strokeDasharray || '',
            targetMarker: null,
            pointerEvents: 'none'
          },
        },
        router: {
          name: 'orth',
          args: {
            padding: 20,
            direction: 'H'
          }
        },
        connector: {
          name: edge.connector || 'rounded',
          args: {
            radius: 8
          }
        },
        zIndex: 1
      })
    })

    if (nodes.length > 0) {
      graph.zoomToFit({ padding: 10 })
      graph.centerContent()
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
      grid: false,
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
    
    // 用于跟踪实际渲染的节点ID
    const renderedNodeIds = new Set()
    
    // 渲染节点
    nodes.forEach((node: any) => {
      // 处理分组节点
      if (node.type === 'group') {
        graph.addNode({
          id: node.id,
          x: node.x,
          y: node.y,
          width: 120,
          height: 80,
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
              fontSize: 12,
              fill: '#1890ff',
              refX: 0.5,
              refY: 0.5,
              textAnchor: 'middle',
              textVerticalAnchor: 'middle',
            },
          },
          zIndex: 1 // 分组应该在底层
        })
        // 记录已渲染的节点ID
        renderedNodeIds.add(node.id)
        return
      }
      
      // 跳过有父节点的节点，避免重复渲染
      if (node.data?.parent) {
        return
      }
      
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
          body: {
            fill: '#fff',
            stroke: 'none',
            refWidth: '100%',
            refHeight: '100%',
          },
          image: {
            'xlink:href': node.type === 'container' 
              ? containerIcon
              : switchIcon,
            width: 32,
            height: 32,
            x: 4,
            y: 4,
          },
          label: {
            text: node.type === 'container' ? '容器' : '交换机',
            fontSize: 12,
            fill: '#333',
            refX: 0.5,
            refY: 0.8,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
          },
        },
        zIndex: 2
      })
      // 记录已渲染的节点ID
      renderedNodeIds.add(node.id)
    })

    // 渲染边
    edges.forEach((edge: any) => {
      // 只渲染连接到已渲染节点的边
      if (!renderedNodeIds.has(edge.source) || !renderedNodeIds.has(edge.target)) {
        return
      }
      
      graph.addEdge({
        source: {
          cell: edge.source,
          anchor: {
            name: 'center',
            args: {
              dx: 0,
              dy: 0
            }
          }
        },
        target: {
          cell: edge.target,
          anchor: {
            name: 'center',
            args: {
              dx: 0,
              dy: 0
            }
          }
        },
        attrs: {
          line: {
            stroke: edge.attrs?.line?.stroke || '#333333',
            strokeWidth: edge.attrs?.line?.strokeWidth || 1,
            strokeDasharray: edge.attrs?.line?.strokeDasharray || '',
            targetMarker: null,
            pointerEvents: 'none'
          },
        },
        router: {
          name: 'orth',
          args: {
            padding: 20,
            direction: 'H'
          }
        },
        connector: {
          name: edge.connector || 'rounded',
          args: {
            radius: 8
          }
        },
        zIndex: 1
      })
    })

    if (nodes.length > 0) {
      graph.zoomToFit({ padding: 20 })
      graph.centerContent()
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
  background: var(--bg-lighter);
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: var(--border-radius-base);
  cursor: pointer;
  transition: var(--transition-smooth);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-base);
    border-color: var(--primary-color);
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