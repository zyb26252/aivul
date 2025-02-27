<template>
  <div class="instances-container">
    <div class="header">
      <h2>实例管理</h2>
      <el-button type="primary" @click="handleAdd">
        创建实例
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="instances"
      style="width: 100%"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column label="靶标">
        <template #default="{ row }">
          {{ row.target?.name }}
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="端口映射" show-overflow-tooltip>
        <template #default="{ row }">
          <template v-if="row.port_mappings">
            <div v-for="mapping in parsePortMappings(row.port_mappings)" :key="mapping.container_port">
              {{ mapping.host_port }}:{{ mapping.container_port }}/{{ mapping.protocol }}
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '创建实例' : '编辑实例'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入实例名称" />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="靶标" prop="target_id">
          <el-select v-model="form.target_id" placeholder="请选择靶标" style="width: 100%">
            <el-option
              v-for="item in targets"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="端口映射">
          <div v-for="(mapping, index) in portMappings" :key="index" class="port-mapping">
            <el-input-number
              v-model="mapping.host_port"
              :min="1"
              :max="65535"
              placeholder="主机端口"
            />
            <span class="port-separator">:</span>
            <el-input-number
              v-model="mapping.container_port"
              :min="1"
              :max="65535"
              placeholder="容器端口"
            />
            <el-select v-model="mapping.protocol" style="width: 90px">
              <el-option label="TCP" value="tcp" />
              <el-option label="UDP" value="udp" />
            </el-select>
            <el-button type="danger" link @click="removePortMapping(index)">
              删除
            </el-button>
          </div>
          <el-button type="primary" link @click="addPortMapping">
            添加端口映射
          </el-button>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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

<style scoped>
.instances-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

.port-mapping {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.port-separator {
  margin: 0 5px;
}
</style> 