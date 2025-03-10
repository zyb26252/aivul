<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">靶标管理</h2>
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip="{
          effect: 'dark',
          placement: 'top',
          enterable: true,
          popperClass: 'description-tooltip',
          width: '500px',
          showArrow: true
        }">
          <template #default="{ row }">
            <div class="description-cell">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDockerfile(row)">
              查看 Dockerfile
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

      <div v-if="selectedRows.length > 0" class="batch-operation">
        <span class="selected-count">已选择 {{ selectedRows.length }} 项</span>
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加靶标' : '编辑靶标'"
        width="1200px"
        top="5vh"
        class="target-dialog"
      >
        <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 20px">
          <el-step title="基本信息" :class="{ 'is-current': currentStep === 0 }" />
          <el-step title="确认 Dockerfile" :class="{ 'is-current': currentStep === 1 }" />
        </el-steps>

        <!-- 第一步：基本信息 -->
        <el-form
          v-if="currentStep === 0"
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          validate-on-rule-change="false"
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
          <div class="dockerfile-header">
            <el-form-item label="Dockerfile" />
          </div>
          
          <div class="dockerfile-container">
            <div class="dockerfile-column" :class="{ 'full-width': !optimizedDockerfile }">
              <div class="dockerfile-title">
                <span>原始版本</span>
                <el-button
                  v-if="!optimizedDockerfile"
                  type="primary"
                  link
                  :loading="optimizingLoading"
                  @click="handleOptimizeDockerfile"
                >
                  优化 Dockerfile
                </el-button>
              </div>
              <div class="editor-wrapper">
                <MonacoEditor
                  v-model="form.dockerfile"
                  language="dockerfile"
                  :options="{
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    readOnly: optimizedDockerfile !== '',
                    wordWrap: 'on',
                    theme: 'vs'
                  }"
                />
              </div>
            </div>
            <div v-if="optimizedDockerfile" class="dockerfile-column">
              <div class="dockerfile-title">
                <span>优化版本</span>
                <el-button
                  type="primary"
                  link
                  :loading="optimizingLoading"
                  @click="handleOptimizeDockerfile"
                >
                  重新优化
                </el-button>
              </div>
              <div class="editor-wrapper">
                <MonacoEditor
                  v-model="optimizedDockerfile"
                  language="dockerfile"
                  :options="{
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    theme: 'vs'
                  }"
                />
              </div>
            </div>
          </div>

          <div class="dockerfile-footer">
            <el-button
              type="primary"
              link
              :loading="optimizingLoading"
              @click="handleOptimizeDockerfile"
            >
              优化 Dockerfile
            </el-button>
          </div>
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
        title="兼容性分析结果"
        width="60%"
      >
        <div v-loading="compatibilityLoading">
          <div class="markdown-body" v-html="renderedCompatibilityResult"></div>
        </div>
        <template #footer>
          <el-button @click="compatibilityDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 查看 Dockerfile 对话框 -->
      <el-dialog
        v-model="dockerfileDialogVisible"
        title="Dockerfile"
        width="800px"
        class="dockerfile-dialog"
      >
        <div class="dockerfile-container dockerfile-view-container">
          <div class="dockerfile-column full-width">
            <div class="editor-wrapper">
              <MonacoEditor
                v-model="currentDockerfile"
                language="dockerfile"
                :options="{
                  lineNumbers: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  theme: 'vs'
                }"
              />
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="dockerfileDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleSaveDockerfile">
            保存
          </el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElDialog } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getTargets, createTarget, updateTarget, deleteTarget, generateDockerfile } from '@/api/target'
import { getImages } from '@/api/image'
import { getSoftware, checkCompatibility } from '@/api/software'
import { generateDescription, optimizeDockerfile } from '@/api/ai'
import type { Target } from '@/types/target'
import type { Image } from '@/types/image'
import type { Software } from '@/types/software'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { Search } from '@element-plus/icons-vue'
import TableSkeleton from '@/components/TableSkeleton.vue'

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
const selectedRows = ref<Target[]>([])

// 添加查看 Dockerfile 相关的状态
const dockerfileDialogVisible = ref(false)
const currentDockerfile = ref('')
const currentTarget = ref<Target | null>(null)

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
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
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
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
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
        optimizedDockerfile.value = '' // 重置优化后的版本

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
    // 使用优化后的版本（如果有）
    const targetData = {
      ...form.value,
      dockerfile: form.value.dockerfile,
      optimized_dockerfile: optimizedDockerfile.value || null
    }
    
    if (dialogType.value === 'add') {
      await createTarget(targetData)
      ElMessage.success('添加成功')
    } else {
      await updateTarget(form.value.id, targetData)
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
const compatibilityResult = ref<string>('')  // 改为 string 类型

const converter = new window.showdown.Converter()

const renderedCompatibilityResult = computed(() => {
  if (!compatibilityResult.value) return ''
  try {
    return converter.makeHtml(compatibilityResult.value)
  } catch (error) {
    console.error('Markdown rendering error:', error)
    return compatibilityResult.value
  }
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
        const response = await generateDescription(selectedImage, selectedSoftware)

        // 解析返回的数据
        let descriptionText = ''
        
        // 判断响应是否包含result
        if (response && response.result !== undefined) {
          // 直接使用响应中的result
          descriptionText = response.result
        } else if (response && response.data && response.data.result) {
          // 使用响应的data.result属性
          descriptionText = response.data.result
        }
        
        if (descriptionText) {
          form.value.description = descriptionText
        } else {
          form.value.description = ''
          ElMessage.warning('生成的描述为空，请手动填写')
        }
      } catch (error) {
        console.error('Generate description error:', error)
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
    const response = await checkCompatibility(form.value.base_image_id, form.value.software_ids)
    
    // 解析返回数据
    let compatibilityText = ''
    
    // 判断响应是否包含result
    if (response && response.result !== undefined) {
      // 直接使用响应中的result
      compatibilityText = response.result
    } else if (response && response.data && response.data.result) {
      // 使用响应的data.result属性
      compatibilityText = response.data.result
    } else if (typeof response === 'string') {
      // 直接使用字符串响应
      compatibilityText = response
    }
    
    if (compatibilityText) {
      compatibilityResult.value = compatibilityText
      compatibilityDialogVisible.value = true
    } else {
      ElMessage.warning('兼容性检查结果为空')
    }
  } catch (error) {
    console.error('检查软件兼容性时发生错误:', error)
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

// 处理表格选择变化
const handleSelectionChange = (rows: Target[]) => {
  selectedRows.value = rows
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个靶标吗？`, 
      '批量删除确认', 
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    loading.value = true
    try {
      await Promise.all(selectedRows.value.map(row => deleteTarget(row.id)))
      ElMessage.success('批量删除成功')
      await fetchTargets()
      selectedRows.value = []
    } catch (error) {
      ElMessage.error('批量删除失败')
    } finally {
      loading.value = false
    }
  } catch {
    // 用户取消删除
  }
}

// 添加优化相关的状态
const optimizedDockerfile = ref('')
const optimizingLoading = ref(false)

// 处理 Dockerfile 优化
const handleOptimizeDockerfile = async () => {
  if (!form.value.dockerfile) {
    ElMessage.warning('请先生成 Dockerfile')
    return
  }

  optimizingLoading.value = true
  try {
    const response = await optimizeDockerfile(form.value.dockerfile)
    
    // 解析返回数据
    let optimizedText = ''
    
    // 判断响应是否包含result
    if (response && response.result !== undefined) {
      // 直接使用响应中的result
      optimizedText = response.result
    } else if (response && response.data && response.data.result) {
      // 使用响应的data.result属性
      optimizedText = response.data.result
    } else if (typeof response === 'string') {
      // 直接使用字符串响应
      optimizedText = response
    }
    
    if (optimizedText) {
      optimizedDockerfile.value = optimizedText
      form.value.optimized_dockerfile = optimizedText // 将优化后的版本保存到表单中
      ElMessage.success('Dockerfile 优化成功')
    } else {
      ElMessage.warning('优化失败，请稍后重试')
    }
  } catch (error) {
    console.error('优化 Dockerfile 时发生错误:', error)
    ElMessage.error('优化 Dockerfile 时发生错误')
  } finally {
    optimizingLoading.value = false
  }
}

// 处理查看 Dockerfile
const handleViewDockerfile = async (row: Target) => {
  currentTarget.value = row
  // 显示优化后的 Dockerfile（如果有），否则显示原始版本
  currentDockerfile.value = row.optimized_dockerfile || row.dockerfile || ''
  dockerfileDialogVisible.value = true
}

// 处理保存 Dockerfile
const handleSaveDockerfile = async () => {
  if (!currentTarget.value) return
  
  try {
    // 保存修改后的 Dockerfile 到优化版本字段
    await updateTarget(currentTarget.value.id, {
      ...currentTarget.value,
      optimized_dockerfile: currentDockerfile.value
    })
    // 刷新靶标列表
    await fetchTargets()
    ElMessage.success('Dockerfile 已保存')
    dockerfileDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存 Dockerfile 失败')
  }
}

onMounted(() => {
  fetchTargets()
  fetchOptions()
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
  
  .software-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .software-item {
      color: var(--text-regular);
    }
    
    .software-separator {
      color: var(--text-secondary);
    }
  }
  
  .port-tag {
    margin: 2px;
  }
  
  .description-cell {
    color: var(--text-regular);
    line-height: 1.5;
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

.target-dialog {
  :deep(.el-dialog__body) {
    padding: var(--spacing-large);
  }
  
  .el-steps {
    margin-bottom: var(--spacing-large);
    padding: 0 var(--spacing-huge);
  }
  
  .dialog-form {
    padding: 0 var(--spacing-huge);
    
    .el-form-item {
      margin-bottom: var(--spacing-large);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .form-tips {
      margin-top: 4px;
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .compatibility-check {
      margin-top: 8px;
    }
    
    .ports-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      
      .port-tag {
        margin: 2px;
      }
    }
  }
}

.dockerfile-dialog {
  :deep(.el-dialog__body) {
    padding: var(--spacing-large);
  }
}

.dockerfile-container {
  display: flex;
  gap: var(--spacing-large);
  margin: var(--spacing-base) 0;
  
  .dockerfile-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-base);
    
    &.full-width {
      width: 100%;
    }
    
    .dockerfile-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--spacing-base);
      
      span {
        font-weight: 500;
        color: var(--text-primary);
      }
    }
    
    .editor-wrapper {
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-base);
      overflow: hidden;
      height: 500px;
    }
  }
}

.dockerfile-header,
.dockerfile-footer {
  padding: var(--spacing-base) var(--spacing-huge);
  border-bottom: 1px solid var(--border-light);
  
  &:last-child {
    border-bottom: none;
  }
}

.image-option,
.software-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-base);
  
  .architecture-tag {
    flex-shrink: 0;
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
        
        .search-input {
          width: 100%;
        }
      }
    }
  }
  
  .target-dialog {
    .el-steps {
      padding: 0 var(--spacing-base);
    }
    
    .dialog-form {
      padding: 0 var(--spacing-base);
    }
  }
  
  .dockerfile-container {
    flex-direction: column;
    
    .dockerfile-column {
      width: 100%;
      
      .editor-wrapper {
        height: 300px;
      }
    }
  }
  
  .dockerfile-header,
  .dockerfile-footer {
    padding: var(--spacing-base);
  }
}
</style> 