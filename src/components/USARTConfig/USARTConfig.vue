<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>串口设置</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>串口设置</span>
      </div>
      <el-row type="flex" justify="center">
        <el-col :xs="22" :sm="22" :md="22" :lg="22" :xl="20">
          <template>
            <el-table :data="ports" style="width: 100%" stripe border>
              <el-table-column prop="address" label="串口"/>
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
              <el-table-column prop="timeout" label="读写超时时间">
                <template slot-scope="scope">
                  <el-input type="number" v-model.number="scope.row.timeout"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="配置" width="200px" align="center">
                <template slot-scope="scope">
                  <el-button type="primary" @click="save(scope.row)">保存</el-button>
                  <el-button type="danger" @click="deleteIt(scope.row.address)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
          <div class="action_btns">
            <el-button type="primary" round @click="showAddDialog">添加</el-button>
            <el-button type="success" round @click="refresh">刷新</el-button>
          </div>
        </el-col>
      </el-row>
      <!--   增加   -->
      <el-dialog title="增加串口配置" :visible.sync="addDialogVisible" center width="400px">
        <el-form ref="addNodeFormRef" :model="port" label-width="100px">
          <el-form-item label="地址:">
            <el-select v-model="port.address" class="interWidth">
              <el-option v-for="addr in portAddress" :key="addr" :value="addr"/>
            </el-select>
          </el-form-item>
          <el-form-item label="波特率:">
            <el-select v-model="port.baudRate" class="interWidth">
              <el-option :value="2400"/>
              <el-option :value="4800"/>
              <el-option :value="9600"/>
              <el-option :value="19200"/>
              <el-option :value="38400"/>
              <el-option :value="57600"/>
              <el-option :value="115200"/>
              <el-option :value="230400"/>
            </el-select>
          </el-form-item>
          <el-form-item label="数据位:">
            <el-select v-model="port.dataBits" class="interWidth">
              <el-option :value="7"/>
              <el-option :value="8"/>
            </el-select>
          </el-form-item>
          <el-form-item label="停止位:">
            <el-select v-model="port.stopBits" class="interWidth">
              <el-option :value="1"/>
              <el-option :value="2"/>
            </el-select>
          </el-form-item>
          <el-form-item label="校验位:">
            <el-select v-model="port.parity" class="interWidth">
              <el-option label="None" value="N"/>
              <el-option label="Even" value="E"/>
              <el-option label="Odd" value="O"/>
            </el-select>
          </el-form-item>
          <el-form-item label="超时时间:">
            <el-input type="number" v-model.number="port.timeout" class="interWidth"/>
          </el-form-item>
        </el-form>
        <div class="add_btns">
          <el-button type="primary" round @click="add">确定</el-button>
          <el-button type="info" round @click="hideAddDialog">取消</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>
<script src="./index.js"></script>
<style lang="less" scoped>
  .action_btns {
    padding-top: 20px;
  }

  .interWidth {
    width: 200px;
  }

  .add_btns {
    padding-top: 20px;
    text-align: center;
  }
</style>
