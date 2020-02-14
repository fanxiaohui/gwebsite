<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{tabPath()}}</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <strong>采集任务</strong>
      </div>
      <!-- 以太网从站IP配置 -->
      <el-collapse v-show="isEthernet">
        <el-collapse-item title="以太网==>从站IP">
          <el-table :data="IPlist" border>
            <el-table-column prop="feature" label="协议" width="100px" align="center"/>
            <el-table-column prop="ipAddress" label="从站地址" align="center"/>
            <el-table-column prop="delayPoll" label="延时时间" align="center"/>
            <el-table-column prop="responseTimeout" label="回复超时" align="center"/>
            <el-table-column label="配置" width="200px" align="center">
              <template slot-scope="scope">
                <el-button type="danger" @click="deleteEthernetConfig(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="eth_btns">
            <el-button type="primary" round @click="showProtocolDialog">添加</el-button>
            <el-button type="danger" round @click="deleteEthernetConfig(0)">全部删除</el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
      <!--  串口协议的配置  -->
      <el-form v-show="!isEthernet &&!isAny" :model="protocolFormData" label-position="left" inline>
        <el-form-item label="接口:">
          <el-input :value="protocolFormData.portName" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item label="协议类型:">
          <el-input
            v-if="protocolFormData.feature==='mbrtu'"
            value="MODBUS-RTU"
            class="showProtoWidth"
            disabled
          />
          <el-input
            v-else-if="protocolFormData.feature==='mbascii'"
            value="MODBUS-ASCII"
            class="showProtoWidth"
            disabled
          />
          <el-input v-else value="None" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item label="命令延时(ms):">
          <el-input :value="protocolFormData.delayPoll" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item label="回复超时(ms):">
          <el-input :value="protocolFormData.responseTimeout" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" round @click="showProtocolDialog">配置</el-button>
        </el-form-item>
      </el-form>
      <!-- 从站列表 -->
      <el-table :data="nodes" border class="node_table">
        <el-table-column prop="portName" label="接口" width="80px" align="center"/>
        <el-table-column
          v-if="isEthernet || isAny"
          prop="ipAddress"
          label="从站IP"
          width="200px"
          align="center"
        />
        <el-table-column prop="slaveID" label="从站地址" width="80px" align="center"/>
        <el-table-column label="功能码参数" align="center">
          <template slot-scope="props">
            <table class="node_internal_table">
              <thead>
              <tr>
                <th>功能码</th>
                <th>数据地址</th>
                <th>数量</th>
                <th>虚拟地址</th>
                <th>扫描周期(ms)</th>
              </tr>
              </thead>
              <tr v-show="props.row.hasCoil">
                <td>1</td>
                <td>{{props.row.coilAddress}}</td>
                <td>{{props.row.coilQuantity}}</td>
                <td>{{props.row.coilVirtualAddress}}</td>
                <td>{{props.row.coilScanRate}}</td>
              </tr>
              <tr v-show="props.row.hasDiscrete">
                <td>2</td>
                <td>{{props.row.discreteAddress}}</td>
                <td>{{props.row.discreteQuantity}}</td>
                <td>{{props.row.discreteVirtualAddress}}</td>
                <td>{{props.row.discreteScanRate}}</td>
              </tr>
              <tr v-show="props.row.hasHolding">
                <td>3</td>
                <td>{{props.row.holdingAddress}}</td>
                <td>{{props.row.holdingQuantity}}</td>
                <td>{{props.row.holdingVirtualAddress}}</td>
                <td>{{props.row.holdingScanRate}}</td>
              </tr>
              <tr v-show="props.row.hasInput">
                <td>4</td>
                <td>{{props.row.inputAddress}}</td>
                <td>{{props.row.inputQuantity}}</td>
                <td>{{props.row.inputVirtualAddress}}</td>
                <td>{{props.row.inputScanRate}}</td>
              </tr>
            </table>
          </template>
        </el-table-column>
        <el-table-column label="配置" width="200px" align="center">
          <template slot-scope="scope">
            <el-button type="primate" @click="editNode(scope.row.id)">编辑</el-button>
            <el-button type="danger" @click="deleteNode(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pageNum"
        :page-sizes="[10, 20, 50, 100, 200]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="nodesTotal"
      ></el-pagination>
      <div class="node_btns">
        <el-button type="primary" round v-show="!isAny" @click="showAddNodeDialog">添加从机</el-button>
        <el-button type="danger" round @click="deleteAllNodes()">全部删除</el-button>
        <el-button type="info" round @click="hpVisible=true">帮助</el-button>
      </div>
    </el-card>
    <!-- 添加IP从机或配置串口协议 -->
    <el-dialog :title="tabPath()" :visible.sync="protocolDialogVisible" center width="400px">
      <el-form ref="protocolFormRef" :model="protocolFormData" label-width="100px">
        <el-form-item label="协议类型:" prop="feature">
          <template>
            <el-select v-model="protocolFormData.feature" class="interWidth">
              <el-option v-if="!isEthernet" label="None" value="none"/>
              <el-option v-if="!isEthernet" label="MODBUS-RTU" value="mbrtu"/>
              <el-option v-if="!isEthernet" label="MODBUS-ASCII" value="mbascii"/>
              <el-option v-if="isEthernet" label="MODBUS-TCP" value="mbtcp"/>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item v-if="isEthernet" label="IP地址:" prop="ipAddress">
          <el-input v-model="protocolFormData.ipAddress" class="interWidth"/>
        </el-form-item>
        <el-form-item v-if="isEthernet" label="IP端口:" prop="ipPort">
          <el-input type="number" v-model.number="protocolFormData.ipPort" class="interWidth"/>
        </el-form-item>
        <el-form-item label="回复超时:" prop="port">
          <el-input
            type="number"
            v-model.number="protocolFormData.responseTimeout"
            class="interWidth"
          />
        </el-form-item>
        <el-form-item label="命令延时:" prop="slaveID">
          <el-input type="number" v-model.number="protocolFormData.delayPoll" class="interWidth"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="protocol_btns">
        <el-button type="primary" round @click="confirmProtocol">确定</el-button>
        <el-button type="info" round @click="hideProtocolDialog">取消</el-button>
        <el-button type="info" round @click="hpVisible=true">帮助</el-button>
      </span>
    </el-dialog>
    <!-- 添加从机地址 -->
    <el-dialog :title="tabPath()" :visible.sync="addSlaveDialogVisible" center width="800px">
      <el-card>
        <el-row>
          <el-form
            ref="addSlaveFormRef"
            :model="addSlaveFormData"
            label-width="100px"
            class="gather_box"
          >
            <el-col :span="24">
              <el-form-item v-if="isEthernet" label="从站IP:">
                <el-select v-model="addSlaveFormData.ipAddress" class="interWidth">
                  <el-option v-for="item in IPlist" :key="item.ipAddress" :value="item.ipAddress"/>
                </el-select>
              </el-form-item>
              <div v-if="!isEthernet">
                <el-form-item label="接口:">
                  <el-input :value="protocolFormData.portName" class="interWidth" disabled/>
                </el-form-item>
                <el-form-item label="协议类型:">
                  <el-input
                    v-if="protocolFormData.feature==='none'"
                    value="None"
                    class="interWidth"
                    disabled
                  />
                  <el-input
                    v-if="protocolFormData.feature==='mbrtu'"
                    value="MODBUS-RTU"
                    class="interWidth"
                    disabled
                  />
                  <el-input
                    v-else-if="protocolFormData.feature==='mbascii'"
                    value="MODBUS-ASCII"
                    class="interWidth"
                    disabled
                  />
                  <el-input
                    v-else-if="protocolFormData.feature==='mbtcp'"
                    value="MODBUS-TCP"
                    class="interWidth"
                    disabled
                  />
                  <el-input v-else value="None" class="interWidth" disabled/>
                </el-form-item>
                <el-form-item label="命令延时(ms):">
                  <el-input :value="protocolFormData.delayPoll" class="interWidth" disabled/>
                </el-form-item>
                <el-form-item label="回复超时(ms):">
                  <el-input :value="protocolFormData.responseTimeout" class="interWidth" disabled/>
                </el-form-item>
              </div>
              <el-form-item label="从机地址:" prop="slaveID">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.slaveID"
                  class="interWidth"
                />
              </el-form-item>
            </el-col>
            <!-- coil-->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasCoil">
                <el-switch
                  v-model="addSlaveFormData.hasCoil"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
                <strong>{{addSlaveFormData.hasCoil ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[1]Read Coils" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="coilAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.coilAddress"
                  :disabled="!addSlaveFormData.hasCoil"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="数量:" prop="coilQuantity">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.coilQuantity"
                  :disabled="!addSlaveFormData.hasCoil"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="coilVirtualAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.coilVirtualAddress"
                  :disabled="!addSlaveFormData.hasCoil"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="coilScanRate">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.coilScanRate"
                  :disabled="!addSlaveFormData.hasCoil"
                  class="interWidth"
                />
              </el-form-item>
            </el-col>
            <!-- discrete -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasDiscrete">
                <el-switch
                  v-model="addSlaveFormData.hasDiscrete"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
                <strong>{{addSlaveFormData.hasDiscrete ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[2]Read Discrete Inputs" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="discretdeleteEthernetConfigeAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.discreteAddress"
                  :disabled="!addSlaveFormData.hasDiscrete"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="数量:" prop="discreteQuantity">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.discreteQuantity"
                  :disabled="!addSlaveFormData.hasDiscrete"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="discreteVirtualAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.discreteVirtualAddress"
                  :disabled="!addSlaveFormData.hasDiscrete"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="discreteScanRate">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.discreteScanRate"
                  :disabled="!addSlaveFormData.hasDiscrete"
                  class="interWidth"
                />
              </el-form-item>
            </el-col>
            <!-- holding register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasHolding">
                <el-switch
                  v-model="addSlaveFormData.hasHolding"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
                <strong>{{addSlaveFormData.hasHolding ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[3]Read Holding Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="holdingAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.holdingAddress"
                  :disabled="!addSlaveFormData.hasHolding"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="数量:" prop="holdingQuantity">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.holdingQuantity"
                  :disabled="!addSlaveFormData.hasHolding"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="holdingVirtualAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.holdingVirtualAddress"
                  :disabled="!addSlaveFormData.hasHolding"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="holdingScanRate">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.holdingScanRate"
                  :disabled="!addSlaveFormData.hasHolding"
                  class="interWidth"
                />
              </el-form-item>
            </el-col>
            <!-- input register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasInput">
                <el-switch
                  v-model="addSlaveFormData.hasInput"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
                <strong>{{addSlaveFormData.hasInput ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[4]Read Input Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="inputAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.inputAddress"
                  :disabled="!addSlaveFormData.hasInput"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="数量:" prop="inputQuantity">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.inputQuantity"
                  :disabled="!addSlaveFormData.hasInput"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="虚拟地址:" prop="inputVirtualAddress">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.inputVirtualAddress"
                  :disabled="!addSlaveFormData.hasInput"
                  class="interWidth"
                />
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="inputScanRate">
                <el-input
                  type="number"
                  v-model.number="addSlaveFormData.inputScanRate"
                  :disabled="!addSlaveFormData.hasInput"
                  class="interWidth"
                />
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
        <div class="gather_btns">
          <el-button type="primary" round @click="addNode">确定</el-button>
          <el-button type="info" round @click="hideAddNodeDialog">取消</el-button>
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
      portName: 'Any',
      nodes: [], // 从机节点列表
      nodesTotal: 0,
      IPlist: [], // 当前IP列表,仅网络口有效
      protocolFormData: {
        portName: 'Port1',
        feature: 'none',
        ipAddress: '192.168.1.2', // ethernet有效
        ipPort: 502, // ethernet有效
        delayPoll: 0,
        responseTimeout: 1000
      },
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
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      },
      protocolDialogVisible: false,
      editProtocolDialogVisible: false,
      addSlaveDialogVisible: false,
      hpVisible: false
    }
  },
  computed: {
    ipAddrPort: function () {
      return (
        this.protocolFormData.ipAddress + ':' + this.protocolFormData.ipPort
      )
    },
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
        this.getPortConfig()
      }
      this.getNodes()
    },
    showProtocolDialog: function () {
      if (this.isEthernet) {
        this.protocolFormData.portName = 'Ethernet'
        this.protocolFormData.feature = 'mbtcp'
        this.protocolFormData.ipAddress = '192.168.1.2'
        this.protocolFormData.ipPort = 502
      } else {
        this.getPortConfig()
      }
      this.protocolDialogVisible = true
    },
    hideProtocolDialog: function () {
      this.protocolDialogVisible = false
    },
    showEditProtocolDialog: function () {
      this.editProtocolDialogVisible = true
    },
    hideEditProtocolDialog: function () {
      this.editProtocolDialogVisible = false
    },
    showAddNodeDialog: function () {
      if (!this.isEthernet) {
        const ok = this.getPortConfig()
        if (!ok || this.protocolFormData.feature === 'none') {
          this.$message.error('未使能相关协议!! 请先配置!')
          return
        }
      } else {
        this.getEthernetConfig()
        this.addSlaveFormData.ipAddress = ''
      }
      this.addSlaveFormData.portName = this.portName
      this.addSlaveDialogVisible = true
    },
    hideAddNodeDialog: function () {
      this.addSlaveDialogVisible = false
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getNodes()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getNodes()
    },
    getNodes: async function () {
      let url = '/gather/modbus/nodes' +
        (this.portName !== 'Any' ? ('/' + this.portName) : '')
      try {
        const result = await this.$http.get(url, {
          params: this.queryInfo
        })
        this.nodes = result.data.nodeList
        // console.log(this.nodes)
      } catch (e) {
        // console.log(e)
      }
    },
    addNode: async function () {
      try {
        await this.$http.put('/gather/modbus/nodes', this.addSlaveFormData)
        this.getNodes()
      } catch (e) {
        // console.log(e)
      }
      this.addSlaveDialogVisible = false
    },
    editNode: function () {
    },
    deleteAllNodes: async function () {
      if (this.nodes.length === 0) {
        this.$message.info('没有什么可以删除!')
        return
      }

      try {
        await this.$http.delete('/gather/modbus/nodes' +
        (this.isAny ? '' : ('/type/' + this.portName)))
        this.$message.success('删除成功!')
      } catch (e) {
        this.$message.error('删除失败!')
      }
      this.getNodes()
    },
    deleteNode: async function (id) {
      try {
        await this.$http.delete('/gather/modbus/nodes/' + id)
        this.$message.success('删除成功!')
      } catch (e) {
        this.$message.error('删除失败!')
      }
      this.getNodes()
    },
    getPortConfig: async function () {
      try {
        const result = await this.$http.get('/gather/usart/' + this.portName)
        this.protocolFormData = result.data
        return true
      } catch (e) {
        return false
      }
    },
    confirmProtocol: async function () {
      let inter = {
        portName: this.protocolFormData.portName,
        feature: this.protocolFormData.feature,
        responseTimeout: this.protocolFormData.responseTimeout,
        delayPoll: this.protocolFormData.delayPoll
      }

      if (this.isEthernet) {
        inter.ipAddress =
          this.protocolFormData.ipAddress + ':' + this.protocolFormData.ipPort
        delete inter['portName']
        try {
          await this.$http.post('/gather/ethernet', inter)
          this.$message.success('添加成功!')
        } catch (e) {
          this.$message.error('添加失败')
        }
        this.getEthernetConfig()
      } else {
        try {
          await this.$http.put('/gather/usart', inter)
          this.$message.success('配置成功!')
        } catch (e) {
          this.$message.error('配置失败')
        }
        this.getPortConfig()
      }
      this.getNodes()
      this.protocolDialogVisible = false
    },
    getEthernetConfig: async function () {
      try {
        const result = await this.$http.get('/gather/ethernet')
        this.IPlist = result.data.configList
      } catch (e) {
        // console.log(e)
      }
    },
    addEthernetConfig: async function () {
    },
    deleteEthernetConfig: async function (id) {
      if (this.IPlist.length === 0) {
        this.$message.info('没有什么可以删除!')
        return
      }
      try {
        await this.$http.delete('/gather/ethernet' +
          (id === 0 ? '' : ('/' + id)))
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
</script>

<style lang="less" scoped>
  .eth_btns {
    padding-top: 20px;
  }

  .node_table {
    margin-top: 30px;

    .el-form-item {
      padding: 0;
    }

    .node_internal_table {
      width: 100%;
      border: 1px solid #aaa;
    }

    th,
    td {
      padding: 0;
      text-align: center;
    }
  }

  .el-pagination {
    margin-top: 15px;
    text-align: center;
  }

  .node_btns {
    margin-top: 20px;
  }

  .showProtoWidth {
    width: 140px;
  }

  .interWidth {
    width: 200px;
  }

  .gather_box {
    strong {
      padding-left: 20px;
    }

    .el-row,
    .el-col {
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
