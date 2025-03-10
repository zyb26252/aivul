<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">实例管理</h2>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              placeholder="搜索实例名称"
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
          <el-icon><Plus /></el-icon>创建实例
        </el-button>
      </div>

      <div class="main-content">
        <el-card class="table-card">
          <el-table
            v-loading="loading"
            :data="instances"
            style="width: 100%"
          >
            <el-table-column prop="name" label="名称" min-width="150">
              <template #default="{ row }">
                <div class="name-column">
                  <span class="name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="靶标" min-width="150">
              <template #default="{ row }">
                <el-tag size="small" type="info">
                  {{ row.target?.name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small" class="status-tag">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="端口映射" min-width="200" show-overflow-tooltip>
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
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.created_at).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'stopped'"
                  type="success"
                  link
                  @click="handleStart(row)"
                >
                  启动
                </el-button>
                <el-button
                  v-if="row.status === 'running'"
                  type="warning"
                  link
                  @click="handleStop(row)"
                >
                  停止
                </el-button>
                <el-button type="primary" link @click="handleEdit(row)">
                  编辑
                </el-button>
                <el-button type="danger" link @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '创建实例' : '编辑实例'"
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
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入实例名称" />
          </el-form-item>
          <el-form-item v-if="dialogType === 'add'" label="靶标" prop="target_id">
            <el-select v-model="form.target_id" placeholder="请选择靶标" class="full-width">
              <el-option
                v-for="item in targets"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="dialogType === 'add'" label="端口映射">
            <div class="port-mappings-form">
              <div v-for="(mapping, index) in portMappings" :key="index" class="port-mapping">
                <el-input-number
                  v-model="mapping.host_port"
                  :min="1"
                  :max="65535"
                  placeholder="主机端口"
                  class="port-input"
                />
                <span class="port-separator">:</span>
                <el-input-number
                  v-model="mapping.container_port"
                  :min="1"
                  :max="65535"
                  placeholder="容器端口"
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
                <el-icon><Plus /></el-icon>添加端口映射
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              确定
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
    { required: true, message: '请输入实例名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  target_id: [
    { required: true, message: '请选择靶标', trigger: 'change' }
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
    ElMessage.error('获取靶标列表失败')
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

// 解析端口映射字符串
const parsePortMappings = (mappings: string): PortMapping[] => {
  try {
    return JSON.parse(mappings)
  } catch {
    return []
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types = {
    running: 'success',
    stopped: 'info',
    error: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts = {
    running: '运行中',
    stopped: '已停止',
    error: '错误'
  }
  return texts[status] || status
}

// 添加实例
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    name: '',
    target_id: undefined
  }
  portMappings.value = [
    { host_port: undefined, container_port: undefined, protocol: 'tcp' }
  ]
  dialogVisible.value = true
}

// 编辑实例
const handleEdit = (row: Instance) => {
  dialogType.value = 'edit'
  form.value = {
    ...row,
    target_id: row.target_id
  }
  dialogVisible.value = true
}

// 删除实例
const handleDelete = async (row: Instance) => {
  try {
    await ElMessageBox.confirm('确定要删除该实例吗？', '提示', {
      type: 'warning'
    })
    await deleteInstance(row.id)
    ElMessage.success('删除成功')
    await fetchInstances()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

// 启动实例
const handleStart = async (row: Instance) => {
  try {
    await startInstance(row.id)
    ElMessage.success('启动成功')
    await fetchInstances()
  } catch (error) {
    // 错误已在请求拦截器中处理
  }
}

// 停止实例
const handleStop = async (row: Instance) => {
  try {
    await stopInstance(row.id)
    ElMessage.success('停止成功')
    await fetchInstances()
  } catch (error) {
    // 错误已在请求拦截器中处理
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
          const validPortMappings = portMappings.value.filter(
            m => m.host_port && m.container_port
          )
          await createInstance({
            ...form.value,
            port_mappings: JSON.stringify(validPortMappings)
          })
          ElMessage.success('创建成功')
        } else {
          await updateInstance(form.value.id, {
            name: form.value.name
          })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        await fetchInstances()
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