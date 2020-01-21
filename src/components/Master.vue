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
        <el-table-column prop="slaveID" label="从站地址"/>
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
        <el-button type="primary" round @click="showAddNodeDialog">添加从机</el-button>
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
    <!-- 添加从机节点 -->
    <el-dialog :title="tabPath()" :visible.sync="addSlaveDialogVisible" center width="800px">
      <el-card>
        <el-row>
          <el-form ref="gatherFormRef" :model="addSlaveFormData" label-width="100px" class="gather_box">
            <el-col :span="24">
              <el-form-item label="协议类型:">
                <el-input v-if="protoFormData.feature==='mbrtu'" value="MODBUS-RTU" class="interWidth" disabled/>
                <el-input v-else-if="protoFormData.feature==='mbascii'" value="MODBUS-ASCII" class="interWidth"
                          disabled/>
                <el-input v-else-if="protoFormData.feature==='mbtcp'" value="MODBUS-TCP" class="interWidth" disabled/>
                <el-input v-else value="None" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item v-if="portName==='Ethernet'" label="从站IP:">
                <el-input :value="ipAddrPort" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="接口:">
                <el-input :value="portName" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="命令延时(ms):">
                <el-input :value="protoFormData.delayPoll" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="回复超时(ms):">
                <el-input :value="protoFormData.responseTimeout" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="从机地址:" prop="slaveID">
                <el-input v-model="addSlaveFormData.slaveID" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- coil-->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasCoil">
                <el-switch v-model="addSlaveFormData.hasCoil" active-color="#13ce66" inactive-color="#ff4949"/>
                <strong class="netTypeShow">{{addSlaveFormData.hasCoil ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[1]Read Coils" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="coilAddress">
                <el-input type="number" v-model.number="addSlaveFormData.coilAddress"
                          :disabled="!addSlaveFormData.hasCoil" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="coilQuantity">
                <el-input type="number" v-model.number="addSlaveFormData.coilQuantity"
                          :disabled="!addSlaveFormData.hasCoil" class="interWidth"/>
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="coilVirtualAddress">
                <el-input type="number" v-model.number="addSlaveFormData.coilVirtualAddress"
                          :disabled="!addSlaveFormData.hasCoil" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="coilScanRate">
                <el-input type="number" v-model.number="addSlaveFormData.coilScanRate"
                          :disabled="!addSlaveFormData.hasCoil" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- discrete -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasDiscrete">
                <el-switch v-model="addSlaveFormData.hasDiscrete" active-color="#13ce66" inactive-color="#ff4949"/>
                <strong class="netTypeShow">{{addSlaveFormData.hasDiscrete ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[2]Read Discrete Inputs" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="discreteAddress">
                <el-input type="number" v-model.number="addSlaveFormData.discreteAddress"
                          :disabled="!addSlaveFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="discreteQuantity">
                <el-input type="number" v-model.number="addSlaveFormData.discreteQuantity"
                          :disabled="!addSlaveFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="discreteVirtualAddress">
                <el-input type="number" v-model.number="addSlaveFormData.discreteVirtualAddress"
                          :disabled="!addSlaveFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="discreteScanRate">
                <el-input type="number" v-model.number="addSlaveFormData.discreteScanRate"
                          :disabled="!addSlaveFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- holding register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasHolding">
                <el-switch v-model="addSlaveFormData.hasHolding" active-color="#13ce66" inactive-color="#ff4949"/>
                <strong class="netTypeShow">{{addSlaveFormData.hasHolding ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[3]Read Holding Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="holdingAddress">
                <el-input type="number" v-model.number="addSlaveFormData.holdingAddress"
                          :disabled="!addSlaveFormData.hasHolding" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="holdingQuantity">
                <el-input type="number" v-model.number="addSlaveFormData.holdingQuantity"
                          :disabled="!addSlaveFormData.hasHolding" class="interWidth"/>
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="holdingVirtualAddress">
                <el-input type="number" v-model.number="addSlaveFormData.holdingVirtualAddress"
                          :disabled="!addSlaveFormData.hasHolding" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="holdingScanRate">
                <el-input type="number" v-model.number="addSlaveFormData.holdingScanRate"
                          :disabled="!addSlaveFormData.hasHolding" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- input register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasInput">
                <el-switch v-model="addSlaveFormData.hasInput" active-color="#13ce66" inactive-color="#ff4949"/>
                <strong class="netTypeShow">{{addSlaveFormData.hasInput ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[4]Read Input Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="inputAddress">
                <el-input type="number" v-model.number="addSlaveFormData.inputAddress"
                          :disabled="!addSlaveFormData.hasInput" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="inputQuantity">
                <el-input type="number" v-model.number="addSlaveFormData.inputQuantity"
                          :disabled="!addSlaveFormData.hasInput" class="interWidth"/>
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="inputVirtualAddress">
                <el-input type="number" v-model.number="addSlaveFormData.inputVirtualAddress"
                          :disabled="!addSlaveFormData.hasInput" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="inputScanRate">
                <el-input type="number" v-model.number="addSlaveFormData.inputScanRate"
                          :disabled="!addSlaveFormData.hasInput" class="interWidth"/>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
        <div class="gather_btns">
          <el-button type="primary" round @click="addNode">确定</el-button>
          <el-button type="info" round @click="cancelAddNodeDialog">取消</el-button>
          <el-button type="info" round @click="hpVisible=true">帮助</el-button>
        </div>
      </el-card>
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
      addSlaveFormData: {
        portName: this.portName,
        slaveID: 1,
        ipAddress: '',
        hasCoil: true,
        coilAddress: 0,
        coilQuantity: 10,
        coilVirtualAddress: 0,
        coilScanRate: 1000,
        hasDiscrete: true,
        discreteAddress: 0,
        discreteQuantity: 10,
        discreteVirtualAddress: 0,
        discreteScanRate: 1000,
        hasHolding: true,
        holdingAddress: 0,
        holdingQuantity: 10,
        holdingVirtualAddress: 0,
        holdingScanRate: 1000,
        hasInput: true,
        inputAddress: 0,
        inputQuantity: 10,
        inputVirtualAddress: 0,
        inputScanRate: 1000
      },
      protoDialogVisible: false,
      addSlaveDialogVisible: false,
      hpVisible: false
    }
  },
  computed: {
    ipAddrPort: function () {
      return this.protoFormData.ipAddress + ':' + this.protoFormData.ipPort
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
    showAddNodeDialog: function () {
      this.addSlaveDialogVisible = true
    },
    cancelAddNodeDialog: function () {
      this.addSlaveDialogVisible = false
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
      let url = '/gather/modbus/node' + ((this.portName !== 'Any') ? ('?portName=' + this.portName) : '')
      try {
        const result = await this.$http.get(url)
        this.nodes = result.data.nodeList
        console.log(this.nodes)
      } catch (e) {
        console.log(e)
      }
    },
    addNode: async function () {
      try {
        await this.$http.put('/gather/modbus/node', this.addSlaveFormData)
        this.getNodes()
      } catch (e) {
        console.log(e)
      }
      this.addSlaveDialogVisible = false
    },
    editNode: function () {
    },
    deleteNode: async function (id) {
      let del = {}
      try {
        if (id < 0) {
          del.portName = this.portName
        } else {
          del.id = id
        }
        await this.$http.delete('/gather/modbus/node', del)
        this.getNodes()
      } catch (e) {
        console.log(e)
      }
    },
    getPort: async function () {
      try {
        const result = await this.$http.get('/gather/usart', { params: { portName: this.portName } })
        this.protoFormData = result.data.configList[0]
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

  .interWidth {
    width: 200px;
  }

  .gather_box {
    strong {
      padding-left: 20px;
    }

    .el-row, .el-col {
      border: 1px solid #eee;
    }

    .el-col {
      padding: 10px 15px;
    }

    .el-form-item {
      margin-bottom: 5px;
    }
  }

  .gather_btns {
    padding-top: 20px;
    text-align: end;
  }
</style>
