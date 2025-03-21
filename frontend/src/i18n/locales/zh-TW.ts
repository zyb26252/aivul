export default {
  common: {
    logout: '登出',
    username: '用戶名',
    operation: '操作',
    edit: '編輯',
    delete: '刪除',
    add: '添加',
    search: '搜索',
    confirm: '確定',
    cancel: '取消',
    pleaseSelect: '請選擇',
    pleaseInput: '請輸入',
    detail: '詳情',
    batchDelete: '批量刪除',
    selected: '已選擇',
    items: '項',
    tips: '提示',
    lengthLimit: '長度在 {min} 到 {max} 個字符',
    copy: '複製',
    refresh: '刷新',
    loading: '加載中',
    noData: '暫無數據',
    success: '成功',
    failed: '失敗',
    error: '錯誤',
    warning: '警告',
    back: '返回',
    reset: '重置',
    save: '保存',
    none: '無',
    noDescription: '無描述',
    profile: '個人資料',
    changePassword: {
      title: '修改密碼',
      oldPassword: '原密碼',
      newPassword: '新密碼',
      confirmPassword: '確認密碼',
      oldPasswordPlaceholder: '請輸入原密碼',
      newPasswordPlaceholder: '請輸入新密碼',
      confirmPasswordPlaceholder: '請再次輸入新密碼',
      success: '密碼修改成功',
      failed: '密碼修改失敗',
      passwordNotMatch: '兩次輸入的密碼不一致',
      oldPasswordError: '原密碼錯誤'
    }
  },
  menu: {
    home: '首頁',
    images: '鏡像管理',
    software: '軟件管理',
    targets: '靶標管理',
    scenes: '場景管理',
    instances: '實例管理',
    login: '登錄',
    register: '註冊',
    topology: '拓撲編輯器'
  },
  header: {
    title: 'AI驅動的網絡靶場自動化構建引擎',
    subtitle: '自動化網絡靶場構建引擎'
  },
  table: {
    name: '名稱',
    description: '描述',
    createdAt: '創建時間',
    operation: '操作',
    registryPath: '鏡像路徑',
    architecture: '架構',
    version: '版本',
    type: '類型',
    port: '端口',
    baseImage: '基礎鏡像',
    software: '軟件',
    status: '狀態',
    nodeCount: '節點數量',
    ip: 'IP地址',
    scene: '場景',
    target: '靶標',
    empty: '暫無數據',
    total: '共 {total} 條數據'
  },
  software: {
    title: '軟件管理',
    searchPlaceholder: '搜索軟件名稱',
    selectArchitecture: '選擇架構',
    addButton: '添加軟件',
    detail: {
      title: '軟件詳情',
      name: '名稱',
      version: '版本',
      architecture: '架構',
      osType: '操作系統',
      ports: '端口',
      installCommand: '安裝命令',
      startCommand: '啟動命令',
      description: '描述',
      createdAt: '創建時間'
    },
    form: {
      addTitle: '添加軟件',
      editTitle: '編輯軟件',
      name: '名稱',
      namePlaceholder: '請輸入軟件名稱',
      version: '版本',
      versionPlaceholder: '請輸入軟件版本',
      architecture: '架構',
      architecturePlaceholder: '請選擇架構',
      installCommand: '安裝命令',
      installCommandPlaceholder: '請輸入軟件安裝命令',
      ports: '端口',
      addPort: '添加端口',
      startCommand: '啟動命令',
      addMainCommand: '添加主命令',
      addParameter: '添加參數',
      commandTip: '例如：httpd 作為主命令，-DFOREGROUND 作為參數',
      description: '描述',
      descriptionPlaceholder: '請輸入軟件描述'
    },
    messages: {
      deleteConfirm: '確定要刪除該軟件嗎？',
      deleteSuccess: '刪除成功',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '確定要刪除選中的 {count} 個軟件嗎？',
      batchDeleteSuccess: '批量刪除成功',
      batchDeleteFailed: '批量刪除失敗'
    }
  },
  scene: {
    title: '場景管理',
    searchPlaceholder: '搜索場景名稱或描述',
    addButton: '添加場景',
    nodeCount: '節點數量',
    form: {
      addTitle: '添加場景',
      editTitle: '編輯場景',
      name: '名稱',
      namePlaceholder: '請輸入場景名稱',
      description: '描述',
      descriptionPlaceholder: '請輸入場景描述'
    },
    messages: {
      deleteConfirm: '確定要刪除該場景嗎？',
      deleteSuccess: '刪除成功',
      deleteFailed: '刪除失敗',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '確定要刪除選中的 {count} 個場景嗎？',
      batchDeleteSuccess: '批量刪除成功',
      batchDeleteFailed: '批量刪除失敗',
      copySuccess: '複製成功',
      copyFailed: '複製失敗',
      loadFailed: '獲取場景列表失敗',
      saveFailed: '保存失敗'
    },
    topology: {
      title: '管理拓撲',
      preview: '拓撲預覽',
      noTopology: '暫無拓撲',
      topologyEditor: '拓撲編輯器',
      editor: {
        title: '拓撲編輯器',
        save: '保存拓撲',
        autoLayout: '自動佈局',
        undo: '撤銷',
        redo: '重做',
        zoomIn: '放大',
        zoomOut: '縮小',
        fitView: '適應畫布',
        delete: '刪除',
        copy: '複製',
        paste: '粘貼',
        selectAll: '全選',
        addNode: '添加節點',
        addEdge: '添加連接',
        nodeConfig: '節點配置',
        edgeConfig: '連接配置',
        group: {
          create: '創建分組',
          edit: '編輯分組',
          delete: '刪除分組',
          name: '分組名稱',
          namePlaceholder: '請輸入分組名稱',
          color: '分組顏色',
          colorPlaceholder: '請選擇分組顏色',
          addNode: '添加節點到分組',
          removeNode: '從分組移除節點',
          title: '分組',
          unnamed: '未命名分組'
        }
      },
      node: {
        name: '名稱',
        type: '節點類型',
        target: '靶標',
        image: '鏡像',
        software: '軟件',
        ports: '端口',
        namePlaceholder: '請輸入節點名稱',
        selectTarget: '選擇靶標',
        selectImage: '請選擇鏡像',
        selectSoftware: '請選擇軟件',
        networkElement: {
          title: '網元配置',
          type: '網元類型',
          typePlaceholder: '請選擇網元類型',
          types: {
            router: '路由器',
            switch: '交換機',
            firewall: '防火牆',
            server: '服務器',
            client: '客戶端',
            custom: '自定義'
          }
        },
        properties: {
          title: '屬性配置',
          add: '添加屬性',
          edit: '編輯屬性',
          delete: '刪除屬性',
          name: '屬性名',
          namePlaceholder: '請輸入屬性名',
          value: '屬性值',
          valuePlaceholder: '請輸入屬性值',
          type: '屬性類型',
          typePlaceholder: '請選擇屬性類型',
          types: {
            string: '字符串',
            number: '數字',
            boolean: '布爾值',
            array: '數組',
            object: '對象'
          }
        },
        types: {
          container: '容器',
          switch: '交換機',
          router: '路由器',
          firewall: '防火牆',
          server: '服務器',
          client: '客戶端',
          custom: '自定義'
        },
        ipPlaceholder: '請輸入IP地址',
        netmask: '子網掩碼',
        netmaskPlaceholder: '請輸入子網掩碼',
        gateway: '網關',
        gatewayPlaceholder: '請輸入網關地址',
        dhcpStart: 'DHCP起始',
        dhcpStartPlaceholder: '請輸入DHCP起始地址',
        dhcpEnd: 'DHCP結束',
        dhcpEndPlaceholder: '請輸入DHCP結束地址'
      },
      edge: {
        source: '源節點',
        target: '目標節點',
        bandwidth: '帶寬',
        delay: '延遲',
        loss: '丟包率',
        unit: {
          mbps: 'Mbps',
          ms: 'ms',
          percentage: '%'
        },
        style: '連線形狀',
        color: '線條顏色',
        width: '線條寬度',
        pattern: '線條樣式',
        styles: {
          straight: '直線',
          polyline: '折線',
          curve: '曲線'
        },
        patterns: {
          solid: '實線',
          dashed: '虛線',
          dotted: '點線'
        }
      },
      messages: {
        saveSuccess: '保存成功',
        saveFailed: '保存失敗',
        deleteNode: '確定要刪除該節點嗎？',
        deleteEdge: '確定要刪除該連接嗎？',
        invalidConnection: '無效的連接',
        duplicateConnection: '連接已存在',
        nodeNameRequired: '節點名稱不能為空',
        nodeNameDuplicate: '節點名稱已存在',
        targetRequired: '請選擇靶標',
        imageRequired: '請選擇鏡像',
        portInUse: '端口已被佔用',
        groupNameRequired: '分組名稱不能為空',
        groupNameDuplicate: '分組名稱已存在',
        groupDeleteConfirm: '確定要刪除該分組嗎？刪除分組不會刪除組內節點',
        propertyNameRequired: '屬性名不能為空',
        propertyNameDuplicate: '屬性名已存在',
        propertyValueRequired: '屬性值不能為空',
        propertyDeleteConfirm: '確定要刪除該屬性嗎？',
        unsavedChanges: '有未保存的更改，確定要離開嗎？',
        confirmLeave: '確定離開',
        editorNotInitialized: '編輯器未初始化',
        resetConfirm: '重置將丟失所有未保存的修改，確定要重置嗎？',
        resetSuccess: '已重置為最後保存的狀態',
        resetFailed: '重置失敗',
        selectNodeOrEdge: '請選擇節點或連線'
      },
      targetSelector: {
        title: '選擇靶標',
        searchPlaceholder: '搜索靶標名稱、描述或軟件',
        allArchitectures: '全部架構',
        allImages: '全部鏡像',
        softwareType: '軟件類型',
        allSoftware: '全部軟件',
        resetFilters: '重置篩選',
        foundTargets: '找到 {count} 個靶標',
        noTargetsFound: '沒有找到符合條件的靶標',
        select: '選擇'
      }
    }
  },
  images: {
    searchPlaceholder: '搜索鏡像名稱',
    selectArchitecture: '選擇架構',
    addButton: '添加鏡像',
    form: {
      addTitle: '添加鏡像',
      editTitle: '編輯鏡像',
      name: '名稱',
      namePlaceholder: '請輸入鏡像名稱',
      registryPath: '鏡像路徑',
      registryPathPlaceholder: '請輸入鏡像路徑',
      architecture: '架構',
      architecturePlaceholder: '請選擇架構',
      version: '版本',
      versionPlaceholder: '請輸入版本號',
      description: '描述',
      descriptionPlaceholder: '請輸入鏡像描述'
    },
    messages: {
      deleteConfirm: '確定要刪除該鏡像嗎？',
      deleteSuccess: '刪除成功',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '確定要刪除選中的 {count} 個鏡像嗎？',
      batchDeleteSuccess: '批量刪除成功',
      batchDeleteError: '批量刪除失敗'
    }
  },
  targets: {
    title: '靶標管理',
    searchPlaceholder: '搜索靶標名稱',
    addButton: '添加靶標',
    viewDockerfile: '查看 Dockerfile',
    form: {
      addTitle: '添加靶標',
      editTitle: '編輯靶標',
      name: '名稱',
      namePlaceholder: '請輸入靶標名稱',
      selectBaseImage: '請選擇基礎鏡像',
      selectSoftware: '請選擇軟件',
      selectBaseImageFirst: '請先選擇基礎鏡像',
      checkCompatibility: '檢查軟件兼容性',
      portsAutoGenerated: '端口列表根據所選軟件自動生成',
      descriptionPlaceholder: '請輸入靶標描述',
      generatingDescription: '正在生成描述，請稍候...'
    },
    steps: {
      basicInfo: '基本信息',
      dockerfile: '確認 Dockerfile'
    },
    messages: {
      deleteConfirm: '確定要刪除該靶標嗎？',
      deleteSuccess: '刪除成功',
      deleteFailed: '刪除失敗',
      addSuccess: '添加成功',
      updateSuccess: '更新成功',
      batchDeleteConfirm: '確定要刪除選中的 {count} 個靶標嗎？',
      batchDeleteSuccess: '批量刪除成功',
      batchDeleteFailed: '批量刪除失敗'
    }
  },
  home: {
    title: '首頁',
    welcome: '歡迎使用',
    description: 'AI驅動的網絡靶場自動化構建引擎',
    statistics: {
      title: '系統統計',
      total: '總數',
      images: '鏡像',
      software: '軟件',
      targets: '靶標',
      scenes: '場景',
      instances: '實例',
      unit: '個'
    },
    quickStart: {
      title: '快速開始',
      createScene: '創建場景',
      manageImages: '管理鏡像',
      manageSoftware: '管理軟件',
      manageTargets: '管理靶標'
    },
    recentActivity: {
      title: '最近活動',
      noActivity: '暫無活動',
      createScene: '創建了場景',
      updateScene: '更新了場景',
      deleteScene: '刪除了場景',
      createInstance: '創建了實例',
      deleteInstance: '刪除了實例'
    },
    systemResources: {
      title: '系統資源使用情況',
      cpu: 'CPU使用率',
      memory: '內存使用率',
      disk: '磁盤使用率',
      network: '網絡使用率',
      unit: {
        percentage: '%',
        gb: 'GB',
        mb: 'MB',
        mbps: 'Mbps'
      }
    }
  },
  instances: {
    title: '實例管理',
    searchPlaceholder: '搜索實例名稱',
    addButton: '添加實例',
    portMappings: '端口映射',
    target: '靶標',
    detail: {
      title: '實例詳情',
      name: '名稱',
      scene: '場景',
      status: '狀態',
      createdAt: '創建時間',
      description: '描述'
    },
    form: {
      addTitle: '添加實例',
      editTitle: '編輯實例',
      name: '名稱',
      namePlaceholder: '請輸入實例名稱',
      description: '描述',
      descriptionPlaceholder: '請輸入實例描述',
      scene: '場景',
      scenePlaceholder: '請選擇場景',
      portMappings: '端口映射',
      hostPort: '主機端口',
      containerPort: '容器端口',
      addPortMapping: '添加端口映射',
      nameRequired: '請輸入實例名稱',
      targetRequired: '請選擇靶標'
    },
    messages: {
      deleteConfirm: '確定要刪除該實例嗎？',
      deleteSuccess: '刪除成功',
      deleteFailed: '刪除失敗',
      addSuccess: '添加成功',
      addFailed: '添加失敗',
      updateSuccess: '更新成功',
      updateFailed: '更新失敗',
      batchDeleteConfirm: '確定要刪除選中的 {count} 個實例嗎？',
      batchDeleteSuccess: '批量刪除成功',
      batchDeleteFailed: '批量刪除失敗',
      startSuccess: '啟動成功',
      startFailed: '啟動失敗',
      stopSuccess: '停止成功',
      stopFailed: '停止失敗',
      restartSuccess: '重啟成功',
      restartFailed: '重啟失敗',
      getTargetsFailed: '獲取靶標列表失敗'
    },
    status: {
      running: '運行中',
      stopped: '已停止',
      failed: '異常',
      starting: '啟動中',
      stopping: '停止中',
      restarting: '重啟中'
    },
    operation: {
      start: '啟動',
      stop: '停止',
      restart: '重啟',
      viewTopology: '查看拓撲',
      viewConsole: '查看控制台',
      viewLogs: '查看日誌'
    }
  }
}