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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import TopologyEditor from './components/TopologyEditor.vue'

const route = useRoute()
const router = useRouter()
const editorRef = ref()

const handleBack = () => {
  router.back()
}

const handleSave = async () => {
  try {
    // TODO: 实现保存逻辑
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  // TODO: 加载拓扑数据
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