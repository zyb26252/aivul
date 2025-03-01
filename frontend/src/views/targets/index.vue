<template>
  <div class="targets-container">
    <div class="header">
      <h2>靶标管理</h2>
      <el-button type="primary" @click="handleAdd">
        添加靶标
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="targets"
      style="width: 100%"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column label="基础镜像">
        <template #default="{ row }">
          {{ row.image?.name }}
        </template>
      </el-table-column>
      <el-table-column label="软件">
        <template #default="{ row }">
          <el-tag
            v-for="item in row.software"
            :key="item.id"
            class="software-tag"
          >
            {{ item.name }} {{ item.version }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="created_at" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="success" link @click="handleGenerate(row)">
            生成Dockerfile
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
      :title="dialogType === 'add' ? '添加靶标' : '编辑靶标'"
      width="600px"
    >
      <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="基本信息" />
        <el-step title="确认 Dockerfile" />
      </el-steps>

      <!-- 第一步：基本信息 -->
      <el-form
        v-if="currentStep === 0"
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入靶标名称" />
        </el-form-item>
        <el-form-item label="基础镜像" prop="image_id">
          <el-select
            v-model="form.image_id"
            placeholder="请选择基础镜像"
            style="width: 100%"
            @change="handleImageChange"
          >
            <el-option-group
              v-for="group in groupedImageList"
              :key="group.architecture"
              :label="group.architecture"
            >
              <el-option
                v-for="item in group.items"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="image-option">
                  <span>{{ item.name }}</span>
                  <el-tag size="small" class="architecture-tag">{{ item.architecture }}</el-tag>
                </div>
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="软件" prop="software_ids">
          <el-select
            v-model="form.software_ids"
            multiple
            filterable
            placeholder="请选择软件"
            style="width: 100%"
            :disabled="!selectedArchitecture"
            @change="handleSoftwareChange"
          >
            <el-option
              v-for="item in filteredSoftwareList"
              :key="item.id"
              :label="`${item.name} ${item.version}`"
              :value="item.id"
            >
              <div class="software-option">
                <span>{{ item.name }} {{ item.version }}</span>
                <el-tag size="small" class="architecture-tag">{{ item.architecture }}</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="form-tips" v-if="!selectedArchitecture">
            <el-text class="text-sm" type="info">请先选择基础镜像</el-text>
          </div>
        </el-form-item>
        <el-form-item label="端口">
          <div class="ports-container">
            <el-tag
              v-for="port in selectedPorts"
              :key="port"
              class="port-tag"
            >
              {{ port }}
            </el-tag>
          </div>
          <div class="form-tips">
            <el-text class="text-sm" type="info">端口列表根据所选软件自动生成</el-text>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入靶标描述"
          />
        </el-form-item>
      </el-form>

      <!-- 第二步：Dockerfile -->
      <el-form
        v-else
        ref="dockerfileFormRef"
        :model="form"
        label-width="100px"
      >
        <el-form-item label="Dockerfile" prop="dockerfile">
          <el-input
            v-model="form.dockerfile"
            type="textarea"
            :rows="15"
            placeholder="请输入或生成 Dockerfile"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <template v-if="currentStep === 0">
          <el-button
            type="primary"
            :loading="generateLoading"
            @click="handleNextStep"
          >
            下一步
          </el-button>
        </template>
        <template v-else>
          <el-button @click="currentStep = 0">上一步</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getTargets, createTarget, updateTarget, deleteTarget, generateDockerfile } from '@/api/target'
import { getImages } from '@/api/image'
import { getSoftwareList } from '@/api/software'
import type { Target } from '@/types/target'
import type { Image } from '@/types/image'
import type { Software } from '@/types/software'

const loading = ref(false)
const targets = ref<Target[]>([])
const images = ref<Image[]>([])
const softwareList = ref<Software[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const generateLoading = ref(false)
const formRef = ref<FormInstance>()
const dockerfileFormRef = ref<FormInstance>()

const form = ref({
  id: 0,
  name: '',
  description: '',
  dockerfile: '',
  image_id: undefined as number | undefined,
  software_ids: [] as number[],
  ports: [] as number[]
})

const rules = {
  name: [
    { required: true, message: '请输入靶标名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  image_id: [
    { required: true, message: '请选择基础镜像', trigger: 'change' }
  ],
  software_ids: [
    { required: true, message: '请选择软件', trigger: 'change' }
  ]
}

// 获取靶标列表
const fetchTargets = async () => {
  loading.value = true
  try {
    targets.value = await getTargets()
  } finally {
    loading.value = false
  }
}

// 获取镜像和软件列表
const fetchOptions = async () => {
  try {
    const [imageRes, softwareRes] = await Promise.all([
      getImages(),
      getSoftwareList()
    ])
    images.value = imageRes
    softwareList.value = softwareRes
  } catch (error) {
    ElMessage.error('获取选项失败')
  }
}

// 添加步骤相关的状态
const currentStep = ref(0)

// 添加靶标
const handleAdd = () => {
  dialogType.value = 'add'
  currentStep.value = 0
  form.value = {
    id: 0,
    name: '',
    description: '',
    dockerfile: '',
    image_id: undefined,
    software_ids: [],
    ports: []
  }
  dialogVisible.value = true
}

// 编辑靶标
const handleEdit = (row: Target) => {
  dialogType.value = 'edit'
  currentStep.value = 0
  form.value = {
    ...row,
    software_ids: row.software?.map(item => item.id) || [],
    ports: row.ports || []
  }
  dialogVisible.value = true
}

// 删除靶标
const handleDelete = async (row: Target) => {
  try {
    await ElMessageBox.confirm('确定要删除该靶标吗？', '提示', {
      type: 'warning'
    })
    await deleteTarget(row.id)
    ElMessage.success('删除成功')
    await fetchTargets()
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

// 生成 Dockerfile（列表操作）
const handleGenerate = async (row: Target) => {
  try {
    const res = await generateDockerfile(row.id)
    ElMessageBox.alert(res.dockerfile, 'Dockerfile', {
      confirmButtonText: '确定'
    })
  } catch (error) {
    // 错误已在请求拦截器中处理
  }
}

// 生成 Dockerfile（表单操作）
const handleNextStep = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      generateLoading.value = true
      try {
        // 获取选中的基础镜像和软件列表
        const selectedImage = images.value.find(img => img.id === form.value.image_id)
        const selectedSoftware = form.value.software_ids.map(id => 
          softwareList.value.find(s => s.id === id)
        ).filter(Boolean)

        if (!selectedImage || selectedSoftware.length === 0) {
          ElMessage.error('请选择基础镜像和软件')
          return
        }

        // 生成 Dockerfile
        let dockerfile = `FROM ${selectedImage.registry_path}:${selectedImage.version}\n\n`
        dockerfile += `LABEL maintainer='${form.value.name}'\n\n`

        // 添加软件安装命令
        dockerfile += '# Install software\n'
        for (const software of selectedSoftware) {
          dockerfile += `# Install ${software.name} ${software.version}\n`
          dockerfile += `RUN ${software.install_command}\n\n`
        }

        // 添加端口暴露
        const ports = new Set<number>()
        selectedSoftware.forEach(software => {
          if (software?.ports) {
            software.ports.forEach(port => ports.add(port))
          }
        })
        if (ports.size > 0) {
          dockerfile += '# Expose ports\n'
          Array.from(ports).sort((a, b) => a - b).forEach(port => {
            dockerfile += `EXPOSE ${port}\n`
          })
          dockerfile += '\n'
        }

        // 添加启动命令
        dockerfile += '# Start commands\n'
        const startCommands: string[] = []
        selectedSoftware.forEach(software => {
          if (software?.start_command) {
            startCommands.push(...software.start_command)
          }
        })
        if (startCommands.length > 0) {
          const combinedCommand = startCommands.join(' & ')
          dockerfile += `CMD ["bash", "-c", "${combinedCommand} & wait"]\n`
        }

        // 更新表单
        form.value.dockerfile = dockerfile
        currentStep.value = 1
      } finally {
        generateLoading.value = false
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await createTarget(form.value)
      ElMessage.success('添加成功')
    } else {
      await updateTarget(form.value.id, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    currentStep.value = 0
    await fetchTargets()
  } finally {
    submitLoading.value = false
  }
}

// 按架构对镜像进行分组
const groupedImageList = computed(() => {
  const groups: { [key: string]: Image[] } = {}
  images.value.forEach(image => {
    if (!groups[image.architecture]) {
      groups[image.architecture] = []
    }
    groups[image.architecture].push(image)
  })
  
  return Object.entries(groups).map(([architecture, items]) => ({
    architecture,
    items: items.sort((a, b) => a.name.localeCompare(b.name))
  }))
})

// 当前选中的架构
const selectedArchitecture = computed(() => {
  if (!form.value.image_id) return ''
  const selectedImage = images.value.find(img => img.id === form.value.image_id)
  return selectedImage?.architecture || ''
})

// 根据架构过滤软件列表
const filteredSoftwareList = computed(() => {
  if (!selectedArchitecture.value) return []
  return softwareList.value
    .filter(software => software.architecture === selectedArchitecture.value)
    .sort((a, b) => a.name.localeCompare(b.name))
})

// 处理镜像选择变化
const handleImageChange = () => {
  // 清空已选软件
  form.value.software_ids = []
}

// 获取选中软件的所有端口
const selectedPorts = computed(() => {
  const ports = new Set<number>()
  form.value.software_ids.forEach(id => {
    const software = softwareList.value.find(s => s.id === id)
    if (software?.ports) {
      software.ports.forEach(port => ports.add(port))
    }
  })
  return Array.from(ports).sort((a, b) => a - b)
})

// 处理软件选择变化
const handleSoftwareChange = () => {
  // 更新端口列表
  form.value.ports = selectedPorts.value
}

onMounted(() => {
  fetchTargets()
  fetchOptions()
})
</script>

<style scoped>
.targets-container {
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

.software-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.software-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.architecture-tag {
  font-size: 12px;
}

.image-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tips {
  margin-top: 8px;
  margin-left: 8px;
}

.ports-container {
  margin-bottom: 8px;
}

.port-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 