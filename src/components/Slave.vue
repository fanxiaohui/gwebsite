<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>从机模式</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div slot="header" class="clearfix">
        <strong>采集任务</strong>
      </div>
      <el-table :data="nodes">
        <el-table-column prop="inter" label="接口"/>
        <el-table-column prop="port" label="端口"/>
        <el-table-column prop="slaveID" label="从站地址"/>
        <el-table-column prop="bindPortName" label="绑定接口"/>
        <el-table-column>
          <template slot-scope="scope">
            <!--                <el-button @click="handleEdit(scope.row.id)">编辑</el-button>-->
            <el-button type="danger" @click="deleteSlave(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="action_btns">
        <el-button type="primary" round @click="showDialog">添加从机</el-button>
        <el-button type="danger" round @click="deleteSlave(0)">全部删除</el-button>
        <el-button type="info" round @click="hpVisible=true">帮助</el-button>
      </div>
    </el-card>
    <el-dialog title="以太网" :visible.sync="dialogVisible" center width="400px">
      <el-form ref="interFormRef" :rules="interFromRules" :model="interFormData" label-width="100px">
        <el-form-item label="协议类型:" prop="username">
          <template>
            <el-select v-model="interFormData.inter" class="interWidth">
              <el-option label="MODBUS-TCP" value="mbtcp"/>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="服务端口:" prop="port">
          <el-input type="number" v-model.number="interFormData.port" class="interWidth"/>
        </el-form-item>
        <el-form-item label="从机地址:" prop="slaveID">
          <el-input type="number" v-model.number="interFormData.slaveID" class="interWidth"/>
        </el-form-item>
        <el-form-item label="绑定端口:" prop="bindPortName">
          <template>
            <el-select v-model="interFormData.bindPortName" class="interWidth">
              <el-option v-for="item in bindInterList" :key="item" :value="item"/>
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="form_btns">
          <el-button type="primary" round @click="addSlave">确定</el-button>
          <el-button type="info" round @click="cancel">取消</el-button>
          <el-button type="info" round @click="hpVisible=true">帮助</el-button>
        </span>
    </el-dialog>
    <el-drawer title="帮助" :visible.sync="hpVisible" direction="rtl">
      <div>
        <el-alert type="warning" center :closable="false" show-icon title="注意:" description="配置信息需重启才生效"/>
        <el-alert type="info" :closable="false" description="从站模式跟上位机通讯，是对主站的映射。"/>
        <el-alert type="info" :closable="false" title="接口：" description="协议及端口"/>
        <el-alert type="info" :closable="false" title="从站地址：" description="Modbus从站地址"/>
        <el-alert type="info" :closable="false" title="绑定接口：" description=" 绑定该接口用于转发该接口数据"/>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'Slave',
  data: function () {
    return {
      interFormData: {
        inter: 'mbtcp',
        port: 502,
        slaveID: 1,
        bindPortName: 'Port1'
      },
      bindInterList: [],
      nodes: [],
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
    getSlaves: async function () {
      try {
        const result = await this.$http.get('/modbus/slaves')
        this.bindInterList = result.data.bindInterface
        this.nodes = result.data.slaveNode
        console.log(this.nodes)
      } catch (e) {
        console.log(e)
      }
    },
    showDialog: function () {
      this.dialogVisible = true
    },
    cancel: function () {
      this.dialogVisible = false
    },
    addSlave: function () {
      this.$refs.interFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('输入不正确,请重新输入!')
          return
        }
        try {
          await this.$http.put('/modbus/slaves', this.interFormData)
          this.$message.success('添加成功!')
          this.dialogVisible = false
          this.getSlaves()
        } catch (e) {
          console.log(e)
          this.$message.error('添加失败!')
        }
      })
    },
    deleteSlave: async function (id) {
      if (this.nodes.length === 0) {
        this.$message.info('没有什么可以删除!')
        return
      }
      try {
        await this.$messageBox.confirm('此操作将删除从机节点,是否确认?', '删除从机节点', { type: 'warning' })
        try {
          await this.$http.delete('/modbus/slaves', {
            data: { id: id }
          })
          this.getSlaves()
          this.$message.success('删除成功!')
        } catch (e) {
          console.log(e)
          this.$message.error('删除失败!')
        }
      } catch (e) {
        this.$message.info('操作取消!')
      }
    }
  },
  created() {
    this.getSlaves()
  }
}
</script>

<style lang="less" scoped>
  .action_btns {
    margin-top: 20px;
  }

  .interWidth {
    width: 200px;
  }
</style>
