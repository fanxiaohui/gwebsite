<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统日志</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div slot="header" class="clearfix">
        <span>系统日志</span>
      </div>
      <el-form ref="form" @submit.native.prevent>
        <el-form-item class="logs_area">
          <el-input id="logarea" type="textarea" :autosize="{minRows:25,maxRows:25}"
                    v-model="logForm.logs" readonly/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" round @click="refresh">刷新</el-button>
          <el-button type="danger" round @click="clear">删除</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Syslog',
  data: function () {
    return {
      logForm: {
        logs: ''
      }
    }
  },
  methods: {
    get: async function () {
      let isSuccess = true

      try {
        this.logForm.logs = ''
        const result = await this.$http.get('/logs')
        result.data.list.forEach(item => {
          this.logForm.logs += item + '\t\n'
        })
      } catch (e) {
        isSuccess = false
      }
      return isSuccess
    },
    refresh: async function () {
      await this.get()
        ? this.$message.success('刷新成功')
        : this.$message.error('刷新失败')
    },
    clear: async function () {
      if (this.logForm.logs.length === 0) {
        this.$message.info('没有什么可以删除的了!')
        return
      }
      try {
        await this.$http.delete('/logs')
        this.logForm.logs = ''
        this.$message.success('删除成功')
      } catch (e) {
        this.$message.error('删除失败')
      }
    }
  },
  created() {
    this.get()
  },
  updated() {
    const ele = document.getElementById('logarea')
    ele.scrollTop = ele.scrollHeight
  }
}
</script>

<style lang="less" scoped>
</style>
