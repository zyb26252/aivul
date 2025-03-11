// 在加载场景数据时，确保计算正确的节点数
const loadScenes = async (params = {}) => {
  loadingScenes.value = true
  try {
    const response = await getScenes(params)
    scenes.value = response.data.items.map((scene: any) => {
      // 预处理拓扑数据
      if (scene.topology) {
        const topology = typeof scene.topology === 'string'
          ? JSON.parse(scene.topology)
          : scene.topology

        // 计算正确的顶级节点数量
        if (topology.nodes) {
          // 只统计顶级节点：分组节点 + 不在任何分组内的普通节点
          const topLevelNodes = topology.nodes.filter((node: any) => 
            !node.data?.parent || node.type === 'group'
          )
          // 使用正确的顶级节点数
          const correctNodeCount = topLevelNodes.length
          console.log(`场景 ${scene.id} (${scene.name}): 原始节点数: ${scene.node_count}, 计算顶级节点数: ${correctNodeCount}`)
          
          // 重要：使用我们计算的顶级节点数替换原始节点数
          return {
            id: scene.id,
            name: scene.name,
            description: scene.description,
            nodeCount: correctNodeCount, // 使用计算的值而不是原始值
            topology: scene.topology,
            createdAt: scene.created_at,
            updatedAt: scene.updated_at,
          }
        }
      }
      
      return {
        id: scene.id,
        name: scene.name,
        description: scene.description,
        nodeCount: scene.node_count, // 如果没有拓扑数据，使用原始值
        topology: scene.topology,
        createdAt: scene.created_at,
        updatedAt: scene.updated_at,
      }
    })
    total.value = response.data.total
  } catch (error) {
    console.error('获取场景列表失败', error)
    ElMessage.error(t('scene.error.loadFailed'))
  } finally {
    loadingScenes.value = false
  }
} 