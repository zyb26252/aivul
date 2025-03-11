/**
 * 分组工具函数
 * 提取自TopologyEditor.vue，用于避免重复声明问题
 */

// 更新所有分组的边界
export const updateAllGroups = (graph) => {
  if (!graph) return;
  const groupNodes = graph.getNodes().filter(node => node.getData()?.type === 'group') || [];
  groupNodes.forEach(group => {
    if (group && group.id) {
      updateGroupBoundaryById(graph, group.id);
    }
  });
  console.log(`更新了${groupNodes.length}个分组的边界`);
};

// 根据分组ID更新分组边界
export const updateGroupBoundaryById = (graph, groupId) => {
  if (!graph || !groupId) return;
  
  // 获取分组节点
  const group = graph.getCellById(groupId);
  if (!group || group.getData()?.type !== 'group') return;
  
  // 获取属于该分组的所有子节点
  const children = graph.getNodes().filter(n => n.getData()?.parent === groupId);
  if (!children || children.length === 0) return;
  
  // 计算所有子节点的边界框
  const bbox = graph.getCellsBBox(children);
  if (!bbox) return;
  
  // 添加内边距
  const padding = 20;
  const newWidth = bbox.width + padding * 2;
  const newHeight = bbox.height + padding * 2;
  const newX = bbox.x - padding;
  const newY = bbox.y - padding;
  
  // 更新分组节点的大小和位置
  group.prop({
    position: { x: newX, y: newY },
    size: { width: newWidth, height: newHeight }
  });
  
  console.log(`更新了分组[${groupId}]的边界, 包含${children.length}个子节点`);
};

// 设置分组相关的事件监听
export const setupGroupEvents = (graph) => {
  if (!graph) return;
  
  // 监听节点拖动开始事件
  graph.on('node:dragstart', ({ node }) => {
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent;
      if (parentId) {
        // 记录拖动前的位置，用于计算移动量
        node._dragStartPosition = { ...node.getPosition() };
      }
    }
  });
  
  // 监听节点拖动中事件
  graph.on('node:drag', ({ node }) => {
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent;
      if (parentId) {
        // 实时更新分组边界
        updateGroupBoundaryById(graph, parentId);
      }
    }
  });
  
  // 监听节点拖动结束事件
  graph.on('node:dragend', ({ node }) => {
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent;
      if (parentId) {
        // 拖动结束时更新分组边界
        updateGroupBoundaryById(graph, parentId);
        // 清除临时记录的位置
        delete node._dragStartPosition;
      }
    }
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph);
    }, 100);
  });
  
  // 监听节点位置变化事件
  graph.on('node:change:position', ({ node }) => {
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent;
      if (parentId) {
        // 位置变化时更新分组边界
        updateGroupBoundaryById(graph, parentId);
      }
    }
  });
  
  // 监听节点移动事件
  graph.on('node:moved', ({ node }) => {
    // 只处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent;
      if (parentId) {
        // 移动结束时更新分组边界
        updateGroupBoundaryById(graph, parentId);
      }
    }
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph);
    }, 100);
  });
  
  // 监听节点添加到画布事件
  graph.on('node:added', ({ node }) => {
    if (node.getData()?.type === 'group') {
      // 为分组节点设置样式和属性
      node.setAttrs({
        body: {
          ...node.getAttrs().body,
          cursor: 'default',
          opacity: 0.6,
          stroke: '#5F95FF',
          strokeWidth: 2,
          strokeDasharray: '5 5'
        },
        label: {
          ...node.getAttrs().label,
          textAnchor: 'start',
          textVerticalAnchor: 'top',
          x: 10,
          y: 10,
          fontSize: 14,
          fontWeight: 500,
          fill: '#5F95FF'
        }
      });
      
      // 设置标签位置
      node.prop('attrs/label/textAnchor', 'start', { silent: false });
      node.prop('attrs/label/textVerticalAnchor', 'top', { silent: false });
      node.prop('attrs/label/x', 10, { silent: false });
      node.prop('attrs/label/y', 10, { silent: false });
      
      // 禁用分组节点的拖动功能
      node.setProp('draggable', false);
      node.setProp('movable', false);
      
      // 添加数据标记
      node.setData({
        ...node.getData(),
        movable: false,
        preventDrag: true
      });
      
      // 设置分组节点的Z轴位置
      node.setZIndex(0);
    }
  });
};

// 初始化分组功能
export const initGroupFeatures = (graph) => {
  if (!graph) return;
  
  // 设置分组相关的事件监听
  setupGroupEvents(graph);
  
  // 初始更新所有分组
  setTimeout(() => {
    updateAllGroups(graph);
  }, 200);
}; 