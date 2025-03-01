<template>
  <div class="software-container">
    <div class="header">
      <h2>软件管理</h2>
      <el-button type="primary" @click="handleAdd">
        添加软件
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索软件名称或描述"
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
        placeholder="选择架构"
        clearable
        @change="handleSearch"
        class="architecture-select"
      >
        <el-option label="x86" value="x86" />
        <el-option label="arm" value="arm" />
      </el-select>
    </div>

    <el-table
      v-loading="loading"
      :data="softwareList"
      style="width: 100%"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="version" label="版本" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="architecture" label="架构" />
      <el-table-column label="端口">
        <template #default="{ row }">
          <el-tag
            v-for="port in (row.ports || [])"
            :key="port"
            class="port-tag"
          >
            {{ port }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleDetail(row)">
            详情
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="软件详情"
      width="600px"
    >
      <div class="detail-container">
        <div class="detail-item">
          <span class="detail-label">名称：</span>
          <span>{{ detailData.name }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">版本：</span>
          <span>{{ detailData.version }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">架构：</span>
          <span>{{ detailData.architecture }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">操作系统：</span>
          <span>{{ detailData.os_type }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">端口：</span>
          <div class="detail-content">
            <el-tag
              v-for="port in (detailData.ports || [])"
              :key="port"
              class="port-tag"
            >
              {{ port }}
            </el-tag>
          </div>
        </div>
        <div class="detail-item">
          <span class="detail-label">安装命令：</span>
          <div class="detail-content">
            <pre class="detail-text">{{ detailData.install_command }}</pre>
          </div>
        </div>
        <div class="detail-item">
          <span class="detail-label">启动命令：</span>
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
          <span class="detail-label">描述：</span>
          <div class="detail-content">
            <pre class="detail-text">{{ detailData.description }}</pre>
          </div>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间：</span>
          <span>{{ new Date(detailData.created_at).toLocaleString() }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加软件' : '编辑软件'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入软件名称" />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入软件版本" />
        </el-form-item>
        <el-form-item label="架构" prop="architecture">
          <el-select v-model="form.architecture" placeholder="请选择架构">
            <el-option label="x86" value="x86" />
            <el-option label="arm" value="arm" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装命令" prop="install_command">
          <el-input
            v-model="form.install_command"
            type="textarea"
            placeholder="请输入软件安装命令"
          />
        </el-form-item>
        <el-form-item label="端口" prop="ports">
          <el-tag
            v-for="port in form.ports"
            :key="port"
            closable
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
            + 添加端口
          </el-button>
        </el-form-item>
        <el-form-item label="启动命令" prop="start_command">
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
              :placeholder="form.start_command.length === 0 ? '输入主命令' : '输入命令参数'"
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
              {{ form.start_command.length === 0 ? '+ 添加主命令' : '+ 添加参数' }}
            </el-button>
          </div>
          <div class="command-tips" v-if="form.start_command.length === 0">
            <el-text class="text-sm" type="info">例如：httpd 作为主命令，-DFOREGROUND 作为参数</el-text>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入软件描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getSoftwareList, createSoftware, updateSoftware, deleteSoftware } from '@/api/software'
import type { Software } from '@/types/software'

const loading = ref(false)
const softwareList = ref<Software[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const searchQuery = ref('')
const selectedArchitecture = ref('')

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
const fetchSoftwareList = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (selectedArchitecture.value) {
      params.append('architecture', selectedArchitecture.value)
    }
    const response = await getSoftwareList(params)
    softwareList.value = response
  } catch (error) {
    console.error('获取软件列表失败:', error)
    ElMessage.error('获取软件列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索和筛选
const handleSearch = () => {
  fetchSoftwareList()
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
    await ElMessageBox.confirm('确定要删除该软件吗？', '提示', {
      type: 'warning'
    })
    await deleteSoftware(row.id)
    ElMessage.success('删除成功')
    await fetchSoftwareList()
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
        await fetchSoftwareList()
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

onMounted(() => {
  fetchSoftwareList()
})
</script>

<style scoped>
.software-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.architecture-select {
  width: 120px;
}

.port-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.port-input {
  width: 100px;
  margin-left: 8px;
  vertical-align: bottom;
}

.button-new-port {
  margin-left: 8px;
  height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.command-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.command-main {
  background-color: #409eff;
  color: white;
}

.command-input {
  width: 200px;
  margin-left: 8px;
  vertical-align: bottom;
}

.button-new-command {
  margin-left: 8px;
  height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.command-tips {
  margin-top: 8px;
  margin-left: 8px;
  color: #909399;
}

.detail-container {
  padding: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
  display: inline-block;
  width: 100px;
  vertical-align: top;
}

.detail-content {
  display: inline-block;
  width: calc(100% - 110px);
}

.detail-text {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  color: #606266;
}
</style> 