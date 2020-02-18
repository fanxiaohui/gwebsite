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
              <el-form-item label="从机地址:" prop="slaveID">
                <el-input type="number" v-model.number="addNodeFormData.slaveID"
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
              <el-form-item label="虚拟地址:" prop="coilVirtualAddress">
                <el-input type="number" v-model.number="addNodeFormData.coilVirtualAddress"
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
              <el-form-item label="虚拟地址:" prop="discreteVirtualAddress">
                <el-input type="number" v-model.number="addNodeFormData.discreteVirtualAddress"
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
              <el-form-item label="虚拟地址:" prop="holdingVirtualAddress">
                <el-input type="number" v-model.number="addNodeFormData.holdingVirtualAddress"
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
              <el-form-item label="虚拟地址:" prop="inputVirtualAddress">
                <el-input type="number" v-model.number="addNodeFormData.inputVirtualAddress"
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
              <el-form-item label="从机地址:" prop="slaveID">
                <el-input type="number" v-model.number="editNodeFormData.slaveID"
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
              <el-form-item label="虚拟地址:" prop="coilVirtualAddress">
                <el-input type="number" v-model.number="editNodeFormData.coilVirtualAddress"
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
              <el-form-item label="虚拟地址:" prop="discreteVirtualAddress">
                <el-input type="number" v-model.number="editNodeFormData.discreteVirtualAddress"
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
              <el-form-item label="虚拟地址:" prop="holdingVirtualAddress">
                <el-input type="number" v-model.number="editNodeFormData.holdingVirtualAddress"
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
              <el-form-item label="虚拟地址:" prop="inputVirtualAddress">
                <el-input type="number" v-model.number="editNodeFormData.inputVirtualAddress"
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

<script>
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
      editNodeFormData: {},
      queryInfo: {
        pagenum: 1,
        pagesize: 10
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
        this.getPortConfig()
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
      this.queryInfo.pagesize = newSize
      this.getNodes()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
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
        await this.modifyPortConfig(inter)
      }
      this.getNodes()
      this.protocolDialogVisible = false
    },
    getNodes: async function () {
      let url = '/gather/modbus/nodes' +
        (this.portName !== 'Any' ? ('/type/' + this.portName) : '')
      try {
        const result = await this.$http.get(url, {
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
        await this.$http.post('/gather/modbus/nodes', this.addNodeFormData)
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
        await this.$http.put('/gather/modbus/nodes', this.editNodeFormData)
      } catch (e) {
        console.log(e)
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
          await this.$http.delete('/gather/modbus/nodes' +
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
          await this.$http.delete('/gather/modbus/nodes/' + id)
          this.$message.success('删除成功!')
        } catch (e) {
          this.$message.error('删除失败!')
        }
        this.getNodes()
      } catch (e) {
        this.$message.info('操作取消.')
      }
    },
    getPortConfig: async function () {
      try {
        const result = await this.$http.get('/gather/usart/' + this.portName)
        this.usartProtocolData = result.data
      } catch (e) {
        // console.log(e)
      }
    },
    modifyPortConfig: async function (inter) {
      try {
        await this.$http.put('/gather/usart', inter)
        this.$message.success('配置成功!')
      } catch (e) {
        this.$message.error('配置失败')
      }
      this.getPortConfig()
    },
    getEthernetConfig: async function () {
      try {
        const result = await this.$http.get('/gather/ethernet')
        this.IPList = result.data.configList
      } catch (e) {
        // console.log(e)
      }
    },
    addEthernetConfig: async function (inter) {
      try {
        await this.$http.post('/gather/ethernet', inter)
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
        await this.$http.delete('/gather/ethernet/' + id)
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
        await this.$http.delete('/gather/ethernet')
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
