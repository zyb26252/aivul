/**
 * 拓扑编辑器快捷键管理
 */
import { shortcutConfig } from './GraphConfig'
import { ElMessageBox } from 'element-plus'

/**
 * 快捷键管理器
 * 管理拓扑编辑器的键盘快捷键
 */
export class ShortcutManager {
  /**
   * 构造函数
   * @param {Object} graph 图形实例
   * @param {Object} state 状态对象
   */
  constructor(graph, state) {
    this.graph = graph
    this.state = state
    this.shortcuts = {}
    this.keydownHandler = this._handleKeyDown.bind(this)
    this.isEnabled = true
  }

  /**
   * 初始化快捷键
   */
  init() {
    // 注册所有快捷键
    Object.entries(shortcutConfig).forEach(([name, config]) => {
      this.register(name, config.key, config.handler)
    })
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.keydownHandler)
  }

  /**
   * 注册快捷键
   * @param {String} name 快捷键名称
   * @param {String} key 快捷键组合
   * @param {Function} handler 处理函数
   */
  register(name, key, handler) {
    // 解析快捷键组合
    const keyCombo = this._parseKeyCombo(key)
    
    this.shortcuts[name] = {
      ...keyCombo,
      handler: (e) => handler(this.graph, this.state, e)
    }
  }

  /**
   * 解析快捷键组合
   * @param {String} keyCombo 快捷键组合字符串
   * @returns {Object} 解析后的快捷键对象
   * @private
   */
  _parseKeyCombo(keyCombo) {
    const parts = keyCombo.toLowerCase().split('+')
    const result = {
      key: parts[parts.length - 1],
      ctrl: false,
      shift: false,
      alt: false,
      meta: false
    }
    
    // 检查修饰键
    parts.forEach(part => {
      if (part === 'ctrl') result.ctrl = true
      if (part === 'shift') result.shift = true
      if (part === 'alt') result.alt = true
      if (part === 'meta') result.meta = true
    })
    
    return result
  }

  /**
   * 处理键盘按下事件
   * @param {KeyboardEvent} e 键盘事件
   * @private
   */
  _handleKeyDown(e) {
    if (!this.isEnabled) return
    
    // 如果当前焦点在输入框中，不处理快捷键
    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA' ||
      document.activeElement.isContentEditable
    ) {
      return
    }
    
    // 获取按键信息
    const key = e.key.toLowerCase()
    const ctrl = e.ctrlKey
    const shift = e.shiftKey
    const alt = e.altKey
    const meta = e.metaKey
    
    // 查找匹配的快捷键
    for (const name in this.shortcuts) {
      const shortcut = this.shortcuts[name]
      
      // 检查是否匹配
      if (
        shortcut.key === key &&
        shortcut.ctrl === ctrl &&
        shortcut.shift === shift &&
        shortcut.alt === alt &&
        shortcut.meta === meta
      ) {
        // 阻止默认行为
        e.preventDefault()
        
        // 执行处理函数
        shortcut.handler(e)
        
        // 找到匹配的快捷键后退出循环
        break
      }
    }
  }

  /**
   * 启用快捷键
   */
  enable() {
    this.isEnabled = true
  }

  /**
   * 禁用快捷键
   */
  disable() {
    this.isEnabled = false
  }

  /**
   * 销毁快捷键管理器
   */
  destroy() {
    document.removeEventListener('keydown', this.keydownHandler)
    this.shortcuts = {}
  }

  /**
   * 获取所有快捷键配置
   * @returns {Object} 快捷键配置
   */
  getShortcuts() {
    return { ...this.shortcuts }
  }
}

/**
 * 创建快捷键管理器
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 * @returns {ShortcutManager} 快捷键管理器实例
 */
export const createShortcutManager = (graph, state) => {
  const manager = new ShortcutManager(graph, state)
  manager.init()
  return manager
}

/**
 * 格式化快捷键显示
 * @param {String} key 快捷键组合
 * @returns {String} 格式化后的快捷键显示
 */
export const formatShortcut = (key) => {
  if (!key) return ''
  
  // 替换修饰键为符号
  return key
    .replace(/\+/g, ' + ')
    .replace(/ctrl/i, 'Ctrl')
    .replace(/shift/i, 'Shift')
    .replace(/alt/i, 'Alt')
    .replace(/meta/i, 'Meta')
    .replace(/delete/i, 'Delete')
}

/**
 * 快捷键配置
 */
export const shortcuts = {
  // 复制
  copy: {
    key: 'c',
    ctrl: true,
    label: '复制'
  },
  
  // 粘贴
  paste: {
    key: 'v',
    ctrl: true,
    label: '粘贴'
  },
  
  // 删除
  delete: {
    key: 'Delete',
    ctrl: false,
    label: '删除'
  },
  
  // 撤销
  undo: {
    key: 'z',
    ctrl: true,
    label: '撤销'
  },
  
  // 重做
  redo: {
    key: 'z',
    ctrl: true,
    shift: true,
    label: '重做'
  },
  
  // 全选
  select_all: {
    key: 'a',
    ctrl: true,
    label: '全选'
  },
  
  // 放大
  zoom_in: {
    key: '+',
    ctrl: true,
    label: '放大'
  },
  
  // 缩小
  zoom_out: {
    key: '-',
    ctrl: true,
    label: '缩小'
  },
  
  // 适应画布
  fit_view: {
    key: '0',
    ctrl: true,
    label: '适应画布'
  },
  
  // 创建分组
  create_group: {
    key: 'g',
    ctrl: true,
    label: '创建分组'
  },
  
  // 取消分组
  ungroup: {
    key: 'g',
    ctrl: true,
    shift: true,
    label: '取消分组'
  }
}

/**
 * 初始化快捷键
 * @param {Object} graph 图形实例
 * @param {Object} state 状态对象
 * @param {Object} handlers 处理函数对象
 */
export const initShortcuts = (graph, state, handlers) => {
  if (!graph) return
  
  const handleKeyDown = (e) => {
    // 如果焦点在输入框中，不处理快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }
    
    // 匹配快捷键
    const matchShortcut = (shortcut) => {
      return e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!e.ctrlKey === !!shortcut.ctrl &&
        !!e.shiftKey === !!shortcut.shift
    }
    
    // 复制
    if (matchShortcut(shortcuts.copy)) {
      e.preventDefault()
      if (state.selectedCells.value.length > 0) {
        state.copiedCells.value = state.selectedCells.value
        console.log('已复制', state.selectedCells.value.length, '个元素')
      }
    }
    
    // 粘贴
    else if (matchShortcut(shortcuts.paste)) {
      e.preventDefault()
      if (state.copiedCells.value.length > 0) {
        handlers.handlePaste()
      }
    }
    
    // 删除
    else if (matchShortcut(shortcuts.delete)) {
      e.preventDefault()
      if (state.selectedCells.value.length > 0) {
        handlers.handleDelete()
      }
    }
    
    // 撤销
    else if (matchShortcut(shortcuts.undo)) {
      e.preventDefault()
      handlers.handleUndo()
    }
    
    // 重做
    else if (matchShortcut(shortcuts.redo)) {
      e.preventDefault()
      handlers.handleRedo()
    }
    
    // 全选
    else if (matchShortcut(shortcuts.select_all)) {
      e.preventDefault()
      handlers.handleSelectAll()
    }
    
    // 放大
    else if (matchShortcut(shortcuts.zoom_in)) {
      e.preventDefault()
      handlers.handleZoomIn()
    }
    
    // 缩小
    else if (matchShortcut(shortcuts.zoom_out)) {
      e.preventDefault()
      handlers.handleZoomOut()
    }
    
    // 适应画布
    else if (matchShortcut(shortcuts.fit_view)) {
      e.preventDefault()
      handlers.handleFitContent()
    }
    
    // 创建分组
    else if (matchShortcut(shortcuts.create_group)) {
      e.preventDefault()
      handlers.handleCreateGroup()
    }
    
    // 取消分组
    else if (matchShortcut(shortcuts.ungroup)) {
      e.preventDefault()
      if (state.selectedCells.value.length === 1 && 
          state.selectedCells.value[0].isNode() && 
          state.selectedCells.value[0].getData()?.type === 'group') {
        handlers.handleUngroup()
      }
    }
  }
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  
  // 返回清理函数
  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * 处理粘贴操作
 * @param {Object} graph 图形实例
 * @param {Array} copiedCells 已复制的元素
 */
export const handlePaste = (graph, copiedCells) => {
  if (!graph || !copiedCells || copiedCells.length === 0) return
  
  // 复制元素
  const cells = graph.copy(copiedCells)
  const dx = 20
  const dy = 20
  
  // 移动位置
  cells.forEach(cell => {
    if (cell.isNode()) {
      cell.translate(dx, dy)
      
      // 如果是分组节点，确保它不能被移动
      if (cell.getData()?.type === 'group') {
        cell.setProp('draggable', false)
        cell.setProp('movable', false)
        
        // 更新数据标记
        cell.setData({
          ...cell.getData(),
          movable: false,
          preventDrag: true
        })
      }
    }
  })
  
  // 添加到画布
  graph.addCells(cells)
  
  // 选中新添加的元素
  graph.select(cells)
  
  return cells
}

/**
 * 处理全选操作
 * @param {Object} graph 图形实例
 */
export const handleSelectAll = (graph) => {
  if (!graph) return
  
  const nodes = graph.getNodes()
  const edges = graph.getEdges()
  
  // 过滤掉分组节点
  const selectableNodes = nodes.filter(node => node.getData()?.type !== 'group')
  
  graph.select([...selectableNodes, ...edges])
} 