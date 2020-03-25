export default {
  name: 'master',
  data: function () {
    return {
      portName: 'Any',
      nodesList: [], // 节点列表
      nodesTotal: 0, // 节眯总数
      IPList: [], // 当前IP列表,仅Ethernet有效
      usartProtocolData: { // 当前串口配置,仅usart有效
        portName: 'Port1',
        feature: 'none',
        delayPoll: 0,
        responseTimeout: 1000
      },
      protocolFormData: {
        portName: 'Port1',
        feature: 'none',
        ipAddress: '192.168.1.2', // ethernet有效
        ipPort: 502, // ethernet有效
        delayPoll: 0,
        responseTimeout: 1000
      },
      addNodeFormData: {
        portName: this.portName,
        slaveId: 1,
        ipAddress: '',
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
        portName: '',
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
      return this.portName === 'Ethernet'
    },
    isAny: function () {
      return this.portName === 'Any'
    }
  },
  watch: {
    $route() { // 路由变化引起初始化
      this.init()
    }
  },
  methods: {
    tabPath: function () {
      return this.isAny ? '所有从站' : (this.isEthernet ? '以太网' : this.portName)
    },
    init: function () {
      this.portName = this.$route.params.portName
      if (this.portName === 'Ethernet') {
        this.getEthernetConfig()
      } else if (this.portName !== 'Any') {
        this.getUSARTConfig()
      }
      this.getNodes()
    },
    showProtocolDialog: function () {
      if (this.isEthernet) {
        this.protocolFormData.portName = 'Ethernet'
        this.protocolFormData.feature = 'mbtcp'
      } else {
        this.protocolFormData.portName = this.usartProtocolData.portName
        this.protocolFormData.feature = this.usartProtocolData.feature
        this.protocolFormData.delayPoll = this.usartProtocolData.delayPoll
        this.protocolFormData.responseTimeout = this.usartProtocolData.responseTimeout
      }
      this.protocolDialogVisible = true
    },
    hideProtocolDialog: function () {
      this.protocolDialogVisible = false
    },
    showAddNodeDialog: function () {
      if (this.isAny) {
        return
      } else if (this.isEthernet) {
        this.protocolFormData.portName = 'Ethernet'
        this.addNodeFormData.ipAddress = ''
      } else if (this.usartProtocolData.feature === 'none') {
        this.$message.error('未使能相关协议!!! 请先配置!')
        return
      } else {
        this.protocolFormData.portName = this.usartProtocolData.portName
        this.protocolFormData.feature = this.usartProtocolData.feature
        this.protocolFormData.delayPoll = this.usartProtocolData.delayPoll
        this.protocolFormData.responseTimeout = this.usartProtocolData.responseTimeout
      }
      this.addNodeFormData.portName = this.portName
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
      let inter = {
        feature: this.protocolFormData.feature,
        responseTimeout: this.protocolFormData.responseTimeout,
        delayPoll: this.protocolFormData.delayPoll
      }

      if (this.isEthernet) {
        inter.ipAddress = this.protocolFormData.ipAddress +
          ':' + this.protocolFormData.ipPort
        await this.addEthernetConfig(inter)
      } else {
        inter.portName = this.protocolFormData.portName
        await this.updateUSARTConfig(inter)
      }
      this.getNodes()
      this.protocolDialogVisible = false
    },
    getNodes: async function () {
      this.queryInfo.portName = this.portName !== 'Any' ? (this.portName) : ''
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
      if (this.isEthernet && this.addNodeFormData.ipAddress === '') {
        this.$message.warning('请选择对应的从站ip地址!')
        return
      }
      try {
        await this.$http.post('/modbus/nodes', this.addNodeFormData)
        this.getNodes()
      } catch (e) {
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
            (this.isAny ? '' : ('/type/' + this.portName)))
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
        const result = await this.$http.get('/modbus/usart/' + this.portName)
        this.usartProtocolData = result.data
      } catch (e) {
        // console.log(e)
      }
    },
    updateUSARTConfig: async function (inter) {
      try {
        await this.$http.put('/modbus/usart/' +
          inter.portName, inter)
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
