<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{tabPath()}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div slot="header" class="clearfix">
        <strong>采集任务</strong>
      </div>
      <el-table :data="nodes">
        <el-table-column prop="portName" label="接口"/>
        <el-table-column v-if="portName === 'Ethernet'" prop="ipAddress" label="从站IP"/>
        <el-table-column prop="port" label="从站地址"/>
        <el-table-column prop="slaveID" label="功能码"/>
        <el-table-column prop="coilAddress" label="数据地址"/>
        <el-table-column prop="coilQuantity" label="数量"/>
        <el-table-column prop="coilVirtualAddress" label="虚拟地址"/>
        <el-table-column prop="coilScanRate" label="扫描周期"/>
        <el-table-column label="配置">
          <template slot-scope="scope">
            <el-button type="primate" @click="editNode(scope.row.id)">编辑</el-button>
            <el-button type="danger" @click="deleteNode(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="action_btns">
        <el-button type="primary" round @click="showProtoDialog">编辑当前协议</el-button>
        <el-button type="primary" round @click="showDialog">添加从机</el-button>
        <el-button type="danger" round @click="deleteNode(0)">全部删除</el-button>
        <el-button type="info" round @click="hpVisible=true">帮助</el-button>
      </div>
    </el-card>
    <el-dialog :title="tabPath()" :visible.sync="protoDialogVisible" center width="400px">
      <el-form ref="protoFormRef" :model="protoFormData" label-width="100px">
        <el-form-item label="协议类型:" prop="feature">
          <template>
            <el-select v-model="protoFormData.feature" class="interWidth">
              <el-option v-if="portName!=='Ethernet'" label="None" value="none"/>
              <el-option v-if="portName!=='Ethernet'" label="MODBUS-RTU" value="mbrtu"/>
              <el-option v-if="portName!=='Ethernet'" label="MODBUS-ASCII" value="mbascii"/>
              <el-option v-if="portName==='Ethernet'" label="MODBUS-TCP" value="mbtcp"/>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item v-if="portName==='Ethernet'" label="IP地址:" prop="ipAddress">
          <el-input v-model="protoFormData.ipAddress" class="interWidth"/>
        </el-form-item>
        <el-form-item v-if="portName==='Ethernet'" label="IP端口:" prop="ipPort">
          <el-input type="number" v-model.number="protoFormData.ipPort" class="interWidth"/>
        </el-form-item>
        <el-form-item label="回复超时:" prop="port">
          <el-input type="number" v-model.number="protoFormData.responseTimeout" class="interWidth"/>
        </el-form-item>
        <el-form-item label="命令延时:" prop="slaveID">
          <el-input type="number" v-model.number="protoFormData.delayPoll" class="interWidth"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="form_btns">
          <el-button type="primary" round @click="doConfirm">确定</el-button>
          <el-button type="info" round @click="cancelPortoDialog">取消</el-button>
          <el-button type="info" round @click="hpVisible=true">帮助</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'master',
  data: function () {
    return {
      nodes: [],
      IPlist: [], // 当前IP列表,仅网络口有效
      protoFormData: {
        portName: '',
        feature: 'mbtcp',
        ipAddress: '', // ethernet有效
        ipPort: 502, // ethernet有效
        delayPoll: 0,
        responseTimeout: 1000
      }, // 当前port口配置,仅串口有效
      protoDialogVisible: false,
      hpVisible: false
    }
  },
  props: ['portName'],
  methods: {
    tabPath: function () {
      return this.portName === 'Any' ? '所有从站' : (this.portName === 'Ethernet' ? '以太网' : this.portName)
    },
    showProtoDialog: function () {
      if (this.portName !== 'Ethernet') {
        this.getPort()
      }
      this.protoDialogVisible = true
    },
    cancelPortoDialog: function () {
      this.protoDialogVisible = false
    },
    showDialog: function () {
    },
    doConfirm: async function () {
      let url = '/gather/usart'
      let inter = {
        portName: this.protoFormData.portName,
        feature: this.protoFormData.feature,
        responseTimeout: this.protoFormData.responseTimeout,
        delayPoll: this.protoFormData.delayPoll,
        ipAddress: ''
      }

      if (this.portName === 'Ethernet') {
        inter.ipAddress = this.protoFormData.ipAddress + ':' + this.protoFormData.ipPort
        inter.portName = ''
        url = '/gather/ethernet?action=add'
      }
      await this.$http.post(url, inter)
      this.protoDialogVisible = false
    },
    getNodes: async function () {
      let url = '/gather/modbus/nodelist' + ((this.portName !== 'Any') ? ('?portName=' + this.portName) : '')
      try {
        const result = await this.$http.get(url)
        this.nodes = result.data.nodeList
        console.log(this.nodes)
      } catch (e) {
        console.log(e)
      }
    },
    editNode: function () {
    },
    deleteNode: function (id) {
    },
    getPort: async function () {
      try {
        const result = await this.$http.get('/gather/usart', { params: { portName: this.portName } })
        this.protoFormData = result.data.configList[0]
        console.log(this.protoFormData)
      } catch (e) {
        console.log(e)
      }
    }
  },
  mounted() {
    this.getNodes()
  }
}
</script>

<style lang="less" scoped>
  .action_btns {
    margin-top: 20px;
  }
</style>
