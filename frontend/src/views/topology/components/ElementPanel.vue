<template>
  <div class="element-panel">
    <div 
      class="element-item" 
      draggable="true" 
      @dragstart="handleDragStart('container')"
    >
      <div class="element-icon">
        <img :src="containerIcon" alt="容器" />
      </div>
      <div class="element-label">{{ t('scene.topology.node.types.container') }}</div>
    </div>
    <div 
      class="element-item" 
      draggable="true" 
      @dragstart="handleDragStart('switch')"
    >
      <div class="element-icon">
        <img :src="switchIcon" alt="交换机" />
      </div>
      <div class="element-label">{{ t('scene.topology.node.types.switch') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 使用与节点相同的容器图标
const containerIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IkRvY2tlciIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3QKd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiCnJ4PSIxNSUiCmZpbGw9IiNmZmYiLz48cGF0aCBzdHJva2U9IiMwNjZkYTUiIHN0cm9rZS13aWR0aD0iMzgiIGQ9Ik0yOTYgMjI2aDQybS05MiAwaDQybS05MSAwaDQybS05MSAwaDQxbS05MSAwaDQybTgtNDZoNDFtOCAwaDQybTcgMGg0Mm0tNDItNDZoNDIiLz48cGF0aCBmaWxsPSIjMDY2ZGE1IiBkPSJtNDcyIDIyOHMtMTgtMTctNTUtMTFjLTQtMjktMzUtNDYtMzUtNDZzLTI5IDM1LTggNzRjLTYgMy0xNiA3LTMxIDdINjhjLTUgMTktNSAxNDUgMTMzIDE0NSA5OSAwIDE3My00NiAyMDgtMTMwIDUyIDQgNjMtMzkgNjMtMzkiLz48L3N2Zz4='

// 使用与节点相同的交换机图标
const switchIcon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgIHZpZXdCb3g9IjAgMCAzNiAzNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+bmV0d29yay1zd2l0Y2gtbGluZTwvdGl0bGU+CiAgICA8cGF0aCBkPSJNMzMuOTEsMTguNDcsMzAuNzgsOC40MUEyLDIsMCwwLDAsMjguODcsN0g3LjEzQTIsMiwwLDAsMCw1LjIyLDguNDFMMi4wOSwxOC40OGEyLDIsMCwwLDAtLjA5LjU5VjI3YTIsMiwwLDAsMCwyLDJIMzJhMiwyLDAsMCwwLDItMlYxOS4wNkEyLDIsMCwwLDAsMzMuOTEsMTguNDdaTTMyLDI3SDRWMTkuMDZMNy4xMyw5SDI4Ljg3TDMyLDE5LjA2WiIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTEiPjwvcGF0aD48cmVjdCB4PSI3LjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMiI+PC9yZWN0PjxyZWN0IHg9IjEyLjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMyI+PC9yZWN0PjxyZWN0IHg9IjE3LjExIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtNCI+PC9yZWN0PjxyZWN0IHg9IjIyLjEiIHk9IjIyIiB3aWR0aD0iMS44IiBoZWlnaHQ9IjMiIGNsYXNzPSJjbHItaS1vdXRsaW5lIGNsci1pLW91dGxpbmUtcGF0aC01Ij48L3JlY3Q+PHJlY3QgeD0iMjcuMSIgeT0iMjIiIHdpZHRoPSIxLjgiIGhlaWdodD0iMyIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTYiPjwvcmVjdD48cmVjdCB4PSI2LjIzIiB5PSIxOCIgd2lkdGg9IjIzLjY5IiBoZWlnaHQ9IjEuNCIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTciPjwvcmVjdD4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgZmlsbC1vcGFjaXR5PSIwIi8+Cjwvc3ZnPg=='

// 处理拖拽开始事件
const handleDragStart = (type: string) => {
  const element = {
    type,
    id: `${type}_${Date.now()}`
  }
  event?.dataTransfer?.setData('element', JSON.stringify(element))
}
</script>

<style lang="scss" scoped>
.element-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .element-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: grab;
    transition: all 0.2s ease;
    background-color: var(--el-bg-color-page);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: var(--el-color-primary-light-5);
    }

    &:active {
      cursor: grabbing;
    }

    .element-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }
    }

    .element-label {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-top: 4px;
    }
  }
}
</style> 