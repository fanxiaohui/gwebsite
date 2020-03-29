function escape(str) {
  return str.replace(/\//g, '%2F')
}

export default {
  name: 'Master',
  data: function () {
    return {
      current: 'Any',
      nodesList: [], // 节点列表
      nodesTotal: 0, // 节点总数
      IPList: [], // 当前IP列表,仅Ethernet有效
      USARTProtocolData: { // 当前串口配置,仅usart有效
        address: '',
        feature: 'none',
        delayPoll: 0,
        responseTimeout: 1000
      },
      protocolFormData: { // 协议配置
        interfaces: 'Ethernet',
        address: '',
        feature: 'none',
        delayPoll: 0,
        responseTimeout: 1000,
        ipPort: 502 // 仅Ethernet有效
      },
      addNodeFormData: {
        interfaces: '', // Ethernet 或 USART
        slaveId: 1,
        address: '', // ip 或 串口地址
        hasCoil: true,
        coilAddress: 0,
        coilQuantity: 10,
        coilScanRate: 1000,
        hasDiscrete: true,
        discreteAddress: 0,
        discreteQuantity: 10,
        discreteScanRate: 1000,
        hasHolding: true,
        holdingAddress: 0,
        holdingQuantity: 10,
        holdingScanRate: 1000,
        hasInput: true,
        inputAddress: 0,
        inputQuantity: 10,
        inputScanRate: 1000
      },
      editNodeFormData: {},
      queryInfo: {
        interfaces: '', // Ethernet 或 串口名
        pageIndex: 1,
        pageSize: 10
      },
      protocolDialogVisible: false,
      editNodeDialogVisible: false,
      addNodeDialogVisible: false,
      hpVisible: false
    }
  },
  computed: {
    isEthernet: function () {
      return this.current === 'Ethernet'
    },
    isAny: function () {
      return this.current === 'Any'
    }
  },
  watch: {
    $route() { // 路由变化引起初始化
      this.init()
    }
  },
  methods: {
    tabPath: function () {
      return this.isAny ? '所有从站' : (this.isEthernet ? '以太网' : '串口')
    },
    init: function () {
      this.current = this.$route.params.pathMatch
      if (this.current === 'Ethernet') {
        this.getEthernetConfig()
      } else if (this.current !== 'Any') {
        this.getUSARTConfig()
      }
      this.getNodes()
    },
    showProtocolDialog: function () {
      if (this.isEthernet) {
        this.protocolFormData.interfaces = 'Ethernet'
        this.protocolFormData.address = ''
        this.protocolFormData.feature = 'mbtcp'
      } else {
        this.protocolFormData.interfaces = 'USART'
        this.protocolFormData.address = this.USARTProtocolData.address
        this.protocolFormData.feature = this.USARTProtocolData.feature
        this.protocolFormData.delayPoll = this.USARTProtocolData.delayPoll
        this.protocolFormData.responseTimeout = this.USARTProtocolData.responseTimeout
      }
      this.protocolDialogVisible = true
    },
    hideProtocolDialog: function () {
      this.protocolDialogVisible = false
    },
    showAddNodeDialog: function () {
      if (this.isAny) {
        return
      }
      if (this.isEthernet) {
        this.addNodeFormData.interfaces = 'Ethernet'
        this.addNodeFormData.address = ''
        this.protocolFormData.interfaces = 'Ethernet'
      } else {
        if (this.USARTProtocolData.feature === 'none') {
          this.$message.error('未使能相关协议!!! 请先配置!')
          return
        }
        this.addNodeFormData.interfaces = 'USART'
        this.addNodeFormData.address = this.current
        this.protocolFormData.interfaces = 'USART'
        this.protocolFormData.address = this.USARTProtocolData.address
        this.protocolFormData.feature = this.USARTProtocolData.feature
        this.protocolFormData.delayPoll = this.USARTProtocolData.delayPoll
        this.protocolFormData.responseTimeout = this.USARTProtocolData.responseTimeout
      }
      this.addNodeDialogVisible = true
    },
    hideAddNodeDialog: function () {
      this.addNodeDialogVisible = false
    },
    showEditNodeDialog: function (node) {
      this.editNodeFormData = Object.assign({}, node)
      this.editNodeDialogVisible = true
    },
    hideEditNodeDialog: function () {
      this.editNodeDialogVisible = false
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getNodes()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageIndex = newPage
      this.getNodes()
    },
    confirmProtocol: async function () {
      const inter = {
        feature: this.protocolFormData.feature,
        responseTimeout: this.protocolFormData.responseTimeout,
        delayPoll: this.protocolFormData.delayPoll
      }

      if (this.isEthernet) {
        inter.address = this.protocolFormData.address + ':' + this.protocolFormData.ipPort
        await this.addEthernetConfig(inter)
      } else {
        inter.address = this.current
        await this.updateUSARTConfig(inter)
      }
      this.getNodes()
      this.protocolDialogVisible = false
    },
    getNodes: async function () {
      this.queryInfo.interfaces = this.current !== 'Any' ? (this.current) : ''
      try {
        const result = await this.$http.get('/modbus/nodes', {
          params: this.queryInfo
        })
        this.nodesList = result.data.list
        this.nodesTotal = result.data.total
      } catch (e) {
        // console.log(e)
      }
    },
    addNode: async function () {
      if (this.isEthernet && this.addNodeFormData.address === '') {
        this.$message.warning('请选择对应的从站ip地址!')
        return
      }
      try {
        await this.$http.post('/modbus/nodes', this.addNodeFormData)
        this.getNodes()
        this.$message.success('添加成功')
      } catch (e) {
        this.$message.warning('添加失败')
        // console.log(e)
      }
      this.addNodeDialogVisible = false
    },
    editNode: async function () {
      if (this.editNodeFormData.id === 0) {
        this.editNodeDialogVisible = false
        return
      }

      try {
        await this.$http.put('/modbus/nodes/' + this.editNodeFormData.id,
          this.editNodeFormData)
      } catch (e) {
        // console.log(e)
      }
      this.getNodes()
      this.editNodeDialogVisible = false
    },
    deleteAllNodes: async function () {
      if (this.nodesList.length === 0) {
        this.$message.info('没有什么可以删除!')
        return
      }

      try {
        await this.$confirm('是否确定删除所有节点?',
          '警告',
          { type: 'warning' }
        )
        try {
          await this.$http.delete('/modbus/nodes' +
            (this.isAny ? '' : ('/type/' + escape(this.current))))
          this.$message.success('删除成功!')
        } catch (e) {
          this.$message.error('删除失败!')
        }
        this.getNodes()
      } catch (e) {
        this.$message.info('操作取消.')
      }
    },
    deleteNode: async function (id) {
      if (id === 0) {
        return
      }

      try {
        await this.$confirm('是否确定删除所有节点?',
          '警告',
          { type: 'warning' }
        )
        try {
          await this.$http.delete('/modbus/nodes/' + id)
          this.$message.success('删除成功!')
        } catch (e) {
          this.$message.error('删除失败!')
        }
        this.getNodes()
      } catch (e) {
        this.$message.info('操作取消.')
      }
    },
    getUSARTConfig: async function () {
      try {
        const result = await this.$http.get('/modbus/usart/' +
          escape(this.current))
        this.USARTProtocolData = result.data
      } catch (e) {
        // console.log(e)
      }
    },
    updateUSARTConfig: async function (inter) {
      try {
        await this.$http.put('/modbus/usart', inter)
        this.$message.success('配置成功!')
      } catch (e) {
        this.$message.error('配置失败')
      }
      this.getUSARTConfig()
    },
    getEthernetConfig: async function () {
      try {
        const result = await this.$http.get('/modbus/ethernet')
        this.IPList = result.data.list
      } catch (e) {
        // console.log(e)
      }
    },
    addEthernetConfig: async function (inter) {
      try {
        await this.$http.post('/modbus/ethernet', inter)
        this.$message.success('添加成功!')
      } catch (e) {
        this.$message.error('添加失败')
      }
      this.getEthernetConfig()
    },
    deleteEthernetConfig: async function (id) {
      if (id === 0) {
        return
      }
      try {
        await this.$http.delete('/modbus/ethernet/' + id)
        this.$message.success('删除成功!')
      } catch (e) {
        this.$message.error('删除失败!')
      }
      this.getEthernetConfig()
      this.getNodes()
    },
    deleteAllEthernetConfig: async function () {
      if (this.IPList.length === 0) {
        this.$message.info('没有什么可以删除!')
        return
      }
      try {
        await this.$http.delete('/modbus/ethernet')
        this.$message.success('删除成功!')
      } catch (e) {
        this.$message.error('删除失败!')
      }
      this.getEthernetConfig()
      this.getNodes()
    }
  },
  mounted() {
    this.init()
  }
}
