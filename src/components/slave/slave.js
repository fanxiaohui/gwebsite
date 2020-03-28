export default {
  name: 'Slave',
  data: function() {
    return {
      interFormData: {
        inter: 'mbtcp',
        port: 502,
        bindInterface: []
      },
      queryInfo: {
        pageIndex: 1,
        pageSize: 10
      },
      bindInterList: [],
      nodes: [],
      total: 0,
      dialogVisible: false,
      hpVisible: false,
      interFromRules: {
        port: [
          { required: true, message: '请输入正确的端口', trigger: 'blur' }
        ],
        slaveID: [
          { required: true, message: '请输入从机地址', trigger: 'blur' }
          // { min: 0, max: 255, message: '值为1 ~ 255之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    showDialog: function() {
      this.dialogVisible = true
    },
    hideDialog: function() {
      this.dialogVisible = false
    },
    showHelp: function() {
      this.hpVisible = true
    },
    handleSizeChange(newSize) {
      this.queryInfo.pageSize = newSize
      this.getSlaves()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pageIndex = newPage
      this.getSlaves()
    },
    getBindInterface: async function() {
      try {
        const result = await this.$http.get('/modbus/interfaces')
        this.bindInterList = result.data.list
      } catch (e) {
        // console.log(e)
      }
    },
    getSlaves: async function() {
      try {
        const result = await this.$http.get('/modbus/slaves', {
          params: this.queryInfo
        })
        this.nodes = result.data.list
        this.total = result.data.total
        // console.log(result.data)
      } catch (e) {
        // console.log(e)
      }
    },
    addSlave: function() {
      this.$refs.interFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('输入不正确,请重新输入!')
          return
        }
        try {
          await this.$http.post('/modbus/slaves', this.interFormData)
          this.dialogVisible = false
          this.$message.success('添加成功!')
          this.getSlaves()
        } catch (e) {
          // console.log(e)
          this.$message.error('添加失败!')
        }
      })
    },
    deleteSlave: async function(id) {
      if (this.nodes.length === 0) {
        this.$message.info('没有什么可以删除!')
        return
      }
      try {
        await this.$confirm(
          '此操作将删除从机节点,是否确认?',
          '删除从机节点',
          { type: 'warning' }
        )
        try {
          let url = '/modbus/slaves' + (id !== 0 ? '/' + id : '')
          await this.$http.delete(url)
          this.getSlaves()
          this.$message.success('删除成功!')
        } catch (e) {
          // console.log(e)
          this.$message.error('删除失败!')
        }
      } catch (e) {
        // console.log(e)
        this.$message.info('操作取消!')
      }
    }
  },
  created() {
    this.getBindInterface()
    this.getSlaves()
  }
}
