<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">{{ $t('software.title') }}</h2>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              :placeholder="$t('software.searchPlaceholder')"
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-select
              v-model="selectedArchitecture"
              :placeholder="$t('software.selectArchitecture')"
              clearable
              @change="handleSearch"
              class="architecture-select"
            >
              <el-option label="x86" value="x86" />
              <el-option label="arm" value="arm" />
            </el-select>
          </div>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>{{ $t('software.addButton') }}
        </el-button>
      </div>

      <div class="main-content">
        <el-card class="table-card">
          <el-table
            v-loading="loading"
            :data="filteredSoftwareList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" :label="$t('table.name')" min-width="150">
              <template #default="{ row }">
                <div class="name-column">
                  <span class="name">{{ row.name }}</span>
                  <el-tag size="small" type="info" v-if="row.version">v{{ row.version }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="description" :label="$t('table.description')" min-width="200" show-overflow-tooltip />
            <el-table-column prop="architecture" :label="$t('table.architecture')" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.architecture === 'x86' ? 'success' : 'warning'">
                  {{ row.architecture }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="port" :label="$t('table.port')" min-width="120">
              <template #default="{ row }">
                <div class="port-tags">
                  <el-tag
                    v-for="port in (row.ports || [])"
                    :key="port"
                    size="small"
                    class="port-tag"
                  >
                    {{ port }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" :label="$t('table.createdAt')" width="180">
              <template #default="{ row }">
                {{ new Date(row.created_at).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('table.operation')" width="240" fixed="right">
              <template #default="{ row }">
                <div class="operation-column">
                  <el-button type="primary" link @click="handleDetail(row)">
                    <el-icon><View /></el-icon>{{ $t('common.detail') }}
                  </el-button>
                  <el-button type="primary" link @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>{{ $t('common.edit') }}
                  </el-button>
                  <el-button type="danger" link @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>{{ $t('common.delete') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="selectedRows.length > 0" class="batch-operation">
            <span class="selected-count">{{ $t('common.selected') }} {{ selectedRows.length }} {{ $t('common.items') }}</span>
            <el-button type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>{{ $t('common.batchDelete') }}
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="$t('software.detail.title')"
        width="700px"
        destroy-on-close
      >
        <div class="detail-container">
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.name') }}：</span>
            <span>{{ detailData.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.version') }}：</span>
            <span>{{ detailData.version }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.architecture') }}：</span>
            <el-tag size="small" :type="detailData.architecture === 'x86' ? 'success' : 'warning'">
              {{ detailData.architecture }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.osType') }}：</span>
            <span>{{ detailData.os_type }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.ports') }}：</span>
            <div class="detail-content">
              <el-tag
                v-for="port in (detailData.ports || [])"
                :key="port"
                size="small"
                class="port-tag"
              >
                {{ port }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.installCommand') }}：</span>
            <div class="detail-content">
              <pre class="detail-text">{{ detailData.install_command }}</pre>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.startCommand') }}：</span>
            <div class="detail-content command-container">
              <el-tag
                v-for="(command, index) in (detailData.start_command || [])"
                :key="command"
                :class="{ 'command-main': index === 0 }"
              >
                {{ command }}
              </el-tag>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.description') }}：</span>
            <div class="detail-content">
              <pre class="detail-text">{{ detailData.description }}</pre>
            </div>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('software.detail.createdAt') }}：</span>
            <span>{{ new Date(detailData.created_at).toLocaleString() }}</span>
          </div>
        </div>
      </el-dialog>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="$t(dialogType === 'add' ? 'software.form.addTitle' : 'software.form.editTitle')"
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
          <el-form-item :label="$t('software.form.name')" prop="name">
            <el-input v-model="form.name" :placeholder="$t('software.form.namePlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('software.form.version')" prop="version">
            <el-input v-model="form.version" :placeholder="$t('software.form.versionPlaceholder')" />
          </el-form-item>
          <el-form-item :label="$t('software.form.architecture')" prop="architecture">
            <el-select v-model="form.architecture" :placeholder="$t('software.form.architecturePlaceholder')" class="full-width">
              <el-option label="x86" value="x86" />
              <el-option label="arm" value="arm" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('software.form.installCommand')" prop="install_command">
            <el-input
              v-model="form.install_command"
              type="textarea"
              :rows="4"
              :placeholder="$t('software.form.installCommandPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="$t('software.form.ports')" prop="ports">
            <div class="port-container">
              <el-tag
                v-for="port in form.ports"
                :key="port"
                closable
                size="small"
                class="port-tag"
                @close="handleRemovePort(port)"
              >
                {{ port }}
              </el-tag>
              <el-input
                v-if="portInputVisible"
                ref="portInputRef"
                v-model="portInputValue"
                class="port-input"
                size="small"
                @keyup.enter="handleAddPort"
                @blur="handleAddPort"
              />
              <el-button
                v-else
                class="button-new-port"
                size="small"
                @click="showPortInput"
              >
                <el-icon><Plus /></el-icon>{{ $t('software.form.addPort') }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="$t('software.form.startCommand')" prop="start_command">
            <div class="command-container">
              <el-tag
                v-for="(command, index) in form.start_command"
                :key="command"
                closable
                :class="{ 'command-main': index === 0 }"
                @close="handleRemoveCommand(command)"
              >
                {{ command }}
              </el-tag>
              <el-input
                v-if="commandInputVisible"
                ref="commandInputRef"
                v-model="commandInputValue"
                class="command-input"
                :placeholder="form.start_command.length === 0 ? $t('software.form.addMainCommand') : $t('software.form.addParameter')"
                size="small"
                @keyup.enter="handleAddCommand"
                @blur="handleAddCommand"
              />
              <el-button
                v-else
                class="button-new-command"
                size="small"
                @click="showCommandInput"
              >
                <el-icon><Plus /></el-icon>
                {{ form.start_command.length === 0 ? $t('software.form.addMainCommand') : $t('software.form.addParameter') }}
              </el-button>
            </div>
            <div class="command-tips" v-if="form.start_command.length === 0">
              <el-text class="text-sm" type="info">{{ $t('software.form.commandTip') }}</el-text>
            </div>
          </el-form-item>
          <el-form-item :label="$t('software.form.description')" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              :placeholder="$t('software.form.descriptionPlaceholder')"
            />
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, View, Edit, ArrowDown } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getSoftware, createSoftware, updateSoftware, deleteSoftware } from '@/api/software'
import type { Software } from '@/types/software'
import TableSkeleton from '@/components/TableSkeleton.vue'

const loading = ref(false)
const softwareList = ref<Software[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const searchQuery = ref('')
const selectedArchitecture = ref('')
const selectedRows = ref<Software[]>([])

const form = ref({
  id: 0,
  name: '',
  version: '',
  description: '',
  architecture: '',
  os_type: 'linux',
  install_command: '',
  ports: [],
  start_command: []
})

const rules = {
  name: [
    { required: true, message: '请输入软件名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入软件版本', trigger: 'blur' }
  ],
  architecture: [
    { required: true, message: '请选择架构', trigger: 'change' }
  ],
  install_command: [
    { required: true, message: '请输入安装命令', trigger: 'blur' }
  ],
  ports: [
    { required: true, message: '请至少添加一个端口', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少添加一个端口', trigger: 'change' }
  ],
  start_command: [
    { required: true, message: '请输入启动命令', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少输入主命令', trigger: 'change' }
  ]
}

// 端口输入相关
const portInputRef = ref()
const portInputVisible = ref(false)
const portInputValue = ref('')

// 显示端口输入框
const showPortInput = () => {
  portInputVisible.value = true
  nextTick(() => {
    portInputRef.value?.input?.focus()
  })
}

// 添加端口
const handleAddPort = () => {
  if (portInputValue.value) {
    const port = parseInt(portInputValue.value)
    if (port >= 1 && port <= 65535 && !form.value.ports.includes(port)) {
      form.value.ports.push(port)
    }
  }
  portInputVisible.value = false
  portInputValue.value = ''
}

// 移除端口
const handleRemovePort = (port: number) => {
  const index = form.value.ports.indexOf(port)
  if (index !== -1) {
    form.value.ports.splice(index, 1)
  }
}

// 启动命令输入相关
const commandInputRef = ref()
const commandInputVisible = ref(false)
const commandInputValue = ref('')

// 显示命令输入框
const showCommandInput = () => {
  commandInputVisible.value = true
  nextTick(() => {
    commandInputRef.value?.input?.focus()
  })
}

// 添加命令参数
const handleAddCommand = () => {
  if (commandInputValue.value) {
    if (!form.value.start_command.includes(commandInputValue.value)) {
      form.value.start_command.push(commandInputValue.value)
    }
  }
  commandInputVisible.value = false
  commandInputValue.value = ''
}

// 移除命令参数
const handleRemoveCommand = (command: string) => {
  const index = form.value.start_command.indexOf(command)
  if (index !== -1) {
    form.value.start_command.splice(index, 1)
  }
}

// 获取软件列表
const fetchSoftware = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (selectedArchitecture.value) {
      params.append('architecture', selectedArchitecture.value)
    }
    softwareList.value = await getSoftware(params)
  } catch (error) {
    ElMessage.error('获取软件列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索和筛选
const handleSearch = () => {
  fetchSoftware()
}

// 添加软件
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    name: '',
    version: '',
    description: '',
    architecture: '',
    os_type: 'linux',
    install_command: '',
    ports: [],
    start_command: []
  }
  dialogVisible.value = true
}

// 编辑软件
const handleEdit = (row: Software) => {
  dialogType.value = 'edit'
  form.value = {
    ...row,
    ports: [...(row.ports || [])],
    start_command: Array.isArray(row.start_command) ? [...row.start_command] : row.start_command ? [row.start_command] : []
  }
  dialogVisible.value = true
}

// 删除软件
const handleDelete = async (row: Software) => {
  try {
    await ElMessageBox.confirm($t('software.messages.deleteConfirm'), $t('common.tips'), {
      type: 'warning'
    })
    await deleteSoftware(row.id)
    ElMessage.success($t('software.messages.deleteSuccess'))
    await fetchSoftware()
  } catch (error) {
    // 用户取消删除或删除失败
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
          await createSoftware(form.value)
          ElMessage.success('添加成功')
        } else {
          await updateSoftware(form.value.id, form.value)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        await fetchSoftware()
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const detailDialogVisible = ref(false)
const detailData = ref<Software>({
  id: 0,
  name: '',
  version: '',
  description: '',
  architecture: '',
  os_type: 'linux',
  install_command: '',
  ports: [],
  start_command: []
})

// 查看详情
const handleDetail = (row: Software) => {
  detailData.value = { ...row }
  detailDialogVisible.value = true
}

// 根据搜索和架构筛选软件列表
const filteredSoftwareList = computed(() => {
  let result = softwareList.value
  
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter(software => 
      software.name.toLowerCase().includes(query)
    )
  }
  
  if (selectedArchitecture.value) {
    result = result.filter(software => 
      software.architecture === selectedArchitecture.value
    )
  }
  
  return result
})

// 处理表格选择变化
const handleSelectionChange = (rows: Software[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      $t('software.messages.batchDeleteConfirm', { count: selectedRows.value.length }), 
      $t('common.batchDelete'), 
      {
        type: 'warning',
        confirmButtonText: $t('common.confirm'),
        cancelButtonText: $t('common.cancel')
      }
    )
    
    loading.value = true
    try {
      await Promise.all(selectedRows.value.map(row => deleteSoftware(row.id)))
      ElMessage.success($t('software.messages.batchDeleteSuccess'))
      await fetchSoftware()
      selectedRows.value = []
    } catch (error) {
      ElMessage.error($t('software.messages.batchDeleteFailed'))
    } finally {
      loading.value = false
    }
  } catch {
    // 用户取消删除
  }
}

onMounted(() => {
  fetchSoftware()
})
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

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
      
      .architecture-select {
        width: 120px;
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
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .port-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .port-tag {
      margin: 0;
    }
  }
}

.batch-operation {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  margin-top: var(--spacing-base);
  padding: var(--spacing-base);
  background: var(--bg-light);
  border-radius: var(--border-radius-base);
  
  .selected-count {
    color: var(--text-secondary);
    font-size: 14px;
  }
  
  .el-button {
    .el-icon {
      margin-right: 4px;
    }
  }
}

.detail-container {
  padding: var(--spacing-large);
  
  .detail-item {
    margin-bottom: var(--spacing-large);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      font-weight: 500;
      color: var(--text-regular);
      width: 100px;
      display: inline-block;
      vertical-align: top;
    }
    
    .detail-content {
      display: inline-block;
      width: calc(100% - 110px);
      
      .port-tag {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
    
    .detail-text {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: monospace;
      color: var(--text-regular);
      background: var(--bg-light);
      padding: var(--spacing-base);
      border-radius: var(--border-radius-base);
      border: 1px solid var(--border-light);
    }
  }
}

.command-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  
  .command-main {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.command-input {
  width: 200px;
  margin-left: 8px;
}

.command-tips {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 12px;
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

.operation-column {
  display: flex;
  gap: 4px;
  justify-content: flex-start;
  
  .el-button {
    padding: 4px 8px;
    height: auto;
    
    .el-icon {
      margin-right: 2px;
    }
  }
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
        
        .search-input,
        .architecture-select {
          width: 100%;
        }
      }
    }
  }
  
  .detail-container {
    padding: var(--spacing-base);
    
    .detail-item {
      .detail-label {
        width: 100%;
        margin-bottom: var(--spacing-mini);
      }
      
      .detail-content {
        width: 100%;
      }
    }
  }
  
  .dialog-form {
    padding: var(--spacing-base);
  }
}
</style> 