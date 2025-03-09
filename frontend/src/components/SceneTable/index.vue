<template>
  <div class="scene-table">
    <el-table
      v-loading="loading"
      :data="scenes"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="场景名称" width="200" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      
      <el-table-column label="拓扑预览" width="200" align="center">
        <template #default="{ row }">
          <div class="topology-thumbnail" @click="handlePreview(row)">
            <div v-if="row.topology" class="thumbnail-container">
              <div 
                :id="`thumbnail-${row.id}`" 
                class="thumbnail-content"
                style="position: relative;"
              ></div>
            </div>
            <el-empty v-else description="暂无拓扑" :image-size="50" />
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="nodeCount" label="节点数量" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" type="info">{{ row.nodeCount }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <div class="operation-group">
            <el-button type="primary" link @click="$emit('edit', row)">
              编辑
            </el-button>
            <el-button type="primary" link @click="$emit('topology', row)">
              管理拓扑
            </el-button>
            <el-button type="danger" link @click="$emit('delete', row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="selectedRows.length > 0" class="batch-operation">
      <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
      <el-button type="danger" @click="$emit('batch-delete', selectedRows)">批量删除</el-button>
    </div>

    <el-dialog
      v-model="previewVisible"
      title="拓扑预览"
      width="800px"
      destroy-on-close
    >
      <div class="preview-container" ref="previewContainer"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { Graph } from '@antv/x6'
import type { Scene } from '@/types/scene'

const props = defineProps<{
  loading: boolean
  scenes: Scene[]
}>()

const selectedRows = ref<Scene[]>([])
const previewVisible = ref(false)
const previewContainer = ref<HTMLElement>()
const graphInstances = new Map<number, any>()

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
    
    // 先渲染节点
    nodes.forEach((node: any) => {
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
              ? '/src/assets/icons/container.svg'
              : '/src/assets/icons/switch.svg',
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
    })

    // 添加边的渲染
    edges.forEach((edge: any) => {
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
    
    // 渲染节点
    nodes.forEach((node: any) => {
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
              ? '/src/assets/icons/container.svg'
              : '/src/assets/icons/switch.svg',
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
    })

    // 渲染边
    edges.forEach((edge: any) => {
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
.operation-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.batch-operation {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  
  .selected-count {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.topology-thumbnail {
  width: 180px;
  height: 100px;
  background: #fff;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
    z-index: 1;
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

.preview-container {
  width: 760px;
  height: 500px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
}
</style> 