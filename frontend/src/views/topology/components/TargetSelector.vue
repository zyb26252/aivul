<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('scene.topology.targetSelector.title')"
    width="84%"
    class="target-selector-dialog"
    destroy-on-close
  >
    <div class="dialog-content">
      <div class="filter-section">
        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            :placeholder="t('scene.topology.targetSelector.searchPlaceholder')"
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <!-- 筛选区域 -->
        <div class="filters-container">
          <div class="filter-group">
            <div class="filter-item">
              <span class="filter-label">{{ t('table.architecture') }}</span>
              <el-select
                v-model="selectedArchitecture"
                :placeholder="t('scene.topology.targetSelector.allArchitectures')"
                clearable
                @change="applyFilters"
              >
                <el-option
                  v-for="item in architectureOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                  <div class="option-content">
                    <el-icon><Monitor /></el-icon>
                    <span>{{ item }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            
            <div class="filter-item">
              <span class="filter-label">{{ t('table.baseImage') }}</span>
              <el-select
                v-model="selectedBaseImage"
                :placeholder="t('scene.topology.targetSelector.allImages')"
                clearable
                @change="applyFilters"
              >
                <el-option
                  v-for="item in baseImageOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                  <div class="option-content">
                    <el-icon><PictureFilled /></el-icon>
                    <span>{{ item.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            
            <div class="filter-item">
              <span class="filter-label">{{ t('scene.topology.targetSelector.softwareType') }}</span>
              <el-select
                v-model="selectedSoftwareType"
                :placeholder="t('scene.topology.targetSelector.allSoftware')"
                clearable
                @change="applyFilters"
              >
                <el-option
                  v-for="item in softwareTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                  <div class="option-content">
                    <el-icon><Box /></el-icon>
                    <span>{{ item }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>
          
          <el-button 
            type="primary" 
            plain 
            @click="resetFilters"
            class="reset-button"
          >
            <el-icon><Refresh /></el-icon>
            {{ t('scene.topology.targetSelector.resetFilters') }}
          </el-button>
        </div>
        
        <!-- 筛选标签显示 -->
        <div v-if="hasActiveFilters" class="active-filters">
          <el-tag 
            v-if="selectedArchitecture" 
            closable 
            type="info"
            effect="light"
            @close="selectedArchitecture = ''"
            class="filter-tag"
          >
            {{ t('table.architecture') }}: {{ selectedArchitecture }}
          </el-tag>
          <el-tag 
            v-if="selectedBaseImage" 
            closable 
            type="success"
            effect="light"
            @close="selectedBaseImage = ''"
            class="filter-tag"
          >
            {{ t('table.baseImage') }}: {{ getBaseImageName(selectedBaseImage) }}
          </el-tag>
          <el-tag 
            v-if="selectedSoftwareType" 
            closable 
            type="warning"
            effect="light"
            @close="selectedSoftwareType = ''"
            class="filter-tag"
          >
            {{ t('scene.topology.targetSelector.softwareType') }}: {{ selectedSoftwareType }}
          </el-tag>
        </div>
      </div>

      <div class="result-count" v-if="filteredTargets.length > 0">
        {{ t('scene.topology.targetSelector.foundTargets', { count: filteredTargets.length }) }}
      </div>
      <div class="no-data" v-else-if="!loading">
        <el-empty :description="t('scene.topology.targetSelector.noTargetsFound')" />
      </div>

      <el-table
        v-loading="loading"
        :data="filteredTargets"
        style="width: 100%"
        @row-click="handleSelectTarget"
        highlight-current-row
        height="calc(100% - 140px)"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        :row-class-name="tableRowClassName"
        border
      >
        <el-table-column prop="name" :label="t('table.name')" min-width="120">
          <template #default="{ row }">
            <div class="name-cell">
              <el-icon><Suitcase /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('table.baseImage')" min-width="150">
          <template #default="{ row }">
            <el-tooltip
              v-if="row.base_image?.description"
              :content="row.base_image.description"
              placement="top"
              effect="dark"
            >
              <div class="base-image-info">
                <span class="image-name">{{ row.base_image?.name }}</span>
                <el-tag size="small" class="architecture-tag" effect="plain" v-if="row.base_image?.architecture">
                  {{ row.base_image.architecture }}
                </el-tag>
              </div>
            </el-tooltip>
            <div v-else class="base-image-info">
              <span class="image-name">{{ row.base_image?.name }}</span>
              <el-tag size="small" class="architecture-tag" effect="plain" v-if="row.base_image?.architecture">
                {{ row.base_image.architecture }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('table.software')" min-width="200">
          <template #default="{ row }">
            <div class="software-list">
              <template v-for="(item, index) in row.software_list" :key="item.id">
                <el-tooltip
                  v-if="item.description"
                  :content="item.description"
                  placement="top"
                  effect="dark"
                >
                  <el-tag size="small" effect="plain" class="software-tag">
                    {{ item.name }}:{{ item.version }}
                  </el-tag>
                </el-tooltip>
                <el-tag v-else size="small" effect="plain" class="software-tag">
                  {{ item.name }}:{{ item.version }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('table.port')" min-width="120">
          <template #default="{ row }">
            <div class="port-list">
              <el-tag
                v-for="port in row.ports"
                :key="port"
                class="port-tag"
                type="info"
                effect="plain"
                size="small"
              >
                {{ port }}
              </el-tag>
              <el-text v-if="!row.ports?.length" type="info" size="small">
                {{ t('common.none') }}
              </el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('table.description')" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="description-cell">
              <el-text class="description-text">{{ row.description || t('common.noDescription') }}</el-text>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="t('table.createdAt')" min-width="150">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ new Date(row.created_at).toLocaleString() }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text @click.stop="handleSelectTarget(row)">
              <el-icon><Select /></el-icon>
              {{ t('scene.topology.targetSelector.select') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getTargets } from '@/api/target'
import type { Target } from '@/types/target'
import { 
  Search, 
  Monitor, 
  PictureFilled, 
  Box, 
  Refresh, 
  Suitcase,
  Calendar,
  Select
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 对话框可见性
const dialogVisible = ref(false)
const loading = ref(false)
const targets = ref<Target[]>([])
const searchQuery = ref('')

// 筛选相关
const selectedArchitecture = ref('')
const selectedBaseImage = ref('')
const selectedSoftwareType = ref('')

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

// 设置表格行的样式
const tableRowClassName = ({ row, rowIndex }: { row: Target, rowIndex: number }) => {
  if (row.id === props.selectedTargetId) {
    return 'selected-row'
  }
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 筛选选项集合
const architectureOptions = computed(() => {
  const architectures = new Set<string>()
  targets.value.forEach(target => {
    if (target.base_image?.architecture) {
      architectures.add(target.base_image.architecture)
    }
  })
  return Array.from(architectures)
})

const baseImageOptions = computed(() => {
  const baseImages = new Map<number, { id: number, name: string }>()
  targets.value.forEach(target => {
    if (target.base_image) {
      baseImages.set(target.base_image.id, { 
        id: target.base_image.id, 
        name: target.base_image.name 
      })
    }
  })
  return Array.from(baseImages.values())
})

const softwareTypeOptions = computed(() => {
  const softwareTypes = new Set<string>()
  targets.value.forEach(target => {
    target.software_list.forEach(software => {
      // 简化处理：使用软件名称作为类型
      // 实际应用中可能需要从后端获取软件类型
      softwareTypes.add(software.name.split(':')[0])
    })
  })
  return Array.from(softwareTypes)
})

// 是否有激活的筛选
const hasActiveFilters = computed(() => {
  return selectedArchitecture.value !== '' || 
         selectedBaseImage.value !== '' || 
         selectedSoftwareType.value !== ''
})

// 获取基础镜像名称
const getBaseImageName = (id: string | number) => {
  const image = baseImageOptions.value.find(item => item.id === id)
  return image ? image.name : '未知镜像'
}

// 过滤靶标列表
const filteredTargets = computed(() => {
  let result = targets.value

  // 文本搜索过滤
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter(target => 
      target.name.toLowerCase().includes(query) || 
      target.description.toLowerCase().includes(query) ||
      target.base_image?.name.toLowerCase().includes(query) ||
      target.software_list.some(s => s.name.toLowerCase().includes(query))
    )
  }

  // 架构过滤
  if (selectedArchitecture.value) {
    result = result.filter(target => 
      target.base_image?.architecture === selectedArchitecture.value
    )
  }

  // 基础镜像过滤
  if (selectedBaseImage.value) {
    result = result.filter(target => 
      target.base_image?.id === selectedBaseImage.value
    )
  }

  // 软件类型过滤
  if (selectedSoftwareType.value) {
    result = result.filter(target => 
      target.software_list.some(software => 
        software.name.includes(selectedSoftwareType.value)
      )
    )
  }

  return result
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

// 应用筛选
const applyFilters = () => {
  // 筛选已通过 computed 属性自动应用
}

// 重置所有筛选
const resetFilters = () => {
  selectedArchitecture.value = ''
  selectedBaseImage.value = ''
  selectedSoftwareType.value = ''
  searchQuery.value = ''
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
    height: 85vh;
    margin: var(--el-dialog-margin-top) auto 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    
    .el-dialog__body {
      flex: 1;
      overflow-y: hidden;
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .el-dialog__header {
      margin: 0;
      padding: 20px 24px 0;
      border-bottom: 1px solid var(--el-border-color-light);
      
      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }

    .el-dialog__footer {
      margin: 0;
      padding: 16px 24px;
      border-top: 1px solid var(--el-border-color-light);
    }
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .filter-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px dashed var(--el-border-color);
  }

  .search-container {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-start;
    
    .search-input {
      width: 300px;
      margin-right: 16px;
      
      :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px var(--el-border-color) inset;
        transition: all 0.2s;
        
        &:hover, &:focus-within {
          box-shadow: 0 0 0 1px var(--el-color-primary) inset;
        }
      }
    }
  }
  
  .filters-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .filter-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .filter-item {
      display: flex;
      align-items: center;
      
      .filter-label {
        margin-right: 8px;
        white-space: nowrap;
        font-weight: 500;
        color: var(--el-text-color-regular);
      }
      
      .el-select {
        width: 180px;
      }
    }
    
    .reset-button {
      display: flex;
      align-items: center;
      gap: 5px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
  
  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    
    .filter-tag {
      cursor: pointer;
      border-radius: 4px;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }
  
  .result-count {
    margin-bottom: 12px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    
    .count {
      font-weight: bold;
      color: var(--el-color-primary);
      margin: 0 4px;
    }
  }
  
  .el-table {
    flex: 1;
    overflow-y: auto;
    border-radius: 6px;
    
    :deep(.el-table__header-wrapper) {
      th {
        font-weight: 600;
        background-color: #f5f7fa;
      }
    }
    
    :deep(.selected-row) {
      background-color: var(--el-color-primary-light-9);
    }
    
    :deep(.el-table__row) {
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
      
      &.even-row {
        background-color: var(--el-fill-color-light);
      }
    }
  }
  
  .name-cell, .time-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: var(--el-color-primary);
    }
  }
  
  .base-image-info {
    display: flex;
    align-items: center;
    gap: 6px;
    
    .image-name {
      font-weight: 500;
    }
    
    .architecture-tag {
      background-color: var(--el-color-info-light-9);
      color: var(--el-color-info-dark-2);
    }
  }
  
  .software-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    
    .software-tag {
      margin-bottom: 4px;
      background-color: var(--el-color-success-light-9);
      color: var(--el-color-success-dark-2);
      border-color: var(--el-color-success-light-5);
    }
  }
  
  .port-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    
    .port-tag {
      margin-bottom: 4px;
    }
  }
  
  .description-cell {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    .description-text {
      color: var(--el-text-color-regular);
      font-size: 13px;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .option-content {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: var(--el-color-primary);
    }
  }
}
</style> 