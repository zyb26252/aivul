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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Scene } from '@/types/scene'

const props = defineProps<{
  loading: boolean
  scenes: Scene[]
}>()

const selectedRows = ref<Scene[]>([])

const handleSelectionChange = (rows: Scene[]) => {
  selectedRows.value = rows
  emit('selection-change', rows)
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
</style> 