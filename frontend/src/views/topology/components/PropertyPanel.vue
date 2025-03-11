<template>
  <div class="property-panel">
    <!-- 节点属性 -->
    <div v-if="selectedNode" class="panel-content">
      <el-form :model="formData" label-width="100px">
        <el-form-item :label="t('scene.topology.node.name')">
          <el-input v-model="formData.name" @change="handleNameChange" />
        </el-form-item>
        
        <!-- 分组节点特有属性 -->
        <template v-if="isGroup">
          <el-form-item :label="t('table.description')">
            <el-input 
              v-model="formData.description" 
              type="textarea"
              :rows="3"
              :placeholder="t('scene.topology.editor.group.descriptionPlaceholder')"
              @change="handleDescriptionChange" 
            />
          </el-form-item>
        </template>

        <!-- 容器节点特有属性 -->
        <template v-if="isContainer">
          <el-form-item :label="t('scene.topology.node.image')">
            <div class="image-selector">
              <div v-if="selectedTarget" class="selected-target">
                <div class="target-name">{{ selectedTarget.name }}</div>
                <div class="target-info">
                  <span v-if="selectedTarget.base_image">
                    {{ selectedTarget.base_image.name }}
                    <el-tag size="small" class="architecture-tag">{{ selectedTarget.base_image.architecture }}</el-tag>
                  </span>
                </div>
              </div>
              <div v-else class="no-target-selected">{{ t('scene.topology.node.selectTarget') }}</div>
              <el-button type="primary" @click="showTargetSelector">{{ t('scene.topology.node.selectTarget') }}</el-button>
            </div>
          </el-form-item>
          <el-form-item label="IP">
            <el-input 
              v-model="formData.properties.ip" 
              :placeholder="t('scene.topology.node.ipPlaceholder')"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item :label="t('scene.topology.node.netmask')">
            <el-input 
              v-model="formData.properties.netmask" 
              :placeholder="t('scene.topology.node.netmaskPlaceholder')"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item :label="t('scene.topology.node.gateway')">
            <el-input 
              v-model="formData.properties.gateway" 
              :placeholder="t('scene.topology.node.gatewayPlaceholder')"
              @change="handlePropertyChange" 
            />
          </el-form-item>
        </template>

        <!-- 交换机节点特有属性 -->
        <template v-if="isSwitch">
          <el-form-item :label="t('scene.topology.node.gateway')">
            <el-input 
              v-model="formData.properties.gateway" 
              :placeholder="t('scene.topology.node.gatewayPlaceholder')"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item :label="t('scene.topology.node.dhcpStart')">
            <el-input 
              v-model="formData.properties.dhcpStart" 
              :placeholder="t('scene.topology.node.dhcpStartPlaceholder')"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item :label="t('scene.topology.node.dhcpEnd')">
            <el-input 
              v-model="formData.properties.dhcpEnd" 
              :placeholder="t('scene.topology.node.dhcpEndPlaceholder')"
              @change="handlePropertyChange" 
            />
          </el-form-item>
        </template>
      </el-form>
    </div>

    <!-- 连线属性 -->
    <div v-else-if="selectedEdge" class="panel-content">
      <el-form :model="edgeFormData" label-width="100px">
        <el-form-item :label="t('scene.topology.edge.style')">
          <el-select 
            v-model="edgeFormData.connector" 
            @change="handleEdgeStyleChange"
          >
            <el-option :label="t('scene.topology.edge.styles.normal')" value="normal" />
            <el-option :label="t('scene.topology.edge.styles.rounded')" value="rounded" />
            <el-option :label="t('scene.topology.edge.styles.smooth')" value="smooth" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('scene.topology.edge.color')">
          <el-color-picker 
            v-model="edgeFormData.stroke" 
            @change="handleEdgeStyleChange" 
          />
        </el-form-item>
        <el-form-item :label="t('scene.topology.edge.width')">
          <el-input-number 
            v-model="edgeFormData.strokeWidth" 
            :min="1" 
            :max="10" 
            @change="handleEdgeStyleChange" 
          />
        </el-form-item>
        <el-form-item :label="t('scene.topology.edge.pattern')">
          <el-select 
            v-model="edgeFormData.strokeDasharray" 
            @change="handleEdgeStyleChange"
          >
            <el-option :label="t('scene.topology.edge.patterns.solid')" value="none" />
            <el-option :label="t('scene.topology.edge.patterns.dashed')" value="5 5" />
            <el-option :label="t('scene.topology.edge.patterns.dotted')" value="2 2" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 空状态 -->
    <div v-else class="panel-empty">
      <span class="text-muted">{{ t('scene.topology.messages.selectNodeOrEdge') }}</span>
    </div>
  </div>

  <!-- 靶标选择模态框 -->
  <TargetSelector
    v-model:visible="targetSelectorVisible"
    :selected-target-id="selectedTarget?.id"
    @select="handleTargetSelect"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Node } from '../types'
import type { Target } from '@/types/target'
import { getTargets } from '@/api/target'
import TargetSelector from './TargetSelector.vue'

const { t } = useI18n()

const props = defineProps<{
  selectedNode?: Node
  selectedEdge?: any
}>()

// 镜像列表
const imageList = ref<any[]>([])

// 选择靶标相关
const targetSelectorVisible = ref(false)
const selectedTarget = ref<Target | null>(null)

// 显示靶标选择器
const showTargetSelector = () => {
  targetSelectorVisible.value = true
}

// 处理靶标选择
const handleTargetSelect = (target: Target) => {
  selectedTarget.value = target
  // 更新formData中的镜像ID
  formData.value.properties.image = target.id
  formData.value.properties.imageName = target.name
  
  // 保存靶标相关信息到节点属性中
  formData.value.properties.targetInfo = {
    id: target.id,
    name: target.name,
    baseImage: target.base_image ? {
      id: target.base_image.id,
      name: target.base_image.name,
      architecture: target.base_image.architecture
    } : null,
    software: target.software_list.map(s => ({
      id: s.id,
      name: s.name,
      version: s.version
    })),
    ports: target.ports
  }
  
  // 触发属性变更
  handlePropertyChange()
}

// 获取靶标列表
const fetchTargets = async () => {
  try {
    const targets = await getTargets()
    imageList.value = targets
  } catch (error) {
    console.error('Failed to fetch targets:', error)
  }
}

// 在组件挂载时获取镜像列表
onMounted(() => {
  fetchTargets()
})

// 节点表单数据
const formData = ref({
  name: '',
  type: '',
  description: '',
  properties: {
    image: '',  // 靶标ID
    imageName: '', // 靶标名称
    ip: '',
    netmask: '',
    gateway: '',
    targetInfo: null
  } as Record<string, any>
})

// 连线表单数据
const edgeFormData = ref({
  stroke: '#333333',
  strokeWidth: 1,
  strokeDasharray: '',
  connector: 'normal'
})

// 计算属性
const isContainer = computed(() => formData.value.type === 'container')
const isSwitch = computed(() => formData.value.type === 'switch')
const isGroup = computed(() => formData.value.type === 'group')

// 监听节点数据变化
watch(() => props.selectedNode, (node) => {
  if (node) {
    formData.value = {
      name: node.attrs?.label?.text || '',
      type: node.data?.type || '',
      description: node.data?.description || '',
      properties: {
        ...(node.data?.type === 'container' ? { 
          ip: '192.168.1.100',
          netmask: '255.255.255.0',
          gateway: '192.168.1.1'
        } : {}),
        ...(node.data?.type === 'switch' ? { 
          gateway: '192.168.1.1',
          dhcpStart: '192.168.1.100',
          dhcpEnd: '192.168.1.200'
        } : {}),
        ...(node.data?.properties || {})
      }
    }
    
    // 如果有靶标信息，恢复选中的靶标
    if (node.data?.properties?.targetInfo) {
      const targetId = node.data.properties.targetInfo.id
      if (targetId) {
        // 从镜像列表中找到对应的靶标
        const target = imageList.value.find((item: any) => item.id === targetId)
        if (target) {
          selectedTarget.value = target
        }
      }
    } else {
      selectedTarget.value = null
    }
  }
}, { immediate: true, deep: true })

// 监听连线数据变化
watch(() => props.selectedEdge, (edge) => {
  if (edge) {
    const lineAttrs = edge.attrs?.line || {}
    edgeFormData.value = {
      stroke: lineAttrs.stroke || '#333333',
      strokeWidth: lineAttrs.strokeWidth || 1,
      strokeDasharray: lineAttrs.strokeDasharray === '' ? 'none' : (lineAttrs.strokeDasharray || 'none'),
      connector: edge.connector || 'normal'
    }
  }
}, { immediate: true, deep: true })

// 处理节点名称变更
const emit = defineEmits(['update:node', 'update:edge'])
const handleNameChange = () => {
  if (!props.selectedNode) return

  const updatedNode = {
    ...props.selectedNode,
    attrs: {
      ...props.selectedNode.attrs,
      label: {
        ...props.selectedNode.attrs?.label,
        text: formData.value.name
      }
    }
  }
  emit('update:node', updatedNode)
}

// 处理节点属性变更
const handlePropertyChange = () => {
  if (!props.selectedNode) return

  const updatedNode = {
    ...props.selectedNode,
    data: {
      ...props.selectedNode.data,
      properties: {
        ...(props.selectedNode.data?.properties || {}),
        ...formData.value.properties
      }
    }
  }
  emit('update:node', updatedNode)
}

// 处理连线样式变更
const handleEdgeStyleChange = () => {
  if (!props.selectedEdge) return

  const updatedEdge = {
    id: props.selectedEdge.id,
    connector: edgeFormData.value.connector,
    attrs: {
      line: {
        stroke: edgeFormData.value.stroke,
        strokeWidth: edgeFormData.value.strokeWidth,
        strokeDasharray: edgeFormData.value.strokeDasharray === 'none' ? '' : edgeFormData.value.strokeDasharray,
        targetMarker: {
          name: 'classic',
          size: 8
        }
      }
    }
  }
  emit('update:edge', updatedEdge)
}

// 处理分组描述变更
const handleDescriptionChange = () => {
  if (!props.selectedNode) return

  const updatedNode = {
    ...props.selectedNode,
    data: {
      ...props.selectedNode.data,
      description: formData.value.description
    }
  }
  emit('update:node', updatedNode)
}
</script>

<style lang="scss" scoped>
.property-panel {
  height: 100%;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-light);

  .panel-content {
    .el-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }

  .panel-empty {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);
  }
}

// 镜像选择器样式
.image-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .selected-target {
    flex: 1;
    
    .target-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .target-info {
      color: var(--el-text-color-regular);
      font-size: 12px;
      
      .architecture-tag {
        margin-left: 4px;
      }
    }
  }
  
  .no-target-selected {
    flex: 1;
    color: var(--el-text-color-secondary);
  }
}

.architecture-tag {
  margin-left: 8px;
}
</style> 