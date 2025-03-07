<template>
  <div class="property-panel">
    <div v-if="selectedNode" class="panel-content">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="formData.name" @change="handleNameChange" />
        </el-form-item>
        
        <!-- 容器节点特有属性 -->
        <template v-if="formData.type === 'container'">
          <el-form-item label="CPU">
            <el-input-number 
              v-model="formData.properties.cpu" 
              :min="0.1" 
              :max="32" 
              :step="0.1"
              @change="handlePropertyChange" 
            />
          </el-form-item>
          <el-form-item label="内存(GB)">
            <el-input-number 
              v-model="formData.properties.memory" 
              :min="0.5" 
              :max="128" 
              :step="0.5"
              @change="handlePropertyChange" 
            />
          </el-form-item>
        </template>

        <!-- 交换机节点特有属性 -->
        <template v-if="formData.type === 'switch'">
          <el-form-item label="带宽">
            <el-select 
              v-model="formData.properties.bandwidth" 
              @change="handlePropertyChange"
            >
              <el-option label="1Gbps" value="1" />
              <el-option label="10Gbps" value="10" />
              <el-option label="25Gbps" value="25" />
              <el-option label="40Gbps" value="40" />
              <el-option label="100Gbps" value="100" />
            </el-select>
          </el-form-item>
          <el-form-item label="VLAN">
            <el-input-number 
              v-model="formData.properties.vlan" 
              :min="1" 
              :max="4094"
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
import { ref, watch } from 'vue'
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

// 监听选中节点变化
watch(() => props.selectedNode, (node) => {
  if (node) {
    formData.value = {
      name: node.attrs?.label?.text ?? '',
      type: node.data?.type ?? '',
      properties: node.data?.properties ?? {}
    }
  } else {
    formData.value = {
      name: '',
      type: '',
      properties: {}
    }
  }
}, { immediate: true })

// 处理名称变更
const emit = defineEmits(['update:node'])
const handleNameChange = () => {
  if (props.selectedNode) {
    emit('update:node', {
      ...props.selectedNode,
      attrs: {
        ...props.selectedNode.attrs,
        label: {
          ...props.selectedNode.attrs?.label,
          text: formData.value.name
        }
      }
    })
  }
}

// 处理属性变更
const handlePropertyChange = () => {
  if (props.selectedNode) {
    emit('update:node', {
      ...props.selectedNode,
      data: {
        ...props.selectedNode.data,
        properties: formData.value.properties
      }
    })
  }
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