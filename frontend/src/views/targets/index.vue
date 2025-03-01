<template>
  <div class="targets-container">
    <div class="header">
      <div class="header-left">
        <h2>靶标管理</h2>
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
      </div>
      <el-button type="primary" @click="handleAdd">
        添加靶标
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredTargets"
      style="width: 100%"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column label="基础镜像">
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
      <el-table-column label="软件">
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
      <el-table-column label="端口">
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
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="created_at" label="创建时间">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
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
      :title="dialogType === 'add' ? '添加靶标' : '编辑靶标'"
      width="800px"
      top="5vh"
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
        <el-form-item label="基础镜像" prop="base_image_id">
          <el-select
            v-model="form.base_image_id"
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
              :label="`${item.name}:${item.version}`"
              :value="item.id"
            >
              <div class="software-option">
                <span>{{ item.name }}:{{ item.version }}</span>
                <el-tag size="small" class="architecture-tag">{{ item.architecture }}</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="form-tips" v-if="!selectedArchitecture">
            <el-text class="text-sm" type="info">请先选择基础镜像</el-text>
          </div>
          <div class="compatibility-check" v-if="form.software_ids.length > 0">
            <el-button
              type="primary"
              :loading="compatibilityLoading"
              @click="checkSoftwareCompatibility"
              link
            >
              检查软件兼容性
            </el-button>
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
            :rows="6"
            :autosize="{ minRows: 6, maxRows: 10 }"
            placeholder="请输入靶标描述"
            :loading="descriptionLoading"
          />
          <div class="form-tips" v-if="descriptionLoading">
            <el-text class="text-sm" type="info">正在生成描述，请稍候...</el-text>
          </div>
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
          <MonacoEditor
            v-model="form.dockerfile"
            language="dockerfile"
            :options="{
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }"
            style="height: 500px"
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

    <!-- 兼容性分析对话框 -->
    <el-dialog
      v-model="compatibilityDialogVisible"
      title="兼容性分析"
      width="800px"
      top="5vh"
      class="compatibility-dialog"
    >
      <div class="compatibility-content markdown-body" v-html="renderedCompatibilityAnalysis" />
      <template #footer>
        <el-button @click="compatibilityDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          :loading="compatibilityLoading"
          @click="handleConfirmCompatibility"
        >
          继续使用
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElDialog } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getTargets, createTarget, updateTarget, deleteTarget, generateDockerfile } from '@/api/target'
import { getImages } from '@/api/image'
import { getSoftware, checkCompatibility } from '@/api/software'
import { generateDescription } from '@/api/ai'
import type { Target } from '@/types/target'
import type { Image } from '@/types/image'
import type { Software } from '@/types/software'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { Search } from '@element-plus/icons-vue'

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
const searchQuery = ref('')

const form = ref({
  id: 0,
  name: '',
  description: '',
  dockerfile: '',
  base_image_id: undefined as number | undefined,
  software_ids: [] as number[],
  ports: [] as number[]
})

const rules = {
  name: [
    { required: true, message: '请输入靶标名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  base_image_id: [
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
  } finally {
    loading.value = false
  }
}

// 获取镜像和软件列表
const fetchOptions = async () => {
  try {
    const [imageRes, softwareRes] = await Promise.all([
      getImages(),
      getSoftware()
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
    base_image_id: undefined,
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
    software_ids: row.software_list.map(item => item.id),
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
        const selectedImage = images.value.find(img => img.id === form.value.base_image_id)
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
  if (!form.value.base_image_id) return ''
  const selectedImage = images.value.find(img => img.id === form.value.base_image_id)
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
  // 清空已选软件和描述
  form.value.software_ids = []
  form.value.description = ''
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

// 添加一个新的 ref 用于描述生成的加载状态
const descriptionLoading = ref(false)

// 添加防抖定时器
let compatibilityCheckTimer: NodeJS.Timeout | null = null

// 添加兼容性检查的加载状态
const compatibilityLoading = ref(false)

// 添加兼容性分析对话框的状态
const compatibilityDialogVisible = ref(false)
const compatibilityAnalysis = ref('')

// 添加兼容性结果的类型定义
interface CompatibilityResult {
  has_compatibility_issues: boolean
  analysis: string
}

// 添加兼容性结果的状态
const compatibilityResult = ref<CompatibilityResult | null>(null)

// 修改计算属性，优化 markdown 渲染
const renderedCompatibilityAnalysis = computed(() => {
  if (!compatibilityAnalysis.value) return ''
  
  const lines = compatibilityAnalysis.value.split('\n')
  const result = []
  let inCodeBlock = false
  let listItems = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    
    // 处理代码块
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        result.push('<pre><code>')
        continue
      } else {
        inCodeBlock = false
        result.push('</code></pre>')
        continue
      }
    }

    if (inCodeBlock) {
      result.push(line)
      continue
    }

    // 处理加粗文本
    line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // 处理标题
    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^(#{1,6})\s/)[1].length
      const text = line.slice(level + 1)
      result.push(`<h${level}>${text}</h${level}>`)
      continue
    }

    // 处理列表项
    if (line.startsWith('- ')) {
      listItems.push(`<li>${line.slice(2)}</li>`)
      if (!lines[i + 1]?.startsWith('- ') || i === lines.length - 1) {
        result.push('<ul>' + listItems.join('') + '</ul>')
        listItems = []
      }
      continue
    }

    // 处理行内代码
    if (line.includes('`')) {
      line = line.replace(/`([^`]+)`/g, '<code>$1</code>')
    }

    // 处理空行
    if (!line.trim()) {
      result.push('<br>')
      continue
    }

    // 处理普通段落
    result.push(`<p>${line}</p>`)
  }

  return result.join('\n')
})

// 处理软件选择变化
const handleSoftwareChange = async () => {
  // 更新端口列表
  form.value.ports = selectedPorts.value

  // 如果已选择基础镜像和软件，则生成环境描述
  if (form.value.base_image_id && form.value.software_ids.length > 0) {
    try {
      const selectedImage = images.value.find(img => img.id === form.value.base_image_id)
      const selectedSoftware = form.value.software_ids
        .map(id => softwareList.value.find(s => s.id === id))
        .filter(Boolean)

      if (!selectedImage || selectedSoftware.length === 0) {
        return
      }

      // 生成环境描述
      descriptionLoading.value = true
      try {
        // 构建提示文本
        const prompt = `这是一个基于 ${selectedImage.name} ${selectedImage.version} (${selectedImage.architecture}) 的靶标环境，包含以下软件：${selectedSoftware.map(s => `${s.name} ${s.version}`).join('、')}。请生成一个简短的中文描述，说明这个靶标环境的主要用途和特点。`
        const response = await generateDescription(prompt)
        if (response) {
          form.value.description = response
        } else {
          form.value.description = ''
          ElMessage.warning('生成的描述为空，请手动填写')
        }
      } catch (error) {
        form.value.description = ''  // 清空描述，让用户手动填写
        ElMessage.error('生成描述失败，请手动填写')
      } finally {
        descriptionLoading.value = false
      }
    } catch (error) {
      ElMessage.error('处理软件选择时发生错误')
    }
  }
}

// 检查软件兼容性
const checkSoftwareCompatibility = async () => {
  if (!form.value.base_image_id || form.value.software_ids.length === 0) {
    ElMessage.warning('请先选择基础镜像和软件')
    return
  }

  compatibilityLoading.value = true
  try {
    const result = await checkCompatibility(form.value.base_image_id, form.value.software_ids)
    compatibilityResult.value = result
    compatibilityAnalysis.value = result.analysis
    compatibilityDialogVisible.value = true
  } catch (error) {
    ElMessage.error('检查软件兼容性时发生错误')
  } finally {
    compatibilityLoading.value = false
  }
}

// 根据搜索关键词过滤靶标列表
const filteredTargets = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return targets.value
  return targets.value.filter(target => 
    target.name.toLowerCase().includes(query)
  )
})

// 处理搜索输入
const handleSearch = () => {
  // 这里可以添加防抖逻辑如果需要
}

// 添加处理兼容性确认的函数
const handleConfirmCompatibility = async () => {
  compatibilityDialogVisible.value = false
  // 如果没有兼容性问题，不需要进一步操作
  if (!compatibilityResult.value?.has_compatibility_issues) {
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要继续使用这些软件吗？',
      '确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    // 用户点击了取消，清空最后选择的软件
    form.value.software_ids = form.value.software_ids.slice(0, -1)
  }
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

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.header h2 {
  margin: 0;
}

.search-container {
  margin-top: 8px;
}

.search-input {
  width: 200px;
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

.software-list {
  line-height: 1.5;
  color: var(--el-text-color-regular);
  display: inline-block;
}

.software-item {
  color: var(--el-color-primary);
  cursor: pointer;
}

.software-separator {
  margin: 0 2px;
  color: var(--el-text-color-regular);
}

:deep(.el-dialog) {
  margin-top: 5vh !important;
}

:deep(.el-dialog__body) {
  max-height: 75vh;
  overflow-y: auto;
  padding: 20px 30px;
}

:deep(.monaco-editor) {
  min-height: 500px;
}

.compatibility-check {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.compatibility-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.compatibility-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
}

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: var(--el-fill-color-light);
  border-radius: 3px;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--el-fill-color-light);
  border-radius: 3px;
}

.markdown-body pre code {
  display: inline;
  max-width: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: transparent;
  border: 0;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: var(--el-text-color-regular);
  border-left: 0.25em solid var(--el-border-color);
  margin: 0 0 16px;
}
</style> 