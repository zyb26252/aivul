<template>
  <div class="element-panel">
    <div
      v-for="element in elements"
      :key="element.type"
      class="element-item"
      draggable="true"
      @dragstart="handleDragStart($event, element)"
    >
      <el-image :src="element.icon" class="element-icon" />
      <span class="element-name">{{ element.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Element {
  type: string
  name: string
  icon: string
}

const elements: Element[] = [
  {
    type: 'container',
    name: t('scene.topology.node.types.container'),
    icon: '/public/icons/container.svg',
  },
  {
    type: 'switch',
    name: t('scene.topology.node.types.switch'),
    icon: '/public/icons/switch.svg',
  },
]

const handleDragStart = (e: DragEvent, element: Element) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('element', JSON.stringify(element))
    e.dataTransfer.effectAllowed = 'copy'
  }
}
</script>

<style lang="scss" scoped>
.element-panel {
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  .element-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    cursor: move;
    user-select: none;
    margin-bottom: 8px;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .element-icon {
      width: 24px;
      height: 24px;
    }

    .element-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }
}
</style> 