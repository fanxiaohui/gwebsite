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
        <el-table-column prop="port" label="端口" />
        <el-table-column prop="bindInterface" label="绑定接口" />
        <el-table-column>
          <template slot-scope="scope">
            <!--                <el-button @click="handleEdit(scope.row.id)">编辑</el-button>-->
            <el-button type="danger" @click="deleteSlave(scope.row.id)">删除</el-button>
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
        :total="total"
      ></el-pagination>
      <div class="action_btns">
        <el-button type="primary" round @click="showDialog">添加从机</el-button>
        <el-button type="danger" round @click="deleteSlave(0)">全部删除</el-button>
        <el-button type="info" round @click="showHelp">帮助</el-button>
      </div>
    </el-card>
    <el-dialog title="以太网" :visible.sync="dialogVisible" center width="400px">
      <el-form
        ref="interFormRef"
        :rules="interFromRules"
        :model="interFormData"
        label-width="100px"
      >
        <el-form-item label="协议类型:" prop="username">
          <template>
            <el-select v-model="interFormData.inter" class="interWidth">
              <el-option label="MODBUS-TCP" value="mbtcp" />
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="服务端口:" prop="port">
          <el-input type="number" v-model.number="interFormData.port" class="interWidth" />
        </el-form-item>
        <el-form-item label="绑定端口:" prop="bindPortName">
          <template>
            <el-select v-model="interFormData.bindInterface" class="interWidth">
              <el-option v-for="item in bindInterList" :key="item" :value="item" />
            </el-select>
          </template>
        </el-form-item>
      </el-form>
      <span slot="footer" class="form_btns">
        <el-button type="primary" round @click="addSlave">确定</el-button>
        <el-button type="info" round @click="hideDialog">取消</el-button>
        <el-button type="info" round @click="showHelp">帮助</el-button>
      </span>
    </el-dialog>
    <el-drawer title="帮助" :visible.sync="hpVisible" direction="rtl">
      <div>
        <el-alert
          type="warning"
          center
          :closable="false"
          show-icon
          title="注意:"
          description="配置信息需重启才生效"
        />
        <el-alert type="info" :closable="false" description="从站模式跟上位机通讯，是对主站的映射。" />
        <el-alert type="info" :closable="false" title="接口：" description="协议及端口" />
        <el-alert type="info" :closable="false" title="从站地址：" description="Modbus从站地址" />
        <el-alert type="info" :closable="false" title="绑定接口：" description=" 绑定该接口用于转发该接口数据" />
      </div>
    </el-drawer>
  </div>
</template>

<script src="./index.js"></script>

<style lang="less" scoped>
.action_btns {
  margin-top: 20px;
}

.interWidth {
  width: 200px;
}

.el-pagination {
  margin-top: 15px;
  text-align: center;
}
</style>
