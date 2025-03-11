<!-- Monaco Editor 组件 - 支持双列显示和Dockerfile优化 -->
<template>
  <div class="monaco-editor-wrapper">
    <div ref="editorContainer" class="monaco-editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  language?: string
  theme?: string
  readOnly?: boolean
  options?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContainer = ref<HTMLElement>()
let editor: any = undefined
let monaco: any = undefined

// 加载 Monaco Editor
const loadMonaco = () => {
  return new Promise((resolve) => {
    if (window.monaco) {
      resolve(window.monaco)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js'
    script.onload = () => {
      // @ts-ignore
      window.require.config({
        paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
      })
      // @ts-ignore
      window.require(['vs/editor/editor.main'], () => {
        resolve(window.monaco)
      })
    }
    document.body.appendChild(script)
  })
}

// 获取编辑器配置
const getEditorOptions = () => {
  return {
    language: props.language || 'dockerfile',
    theme: props.theme || 'dockerfile-dark',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    automaticLayout: true,
    readOnly: props.readOnly || false,
    ...props.options
  }
}

// 初始化编辑器
const initMonaco = async () => {
  if (!editorContainer.value) return

  monaco = await loadMonaco()

  // 注册 Dockerfile 语法高亮
  monaco.languages.register({ id: 'dockerfile' })
  monaco.languages.setMonarchTokensProvider('dockerfile', {
    tokenizer: {
      root: [
        // 注释
        [/#.*$/, 'comment'],
        // 指令
        [/^(FROM|LABEL|RUN|CMD|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/, 'keyword'],
        // 字符串
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],
        // 数字
        [/[0-9]+/, 'number'],
        // 变量
        [/\$[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
        [/\$\{[^}]+\}/, 'variable'],
      ],
      string_double: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
      string_single: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop']
      ]
    }
  })

  // 配置编辑器主题
  monaco.editor.defineTheme('dockerfile-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'comment', foreground: '6A9955' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'variable', foreground: '9CDCFE' }
    ],
    colors: {}
  })

  // 获取编辑器选项
  const editorOptions = getEditorOptions()

  // 创建编辑器实例
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    ...editorOptions
  })

  // 监听编辑器内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
  })
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue)
  }
})

// 组件挂载时初始化编辑器
onMounted(() => {
  initMonaco()
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<style scoped>
.monaco-editor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.monaco-editor-container {
  height: 100%;
  border-radius: 4px;
  flex: 1;
}
</style>

<script lang="ts">
// 添加全局类型声明
declare global {
  interface Window {
    monaco: any
    require: any
  }
}
</script> 