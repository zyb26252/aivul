export default {
  common: {
    logout: 'Logout',
    username: 'Username',
    operation: 'Operation',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    confirm: 'Confirm',
    cancel: 'Cancel',
    pleaseSelect: 'Please Select',
    pleaseInput: 'Please Input',
    detail: 'Detail',
    batchDelete: 'Batch Delete',
    selected: 'Selected',
    items: 'items',
    tips: 'Tips',
    lengthLimit: 'Length should be between {min} and {max} characters',
    copy: 'Copy',
    refresh: 'Refresh',
    loading: 'Loading',
    noData: 'No Data',
    success: 'Success',
    failed: 'Failed',
    error: 'Error',
    warning: 'Warning',
    back: 'Back',
    reset: 'Reset',
    save: 'Save',
    none: 'None',
    noDescription: 'No description',
    profile: 'Profile',
    changePassword: {
      title: 'Change Password',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      oldPasswordPlaceholder: 'Please enter old password',
      newPasswordPlaceholder: 'Please enter new password',
      confirmPasswordPlaceholder: 'Please confirm new password',
      success: 'Password changed successfully',
      failed: 'Failed to change password',
      passwordNotMatch: 'The two passwords do not match',
      oldPasswordError: 'Old password is incorrect'
    }
  },
  menu: {
    home: 'Home',
    images: 'Images',
    software: 'Software',
    targets: 'Targets',
    scenes: 'Scenes',
    instances: 'Instances',
    login: 'Login',
    register: 'Register',
    topology: 'Topology Editor'
  },
  header: {
    title: 'AI-Driven Cyber Range Construction Engine',
    subtitle: 'Automated Cyber Range Construction Engine'
  },
  table: {
    // Common Headers
    name: 'Name',
    description: 'Description',
    createdAt: 'Created At',
    operation: 'Operation',
    // Image Headers
    registryPath: 'Registry Path',
    architecture: 'Architecture',
    version: 'Version',
    // Software Headers
    type: 'Type',
    port: 'Port',
    // Target Headers
    baseImage: 'Base Image',
    software: 'Software',
    // Scene Headers
    status: 'Status',
    nodeCount: 'Node Count',
    // Instance Headers
    ip: 'IP Address',
    scene: 'Scene',
    target: 'Target',
    empty: 'No Data',
    loading: 'Loading',
    total: 'Total {total} items'
  },
  software: {
    title: 'Software Management',
    searchPlaceholder: 'Search software name',
    selectArchitecture: 'Select architecture',
    addButton: 'Add Software',
    detail: {
      title: 'Software Details',
      name: 'Name',
      version: 'Version',
      architecture: 'Architecture',
      osType: 'OS Type',
      ports: 'Ports',
      installCommand: 'Install Command',
      startCommand: 'Start Command',
      description: 'Description',
      createdAt: 'Created At'
    },
    form: {
      addTitle: 'Add Software',
      editTitle: 'Edit Software',
      name: 'Name',
      namePlaceholder: 'Please input software name',
      version: 'Version',
      versionPlaceholder: 'Please input version',
      architecture: 'Architecture',
      architecturePlaceholder: 'Please select architecture',
      installCommand: 'Install Command',
      installCommandPlaceholder: 'Please input install command',
      ports: 'Ports',
      addPort: 'Add Port',
      startCommand: 'Start Command',
      addMainCommand: 'Add Main Command',
      addParameter: 'Add Parameter',
      commandTip: 'Example: httpd as main command, -DFOREGROUND as parameter',
      description: 'Description',
      descriptionPlaceholder: 'Please input description'
    },
    messages: {
      deleteConfirm: 'Are you sure to delete this software?',
      deleteSuccess: 'Delete successful',
      addSuccess: 'Add successful',
      updateSuccess: 'Update successful',
      batchDeleteConfirm: 'Are you sure to delete {count} selected software?',
      batchDeleteSuccess: 'Batch delete successful',
      batchDeleteFailed: 'Batch delete failed'
    }
  },
  scene: {
    title: 'Scene Management',
    searchPlaceholder: 'Search scene name or description',
    addButton: 'Add Scene',
    form: {
      addTitle: 'Add Scene',
      editTitle: 'Edit Scene',
      name: 'Name',
      namePlaceholder: 'Please input scene name',
      description: 'Description',
      descriptionPlaceholder: 'Please input scene description'
    },
    messages: {
      deleteConfirm: 'Are you sure to delete this scene?',
      deleteSuccess: 'Delete successful',
      deleteFailed: 'Delete failed',
      addSuccess: 'Add successful',
      updateSuccess: 'Update successful',
      batchDeleteConfirm: 'Are you sure to delete {count} selected scenes?',
      batchDeleteSuccess: 'Batch delete successful',
      batchDeleteFailed: 'Batch delete failed',
      copySuccess: 'Copy successful',
      copyFailed: 'Copy failed',
      loadFailed: 'Failed to load scene list',
      saveFailed: 'Save failed'
    },
    topology: {
      title: 'Manage Topology',
      preview: 'Topology Preview',
      noTopology: 'No topology',
      topologyEditor: 'Topology Editor',
      editor: {
        title: 'Topology Editor',
        save: 'Save Topology',
        autoLayout: 'Auto Layout',
        undo: 'Undo',
        redo: 'Redo',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        fitView: 'Fit View',
        delete: 'Delete',
        copy: 'Copy',
        paste: 'Paste',
        selectAll: 'Select All',
        addNode: 'Add Node',
        addEdge: 'Add Edge',
        nodeConfig: 'Node Config',
        edgeConfig: 'Edge Config',
        group: {
          create: 'Create Group',
          edit: 'Edit Group',
          delete: 'Delete Group',
          name: 'Group Name',
          namePlaceholder: 'Please input group name',
          color: 'Group Color',
          colorPlaceholder: 'Please select group color',
          addNode: 'Add Node to Group',
          removeNode: 'Remove Node from Group',
          title: 'Groups',
          unnamed: 'Unnamed Group'
        }
      },
      node: {
        name: 'Name',
        type: 'Node Type',
        target: 'Target',
        image: 'Image',
        software: 'Software',
        ports: 'Ports',
        namePlaceholder: 'Please input node name',
        selectTarget: 'Select Target',
        selectImage: 'Please select image',
        selectSoftware: 'Please select software',
        networkElement: {
          title: 'Network Element Config',
          type: 'Element Type',
          typePlaceholder: 'Please select element type',
          types: {
            router: 'Router',
            switch: 'Switch',
            firewall: 'Firewall',
            server: 'Server',
            client: 'Client',
            custom: 'Custom'
          }
        },
        properties: {
          title: 'Properties Config',
          add: 'Add Property',
          edit: 'Edit Property',
          delete: 'Delete Property',
          name: 'Property Name',
          namePlaceholder: 'Please input property name',
          value: 'Property Value',
          valuePlaceholder: 'Please input property value',
          type: 'Property Type',
          typePlaceholder: 'Please select property type',
          types: {
            string: 'String',
            number: 'Number',
            boolean: 'Boolean',
            array: 'Array',
            object: 'Object'
          }
        },
        types: {
          container: 'Container',
          switch: 'Switch',
          router: 'Router',
          firewall: 'Firewall',
          server: 'Server',
          client: 'Client',
          custom: 'Custom'
        },
        ipPlaceholder: 'Please input IP address',
        netmask: 'Netmask',
        netmaskPlaceholder: 'Please input netmask',
        gateway: 'Gateway',
        gatewayPlaceholder: 'Please input gateway address',
        dhcpStart: 'DHCP Start',
        dhcpStartPlaceholder: 'Please input DHCP start address',
        dhcpEnd: 'DHCP End',
        dhcpEndPlaceholder: 'Please input DHCP end address'
      },
      edge: {
        source: 'Source Node',
        target: 'Target Node',
        bandwidth: 'Bandwidth',
        style: 'Line Style',
        color: 'Line Color',
        width: 'Line Width',
        pattern: 'Line Pattern',
        styles: {
          normal: 'Straight',
          rounded: 'Rounded',
          smooth: 'Smooth'
        },
        patterns: {
          solid: 'Solid',
          dashed: 'Dashed',
          dotted: 'Dotted'
        }
      },
      messages: {
        saveSuccess: 'Save successful',
        saveFailed: 'Save failed',
        deleteNode: 'Are you sure to delete this node?',
        deleteEdge: 'Are you sure to delete this edge?',
        invalidConnection: 'Invalid connection',
        duplicateConnection: 'Connection already exists',
        nodeNameRequired: 'Node name is required',
        nodeNameDuplicate: 'Node name already exists',
        targetRequired: 'Please select a target',
        imageRequired: 'Please select an image',
        portInUse: 'Port is already in use',
        groupNameRequired: 'Group name is required',
        groupNameDuplicate: 'Group name already exists',
        groupDeleteConfirm: 'Are you sure to delete this group? Nodes in the group will not be deleted',
        propertyNameRequired: 'Property name is required',
        propertyNameDuplicate: 'Property name already exists',
        propertyValueRequired: 'Property value is required',
        propertyDeleteConfirm: 'Are you sure to delete this property?',
        unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
        confirmLeave: 'Leave',
        editorNotInitialized: 'Editor not initialized',
        resetConfirm: 'Reset will lose all unsaved changes. Are you sure you want to reset?',
        resetSuccess: 'Reset to last saved state',
        resetFailed: 'Reset failed',
        selectNodeOrEdge: 'Please select a node or edge'
      },
      targetSelector: {
        title: 'Select Target',
        searchPlaceholder: 'Search target name, description or software',
        allArchitectures: 'All Architectures',
        allImages: 'All Images',
        softwareType: 'Software Type',
        allSoftware: 'All Software',
        resetFilters: 'Reset Filters',
        foundTargets: 'Found {count} targets',
        noTargetsFound: 'No targets found',
        select: 'Select'
      }
    },
    nodeCount: 'Node Count'
  },
  images: {
    searchPlaceholder: 'Search image name',
    selectArchitecture: 'Select architecture',
    addButton: 'Add Image',
    form: {
      addTitle: 'Add Image',
      editTitle: 'Edit Image',
      name: 'Name',
      namePlaceholder: 'Please input image name',
      registryPath: 'Registry Path',
      registryPathPlaceholder: 'Please input registry path',
      architecture: 'Architecture',
      architecturePlaceholder: 'Please select architecture',
      version: 'Version',
      versionPlaceholder: 'Please input version',
      description: 'Description',
      descriptionPlaceholder: 'Please input description'
    },
    messages: {
      deleteConfirm: 'Are you sure to delete this image?',
      deleteSuccess: 'Delete successful',
      addSuccess: 'Add successful',
      updateSuccess: 'Update successful',
      batchDeleteConfirm: 'Are you sure to delete {count} selected images?',
      batchDeleteSuccess: 'Batch delete successful',
      batchDeleteError: 'Batch delete failed'
    }
  },
  targets: {
    title: 'Target Management',
    searchPlaceholder: 'Search target name',
    addButton: 'Add Target',
    viewDockerfile: 'View Dockerfile',
    form: {
      addTitle: 'Add Target',
      editTitle: 'Edit Target',
      name: 'Name',
      namePlaceholder: 'Please input target name',
      selectBaseImage: 'Please select base image',
      selectSoftware: 'Please select software',
      selectBaseImageFirst: 'Please select base image first',
      checkCompatibility: 'Check Software Compatibility',
      portsAutoGenerated: 'Port list is automatically generated based on selected software',
      descriptionPlaceholder: 'Please input target description',
      generatingDescription: 'Generating description, please wait...'
    },
    steps: {
      basicInfo: 'Basic Information',
      dockerfile: 'Confirm Dockerfile'
    },
    messages: {
      deleteConfirm: 'Are you sure to delete this target?',
      deleteSuccess: 'Delete successful',
      deleteFailed: 'Delete failed',
      addSuccess: 'Add successful',
      updateSuccess: 'Update successful',
      batchDeleteConfirm: 'Are you sure to delete {count} selected targets?',
      batchDeleteSuccess: 'Batch delete successful',
      batchDeleteFailed: 'Batch delete failed'
    }
  },
  home: {
    title: 'Home',
    welcome: 'Welcome to',
    description: 'AI-Driven Cyber Range Construction Engine',
    statistics: {
      title: 'System Statistics',
      total: 'Total',
      images: 'Images',
      software: 'Software',
      targets: 'Targets',
      scenes: 'Scenes',
      instances: 'Instances',
      unit: ''
    },
    quickStart: {
      title: 'Quick Start',
      createScene: 'Create Scene',
      manageImages: 'Manage Images',
      manageSoftware: 'Manage Software',
      manageTargets: 'Manage Targets'
    },
    recentActivity: {
      title: 'Recent Activity',
      noActivity: 'No Activity',
      createScene: 'Created scene',
      updateScene: 'Updated scene',
      deleteScene: 'Deleted scene',
      createInstance: 'Created instance',
      deleteInstance: 'Deleted instance'
    },
    systemResources: {
      title: 'System Resources Usage',
      cpu: 'CPU Usage',
      memory: 'Memory Usage',
      disk: 'Disk Usage',
      network: 'Network Usage',
      unit: {
        percentage: 'Percentage',
        gb: 'GB',
        mb: 'MB',
        mbps: 'Mbps'
      }
    }
  },
  instances: {
    title: 'Instance Management',
    searchPlaceholder: 'Search instance name',
    addButton: 'Add Instance',
    detail: {
      title: 'Instance Details',
      name: 'Name',
      scene: 'Scene',
      status: 'Status',
      createdAt: 'Created At',
      description: 'Description'
    },
    form: {
      addTitle: 'Add Instance',
      editTitle: 'Edit Instance',
      name: 'Name',
      namePlaceholder: 'Please input instance name',
      description: 'Description',
      descriptionPlaceholder: 'Please input instance description',
      scene: 'Scene',
      scenePlaceholder: 'Please select scene'
    },
    messages: {
      deleteConfirm: 'Are you sure to delete this instance?',
      deleteSuccess: 'Delete successful',
      deleteFailed: 'Delete failed',
      addSuccess: 'Add successful',
      updateSuccess: 'Update successful',
      batchDeleteConfirm: 'Are you sure to delete {count} selected instances?',
      batchDeleteSuccess: 'Batch delete successful',
      batchDeleteFailed: 'Batch delete failed',
      startSuccess: 'Start successful',
      startFailed: 'Start failed',
      stopSuccess: 'Stop successful',
      stopFailed: 'Stop failed',
      restartSuccess: 'Restart successful',
      restartFailed: 'Restart failed'
    },
    status: {
      running: 'Running',
      stopped: 'Stopped',
      failed: 'Failed',
      starting: 'Starting',
      stopping: 'Stopping',
      restarting: 'Restarting'
    },
    operation: {
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      viewTopology: 'View Topology',
      viewConsole: 'View Console',
      viewLogs: 'View Logs'
    }
  }
}