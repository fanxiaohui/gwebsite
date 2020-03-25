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
          <el-table :data="IPList" border>
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
            <el-button type="danger" round @click="deleteAllEthernetConfig">全部删除</el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
      <!--  串口协议的配置  -->
      <el-form v-show="!isEthernet &&!isAny" :model="usartProtocolData" label-position="left"
               inline>
        <el-form-item label="接口:">
          <el-input :value="usartProtocolData.portName" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item label="协议类型:">
          <el-input
            v-if="usartProtocolData.feature==='mbrtu'"
            value="MODBUS-RTU"
            class="showProtoWidth"
            disabled
          />
          <el-input
            v-else-if="usartProtocolData.feature==='mbascii'"
            value="MODBUS-ASCII"
            class="showProtoWidth"
            disabled
          />
          <el-input v-else value="None" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item label="命令延时(ms):">
          <el-input :value="usartProtocolData.delayPoll" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item label="回复超时(ms):">
          <el-input :value="usartProtocolData.responseTimeout" class="showProtoWidth" disabled/>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" round @click="showProtocolDialog">配置</el-button>
        </el-form-item>
      </el-form>
      <!-- 从站列表 -->
      <el-table :data="nodesList" border class="node_table">
        <el-table-column prop="portName" label="接口" width="80px" align="center"/>
        <el-table-column
          v-if="isEthernet || isAny"
          prop="ipAddress"
          label="从站IP"
          width="200px"
          align="center"
        />
        <el-table-column prop="slaveId" label="从站地址" width="80px" align="center"/>
        <el-table-column label="功能码参数" align="center">
          <template slot-scope="props">
            <table class="node_internal_table">
              <thead>
              <tr>
                <th>功能码</th>
                <th>数据地址</th>
                <th>数量</th>
                <th>扫描周期(ms)</th>
              </tr>
              </thead>
              <tr v-show="props.row.hasCoil">
                <td>1</td>
                <td>{{props.row.coilAddress}}</td>
                <td>{{props.row.coilQuantity}}</td>
                <td>{{props.row.coilScanRate}}</td>
              </tr>
              <tr v-show="props.row.hasDiscrete">
                <td>2</td>
                <td>{{props.row.discreteAddress}}</td>
                <td>{{props.row.discreteQuantity}}</td>
                <td>{{props.row.discreteScanRate}}</td>
              </tr>
              <tr v-show="props.row.hasHolding">
                <td>3</td>
                <td>{{props.row.holdingAddress}}</td>
                <td>{{props.row.holdingQuantity}}</td>
                <td>{{props.row.holdingScanRate}}</td>
              </tr>
              <tr v-show="props.row.hasInput">
                <td>4</td>
                <td>{{props.row.inputAddress}}</td>
                <td>{{props.row.inputQuantity}}</td>
                <td>{{props.row.inputScanRate}}</td>
              </tr>
            </table>
          </template>
        </el-table-column>
        <el-table-column label="配置" width="200px" align="center">
          <template slot-scope="scope">
            <el-button type="primate" @click="showEditNodeDialog(scope.row)">编辑</el-button>
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
        <el-form-item label="命令延时:" prop="slaveId">
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
    <el-dialog title="添加从机节点" :visible.sync="addNodeDialogVisible" center width="800px">
      <el-card>
        <el-row>
          <el-form ref="addNodeFormRef" :model="addNodeFormData"
                   label-width="100px" class="gather_box">
            <el-col :span="24">
              <el-form-item label="接口:">
                <el-input :value="protocolFormData.portName"
                          class="interWidth" disabled/>
              </el-form-item>
              <div v-if="isEthernet">
                <el-form-item v-show="isEthernet" label="从站IP:">
                  <el-select v-model="addNodeFormData.ipAddress" class="interWidth">
                    <el-option v-for="item in IPList" :key="item.ipAddress"
                               :value="item.ipAddress"/>
                  </el-select>
                </el-form-item>
              </div>
              <div v-else>
                <el-form-item label="协议类型:">
                  <el-input v-if="protocolFormData.feature==='none'"
                            value="None" class="interWidth" disabled/>
                  <el-input v-else-if="protocolFormData.feature==='mbrtu'"
                            value="MODBUS-RTU" class="interWidth" disabled/>
                  <el-input v-else-if="protocolFormData.feature==='mbascii'"
                            value="MODBUS-ASCII" class="interWidth" disabled/>
                  <el-input v-else-if="protocolFormData.feature==='mbtcp'"
                            value="MODBUS-TCP" class="interWidth" disabled/>
                  <el-input v-else value="None" class="interWidth" disabled/>
                </el-form-item>
                <el-form-item label="命令延时(ms):">
                  <el-input :value="protocolFormData.delayPoll"
                            class="interWidth" disabled/>
                </el-form-item>
                <el-form-item label="回复超时(ms):">
                  <el-input :value="protocolFormData.responseTimeout"
                            class="interWidth" disabled/>
                </el-form-item>
              </div>
              <el-form-item label="从机地址:" prop="slaveId">
                <el-input type="number" v-model.number="addNodeFormData.slaveId"
                          class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- coil-->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasCoil">
                <el-switch v-model="addNodeFormData.hasCoil"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{addNodeFormData.hasCoil ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[1]Read Coils" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="coilAddress">
                <el-input type="number" v-model.number="addNodeFormData.coilAddress"
                          :disabled="!addNodeFormData.hasCoil" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="coilQuantity">
                <el-input type="number" v-model.number="addNodeFormData.coilQuantity"
                          :disabled="!addNodeFormData.hasCoil" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="coilScanRate">
                <el-input type="number" v-model.number="addNodeFormData.coilScanRate"
                          :disabled="!addNodeFormData.hasCoil" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- discrete -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasDiscrete">
                <el-switch v-model="addNodeFormData.hasDiscrete"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{addNodeFormData.hasDiscrete ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[2]Read Discrete Inputs" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="discretdeleteEthernetConfigeAddress">
                <el-input type="number" v-model.number="addNodeFormData.discreteAddress"
                          :disabled="!addNodeFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="discreteQuantity">
                <el-input type="number" v-model.number="addNodeFormData.discreteQuantity"
                          :disabled="!addNodeFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="discreteScanRate">
                <el-input type="number" v-model.number="addNodeFormData.discreteScanRate"
                          :disabled="!addNodeFormData.hasDiscrete" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- holding register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasHolding">
                <el-switch v-model="addNodeFormData.hasHolding"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{addNodeFormData.hasHolding ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[3]Read Holding Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="holdingAddress">
                <el-input type="number" v-model.number="addNodeFormData.holdingAddress"
                          :disabled="!addNodeFormData.hasHolding" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="holdingQuantity">
                <el-input type="number" v-model.number="addNodeFormData.holdingQuantity"
                          :disabled="!addNodeFormData.hasHolding" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="holdingScanRate">
                <el-input type="number" v-model.number="addNodeFormData.holdingScanRate"
                          :disabled="!addNodeFormData.hasHolding" class="interWidth"/>
              </el-form-item>
            </el-col>
            <!-- input register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasInput">
                <el-switch v-model="addNodeFormData.hasInput"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{addNodeFormData.hasInput ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[4]Read Input Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="inputAddress">
                <el-input type="number" v-model.number="addNodeFormData.inputAddress"
                          :disabled="!addNodeFormData.hasInput" class="interWidth"/>
              </el-form-item>
              <el-form-item label="数量:" prop="inputQuantity">
                <el-input type="number" v-model.number="addNodeFormData.inputQuantity"
                          :disabled="!addNodeFormData.hasInput" class="interWidth"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="inputScanRate">
                <el-input type="number" v-model.number="addNodeFormData.inputScanRate"
                          :disabled="!addNodeFormData.hasInput" class="interWidth"/>
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

    <!-- 编辑从机地址 -->
    <el-dialog title="编辑从机节点" :visible.sync="editNodeDialogVisible" center width="800px">
      <el-card>
        <el-row>
          <el-form ref="editNodeFormRef" :model="editNodeFormData"
                   label-width="100px" class="gather_box">
            <el-col :span="24">
              <el-form-item label="接口:">
                <el-input :value="editNodeFormData.portName"
                          class="interWidth" disabled/>
              </el-form-item>
              <el-form-item v-show="editNodeFormData.portName==='Ethernet'" label="从站IP:">
                <el-input :value="editNodeFormData.ipAddress"
                          class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="从机地址:" prop="slaveId">
                <el-input type="number" v-model.number="editNodeFormData.slaveId"
                          class="interWidth" disabled/>
              </el-form-item>
            </el-col>
            <!-- coil-->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasCoil">
                <el-switch v-model="editNodeFormData.hasCoil"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{editNodeFormData.hasCoil ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[1]Read Coils" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="coilAddress">
                <el-input type="number" v-model.number="editNodeFormData.coilAddress"
                          class="interWidth" :disabled="!editNodeFormData.hasCoil"/>
              </el-form-item>
              <el-form-item label="数量:" prop="coilQuantity">
                <el-input type="number" v-model.number="editNodeFormData.coilQuantity"
                          class="interWidth" :disabled="!editNodeFormData.hasCoil"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="coilScanRate">
                <el-input type="number" v-model.number="editNodeFormData.coilScanRate"
                          class="interWidth" :disabled="!editNodeFormData.hasCoil"/>
              </el-form-item>
            </el-col>
            <!-- discrete -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasDiscrete">
                <el-switch v-model="editNodeFormData.hasDiscrete"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{editNodeFormData.hasDiscrete ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[2]Read Discrete Inputs" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="discretdeleteEthernetConfigeAddress">
                <el-input type="number" v-model.number="editNodeFormData.discreteAddress"
                          class="interWidth" :disabled="!editNodeFormData.hasDiscrete"/>
              </el-form-item>
              <el-form-item label="数量:" prop="discreteQuantity">
                <el-input type="number" v-model.number="editNodeFormData.discreteQuantity"
                          class="interWidth" :disabled="!editNodeFormData.hasDiscrete"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="discreteScanRate">
                <el-input type="number" v-model.number="editNodeFormData.discreteScanRate"
                          class="interWidth" :disabled="!editNodeFormData.hasDiscrete"/>
              </el-form-item>
            </el-col>
            <!-- holding register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasHolding">
                <el-switch v-model="editNodeFormData.hasHolding"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{editNodeFormData.hasHolding ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[3]Read Holding Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="holdingAddress">
                <el-input type="number" v-model.number="editNodeFormData.holdingAddress"
                          class="interWidth" :disabled="!editNodeFormData.hasHolding"/>
              </el-form-item>
              <el-form-item label="数量:" prop="holdingQuantity">
                <el-input type="number" v-model.number="editNodeFormData.holdingQuantity"
                          class="interWidth" :disabled="!editNodeFormData.hasHolding"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="holdingScanRate">
                <el-input type="number" v-model.number="editNodeFormData.holdingScanRate"
                          class="interWidth" :disabled="!editNodeFormData.hasHolding"/>
              </el-form-item>
            </el-col>
            <!-- input register -->
            <el-col :span="12">
              <el-form-item label="是否使能:" prop="hasInput">
                <el-switch v-model="editNodeFormData.hasInput"
                           active-color="#13ce66" inactive-color="#ff4949"/>
                <strong>{{editNodeFormData.hasInput ? '已使能': '已失能'}}</strong>
              </el-form-item>
              <el-form-item label="功能码:">
                <el-input value="[4]Read Input Registers" class="interWidth" disabled/>
              </el-form-item>
              <el-form-item label="数据地址:" prop="inputAddress">
                <el-input type="number" v-model.number="editNodeFormData.inputAddress"
                          class="interWidth" :disabled="!editNodeFormData.hasInput"/>
              </el-form-item>
              <el-form-item label="数量:" prop="inputQuantity">
                <el-input type="number" v-model.number="editNodeFormData.inputQuantity"
                          class="interWidth" :disabled="!editNodeFormData.hasInput"/>
              </el-form-item>
              <el-form-item label="扫描周期(ms):" prop="inputScanRate">
                <el-input type="number" v-model.number="editNodeFormData.inputScanRate"
                          class="interWidth" :disabled="!editNodeFormData.hasInput"/>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
        <div class="gather_btns">
          <el-button type="primary" round @click="editNode">确定</el-button>
          <el-button type="info" round @click="hideEditNodeDialog">取消</el-button>
          <el-button type="info" round @click="hpVisible=true">帮助</el-button>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>

<script src="./index.js">

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
