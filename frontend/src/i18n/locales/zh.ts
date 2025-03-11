export default {
  common: {
    logout: '退出',
    username: '用户名',
    operation: '操作',
    edit: '编辑',
    delete: '删除',
    add: '添加',
    search: '搜索',
    confirm: '确定',
    cancel: '取消',
    pleaseSelect: '请选择',
    pleaseInput: '请输入',
    detail: '详情',
    batchDelete: '批量删除',
    selected: '已选择',
    items: '项',
    tips: '提示',
    lengthLimit: '长度在 {min} 到 {max} 个字符',
    copy: '复制',
    refresh: '刷新',
    loading: '加载中',
    noData: '暂无数据',
    success: '成功',
    failed: '失败',
    error: '错误',
    warning: '警告',
    back: '返回',
    reset: '重置',
    save: '保存',
    none: '无',
    noDescription: '无描述'
  },
  menu: {
    home: '首页',
    images: '镜像管理',
    software: '软件管理',
    targets: '靶标管理',
    scenes: '场景管理',
    instances: '实例管理',
    login: '登录',
    register: '注册',
    topology: '拓扑编辑器'
  },
  header: {
    title: 'AI驱动的网络靶场自动化构建引擎',
    subtitle: 'Automated Cyber Range Construction Engine'
  },
  table: {
    // 通用表头
    name: '名称',
    description: '描述',
    createdAt: '创建时间',
    operation: '操作',
    // 镜像表头
    registryPath: '镜像路径',
    architecture: '架构',
    version: '版本',
    // 软件表头
    type: '类型',
    port: '端口',
    // 靶标表头
    baseImage: '基础镜像',
    software: '软件',
    // 场景表头
    status: '状态',
    nodeCount: '节点数量',
    // 实例表头
    ip: 'IP地址',
    scene: '场景',
    target: '靶标',
    empty: '暂无数据',
    total: '共 {total} 条数据'
  },
  software: {
    title: '软件管理',
    searchPlaceholder: '搜索软件名称',
    selectArchitecture: '选择架构',
    addButton: '添加软件',
    detail: {
      title: '软件详情',
      name: '名称',
      version: '版本',
      architecture: '架构',
      osType: '操作系统',
      ports: '端口',
      installCommand: '安装命令',
      startCommand: '启动命令',
      description: '描述',
      createdAt: '创建时间'
    },
    form: {
      addTitle: '添加软件',
      editTitle: '编辑软件',
      name: '名称',
      namePlaceholder: '请输入软件名称',
      version: '版本',
      versionPlaceholder: '请输入软件版本',
      architecture: '架构',
      architecturePlaceholder: '请选择架构',
      installCommand: '安装命令',
      installCommandPlaceholder: '请输入软件安装命令',
      ports: '端口',
      addPort: '添加端口',
      startCommand: '启动命令',
      addMainCommand: '添加主命令',
      addParameter: '添加参数',
      commandTip: '例如：httpd 作为主命令，-DFOREGROUND 作为参数',
      description: '描述',
      descriptionPlaceholder: '请输入软件描述'
    },
    messages: {
      deleteConfirm: '确定要删除该软件吗？',
      deleteSuccess: '删除成功',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '确定要删除选中的 {count} 个软件吗？',
      batchDeleteSuccess: '批量删除成功',
      batchDeleteFailed: '批量删除失败'
    }
  },
  scene: {
    title: '场景管理',
    searchPlaceholder: '搜索场景名称或描述',
    addButton: '添加场景',
    form: {
      addTitle: '添加场景',
      editTitle: '编辑场景',
      name: '名称',
      namePlaceholder: '请输入场景名称',
      description: '描述',
      descriptionPlaceholder: '请输入场景描述'
    },
    messages: {
      deleteConfirm: '确定要删除该场景吗？',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '确定要删除选中的 {count} 个场景吗？',
      batchDeleteSuccess: '批量删除成功',
      batchDeleteFailed: '批量删除失败',
      copySuccess: '复制成功',
      copyFailed: '复制失败',
      loadFailed: '获取场景列表失败',
      saveFailed: '保存失败'
    },
    topology: {
      title: '管理拓扑',
      preview: '拓扑预览',
      noTopology: '暂无拓扑',
      topologyEditor: '拓扑编辑器',
      editor: {
        title: '拓扑编辑器',
        save: '保存拓扑',
        autoLayout: '自动布局',
        undo: '撤销',
        redo: '重做',
        zoomIn: '放大',
        zoomOut: '缩小',
        fitView: '适应画布',
        delete: '删除',
        copy: '复制',
        paste: '粘贴',
        selectAll: '全选',
        addNode: '添加节点',
        addEdge: '添加连接',
        nodeConfig: '节点配置',
        edgeConfig: '连接配置',
        group: {
          create: '创建分组',
          edit: '编辑分组',
          delete: '删除分组',
          name: '分组名称',
          namePlaceholder: '请输入分组名称',
          description: '描述',
          descriptionPlaceholder: '请输入分组描述',
          color: '分组颜色',
          colorPlaceholder: '请选择分组颜色',
          addNode: '添加节点到分组',
          removeNode: '从分组移除节点',
          title: '分组',
          unnamed: '未命名分组'
        }
      },
      node: {
        name: '名称',
        type: '节点类型',
        target: '靶标',
        image: '镜像',
        software: '软件',
        ports: '端口',
        namePlaceholder: '请输入节点名称',
        selectTarget: '选择靶标',
        selectImage: '请选择镜像',
        selectSoftware: '请选择软件',
        networkElement: {
          title: '网元配置',
          type: '网元类型',
          typePlaceholder: '请选择网元类型',
          types: {
            router: '路由器',
            switch: '交换机',
            firewall: '防火墙',
            server: '服务器',
            client: '客户端',
            custom: '自定义'
          }
        },
        properties: {
          title: '属性配置',
          add: '添加属性',
          edit: '编辑属性',
          delete: '删除属性',
          name: '属性名',
          namePlaceholder: '请输入属性名',
          value: '属性值',
          valuePlaceholder: '请输入属性值',
          type: '属性类型',
          typePlaceholder: '请选择属性类型',
          types: {
            string: '字符串',
            number: '数字',
            boolean: '布尔值',
            array: '数组',
            object: '对象'
          }
        },
        types: {
          container: '容器',
          switch: '交换机',
          router: '路由器',
          firewall: '防火墙',
          server: '服务器',
          client: '客户端',
          custom: '自定义'
        },
        ipPlaceholder: '请输入IP地址',
        netmask: '子网掩码',
        netmaskPlaceholder: '请输入子网掩码',
        gateway: '网关',
        gatewayPlaceholder: '请输入网关地址',
        dhcpStart: 'DHCP起始',
        dhcpStartPlaceholder: '请输入DHCP起始地址',
        dhcpEnd: 'DHCP结束',
        dhcpEndPlaceholder: '请输入DHCP结束地址'
      },
      edge: {
        source: '源节点',
        target: '目标节点',
        bandwidth: '带宽',
        style: '连线样式',
        color: '连线颜色',
        width: '连线宽度',
        pattern: '连线类型',
        styles: {
          normal: '直线',
          rounded: '圆角',
          smooth: '平滑'
        },
        patterns: {
          solid: '实线',
          dashed: '虚线',
          dotted: '点线'
        }
      },
      messages: {
        saveSuccess: '保存成功',
        saveFailed: '保存失败',
        deleteNode: '确定要删除该节点吗？',
        deleteEdge: '确定要删除该连接吗？',
        invalidConnection: '无效的连接',
        duplicateConnection: '连接已存在',
        nodeNameRequired: '节点名称不能为空',
        nodeNameDuplicate: '节点名称已存在',
        targetRequired: '请选择靶标',
        imageRequired: '请选择镜像',
        portInUse: '端口已被占用',
        groupNameRequired: '分组名称不能为空',
        groupNameDuplicate: '分组名称已存在',
        groupDeleteConfirm: '确定要删除该分组吗？删除分组不会删除组内节点',
        propertyNameRequired: '属性名不能为空',
        propertyNameDuplicate: '属性名已存在',
        propertyValueRequired: '属性值不能为空',
        propertyDeleteConfirm: '确定要删除该属性吗？',
        unsavedChanges: '有未保存的更改，确定要离开吗？',
        confirmLeave: '确定离开',
        editorNotInitialized: '编辑器未初始化',
        resetConfirm: '重置将丢失所有未保存的修改，确定要重置吗？',
        resetSuccess: '已重置为最后保存的状态',
        resetFailed: '重置失败',
        selectNodeOrEdge: '请选择节点或连线'
      },
      targetSelector: {
        title: '选择靶标',
        searchPlaceholder: '搜索靶标名称、描述或软件',
        allArchitectures: '全部架构',
        allImages: '全部镜像',
        softwareType: '软件类型',
        allSoftware: '全部软件',
        resetFilters: '重置筛选',
        foundTargets: '找到 {count} 个靶标',
        noTargetsFound: '没有找到符合条件的靶标',
        select: '选择'
      }
    }
  },
  images: {
    searchPlaceholder: '搜索镜像名称',
    selectArchitecture: '选择架构',
    addButton: '添加镜像',
    form: {
      addTitle: '添加镜像',
      editTitle: '编辑镜像',
      name: '名称',
      namePlaceholder: '请输入镜像名称',
      registryPath: '镜像路径',
      registryPathPlaceholder: '请输入镜像路径',
      architecture: '架构',
      architecturePlaceholder: '请选择架构',
      version: '版本',
      versionPlaceholder: '请输入版本号',
      description: '描述',
      descriptionPlaceholder: '请输入镜像描述'
    },
    messages: {
      deleteConfirm: '确定要删除该镜像吗？',
      deleteSuccess: '删除成功',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '确定要删除选中的 {count} 个镜像吗？',
      batchDeleteSuccess: '批量删除成功',
      batchDeleteError: '批量删除失败'
    }
  },
  targets: {
    title: '靶标管理',
    searchPlaceholder: '搜索靶标名称',
    addButton: '添加靶标',
    viewDockerfile: '查看 Dockerfile',
    form: {
      addTitle: '添加靶标',
      editTitle: '编辑靶标',
      name: '名称',
      namePlaceholder: '请输入靶标名称',
      selectBaseImage: '请选择基础镜像',
      selectSoftware: '请选择软件',
      selectBaseImageFirst: '请先选择基础镜像',
      checkCompatibility: '检查软件兼容性',
      portsAutoGenerated: '端口列表根据所选软件自动生成',
      descriptionPlaceholder: '请输入靶标描述',
      generatingDescription: '正在生成描述，请稍候...'
    },
    steps: {
      basicInfo: '基本信息',
      dockerfile: '确认 Dockerfile'
    },
    messages: {
      deleteConfirm: '确定要删除该靶标吗？',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '确定要删除选中的 {count} 个靶标吗？',
      batchDeleteSuccess: '批量删除成功',
      batchDeleteFailed: '批量删除失败'
    }
  },
  home: {
    title: '首页',
    welcome: '欢迎使用',
    description: 'AI驱动的网络靶场自动化构建引擎',
    statistics: {
      title: '系统统计',
      total: '总数',
      images: '镜像',
      software: '软件',
      targets: '靶标',
      scenes: '场景',
      instances: '实例',
      unit: '个'
    },
    quickStart: {
      title: '快速开始',
      createScene: '创建场景',
      manageImages: '管理镜像',
      manageSoftware: '管理软件',
      manageTargets: '管理靶标'
    },
    recentActivity: {
      title: '最近活动',
      noActivity: '暂无活动',
      createScene: '创建了场景',
      updateScene: '更新了场景',
      deleteScene: '删除了场景',
      createInstance: '创建了实例',
      deleteInstance: '删除了实例'
    },
    systemResources: {
      title: '系统资源使用情况',
      cpu: 'CPU使用率',
      memory: '内存使用率',
      disk: '磁盘使用率',
      network: '网络使用率',
      unit: {
        percentage: '%',
        gb: 'GB',
        mb: 'MB',
        mbps: 'Mbps'
      }
    }
  },
  instances: {
    title: '实例管理',
    searchPlaceholder: '搜索实例名称',
    addButton: '添加实例',
    detail: {
      title: '实例详情',
      name: '名称',
      scene: '场景',
      status: '状态',
      createdAt: '创建时间',
      description: '描述'
    },
    form: {
      addTitle: '添加实例',
      editTitle: '编辑实例',
      name: '名称',
      namePlaceholder: '请输入实例名称',
      description: '描述',
      descriptionPlaceholder: '请输入实例描述',
      scene: '场景',
      scenePlaceholder: '请选择场景'
    },
    messages: {
      deleteConfirm: '确定要删除该实例吗？',
      deleteSuccess: '删除成功',
      deleteFailed: '删除失败',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '确定要删除选中的 {count} 个实例吗？',
      batchDeleteSuccess: '批量删除成功',
      batchDeleteFailed: '批量删除失败',
      startSuccess: '启动成功',
      startFailed: '启动失败',
      stopSuccess: '停止成功',
      stopFailed: '停止失败',
      restartSuccess: '重启成功',
      restartFailed: '重启失败'
    },
    status: {
      running: '运行中',
      stopped: '已停止',
      failed: '异常',
      starting: '启动中',
      stopping: '停止中',
      restarting: '重启中'
    },
    operation: {
      start: '启动',
      stop: '停止',
      restart: '重启',
      viewTopology: '查看拓扑',
      viewConsole: '查看控制台',
      viewLogs: '查看日志'
    }
  }
} 