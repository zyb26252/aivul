<template>
  <div class="property-panel">
    <!-- 节点属性 -->
    <div v-if="selectedNode" class="panel-content">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" @change="handleNameChange" />
        </el-form-item>
        
        <!-- 容器节点特有属性 -->
        <template v-if="isContainer">
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
import { ref, computed, watch } from 'vue'
import type { Node } from '../types'

const props = defineProps<{
  selectedNode?: Node
  selectedEdge?: any
}>()

// 节点表单数据
const formData = ref({
  name: '',
  type: '',
  properties: {} as Record<string, any>
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

// 监听节点数据变化
watch(() => props.selectedNode, (node) => {
  if (node) {
    formData.value = {
      name: node.attrs?.label?.text || '',
      type: node.data?.type || '',
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