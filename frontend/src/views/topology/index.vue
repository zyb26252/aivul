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
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
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

onMounted(async () => {
  try {
    // 加载场景数据
    const scene = await getScene(sceneId.value)
    
    // 如果有拓扑数据，加载到编辑器中
    if (scene.topology && editorRef.value) {
      editorRef.value.setData(scene.topology)
    }
  } catch (error) {
    console.error('加载场景失败:', error)
    ElMessage.error('加载场景失败')
  }
})
</script>

<style lang="scss" scoped>
.topology-editor {
  height: 100vh;
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