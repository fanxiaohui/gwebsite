<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统信息</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row>
      <el-col :xl="9" :lg="9" :md="20" :sm="20" :xs="20" :offset="2">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>系统主要信息</span>
          </div>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">型号:</el-col>
            <el-col :span="14">{{sysInfo.model}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">序列号:</el-col>
            <el-col :span="14">{{sysInfo.sn}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">固件版本:</el-col>
            <el-col :span="14">{{sysInfo.version}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">编译时间:</el-col>
            <el-col :span="14">{{sysInfo.buildDate}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">IP地址:</el-col>
            <el-col :span="14">{{sysInfo.ipAddr}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">子网掩码:</el-col>
            <el-col :span="14">{{sysInfo.netmask}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">网关地址:</el-col>
            <el-col :span="14">{{sysInfo.gateway}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">首选DNS:</el-col>
            <el-col :span="14">{{sysInfo.primaryDNS}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">备选DNS:</el-col>
            <el-col :span="14">{{sysInfo.secondaryDNS}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">开机时间:</el-col>
            <el-col :span="14">{{sysInfo.setupTime}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="6" :offset="2">运行时间:</el-col>
            <el-col :span="14">{{runTime}}</el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :xl="9" :lg="9" :md="20" :sm="20" :xs="20" :offset="2">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>系统内存使用概况</span>
          </div>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">应用程序使用内存(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.appAlloc}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统总内存(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.totalram}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统空闲内存(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.freeram}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统已使用内存(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.usedram}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统共享存储器空间(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.sharedram}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统缓存空间(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.bufferram}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统交换区空间(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.totalswap}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统交换区空闲空间(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.freeswap}}</el-col>
          </el-row>
          <el-divider/>
          <el-row type="flex" justify="space-around">
            <el-col :span="14" :offset="2">系统交换区已使用空间(KB):</el-col>
            <el-col :span="6">{{sysMemInfo.usedswap}}</el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'sysinfo',
  data: function () {
    return {
      sysInfo: {},
      sysMemInfo: {},
      origTime: 0
    }
  },
  computed: {
    runTime: function () {
      let tmpSec = parseInt(this.origTime)// 秒
      let second = tmpSec % 60
      let minute = Math.floor(tmpSec / 60) % 60
      let hour = Math.floor(tmpSec / 3600)
      let result = ''

      if (hour > 0) {
        result += hour + '小时'
      }

      if (minute > 0) {
        result += minute + '分'
      }
      return result + second + '秒'
    }
  },
  methods: {
    getSystemInfo: async function () {
      try {
        const result = await this.$http.get('/system/info')
        this.sysInfo = result.data.sysInfo
        this.sysMemInfo = result.data.sysMemInfo
        this.origTime = this.sysInfo.runningTime
      } catch (e) {
        console.log(e)
      }
    }
  },
  created() {
    this.getSystemInfo()
  }
}
</script>

<style lang="less" scoped>
  .el-row {
    padding-top: 5px;
  }

  .el-col {
    line-height: 24px;
    font-weight: bold;
  }

  .el-divider {
    margin: 5px 0;
  }
</style>
