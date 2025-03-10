<template>
  <div class="property-panel">
    <!-- 节点属性 -->
    <div v-if="selectedNode" class="panel-content">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" @change="handleNameChange" />
        </el-form-item>
        
        <!-- 分组节点特有属性 -->
        <template v-if="isGroup">
          <el-form-item label="描述">
            <el-input 
              v-model="formData.description" 
              type="textarea"
              :rows="3"
              placeholder="请输入分组描述"
              @change="handleDescriptionChange" 
            />
          </el-form-item>
        </template>

        <!-- 容器节点特有属性 -->
        <template v-if="isContainer">
          <el-form-item label="镜像">
            <el-select 
              v-model="formData.properties.image" 
              placeholder="请选择镜像"
              @change="handlePropertyChange"
            >
              <el-option
                v-for="image in imageList"
                :key="image.id"
                :label="image.name"
                :value="image.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="IP地址">
            <el-input 
              v-model="formData.properties.ip" 
              placeholder="请输入IP地址"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item label="子网掩码">
            <el-input 
              v-model="formData.properties.netmask" 
              placeholder="请输入子网掩码"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item label="网关">
            <el-input 
              v-model="formData.properties.gateway" 
              placeholder="请输入网关地址"
              @change="handlePropertyChange" 
            />
          </el-form-item>
        </template>

        <!-- 交换机节点特有属性 -->
        <template v-if="isSwitch">
          <el-form-item label="网关">
            <el-input 
              v-model="formData.properties.gateway" 
              placeholder="请输入网关地址"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item label="DHCP起始">
            <el-input 
              v-model="formData.properties.dhcpStart" 
              placeholder="请输入DHCP起始地址"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item label="DHCP结束">
            <el-input 
              v-model="formData.properties.dhcpEnd" 
              placeholder="请输入DHCP结束地址"
              @change="handlePropertyChange" 
            />
          </el-form-item>
        </template>
      </el-form>
    </div>

    <!-- 连线属性 -->
    <div v-else-if="selectedEdge" class="panel-content">
      <el-form :model="edgeFormData" label-width="100px">
        <el-form-item label="连线形状">
          <el-select 
            v-model="edgeFormData.connector" 
            @change="handleEdgeStyleChange"
          >
            <el-option label="直线" value="normal" />
            <el-option label="折线" value="smooth" />
            <el-option label="曲线" value="rounded" />
          </el-select>
        </el-form-item>
        <el-form-item label="线条颜色">
          <el-color-picker 
            v-model="edgeFormData.stroke" 
            @change="handleEdgeStyleChange" 
          />
        </el-form-item>
        <el-form-item label="线条宽度">
          <el-input-number 
            v-model="edgeFormData.strokeWidth" 
            :min="1" 
            :max="10" 
            @change="handleEdgeStyleChange" 
          />
        </el-form-item>
        <el-form-item label="线条样式">
          <el-select 
            v-model="edgeFormData.strokeDasharray" 
            @change="handleEdgeStyleChange"
          >
            <el-option label="实线" value="none" />
            <el-option label="虚线" value="5 5" />
            <el-option label="点线" value="2 2" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 空状态 -->
    <div v-else class="panel-empty">
      <span class="text-muted">请选择节点或连线</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Node } from '../types'
import { getImages } from '@/api/image'

const props = defineProps<{
  selectedNode?: Node
  selectedEdge?: any
}>()

// 镜像列表
const imageList = ref<any[]>([])

// 获取镜像列表
const fetchImageList = async () => {
  try {
    const response = await getImages()
    imageList.value = response
  } catch (error) {
    console.error('Failed to fetch images:', error)
  }
}

// 在组件挂载时获取镜像列表
onMounted(() => {
  fetchImageList()
})

// 节点表单数据
const formData = ref({
  name: '',
  type: '',
  description: '',
  properties: {
    image: '',  // 添加镜像字段
    ip: '',
    netmask: '',
    gateway: ''
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
    ...props.selectedEdge,
    connector: edgeFormData.value.connector,
    attrs: {
      ...props.selectedEdge.attrs,
      line: {
        ...props.selectedEdge.attrs?.line,
        stroke: edgeFormData.value.stroke,
        strokeWidth: edgeFormData.value.strokeWidth,
        strokeDasharray: edgeFormData.value.strokeDasharray === 'none' ? '' : edgeFormData.value.strokeDasharray
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
</style> 