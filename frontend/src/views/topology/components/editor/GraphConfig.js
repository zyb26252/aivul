/**
 * 拓扑图形配置
 * 包含节点配置、边配置、快捷键配置等
 */

// 替换导入的容器图标为base64编码
export const containerIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCmFyaWEtbGFiZWw9IkRvY2tlciIgcm9sZT0iaW1nIgp2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHJlY3QKd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiCnJ4PSIxNSUiCmZpbGw9IiNmZmYiLz48cGF0aCBzdHJva2U9IiMwNjZkYTUiIHN0cm9rZS13aWR0aD0iMzgiIGQ9Ik0yOTYgMjI2aDQybS05MiAwaDQybS05MSAwaDQybS05MSAwaDQxbS05MSAwaDQybTgtNDZoNDFtOCAwaDQybTcgMGg0Mm0tNDItNDZoNDIiLz48cGF0aCBmaWxsPSIjMDY2ZGE1IiBkPSJtNDcyIDIyOHMtMTgtMTctNTUtMTFjLTQtMjktMzUtNDYtMzUtNDZzLTI5IDM1LTggNzRjLTYgMy0xNiA3LTMxIDdINjhjLTUgMTktNSAxNDUgMTMzIDE0NSA5OSAwIDE3My00NiAyMDgtMTMwIDUyIDQgNjMtMzkgNjMtMzkiLz48L3N2Zz4='

// 替换导入的交换机图标为新的base64编码
export const switchIcon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgIHZpZXdCb3g9IjAgMCAzNiAzNiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+bmV0d29yay1zd2l0Y2gtbGluZTwvdGl0bGU+CiAgICA8cGF0aCBkPSJNMzMuOTEsMTguNDcsMzAuNzgsOC40MUEyLDIsMCwwLDAsMjguODcsN0g3LjEzQTIsMiwwLDAsMCw1LjIyLDguNDFMMi4wOSwxOC40OGEyLDIsMCwwLDAtLjA5LjU5VjI3YTIsMiwwLDAsMCwyLDJIMzJhMiwyLDAsMCwwLDItMlYxOS4wNkEyLDIsMCwwLDAsMzMuOTEsMTguNDdaTTMyLDI3SDRWMTkuMDZMNy4xMyw5SDI4Ljg3TDMyLDE5LjA2WiIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTEiPjwvcGF0aD48cmVjdCB4PSI3LjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMiI+PC9yZWN0PjxyZWN0IHg9IjEyLjEyIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtMyI+PC9yZWN0PjxyZWN0IHg9IjE3LjExIiB5PSIyMiIgd2lkdGg9IjEuOCIgaGVpZ2h0PSIzIiBjbGFzcz0iY2xyLWktb3V0bGluZSBjbHItaS1vdXRsaW5lLXBhdGgtNCI+PC9yZWN0PjxyZWN0IHg9IjIyLjEiIHk9IjIyIiB3aWR0aD0iMS44IiBoZWlnaHQ9IjMiIGNsYXNzPSJjbHItaS1vdXRsaW5lIGNsci1pLW91dGxpbmUtcGF0aC01Ij48L3JlY3Q+PHJlY3QgeD0iMjcuMSIgeT0iMjIiIHdpZHRoPSIxLjgiIGhlaWdodD0iMyIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTYiPjwvcmVjdD48cmVjdCB4PSI2LjIzIiB5PSIxOCIgd2lkdGg9IjIzLjY5IiBoZWlnaHQ9IjEuNCIgY2xhc3M9ImNsci1pLW91dGxpbmUgY2xyLWktb3V0bGluZS1wYXRoLTciPjwvcmVjdD4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgZmlsbC1vcGFjaXR5PSIwIi8+Cjwvc3ZnPg=='

/**
 * 节点配置
 */
export const nodeConfig = {
  // 服务器节点
  server: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#5F95FF',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      image: {
        'xlink:href': '/icons/server.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 10
      },
      label: {
        text: '服务器',
        x: 40,
        y: 70,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 12,
        fill: '#333333'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        }
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' }
      ]
    }
  },
  
  // 数据库节点
  database: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#5F95FF',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      image: {
        'xlink:href': '/icons/database.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 10
      },
      label: {
        text: '数据库',
        x: 40,
        y: 70,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 12,
        fill: '#333333'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        }
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' }
      ]
    }
  },
  
  // 路由器节点
  router: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#5F95FF',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      image: {
        'xlink:href': '/icons/router.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 10
      },
      label: {
        text: '路由器',
        x: 40,
        y: 70,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 12,
        fill: '#333333'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        }
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' }
      ]
    }
  },
  
  // 交换机节点
  switch: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#5F95FF',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      image: {
        'xlink:href': '/icons/switch.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 10
      },
      label: {
        text: '交换机',
        x: 40,
        y: 70,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 12,
        fill: '#333333'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        }
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' }
      ]
    }
  },
  
  // 防火墙节点
  firewall: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#5F95FF',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      image: {
        'xlink:href': '/icons/firewall.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 10
      },
      label: {
        text: '防火墙',
        x: 40,
        y: 70,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 12,
        fill: '#333333'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        }
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' }
      ]
    }
  },
  
  // 云服务节点
  cloud: {
    width: 80,
    height: 80,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#ffffff',
        stroke: '#5F95FF',
        strokeWidth: 1,
        rx: 6,
        ry: 6
      },
      image: {
        'xlink:href': '/icons/cloud.svg',
        width: 40,
        height: 40,
        x: 20,
        y: 10
      },
      label: {
        text: '云服务',
        x: 40,
        y: 70,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 12,
        fill: '#333333'
      }
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
              style: {
                visibility: 'hidden'
              }
            }
          }
        }
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' }
      ]
    }
  },
  
  // 分组节点
  group: {
    width: 200,
    height: 120,
    shape: 'rect',
    zIndex: 0,
    attrs: {
      body: {
        fill: 'rgba(95, 149, 255, 0.1)',
        stroke: '#5F95FF',
        strokeWidth: 2,
        strokeDasharray: '5 5',
        rx: 8,
        ry: 8,
        cursor: 'default'
      },
      label: {
        text: '分组',
        x: 10,
        y: 10,
        textAnchor: 'start',
        textVerticalAnchor: 'top',
        fontSize: 14,
        fontWeight: 500,
        fill: '#5F95FF'
      }
    }
  }
}

/**
 * 图形配置
 */
export const graphConfig = {
  // 网格配置
  grid: {
    visible: true,
    type: 'doubleMesh',
    args: [
      {
        color: '#E7E8EA',
        thickness: 1
      },
      {
        color: '#CBCED3',
        thickness: 1,
        factor: 4
      }
    ]
  },
  
  // 背景配置
  background: {
    color: '#F8F9FA'
  },
  
  // 连接配置
  connecting: {
    router: {
      name: 'orth',
      args: {
        padding: 20,
        direction: 'H'
      }
    },
    connector: {
      name: 'rounded',
      args: {
        radius: 8
      }
    },
    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    snap: {
      radius: 20
    },
    createEdge() {
      return {
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2,
            targetMarker: null // 移除箭头
          }
        }
      }
    },
    validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
      if (sourceView === targetView) {
        return false
      }
      
      // 检查源节点和目标节点是否都是分组节点
      const sourceData = sourceView?.cell?.getData()
      const targetData = targetView?.cell?.getData()
      
      if (sourceData?.type === 'group' || targetData?.type === 'group') {
        return false
      }
      
      return true
    }
  },
  
  // 交互配置
  interacting: {
    nodeMovable: (view) => {
      const node = view.cell
      const data = node.getData()
      
      // 如果节点是分组节点，禁止移动
      if (data?.type === 'group' || data?.preventDrag) {
        return false
      }
      
      return true
    }
  },
  
  // 平移配置
  translating: {
    restrict: (view) => {
      const node = view.cell
      const data = node.getData()
      
      // 如果节点是分组节点，禁止移动
      if (data?.type === 'group' || data?.preventDrag) {
        return false
      }
      
      return true
    }
  },
  
  // 选择配置
  selecting: {
    enabled: true,
    multiple: true,
    rubberband: true,
    movable: true,
    showNodeSelectionBox: true,
    showEdgeSelectionBox: false,
    filter: ['group']
  },
  
  // 缩放配置
  scaling: {
    min: 0.5,
    max: 2
  },
  
  // 滚动配置
  mousewheel: {
    enabled: true,
    modifiers: ['ctrl', 'meta']
  },
  
  // 历史记录配置
  history: {
    enabled: true
  }
}

/**
 * 快捷键配置
 */
export const shortcutConfig = {
  // 复制
  copy: {
    key: 'ctrl+c',
    handler: (graph, state) => {
      const cells = state.selectedCells.value
      if (cells.length > 0) {
        state.copiedCells.value = cells
      }
    }
  },
  
  // 粘贴
  paste: {
    key: 'ctrl+v',
    handler: (graph, state) => {
      if (state.copiedCells.value.length > 0) {
        const cells = graph.copy(state.copiedCells.value)
        const dx = 20
        const dy = 20
        
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
        
        graph.addCells(cells)
      }
    }
  },
  
  // 删除
  delete: {
    key: 'delete',
    handler: (graph, state) => {
      const cells = state.selectedCells.value
      if (cells.length > 0) {
        cells.forEach(cell => {
          graph.removeCell(cell)
        })
      }
    }
  },
  
  // 撤销
  undo: {
    key: 'ctrl+z',
    handler: (graph) => {
      if (graph.canUndo()) {
        graph.undo()
      }
    }
  },
  
  // 重做
  redo: {
    key: 'ctrl+shift+z',
    handler: (graph) => {
      if (graph.canRedo()) {
        graph.redo()
      }
    }
  },
  
  // 全选
  selectAll: {
    key: 'ctrl+a',
    handler: (graph) => {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()
      
      // 过滤掉分组节点
      const selectableNodes = nodes.filter(node => node.getData()?.type !== 'group')
      
      graph.select([...selectableNodes, ...edges])
    }
  },
  
  // 放大
  zoomIn: {
    key: 'ctrl+=',
    handler: (graph) => {
      const zoom = graph.zoom()
      if (zoom < 2) {
        graph.zoom(0.1)
      }
    }
  },
  
  // 缩小
  zoomOut: {
    key: 'ctrl+-',
    handler: (graph) => {
      const zoom = graph.zoom()
      if (zoom > 0.5) {
        graph.zoom(-0.1)
      }
    }
  },
  
  // 重置缩放
  resetZoom: {
    key: 'ctrl+0',
    handler: (graph) => {
      graph.zoom(1)
    }
  }
} 