<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>网络设置</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span>网络设置</span>
      </div>
      <el-row type="flex" justify="center">
        <el-col :xs="22" :sm="20" :md="16" :lg="16" :xl="12">
          <el-form ref="netFormRef" :model="netForm" :rules="netFormRules" @submit.native.prevent
                   status-icon label-width="120px">
            <el-form-item prop="auto" label="连接类型" >
              <el-switch v-model="netForm.auto"/>
              <strong class="netTypeShow">{{netForm.auto ? '动态IP': '静态IP'}}</strong>
            </el-form-item>
            <el-form-item prop="ipAddress" v-if="!netForm.auto" label="IP地址:">
              <el-input v-model="netForm.ipAddress"/>
            </el-form-item>
            <el-form-item prop="netMask" v-if="!netForm.auto" label="子网掩码:">
              <el-input v-model="netForm.netMask"/>
            </el-form-item>
            <el-form-item prop="gateway" v-if="!netForm.auto" label="网关地址:">
              <el-input v-model="netForm.gateway"/>
            </el-form-item>
            <el-form-item prop="primaryDNS" v-if="!netForm.auto" label="首选DNS服务器:">
              <el-input v-model="netForm.primaryDNS"/>
            </el-form-item>
            <el-form-item prop="secondaryDNS" v-if="!netForm.auto" label="备选DNS服务器:">
              <el-input v-model="netForm.secondaryDNS"/>
            </el-form-item>
            <el-form-item>
              <el-button type="success" round @click="refresh">刷新</el-button>
              <el-button type="primary" round @click="save">保存</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'netsetting',
  data: function () {
    return {
      netForm: {},
      netFormRules: {
        ipAddress: [
          { required: true, message: '请输入正确的ip地址', trigger: 'blur' }
        ],
        netMask: [
          { required: true, message: '请输入正确的子网掩码地址', trigger: 'blur' }
        ],
        gateway: [
          { required: true, message: '请输入正确的网关地址', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    getNetconfig: async function () {
      let isSuccess = true
      try {
        const result = await this.$http.get('/net/config')
        this.netForm = result.data
      } catch (e) {
        isSuccess = false
        console.log(e)
      }
      return isSuccess
    },
    refresh: function () {
      this.getNetconfig() ? this.$message.success('刷新成功') : this.$message.error('刷新失败')
    },
    save: async function () {
      this.$refs.netFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('输入不正确,请检查输入!')
          return
        }

        try {
          await this.$http.post('/net/config', this.netForm)
          this.$message.success('保存成功')
        } catch (e) {
          this.$message.error('保存失败')
          this.getNetconfig()
          console.log(e)
        }
      })
    }
  },
  created() {
    this.getNetconfig()
  }
}
</script>

<style lang="less" scoped>
  .netTypeShow {
    margin-left: 15px;
  }
</style>
