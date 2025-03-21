<!-- 拓扑编辑器主页面 -->
<template>
  <div class="topology-editor">
    <!-- 顶部工具栏 -->
    <div class="topology-toolbar">
      <div class="left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          {{ t('common.back') }}
        </el-button>
        <h2 class="page-title">{{ t('scene.topology.topologyEditor') }}</h2>
      </div>
      <div class="right">
        <el-button @click="handleReset">
          <el-icon><RefreshRight /></el-icon>
          {{ t('common.reset') }}
        </el-button>
        <el-button type="primary" @click="handleSave">
          <el-icon><Check /></el-icon>
          {{ t('common.save') }}
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="topology-content">
      <TopologyEditor ref="editorRef" @save="handleSave" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, RefreshRight, Check } from '@element-plus/icons-vue'
import TopologyEditor from './components/TopologyEditor.vue'
import { getScene, updateScene } from '@/api/scene'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const editorRef = ref()
const lastSavedData = ref<string>('')  // 添加最后保存的数据引用

const sceneId = computed(() => Number(route.params.id))

// 检查是否有未保存的更改
const hasUnsavedChanges = () => {
  if (!editorRef.value) return false
  const currentData = JSON.stringify(editorRef.value.getData())
  return currentData !== lastSavedData.value
}

const handleBack = async () => {
  // 检查是否有未保存的更改
  if (hasUnsavedChanges()) {
    try {
      await ElMessageBox.confirm(
        t('scene.topology.messages.unsavedChanges'),
        t('common.tips'),
        {
          confirmButtonText: t('scene.topology.messages.confirmLeave'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
        }
      )
      // 用户确认离开
      router.back()
    } catch (error) {
      // 用户取消离开，不做任何操作
    }
  } else {
    // 没有未保存的更改，直接返回
    router.back()
  }
}

const handleSave = async () => {
  try {
    if (!editorRef.value) {
      throw new Error(t('scene.topology.messages.editorNotInitialized'))
    }

    // 获取编辑器中的拓扑数据
    const topology = editorRef.value.getData()

    // 更新场景数据
    await updateScene(sceneId.value, {
      topology
    })

    // 保存成功后更新最后保存的数据
    lastSavedData.value = JSON.stringify(topology)

    ElMessage.success(t('scene.topology.messages.saveSuccess'))
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(t('scene.topology.messages.saveFailed'))
  }
}

// 重置功能
const handleReset = async () => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      t('scene.topology.messages.resetConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
      }
    )

    // 重新加载场景数据
    const scene = await getScene(sceneId.value)
    console.log('Scene Response:', scene)
    
    // 如果编辑器已初始化，重新加载数据
    if (editorRef.value) {
      // 确保 topology 存在，如果不存在则使用空对象
      const topology = scene?.topology || {}
      console.log('Loading topology:', topology)
      editorRef.value.setData(topology)
      ElMessage.success(t('scene.topology.messages.resetSuccess'))
    } else {
      throw new Error(t('scene.topology.messages.editorNotInitialized'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置失败:', error)
      ElMessage.error(error instanceof Error ? error.message : t('scene.topology.messages.resetFailed'))
    }
  }
}

onMounted(async () => {
  try {
    // 加载场景数据
    const scene = await getScene(sceneId.value)
    console.log('Scene Response:', scene)
    
    // 如果编辑器已初始化，加载数据
    if (editorRef.value) {
      // 确保 topology 存在，如果不存在则使用空对象
      const topology = scene?.topology || {}
      console.log('Loading topology:', topology)
      editorRef.value.setData(topology)
      // 初始化最后保存的数据
      lastSavedData.value = JSON.stringify(topology)
    } else {
      throw new Error('编辑器未初始化')
    }
  } catch (error) {
    console.error('加载场景失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '加载场景失败')
  }
})
</script>

<style lang="scss" scoped>
.topology-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);

  .topology-toolbar {
    height: 64px;
    padding: 0 var(--spacing-large);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-lighter);

    .left {
      display: flex;
      align-items: center;
      gap: var(--spacing-large);

      .page-title {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .el-button {
        .el-icon {
          margin-right: 4px;
        }
      }
    }
    
    .right {
      display: flex;
      align-items: center;
      gap: var(--spacing-base);
      
      .el-button {
        .el-icon {
          margin-right: 4px;
        }
      }
    }
  }

  .topology-content {
    flex: 1;
    overflow: hidden;
    background: var(--bg-lighter);
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .topology-editor {
    .topology-toolbar {
      height: auto;
      padding: var(--spacing-base);
      flex-direction: column;
      gap: var(--spacing-base);
      
      .left,
      .right {
        width: 100%;
        justify-content: space-between;
      }
    }
  }
}
</style> 