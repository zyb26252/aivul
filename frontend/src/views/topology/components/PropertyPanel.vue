<template>
  <div class="property-panel">
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
          <el-form-item label="网关地址">
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
    <div v-else class="panel-empty">
      <el-empty description="请选择一个节点" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Node } from '../types'

const props = defineProps<{
  selectedNode?: Node
}>()

const formData = ref<{
  name: string
  type: string
  properties: Record<string, any>
}>({
  name: '',
  type: '',
  properties: {}
})

// 计算属性：判断是否显示容器属性
const isContainer = computed(() => formData.value.type === 'container')

// 计算属性：判断是否显示交换机属性
const isSwitch = computed(() => formData.value.type === 'switch')

// 监听选中节点变化
watch(() => props.selectedNode, (node) => {
  console.log('PropertyPanel received node:', node)
  if (node) {
    // 初始化默认属性
    const defaultProperties = node.data?.type === 'container' 
      ? { 
          ip: '192.168.1.100',
          netmask: '255.255.255.0',
          gateway: '192.168.1.1'
        }
      : node.data?.type === 'switch'
      ? { 
          gateway: '192.168.1.1',
          dhcpStart: '192.168.1.100',
          dhcpEnd: '192.168.1.200'
        }
      : {}

    // 确保 properties 对象存在
    const properties = {
      ...defaultProperties,
      ...(node.data?.properties || {})
    }

    // 更新表单数据
    formData.value = {
      name: node.attrs?.label?.text || '',
      type: node.data?.type || '',
      properties: properties
    }
    console.log('PropertyPanel formData:', formData.value)
  } else {
    formData.value = {
      name: '',
      type: '',
      properties: {}
    }
  }
}, { immediate: true, deep: true })

// 处理名称变更
const emit = defineEmits(['update:node'])
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
  console.log('Emitting node update:', updatedNode)
  emit('update:node', updatedNode)
}

// 处理属性变更
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
  console.log('Emitting node update:', updatedNode)
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
  }
}
</style> 