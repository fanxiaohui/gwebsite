function escape(str) {
  return str.replace(/\//g, '%2F')
}

export default {
  name: 'USARTConfig',
  data: function () {
    return {
      ports: [],
      port: {
        address: '',
        baudRate: 9600,
        dataBits: 8,
        parity: 'N',
        stopBits: 1,
        timeout: 1000
      },
      addDialogVisible: false
    }
  },
  methods: {
    showAddDialog: function () {
      this.addDialogVisible = true
    },
    hideAddDialog: function () {
      this.addDialogVisible = false
    },
    get: async function () {
      const result = await this.$http.get('/usart/config')
      this.ports = result.data.list
    },
    add: async function () {
      try {
        await this.$http.post('/usart/config', this.port)
        this.get()
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error('保存失败')
      }
      this.addDialogVisible = false
    },
    save: async function (port) {
      console.log(port)
      try {
        await this.$http.put('/usart/config', port)
        await this.get()
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error('保存失败')
      }
    },
    deleteIt: async function (address) {
      try {
        await this.$confirm('是否确定删除此配置?',
          '警告',
          { type: 'warning' }
        )
        try {
          await this.$http.delete(`/usart/config/${escape(address)}`)
          this.$message.success('删除成功')
        } catch (e) {
          this.$message.error('删除失败')
        }
        this.get()
      } catch (e) {
        this.$message.info('操作取消')
      }
    },
    refresh: async function () {
      try {
        await this.get()
        this.$message.success('刷新成功')
      } catch (e) {
        this.$message.error('刷新失败')
      }
    }
  },
  created() {
    this.get()
  }
}
