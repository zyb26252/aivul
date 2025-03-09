<!-- 拓扑编辑器主页面 -->
<template>
  <div class="topology-editor">
    <!-- 顶部工具栏 -->
    <div class="topology-toolbar">
      <div class="left">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>拓扑编辑器</h2>
      </div>
      <div class="right">
        <el-button @click="handleReset">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="handleSave">
          保存
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="topology-content">
      <TopologyEditor ref="editorRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, RefreshRight } from '@element-plus/icons-vue'
import TopologyEditor from './components/TopologyEditor.vue'
import { getScene, updateScene } from '@/api/scenes'

const route = useRoute()
const router = useRouter()
const editorRef = ref()

const sceneId = computed(() => Number(route.params.id))

const handleBack = () => {
  router.back()
}

const handleSave = async () => {
  try {
    if (!editorRef.value) {
      throw new Error('编辑器未初始化')
    }

    // 获取编辑器中的拓扑数据
    const topology = editorRef.value.getData()

    // 更新场景数据
    await updateScene(sceneId.value, {
      topology
    })

    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 重置功能
const handleReset = async () => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      '重置将丢失所有未保存的修改，确定要重置吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 重新加载场景数据
    const scene = await getScene(sceneId.value)
    console.log('Scene Response:', scene) // 添加日志
    
    // 如果编辑器已初始化，重新加载数据
    if (editorRef.value) {
      // 确保 topology 存在，如果不存在则使用空对象
      const topology = scene?.topology || {}
      console.log('Loading topology:', topology) // 添加日志
      editorRef.value.setData(topology)
      ElMessage.success('已重置为最后保存的状态')
    } else {
      throw new Error('编辑器未初始化')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '重置失败')
    }
  }
}

onMounted(async () => {
  try {
    // 加载场景数据
    const scene = await getScene(sceneId.value)
    console.log('Scene Response:', scene) // 添加日志
    
    // 如果编辑器已初始化，加载数据
    if (editorRef.value) {
      // 确保 topology 存在，如果不存在则使用空对象
      const topology = scene?.topology || {}
      console.log('Loading topology:', topology) // 添加日志
      editorRef.value.setData(topology)
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
  background-color: var(--el-bg-color);

  .topology-toolbar {
    height: 64px;
    padding: 0 24px;
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--el-bg-color);

    .left {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }
  }

  .topology-content {
    flex: 1;
    overflow: hidden;
  }
}
</style> 