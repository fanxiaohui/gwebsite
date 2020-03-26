export default {
  name: 'USARTConfig',
  data: function () {
    return {
      portsConfigs: []
    }
  },
  methods: {
    get: async function () {
      let isSuccess = true
      try {
        const result = await this.$http.get('/usart/config')
        this.portsConfigs = result.data.list
      } catch (e) {
        isSuccess = false
      }
      return isSuccess
    },
    // save: async function () {
    //   const cfg = {
    //     total: this.portsConfigs.length,
    //     list: {}
    //   }
    //   this.portsConfigs.forEach(function (item) {
    //     cfg.list[item.portName] = {
    //       portName: item.portName,
    //       address: item.address,
    //       baudRate: item.baudRate,
    //       dataBits: item.dataBits,
    //       stopBits: item.stopBits,
    //       parity: item.parity,
    //       timeout: item.timeout
    //     }
    //   })
    //
    //   try {
    //     await this.$http.put('/usart/config', cfg)
    //     this.get()
    //     this.$message.success('保存成功')
    //   } catch (e) {
    //     this.$message.error('保存失败')
    //   }
    // },
    refresh: async function () {
      await this.get()
        ? this.$message.success('刷新成功')
        : this.$message.error('刷新失败')
    }
  },
  created() {
    this.get()
  }
}
