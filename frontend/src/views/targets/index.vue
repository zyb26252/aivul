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
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入靶标名称" />
        </el-form-item>
        <el-form-item label="基础镜像" prop="image_id">
          <el-select v-model="form.image_id" placeholder="请选择基础镜像" style="width: 100%">
            <el-option
              v-for="item in images"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="软件" prop="software_ids">
          <el-select
            v-model="form.software_ids"
            multiple
            placeholder="请选择软件"
            style="width: 100%"
          >
            <el-option
              v-for="item in softwareList"
              :key="item.id"
              :label="`${item.name} ${item.version}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入靶标描述"
          />
        </el-form-item>
        <el-form-item label="Dockerfile" prop="dockerfile">
          <el-input
            v-model="form.dockerfile"
            type="textarea"
            :rows="10"
            placeholder="请输入或生成 Dockerfile"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          v-if="dialogVisible"
          type="success"
          :loading="generateLoading"
          @click="handleGenerateDockerfile"
        >
          生成 Dockerfile
        </el-button>
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

const form = ref({
  id: 0,
  name: '',
  description: '',
  dockerfile: '',
  image_id: undefined as number | undefined,
  software_ids: [] as number[]
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

// 添加靶标
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    name: '',
    description: '',
    dockerfile: '',
    image_id: undefined,
    software_ids: []
  }
  dialogVisible.value = true
}

// 编辑靶标
const handleEdit = (row: Target) => {
  dialogType.value = 'edit'
  form.value = {
    ...row,
    software_ids: row.software?.map(item => item.id) || []
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
const handleGenerateDockerfile = async () => {
  if (!formRef.value) return
  
  await formRef.value.validateField(['image_id', 'software_ids'], async (valid) => {
    if (valid && form.value.id) {
      generateLoading.value = true
      try {
        const res = await generateDockerfile(form.value.id)
        form.value.dockerfile = res.dockerfile
        ElMessage.success('生成成功')
      } finally {
        generateLoading.value = false
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
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
        await fetchTargets()
      } finally {
        submitLoading.value = false
      }
    }
  })
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
</style> 