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
  
  // 确保层级关系正确
  group.setZIndex(0);
  children.forEach(child => {
    child.setZIndex(1);
  });
  
  console.log(`更新了分组[${groupId}]的边界, 包含${children.length}个子节点`);
};

// 禁用所有分组节点的移动功能
export const disableGroupMovement = (graph) => {
  if (!graph) return;
  const groupNodes = graph.getNodes().filter(node => node.getData()?.type === 'group');
  groupNodes.forEach(group => {
    // 设置不可移动属性
    group.setProp('draggable', false);
    group.setProp('movable', false);
    
    // 添加数据标记
    group.setData({
      ...group.getData(),
      movable: false,
      preventDrag: true
    });
    
    // 设置分组节点的Z轴位置
    group.setZIndex(0);
    
    // 获取分组内的所有子节点
    const children = graph.getNodes().filter(node => node.getData()?.parent === group.id);
    // 确保子节点在分组上方
    children.forEach(child => {
      child.setZIndex(1);
    });
  });
};

// 设置分组相关的事件监听
export const setupGroupEvents = (graph, selectedCells) => {
  if (!graph) return;
  
  // 初始禁用所有分组节点的移动
  disableGroupMovement(graph);
  
  // 监听节点拖动开始事件
  graph.on('node:dragstart', ({ node }) => {
    // 处理分组节点
    if (node.getData()?.type === 'group') {
      // 如果是分组节点，禁止拖动
      return false;
    }
    
    // 处理非分组节点
    if (node.getData()?.type !== 'group') {
      const parentId = node.getData()?.parent;
      if (parentId) {
        // 检查父分区是否被选中
        if (selectedCells && selectedCells.value) {
          const selectedCellIds = selectedCells.value.map(cell => cell.id);
          if (selectedCellIds.includes(parentId)) {
            // 如果父分区被选中，则阻止拖动
            return false;
          }
        }
        
        // 记录拖动前的位置，用于计算移动量
        node._dragStartPosition = { ...node.getPosition() };
      }
    }
  });
  
  // 监听节点拖动中事件
  graph.on('node:drag', ({ node }) => {
    // 如果是分组节点，立即阻止拖动
    if (node.getData()?.type === 'group') {
      return false;
    }
    
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
    // 如果是分组节点，确保它不能被移动
    if (node.getData()?.type === 'group') {
      node.setProp('draggable', false);
      node.setProp('movable', false);
      return;
    }
    
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
      // 确保所有分组节点不可移动
      disableGroupMovement(graph);
    }, 100);
  });
  
  // 监听节点位置变化事件
  graph.on('node:change:position', ({ node }) => {
    // 如果是分组节点，恢复到原始位置
    if (node.getData()?.type === 'group') {
      // 获取原始位置
      const originalPos = node._originalPosition;
      if (originalPos) {
        // 恢复到原始位置
        node.setPosition(originalPos.x, originalPos.y);
      }
      return;
    }
    
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
    // 如果是分组节点，确保它不能被移动
    if (node.getData()?.type === 'group') {
      node.setProp('draggable', false);
      node.setProp('movable', false);
      return;
    }
    
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
      // 确保所有分组节点不可移动
      disableGroupMovement(graph);
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
      
      // 保存原始位置
      node._originalPosition = { ...node.getPosition() };
    } else {
      // 如果是普通节点，检查是否需要添加到分组
      setTimeout(() => {
        const nodePos = node.getPosition();
        const nodeBBox = node.getBBox();
        
        // 检查是否落在某个分组内
        const groups = graph.getNodes().filter(n => n.getData()?.type === 'group');
        for (const group of groups) {
          const groupBBox = group.getBBox();
          
          if (groupBBox.containsRect(nodeBBox) || groupBBox.containsPoint(nodePos)) {
            // 设置父子关系
            node.setData({
              ...node.getData(),
              parent: group.id
            });
            
            // 确保层级关系正确
            group.setZIndex(0);
            node.setZIndex(1);
            
            // 调整分组大小
            updateGroupBoundaryById(graph, group.id);
            break;
          }
        }
      }, 50);
    }
    
    // 更新所有分组
    setTimeout(() => {
      updateAllGroups(graph);
      disableGroupMovement(graph);
    }, 100);
  });
  
  // 添加对分组节点的点击事件处理
  graph.on('node:click', ({ node }) => {
    if (node.getData()?.type === 'group') {
      // 确保分组节点不可移动
      node.setProp('draggable', false);
      node.setProp('movable', false);
      
      // 更新数据标记
      node.setData({
        ...node.getData(),
        movable: false,
        preventDrag: true
      });
    }
  });
  
  // 监听选择变化事件
  graph.on('selection:changed', ({ selected }) => {
    // 确保所有分组节点不可移动
    disableGroupMovement(graph);
    
    // 特别处理被选中的分组节点
    if (selected && selected.length > 0) {
      selected.forEach(cell => {
        if (cell.isNode && cell.isNode() && cell.getData()?.type === 'group') {
          // 确保分组节点不可移动
          cell.setProp('draggable', false);
          cell.setProp('movable', false);
          
          // 更新数据标记
          cell.setData({
            ...cell.getData(),
            movable: false,
            preventDrag: true,
            selected: true
          });
        }
      });
    }
  });
};

// 初始化分组功能
export const initGroupFeatures = (graph, selectedCells) => {
  if (!graph) return;
  
  // 设置分组相关的事件监听
  setupGroupEvents(graph, selectedCells);
  
  // 初始更新所有分组
  setTimeout(() => {
    updateAllGroups(graph);
    disableGroupMovement(graph);
  }, 200);
}; 