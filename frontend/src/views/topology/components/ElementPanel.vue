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
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGQ9Ik04MzIgNjRIMTkyYy0xNy43IDAtMzIgMTQuMy0zMiAzMnY4MzJjMCAxNy43IDE0LjMgMzIgMzIgMzJoNjQwYzE3LjcgMCAzMi0xNC4zIDMyLTMyVjk2YzAtMTcuNy0xNC4zLTMyLTMyLTMyem0tNDAgODI0SDIzMlY2ODdoOTcuOWMxMS42IDMyLjggMzIgNjIuMyA1OS4xIDg0LjcgMzQuNSAyOC41IDc4LjIgNDQuMyAxMjMgNDQuM3M4OC41LTE1LjcgMTIzLTQ0LjNjMjcuMS0yMi40IDQ3LjUtNTEuOSA1OS4xLTg0LjdINzkydi02M0g2NDMuNmwtNS4yIDI0LjdDNjI2LjQgNzA4LjUgNTczLjIgNzUyIDUxMiA3NTJzLTExNC40LTQzLjUtMTI2LjUtMTAzLjNsLTUuMi0yNC43SDIzMlYxMzZoNTYwdjc1MnoiIGZpbGw9IiMxODkwZmYiLz48cGF0aCBkPSJNMzIwIDM0MWgzODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMzIwYy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4em0wIDE2MGgzODRjNC40IDAgOC0zLjYgOC04di00OGMwLTQuNC0zLjYtOC04LThIMzIwYy00LjQgMC04IDMuNi04IDh2NDhjMCA0LjQgMy42IDggOCA4eiIgZmlsbD0iIzE4OTBmZiIvPjwvc3ZnPg=='
  },
  {
    type: 'switch',
    name: t('scene.topology.node.types.switch'),
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiPjxwYXRoIGQ9Ik04ODAgMTEySDE0NGMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2NzM2YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDczNmMxNy43IDAgMzItMTQuMyAzMi0zMlYxNDRjMC0xNy43LTE0LjMtMzItMzItMzJ6TTUxMiA4MDBjLTg4LjQgMC0xNjAtNzEuNi0xNjAtMTYwczcxLjYtMTYwIDE2MC0xNjAgMTYwIDcxLjYgMTYwIDE2MC03MS42IDE2MC0xNjAgMTYwek01MTIgNTQ0Yy01My4wMiAwLTk2IDQyLjk4LTk2IDk2czQyLjk4IDk2IDk2IDk2IDk2LTQyLjk4IDk2LTk2LTQyLjk4LTk2LTk2LTk2eiIgZmlsbD0iIzEzYzJjMiIvPjwvc3ZnPg=='
  }
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