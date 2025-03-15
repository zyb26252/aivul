/**
 * 拓扑编辑器历史记录管理
 */
import { getData } from './GraphUtils'

/**
 * 历史记录管理器
 * 管理拓扑编辑器的撤销/重做功能
 */
export class HistoryManager {
  /**
   * 构造函数
   * @param {Object} graph 图形实例
   * @param {Number} maxHistory 最大历史记录数量
   */
  constructor(graph, maxHistory = 50) {
    this.graph = graph
    this.maxHistory = maxHistory
    this.history = []
    this.currentIndex = -1
    this.isPerformingAction = false
  }

  /**
   * 保存当前状态到历史记录
   * @returns {Boolean} 是否成功保存
   */
  saveState() {
    if (this.isPerformingAction) return false

    try {
      // 获取当前图形数据
      const currentState = getData(this.graph)
      
      // 如果当前索引不是最后一个，则删除后面的历史记录
      if (this.currentIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.currentIndex + 1)
      }
      
      // 检查是否与上一个状态相同
      const lastState = this.history[this.currentIndex]
      if (lastState && JSON.stringify(lastState) === JSON.stringify(currentState)) {
        return false
      }
      
      // 添加新状态
      this.history.push(currentState)
      this.currentIndex++
      
      // 如果历史记录超过最大数量，则删除最早的记录
      if (this.history.length > this.maxHistory) {
        this.history.shift()
        this.currentIndex--
      }
      
      return true
    } catch (error) {
      console.error('保存历史记录失败:', error)
      return false
    }
  }

  /**
   * 撤销操作
   * @returns {Boolean} 是否成功撤销
   */
  undo() {
    if (this.currentIndex <= 0 || this.isPerformingAction) return false

    try {
      this.isPerformingAction = true
      
      // 获取上一个状态
      this.currentIndex--
      const previousState = this.history[this.currentIndex]
      
      // 应用上一个状态
      this._applyState(previousState)
      
      this.isPerformingAction = false
      return true
    } catch (error) {
      console.error('撤销操作失败:', error)
      this.isPerformingAction = false
      return false
    }
  }

  /**
   * 重做操作
   * @returns {Boolean} 是否成功重做
   */
  redo() {
    if (this.currentIndex >= this.history.length - 1 || this.isPerformingAction) return false

    try {
      this.isPerformingAction = true
      
      // 获取下一个状态
      this.currentIndex++
      const nextState = this.history[this.currentIndex]
      
      // 应用下一个状态
      this._applyState(nextState)
      
      this.isPerformingAction = false
      return true
    } catch (error) {
      console.error('重做操作失败:', error)
      this.isPerformingAction = false
      return false
    }
  }

  /**
   * 应用状态到图形
   * @param {Object} state 状态数据
   * @private
   */
  _applyState(state) {
    if (!state) return
    
    // 清空图形
    this.graph.clearCells()
    
    // 添加分组节点
    if (state.groups && state.groups.length > 0) {
      state.groups.forEach(group => {
        this.graph.addNode({
          ...group,
          data: {
            ...group.data,
            type: 'group',
            movable: false,
            preventDrag: true
          },
          zIndex: 0
        })
      })
    }
    
    // 添加普通节点
    if (state.nodes && state.nodes.length > 0) {
      state.nodes.forEach(node => {
        this.graph.addNode({
          ...node,
          zIndex: 1
        })
      })
    }
    
    // 添加边
    if (state.edges && state.edges.length > 0) {
      state.edges.forEach(edge => {
        this.graph.addEdge({
          ...edge,
          zIndex: 2
        })
      })
    }
  }

  /**
   * 检查是否可以撤销
   * @returns {Boolean} 是否可以撤销
   */
  canUndo() {
    return this.currentIndex > 0
  }

  /**
   * 检查是否可以重做
   * @returns {Boolean} 是否可以重做
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1
  }

  /**
   * 清空历史记录
   */
  clear() {
    this.history = []
    this.currentIndex = -1
  }

  /**
   * 获取当前历史记录状态
   * @returns {Object} 历史记录状态
   */
  getState() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      historyLength: this.history.length,
      currentIndex: this.currentIndex
    }
  }
}

/**
 * 创建防抖函数
 * @param {Function} func 要执行的函数
 * @param {Number} wait 等待时间
 * @returns {Function} 防抖函数
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 创建节流函数
 * @param {Function} func 要执行的函数
 * @param {Number} limit 限制时间
 * @returns {Function} 节流函数
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 创建历史记录保存函数
 * @param {HistoryManager} historyManager 历史记录管理器
 * @param {Boolean} useDebounce 是否使用防抖
 * @returns {Function} 保存历史记录的函数
 */
export const createSaveHistoryFunction = (historyManager, useDebounce = true) => {
  const saveFunction = () => {
    historyManager.saveState()
  }
  
  return useDebounce ? debounce(saveFunction, 300) : saveFunction
}

/**
 * 创建历史记录管理器
 * @param {Object} graph 图形实例
 * @param {number} maxHistory 最大历史记录数量
 * @returns {Object} 历史记录管理器
 */
export const createHistoryManager = (graph, maxHistory = 20) => {
  if (!graph) {
    throw new Error('图形实例未初始化')
  }
  
  // 历史记录数组
  const history = []
  // 当前历史记录索引
  let currentIndex = -1
  
  /**
   * 保存当前状态到历史记录
   */
  const saveToHistory = () => {
    try {
      // 获取当前画布状态的JSON表示
      const data = graph.toJSON()
      
      // 如果历史记录为空，或者当前状态与最新历史记录不同，则保存
      if (history.length === 0 || JSON.stringify(data) !== JSON.stringify(history[currentIndex])) {
        // 如果当前不是最新状态，则删除当前索引之后的所有历史记录
        if (currentIndex < history.length - 1) {
          history.splice(currentIndex + 1)
        }
        
        // 添加新的历史记录
        history.push(data)
        currentIndex = history.length - 1
        
        // 如果历史记录超过最大数量，则删除最早的记录
        if (history.length > maxHistory) {
          history.shift()
          currentIndex--
        }
        
        console.log(`保存历史记录 [${currentIndex + 1}/${history.length}]`)
      }
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }
  
  /**
   * 撤销操作
   */
  const undo = () => {
    if (currentIndex > 0) {
      currentIndex--
      const data = history[currentIndex]
      
      // 清空画布并加载历史状态
      graph.fromJSON(data)
      
      console.log(`撤销到历史记录 [${currentIndex + 1}/${history.length}]`)
      return true
    }
    
    console.log('没有可撤销的操作')
    return false
  }
  
  /**
   * 重做操作
   */
  const redo = () => {
    if (currentIndex < history.length - 1) {
      currentIndex++
      const data = history[currentIndex]
      
      // 清空画布并加载历史状态
      graph.fromJSON(data)
      
      console.log(`重做到历史记录 [${currentIndex + 1}/${history.length}]`)
      return true
    }
    
    console.log('没有可重做的操作')
    return false
  }
  
  /**
   * 检查是否可以撤销
   */
  const canUndo = () => {
    return currentIndex > 0
  }
  
  /**
   * 检查是否可以重做
   */
  const canRedo = () => {
    return currentIndex < history.length - 1
  }
  
  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    history.length = 0
    currentIndex = -1
    console.log('历史记录已清空')
  }
  
  // 立即保存初始状态
  saveToHistory()
  
  // 返回历史记录管理器接口
  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistoryLength: () => history.length,
    getCurrentIndex: () => currentIndex
  }
} 