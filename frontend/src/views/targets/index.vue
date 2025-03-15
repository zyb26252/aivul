<template>
  <div class="page-container">
    <TableSkeleton v-if="loading" />
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">{{ t('targets.title') }}</h2>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              :placeholder="t('targets.searchPlaceholder')"
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
          {{ t('targets.addButton') }}
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredTargets"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" :label="t('table.name')" />
        <el-table-column :label="t('table.baseImage')">
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
        <el-table-column :label="t('table.software')">
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
        <el-table-column :label="t('table.port')">
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
              {{ t('common.none') }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="description" :label="t('table.description')" min-width="300" :show-overflow-tooltip="{
          effect: 'dark',
          placement: 'top',
          enterable: true,
          popperClass: 'description-tooltip',
          width: '500px',
          showArrow: true
        }">
          <template #default="{ row }">
            <div class="description-cell">{{ row.description || t('common.noDescription') }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="t('table.createdAt')">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column :label="t('table.operation')" width="300">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDockerfile(row)">
              {{ t('targets.viewDockerfile') }}
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <div v-if="selectedRows.length > 0" class="batch-operation">
        <span class="selected-count">{{ t('common.selected') }} {{ selectedRows.length }} {{ t('common.items') }}</span>
        <el-button type="danger" @click="handleBatchDelete">{{ t('common.batchDelete') }}</el-button>
      </div>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? t('targets.form.addTitle') : t('targets.form.editTitle')"
        width="1200px"
        top="5vh"
        class="target-dialog"
      >
        <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 20px">
          <el-step :title="t('targets.steps.basicInfo')" :class="{ 'is-current': currentStep === 0 }" />
          <el-step :title="t('targets.steps.dockerfile')" :class="{ 'is-current': currentStep === 1 }" />
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
          <el-form-item :label="t('table.name')" prop="name">
            <el-input v-model="form.name" :placeholder="t('targets.form.namePlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('table.baseImage')" prop="base_image_id">
            <el-select
              v-model="form.base_image_id"
              :placeholder="t('targets.form.selectBaseImage')"
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
                    <span>{{ item.name }}:{{ item.version }}</span>
                    <el-tag size="small" class="architecture-tag">{{ item.architecture }}</el-tag>
                  </div>
                </el-option>
              </el-option-group>
            </el-select>
            <div v-if="selectedImage" class="selected-image-info">
              <el-text class="text-sm">{{ selectedImage.name }}:{{ selectedImage.version }}</el-text>
            </div>
          </el-form-item>
          <el-form-item :label="t('table.software')" prop="software_ids">
            <el-select
              v-model="form.software_ids"
              multiple
              filterable
              :placeholder="t('targets.form.selectSoftware')"
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
              <el-text class="text-sm" type="info">{{ t('targets.form.selectBaseImageFirst') }}</el-text>
            </div>
            <div class="compatibility-check" v-if="form.software_ids.length > 0">
              <el-button
                type="primary"
                :loading="compatibilityLoading"
                @click="checkSoftwareCompatibility"
                link
              >
                {{ t('targets.form.checkCompatibility') }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="t('table.port')">
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
              <el-text class="text-sm" type="info">{{ t('targets.form.portsAutoGenerated') }}</el-text>
            </div>
          </el-form-item>
          <el-form-item :label="t('table.description')" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="6"
              :autosize="{ minRows: 6, maxRows: 10 }"
              :placeholder="t('targets.form.descriptionPlaceholder')"
              :loading="descriptionLoading"
            />
            <div class="form-tips" v-if="descriptionLoading">
              <el-text class="text-sm" type="info">{{ t('targets.form.generatingDescription') }}</el-text>
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
                <span>{{ optimizedDockerfile ? '原始版本' : 'Dockerfile' }}</span>
                <!-- 优化按钮仅在原始视图中显示 -->
                <el-button
                  v-if="!optimizedDockerfile"
                  type="primary"
                  link
                  :loading="optimizingLoading"
                  @click="handleMonacoOptimize(form.dockerfile)"
                >
                  优化Dockerfile
                </el-button>
              </div>
              <div class="editor-wrapper">
                <MonacoEditor
                  v-model="form.dockerfile"
                  language="dockerfile"
                  :readOnly="!!optimizedDockerfile"
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
            
            <!-- 优化后的Dockerfile列 -->
            <div v-if="optimizedDockerfile" class="dockerfile-column">
              <div class="dockerfile-title">
                <span>优化版本</span>
                <el-button
                  type="primary"
                  link
                  :loading="optimizingLoading"
                  @click="handleMonacoOptimize(form.dockerfile)"
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
import { ref, onMounted, computed, nextTick } from 'vue'
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const hasNextPage = ref(false)

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
    const params = new URLSearchParams()
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    
    // 添加分页参数
    params.append('skip', ((currentPage.value - 1) * pageSize.value).toString())
    params.append('limit', (pageSize.value + 1).toString()) // 多请求一条数据，用于判断是否有下一页
    
    const data = await getTargets(params)
    
    // 判断是否有下一页
    hasNextPage.value = data.length > pageSize.value
    
    // 如果返回的数据超过了页大小，则截取前pageSize条数据
    const displayData = hasNextPage.value ? data.slice(0, pageSize.value) : data
    
    targets.value = displayData.map(target => ({
      ...target,
      ports: target.software_list?.reduce((acc: number[], software) => {
        if (software.ports) {
          acc.push(...software.ports)
        }
        return acc
      }, []).sort((a, b) => a - b) || []
    }))
    
    // 计算总数
    // 如果当前页是第一页，且返回的数据量小于页大小，则总数就是返回的数据量
    if (currentPage.value === 1 && data.length < pageSize.value + 1) {
      totalCount.value = data.length
    } 
    // 如果有下一页，则总数至少是当前页的数据加上下一页的一条数据
    else if (hasNextPage.value) {
      totalCount.value = Math.max(totalCount.value, currentPage.value * pageSize.value + 1)
    } 
    // 如果没有下一页，且不是第一页，则总数是前面所有页的数据量加上当前页的数据量
    else if (!hasNextPage.value && currentPage.value > 1) {
      totalCount.value = (currentPage.value - 1) * pageSize.value + data.length
    }
    
    // 如果当前页没有数据，但不是第一页，回到上一页
    if (data.length === 0 && currentPage.value > 1) {
      currentPage.value--
      await fetchTargets()
    }
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

// 当前选中的镜像
const selectedImage = computed(() => {
  if (!form.value.base_image_id) return null
  return images.value.find(img => img.id === form.value.base_image_id) || null
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
        // 构建符合API要求的请求数据格式
        const requestData = {
          image: {
            name: selectedImage.name,
            version: selectedImage.version,
            architecture: selectedImage.architecture
          },
          software_list: selectedSoftware.map(sw => ({
            name: sw.name,
            version: sw.version,
            architecture: sw.architecture
          }))
        }
        
        // 发送请求
        const response = await generateDescription(requestData)

        // 解析返回的数据
        let descriptionText = ''
        
        // 判断响应是否包含result
        if (response && typeof response === 'string') {
          // 如果直接返回字符串
          descriptionText = response
        } else if (response && response.result !== undefined) {
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
        console.error('生成描述错误:', error)
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
  return targets.value
})

// 处理搜索输入
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchTargets()
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

// 处理双列模式变化
const handleDualModeChange = (isDual: boolean) => {
  // 如果模式变为单列，清空优化后的Dockerfile
  if (!isDual) {
    optimizedDockerfile.value = ''
  }
}

// 处理Monaco编辑器的优化请求
const handleMonacoOptimize = async (dockerfile: string) => {
  if (!dockerfile) {
    ElMessage.warning('请先生成Dockerfile')
    return
  }
  
  optimizingLoading.value = true
  try {
    const response = await optimizeDockerfile(dockerfile)
    
    // 解析返回数据
    let optimizedText = ''
    
    // 判断响应是否包含result
    if (response && response.result !== undefined) {
      optimizedText = response.result
    } else if (response && response.data && response.data.result) {
      optimizedText = response.data.result
    } else if (typeof response === 'string') {
      optimizedText = response
    }
    
    if (optimizedText) {
      // 设置优化后的内容
      optimizedDockerfile.value = optimizedText
      form.value.optimized_dockerfile = optimizedText
      
      // 确保更新UI
      await nextTick()
      
      ElMessage.success('Dockerfile优化成功')
    } else {
      ElMessage.warning('优化失败，请稍后重试')
    }
  } catch (error) {
    console.error('优化Dockerfile时发生错误:', error)
    ElMessage.error('优化Dockerfile时发生错误')
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

// 处理页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  fetchTargets()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchTargets()
}

onMounted(() => {
  fetchTargets()
  fetchOptions()
})
</script>

<style lang="scss">
@use '@/styles/common.scss' as *;

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
  gap: 16px;
  height: 600px;
}

.dockerfile-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--border-radius-base);
}

.dockerfile-column.full-width {
  width: 100%;
}

/* 调整双列模式下的宽度比例 */
.dockerfile-container:not(.dockerfile-view-container) .dockerfile-column:first-child:not(.full-width) {
  flex: 0 0 50%;
  width: 50%;
}

.dockerfile-container:not(.dockerfile-view-container) .dockerfile-column:last-child {
  flex: 0 0 50%;
  width: 50%;
}

.dockerfile-title {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-wrapper {
  flex: 1;
  height: calc(100% - 48px);
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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
    height: auto;
    
    .dockerfile-column,
    .dockerfile-column:first-child:not(.full-width),
    .dockerfile-column:last-child {
      width: 100%;
      flex: none;
      margin-bottom: 16px;
      
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

<style scoped>
.targets-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.image-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.software-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.architecture-tag {
  margin-left: 8px;
}

.port-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.port-tag {
  margin-right: 4px;
}

.ports-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.form-tips {
  margin-top: 4px;
  color: #909399;
}

.compatibility-check {
  margin-top: 8px;
}

.dockerfile-container {
  display: flex;
  gap: 20px;
  height: 400px;
}

.dockerfile-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dockerfile-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}

.editor-wrapper {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.selected-image-info {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}
</style>