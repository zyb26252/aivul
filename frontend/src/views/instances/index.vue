<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">{{ $t('instances.title') }}</h2>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              :placeholder="$t('instances.searchPlaceholder')"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>{{ $t('instances.addButton') }}
        </el-button>
      </div>

      <div class="main-content">
        <el-card class="table-card">
          <el-table
            v-loading="loading"
            :data="instances"
            style="width: 100%"
          >
            <el-table-column prop="name" :label="$t('table.name')" min-width="150">
              <template #default="{ row }">
                <div class="name-column">
                  <span class="name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.target')" min-width="150">
              <template #default="{ row }">
                <el-tag size="small" type="info">
                  {{ row.target?.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small" class="status-tag">
                  {{ $t(`instances.status.${row.status}`) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('instances.portMappings')" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <template v-if="row.port_mappings">
                  <div class="port-mappings">
                    <el-tag
                      v-for="mapping in parsePortMappings(row.port_mappings)"
                      :key="mapping.container_port"
                      size="small"
                      class="port-tag"
                    >
                      {{ mapping.host_port }}:{{ mapping.container_port }}/{{ mapping.protocol }}
                    </el-tag>
                  </div>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" :label="$t('table.createdAt')" width="180">
              <template #default="{ row }">
                {{ new Date(row.created_at).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.operation')" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'stopped'"
                  type="success"
                  link
                  @click="handleStart(row)"
                >
                  {{ $t('instances.operation.start') }}
                </el-button>
                <el-button
                  v-if="row.status === 'running'"
                  type="warning"
                  link
                  @click="handleStop(row)"
                >
                  {{ $t('instances.operation.stop') }}
                </el-button>
                <el-button type="primary" link @click="handleEdit(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-button type="danger" link @click="handleDelete(row)">
                  {{ $t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? $t('instances.form.addTitle') : $t('instances.form.editTitle')"
        width="600px"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="dialog-form"
        >
          <el-form-item :label="$t('table.name')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('instances.form.namePlaceholder')" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'add'" :label="$t('table.target')" prop="target_id">
            <el-select v-model="form.target_id" :placeholder="$t('instances.form.targetPlaceholder')" class="full-width">
              <el-option
                v-for="item in targets"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dialogType === 'add'" :label="$t('instances.form.portMappings')">
            <div class="port-mappings-form">
              <div v-for="(mapping, index) in portMappings" :key="index" class="port-mapping">
                <el-input-number
                  v-model="mapping.host_port"
                  :min="1"
                  :max="65535"
                  :placeholder="$t('instances.form.hostPort')"
                  class="port-input"
                />
                <span class="port-separator">:</span>
                <el-input-number
                  v-model="mapping.container_port"
                  :min="1"
                  :max="65535"
                  :placeholder="$t('instances.form.containerPort')"
                  class="port-input"
                />
                <el-select v-model="mapping.protocol" class="protocol-select">
                  <el-option label="TCP" value="tcp" />
                  <el-option label="UDP" value="udp" />
                </el-select>
                <el-button type="danger" link @click="removePortMapping(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" link @click="addPortMapping" class="add-mapping-btn">
                <el-icon><Plus /></el-icon>{{ $t('instances.form.addPortMapping') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              {{ $t('common.confirm') }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance } from 'element-plus'
import {
  getInstances,
  createInstance,
  updateInstance,
  deleteInstance,
  startInstance,
  stopInstance
} from '@/api/instance'
import { getTargets } from '@/api/target'
import type { Instance, PortMapping } from '@/types/instance'
import type { Target } from '@/types/target'
import TableSkeleton from '@/components/TableSkeleton.vue'

const { t } = useI18n()
const loading = ref(false)
const instances = ref<Instance[]>([])
const targets = ref<Target[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  id: 0,
  name: '',
  target_id: undefined as number | undefined
})

const portMappings = ref<PortMapping[]>([
  { host_port: undefined, container_port: undefined, protocol: 'tcp' }
])

const rules = {
  name: [
    { required: true, message: t('instances.form.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('common.lengthLimit', { min: 2, max: 50 }), trigger: 'blur' }
  ],
  target_id: [
    { required: true, message: t('instances.form.targetRequired'), trigger: 'change' }
  ]
}

// 获取实例列表
const fetchInstances = async () => {
  loading.value = true
  try {
    instances.value = await getInstances()
  } finally {
    loading.value = false
  }
}

// 获取靶标列表
const fetchTargets = async () => {
  try {
    targets.value = await getTargets()
  } catch (error) {
    ElMessage.error(t('instances.messages.getTargetsFailed'))
  }
}

// 添加端口映射
const addPortMapping = () => {
  portMappings.value.push({
    host_port: undefined,
    container_port: undefined,
    protocol: 'tcp'
  })
}

// 删除端口映射
const removePortMapping = (index: number) => {
  portMappings.value.splice(index, 1)
}

// 解析端口映射
const parsePortMappings = (mappings: string) => {
  try {
    return JSON.parse(mappings)
  } catch {
    return []
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    running: 'success',
    stopped: 'info',
    failed: 'danger',
    starting: 'warning',
    stopping: 'warning',
    restarting: 'warning'
  }
  return statusMap[status] || 'info'
}

// 添加实例
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.value = {
    id: 0,
    name: '',
    target_id: undefined
  }
  portMappings.value = [{ host_port: undefined, container_port: undefined, protocol: 'tcp' }]
}

// 编辑实例
const handleEdit = (row: Instance) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  form.value = {
    id: row.id,
    name: row.name,
    target_id: row.target_id
  }
}

// 删除实例
const handleDelete = (row: Instance) => {
  ElMessageBox.confirm(
    t('instances.messages.deleteConfirm'),
    t('common.tips'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteInstance(row.id)
      ElMessage.success(t('instances.messages.deleteSuccess'))
      fetchInstances()
    } catch {
      ElMessage.error(t('instances.messages.deleteFailed'))
    }
  })
}

// 启动实例
const handleStart = async (row: Instance) => {
  try {
    await startInstance(row.id)
    ElMessage.success(t('instances.messages.startSuccess'))
    fetchInstances()
  } catch {
    ElMessage.error(t('instances.messages.startFailed'))
  }
}

// 停止实例
const handleStop = async (row: Instance) => {
  try {
    await stopInstance(row.id)
    ElMessage.success(t('instances.messages.stopSuccess'))
    fetchInstances()
  } catch {
    ElMessage.error(t('instances.messages.stopFailed'))
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await createInstance({
            ...form.value,
            port_mappings: JSON.stringify(portMappings.value)
          })
          ElMessage.success(t('instances.messages.addSuccess'))
        } else {
          await updateInstance(form.value)
          ElMessage.success(t('instances.messages.updateSuccess'))
        }
        dialogVisible.value = false
        fetchInstances()
      } catch (error) {
        ElMessage.error(dialogType.value === 'add' 
          ? t('instances.messages.addFailed')
          : t('instances.messages.updateFailed')
        )
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchInstances()
  fetchTargets()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: var(--spacing-large);
  background: var(--bg-color);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-large);
  
  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-large);
    
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .search-container {
      display: flex;
      gap: var(--spacing-base);
      
      .search-input {
        width: 320px;
      }
    }
  }
  
  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}

.main-content {
  background: var(--bg-lighter);
  border-radius: var(--border-radius-base);
  
  .table-card {
    background: transparent;
    border: none;
    
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

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
  
  .port-mappings {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .port-tag {
      margin: 2px;
    }
  }
}

.status-tag {
  &.el-tag--success {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    color: #52c41a;
  }
  
  &.el-tag--warning {
    background-color: #fff7e6;
    border-color: #ffd591;
    color: #fa8c16;
  }
  
  &.el-tag--danger {
    background-color: #fff1f0;
    border-color: #ffa39e;
    color: #f5222d;
  }
  
  &.el-tag--info {
    background-color: #f5f5f5;
    border-color: #d9d9d9;
    color: #8c8c8c;
  }
}

.port-mappings-form {
  .port-mapping {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .port-input {
      width: 120px;
    }
    
    .protocol-select {
      width: 90px;
    }
    
    .port-separator {
      color: var(--text-secondary);
      font-weight: bold;
    }
  }
  
  .add-mapping-btn {
    margin-top: 8px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}

.dialog-form {
  padding: var(--spacing-large) var(--spacing-huge);
  
  .el-form-item {
    margin-bottom: var(--spacing-large);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .full-width {
    width: 100%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-base);
}

// 响应式布局
@media screen and (max-width: 768px) {
  .page-container {
    padding: var(--spacing-base);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-base);
    
    .header-left {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      
      .search-container {
        flex-direction: column;
        
        .search-input {
          width: 100%;
        }
      }
    }
  }
  
  .port-mappings-form {
    .port-mapping {
      flex-wrap: wrap;
      
      .port-input,
      .protocol-select {
        width: 100%;
      }
      
      .port-separator {
        display: none;
      }
    }
  }
  
  .dialog-form {
    padding: var(--spacing-base);
  }
}
</style> 