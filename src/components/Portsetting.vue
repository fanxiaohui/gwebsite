<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>串口设置</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>网络设置</span>
      </div>
      <el-row type="flex" justify="center">
        <el-col :xs="22" :sm="20" :md="16" :lg="16" :xl="12">
          <template>
            <el-table :data="portsConfigs" style="width: 100%" stripe border>
              <el-table-column prop="portName" label="串口"/>
              <el-table-column label="接口类型">RS485/RS232</el-table-column>
              <el-table-column prop="baudRate" label="波特率">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.baudRate">
                    <el-option :value="2400"/>
                    <el-option :value="4800"/>
                    <el-option :value="9600"/>
                    <el-option :value="19200"/>
                    <el-option :value="38400"/>
                    <el-option :value="57600"/>
                    <el-option :value="115200"/>
                    <el-option :value="230400"/>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="dataBits" label="数据位">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.dataBits">
                    <el-option :value="7"/>
                    <el-option :value="8"/>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="stopBits" label="停止位">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.stopBits">
                    <el-option :value="1"/>
                    <el-option :value="2"/>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="parity" label="奇偶校验位">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.parity">
                    <el-option label="None" value="N"/>
                    <el-option label="Even" value="E"/>
                    <el-option label="Odd" value="O"/>
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </template>
          <div class="action_btns">
            <el-button type="success" round @click="refresh">刷新</el-button>
            <el-button type="primary" round @click="saveUsartConfig">保存</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Portsetting',
  data: function () {
    return {
      portsConfigs: []
    }
  },
  methods: {
    getUsartConfig: async function () {
      let isSuccess = true
      try {
        const result = await this.$http.get('/usart/config')
        this.portsConfigs = result.data.portsList
      } catch (e) {
        isSuccess = false
      }
      return isSuccess
    },
    saveUsartConfig: async function () {
      try {
        await this.$http.put('/usart/config', { portsList: this.portsConfigs })
        this.getUsartConfig()
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error('保存失败')
      }
    },
    refresh: async function () {
      await this.getUsartConfig() ? this.$message.success('刷新成功') : this.$message.error('刷新失败')
    }
  },
  created() {
    this.getUsartConfig()
  }
}
</script>

<style lang="less" scoped>
  .action_btns {
    padding-top: 20px;
  }
</style>
