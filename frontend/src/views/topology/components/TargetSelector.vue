<template>
  <el-dialog
    v-model="dialogVisible"
    title="选择靶标"
    width="80%"
    class="target-selector-dialog"
    destroy-on-close
  >
    <div class="dialog-content">
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索靶标名称"
          class="search-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredTargets"
        style="width: 100%"
        @row-click="handleSelectTarget"
        highlight-current-row
        height="calc(100% - 60px)"
      >
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column label="基础镜像" min-width="150">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.base_image?.description"
              :content="row.base_image.description"
              placement="right"
              effect="dark"
            >
              <span>
                {{ row.base_image?.name }}
                <el-tag size="small" class="architecture-tag" v-if="row.base_image?.architecture">
                  {{ row.base_image.architecture }}
                </el-tag>
              </span>
            </el-tooltip>
            <span v-else>
              {{ row.base_image?.name }}
              <el-tag size="small" class="architecture-tag" v-if="row.base_image?.architecture">
                {{ row.base_image.architecture }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="软件" min-width="200">
          <template #default="{ row }">
            <div class="software-list">
              <template v-for="(item, index) in row.software_list" :key="item.id">
                <el-tooltip
                  v-if="item.description"
                  :content="item.description"
                  placement="right"
                  effect="dark"
                >
                  <span class="software-item">{{ item.name }}:{{ item.version }}</span>
                </el-tooltip>
                <span v-else class="software-item">{{ item.name }}:{{ item.version }}</span>
                <span v-if="index < row.software_list.length - 1" class="software-separator">, </span>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="端口" min-width="120">
          <template #default="{ row }">
            <el-tag
              v-for="port in row.ports"
              :key="port"
              class="port-tag"
              type="info"
              size="small"
            >
              {{ port }}
            </el-tag>
            <el-text v-if="!row.ports?.length" type="info" size="small">
              无
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" min-width="150">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleSelectTarget(row)">
              选择
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getTargets } from '@/api/target'
import type { Target } from '@/types/target'
import { Search } from '@element-plus/icons-vue'

// 对话框可见性
const dialogVisible = ref(false)
const loading = ref(false)
const targets = ref<Target[]>([])
const searchQuery = ref('')

// 定义事件和接收props
const props = defineProps<{
  visible: boolean
  selectedTargetId?: number
}>()

const emit = defineEmits(['update:visible', 'select'])

// 监听对话框可见性
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    fetchTargets()
  }
})

// 监听对话框内部状态变化
watch(() => dialogVisible.value, (val) => {
  emit('update:visible', val)
})

// 过滤靶标列表
const filteredTargets = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return targets.value
  return targets.value.filter(target => 
    target.name.toLowerCase().includes(query) || 
    target.description.toLowerCase().includes(query) ||
    target.base_image?.name.toLowerCase().includes(query) ||
    target.software_list.some(s => s.name.toLowerCase().includes(query))
  )
})

// 获取靶标列表
const fetchTargets = async () => {
  loading.value = true
  try {
    const data = await getTargets()
    targets.value = data.map(target => ({
      ...target,
      ports: target.software_list?.reduce((acc: number[], software) => {
        if (software.ports) {
          acc.push(...software.ports)
        }
        return acc
      }, []).sort((a, b) => a - b) || []
    }))
  } catch (error) {
    console.error('获取靶标列表失败', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  // 这里可以添加防抖逻辑
}

// 处理选择靶标
const handleSelectTarget = (row: Target) => {
  emit('select', row)
  dialogVisible.value = false
}

// 组件挂载时加载数据
onMounted(() => {
  if (props.visible) {
    fetchTargets()
  }
})
</script>

<style lang="scss" scoped>
.target-selector-dialog {
  :deep(.el-dialog) {
    --el-dialog-margin-top: 5vh;
    height: 80vh;
    margin: var(--el-dialog-margin-top) auto 0;
    display: flex;
    flex-direction: column;
    
    .el-dialog__body {
      flex: 1;
      overflow-y: hidden;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .el-dialog__header {
      margin: 0;
      padding: 20px 20px 0;
    }

    .el-dialog__footer {
      margin: 0;
      padding: 0 20px 20px;
      border-top: 1px solid var(--el-border-color-light);
    }
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .search-container {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-start;
    
    .search-input {
      width: 300px;
    }
  }
  
  .el-table {
    flex: 1;
    overflow-y: auto;
  }
  
  .architecture-tag {
    margin-left: 8px;
  }
  
  .software-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .software-item {
      color: var(--el-text-color-regular);
    }
    
    .software-separator {
      color: var(--el-text-color-secondary);
    }
  }
  
  .port-tag {
    margin-right: 6px;
    margin-bottom: 4px;
  }
}
</style> 