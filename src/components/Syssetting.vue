<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统设置</el-breadcrumb-item>
    </el-breadcrumb>
    <div>
    </div>
    <div>
      <el-card>
        <div slot="header" class="clearfix">
          <span>系统设置</span>
        </div>
        <el-row :gutter="20">
          <!-- 修改密码  -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>修改密码</span>
              </div>
              <el-form ref="passwdFormRef" :rules="passwdFromRules" :model="passwdFormData" label-width="100px">
                <el-form-item label="用户名:" prop="username">
                  <el-input v-model="passwdFormData.username" disabled prefix-icon="el-icon-user-solid"/>
                </el-form-item>
                <el-form-item label="原密码:" prop="oldPassword">
                  <el-input v-model="passwdFormData.oldPassword" show-password prefix-icon="el-icon-lock"
                            @keyup.enter.native="passwd"/>
                </el-form-item>
                <el-form-item label="新密码:" prop="newPassword">
                  <el-input v-model="passwdFormData.newPassword" show-password prefix-icon="el-icon-lock"
                            @keyup.enter.native="passwd"/>
                </el-form-item>
                <el-form-item label="确认新密码:" prop="confirmPassword">
                  <el-input v-model="passwdFormData.confirmPassword" show-password prefix-icon="el-icon-lock"
                            @keyup.enter.native="passwd"/>
                </el-form-item>
                <el-form-item class="form_btns">
                  <el-button type="primary" round @click="passwd">保存</el-button>
                  <el-button type="info" round @click="resetPasswdInfo">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <!-- 授权  -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>授权认证</span>
              </div>
              <el-form ref="licenceKeyRef" :rules="licenceKeyRules" :model="warrantFormData" label-width="100px">
                <el-form-item label="当前状态:">
                  <el-input v-model="warrantFormData.hasWarrant" readonly/>
                </el-form-item>
                <el-form-item label="到期日期:">
                  <el-input v-model="warrantFormData.expiryTime" readonly/>
                </el-form-item>
                <el-form-item label="原始码:">
                  <el-input v-model="warrantFormData.warrant" readonly/>
                </el-form-item>
                <el-form-item label="授权码:" required prop="licenceKey">
                  <el-input v-model="warrantFormData.licenceKey"/>
                </el-form-item>
                <el-form-item class="form_btns">
                  <el-button type="primary" round @click="approve">认证</el-button>
                  <el-button type="info" round @click="resetLicenceKey">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <!-- 重启恢复出厂  -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>重启设备-恢复出厂设置</span>
              </div>
              <el-button type="danger" round @click="reboot">重启网关</el-button>
              <el-button type="danger" round @click="resoft">重启软件</el-button>
              <el-tooltip class="item" effect="dark" content="本操作 将清空所有数据并设置IP和密码为默认!!!" placement="top-start">
                <el-button type="danger" round @click="factory">恢重出厂设置</el-button>
              </el-tooltip>
            </el-card>
          </el-col>
          <!-- 固件升级  -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>固件升级</span>
              </div>
              <el-upload
                class="upload-demo"
                ref="upload"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="fileList"
                :auto-upload="false">
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'syssetting',
  data: function () {
    return {
      passwdFormData: {
        username: 'admin',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwdFromRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        oldPassword: [
          { required: true, message: '请输入原始密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      },
      warrantFormData: {
        hasWarrant: '',
        expiryTime: '',
        warrant: '',
        licenceKey: ''
      },
      licenceKeyRules: {
        licenceKey: [
          { required: true, message: '请输入有效授权码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    rebootAction: async function (message, url) {
      try {
        await this.$messageBox.confirm(
          message,
          '警告',
          { type: 'warning', center: true })
        try {
          // await this.$http.post(url)
          this.$message.warning('重启中...')
        } catch (e) {
          this.$message.warning('重启失败')
        }
      } catch (e) {
        this.$message.info('取消操作')
      }
    },
    reboot: async function () {
      this.rebootAction('确认重启网关?', '/syscfg/reboot')
    },
    resoft: async function () {
      this.rebootAction('确认重启软件?', '/syscfg/exec')
    },
    factory: async function () {
      try {
        await this.$messageBox.confirm(
          '恢复出厂设置操作,将清除所有数据,并将IP与密码将会恢复至默认? - IP地址重启生效!!!',
          '警告',
          { type: 'warning', center: true })
        this.$message.warning('恢复出厂中...')
        try {
          await this.$http.post('/syscfg/factoryReset')
          this.$message.success('恢复出厂成功!')
        } catch (e) {
          this.$message.warning('恢复出厂失败!')
        }
      } catch (e) {
        this.$message.info('取消操作')
      }
    },
    resetPasswdInfo: function () {
      this.$refs.passwdFormRef.resetFields()
    },
    passwd: function () {
      this.$refs.passwdFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('输入不正确,请重新输入!')
          this.resetPasswdInfo()
          return
        }
        try {
          await this.$http.post('/passwd', this.passwdFormData)
          this.$message.success('修改密码成功!请重启!!')
        } catch (e) {
          this.$message.warning('修改密码失败!')
        }
      })
    },
    approve: async function () {
      this.$refs.licenceKeyRef.validate(async valid => {
        console.log('aaa')
        if (!valid) {
          this.$message.error('授权码输入不正确,请重新输入!')
          this.resetLicenceKey()
          return
        }
        this.$message.info('授权中...')
        try {
          await this.$http.post('/warrant', {
            params: {
              licenceKey: this.warrantFormData.licenceKey
            }
          })
          this.$message.success('授权成功')
        } catch (e) {
          this.$message.error('授权失败')
        }
        this.getWarrant()
      })
    },
    resetLicenceKey: function () {
      this.$refs.licenceKeyRef.resetFields()
    },
    getWarrant: async function () {
      try {
        const result = await this.$http.get('/warrant')
        console.log(result)
        this.warrantFormData.hasWarrant = result.data.hasWarrant ? '已授权' : '未授权'
        this.warrantFormData.expiryTime = result.data.expiryTime
        this.warrantFormData.warrant = result.data.warrant
      } catch (e) {
        console.log(e)
      }
    }
  },
  created() {
    this.getWarrant()
  }
}
</script>

<style lang="less" scoped>

</style>
