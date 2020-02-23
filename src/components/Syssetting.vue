<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统设置</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div slot="header" class="clearfix">
        <span>系统设置</span>
      </div>
      <div v-show="!isUpload">
        <el-row :gutter="20">
          <!-- 修改密码 -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>修改密码</span>
              </div>
              <el-form
                ref="passwdFormRef"
                :rules="passwdFromRules"
                :model="passwdFormData"
                label-width="100px"
              >
                <el-form-item label="用户名:" prop="username">
                  <el-input
                    v-model="passwdFormData.username"
                    disabled
                    prefix-icon="el-icon-user-solid"
                  />
                </el-form-item>
                <el-form-item label="原密码:" prop="oldPassword">
                  <el-input
                    v-model="passwdFormData.oldPassword"
                    show-password
                    prefix-icon="el-icon-lock"
                    @keyup.enter.native="passwd"
                  />
                </el-form-item>
                <el-form-item label="新密码:" prop="newPassword">
                  <el-input
                    v-model="passwdFormData.newPassword"
                    show-password
                    prefix-icon="el-icon-lock"
                    @keyup.enter.native="passwd"
                  />
                </el-form-item>
                <el-form-item label="确认新密码:" prop="confirmPassword">
                  <el-input
                    v-model="passwdFormData.confirmPassword"
                    show-password
                    prefix-icon="el-icon-lock"
                    @keyup.enter.native="passwd"
                  />
                </el-form-item>
                <el-form-item class="form_btns">
                  <el-button type="primary" round @click="passwd">保存</el-button>
                  <el-button type="info" round @click="resetPasswdInfo">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <!-- 授权 -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>授权认证</span>
              </div>
              <el-form ref="licenceKeyRef" :rules="warrantFormRules"
                       :model="warrantFormData" label-width="100px">
                <el-form-item label="当前状态:">
                  <el-input
                    v-model="warrantStatus"
                    readonly/>
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
                  <el-button type="danger" round @click="cancelApprove">取消认证</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <!-- 重启恢复出厂  -->
          <el-col :offset="2" :xl="9" :lg="9" :md="20" :sm="20" :xs="20">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>重启设备-恢复出厂设置</span>
              </div>
              <el-button type="danger" round @click="reboot">重启网关</el-button>
              <el-button type="danger" round @click="softReboot">重启软件</el-button>
              <el-tooltip class="item" effect="dark"
                          content="本操作 将清空所有数据并设置IP和密码为默认!!!" placement="top-start">
                <el-button type="danger" round @click="factory">恢复出厂设置</el-button>
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
                ref="upload"
                accept=".bz2"
                name="firmware"
                :limit="1"
                :auto-upload="false"
                :action="uploadUrl"
                :headers="headers"
                :data="exceedData"
                :on-exceed="uploadExceed"
                :on-change="uploadChange"
                :on-remove="uploadRemove"
                :before-upload="uploadBefore"
                :on-success="uploadSuccess"
                :on-error="uploadError">
                <el-button slot="trigger" type="primary">选取文件</el-button>
                <el-button style="margin-left: 10px;" type="success" @click="uploadSubmit">开始更新
                </el-button>
                <div>
                  <strong>MD5:</strong>
                  <strong v-text="exceedData.md5"></strong>
                </div>
                <div slot="tip" class="el-upload_tip">只支持bz压缩文件,且不超过10M</div>
              </el-upload>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div v-show="isUpload">
        <strong>重启中...请稍等!!!</strong>
        <el-progress :text-inside="true" :stroke-width="30" :percentage="upgradeRate"></el-progress>
      </div>
    </el-card>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'

export default {
  name: 'Syssetting',
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
        hasWarrant: false,
        expiryTime: '',
        warrant: '',
        licenceKey: ''
      },
      warrantFormRules: {
        licenceKey: [
          { required: true, message: '请输入有效授权码', trigger: 'blur' }
        ]
      },
      exceedData: {
        md5: ''
      },
      uploadUrl: this.$http.defaults.baseURL + '/upgrade',
      isUpload: false,
      upgradeRate: 0
    }
  },
  computed: {
    warrantStatus: function () {
      return this.warrantFormData.hasWarrant ? '已授权' : '未授权'
    },
    headers: function () {
      return {
        Authorization: 'BEARER ' + window.sessionStorage.getItem('token')
      }
    }
  },
  methods: {
    rebootAction: async function (message, url) {
      try {
        await this.$confirm(message, '警告', {
          type: 'warning',
          center: true
        })
        try {
          await this.$http.post(url)
          this.rebootProgress()
          this.$message.warning('重启中...')
        } catch (e) {
          this.$message.warning('重启失败')
        }
      } catch (e) {
        this.$message.info('取消操作')
      }
    },
    reboot: function () {
      this.rebootAction('确认重启网关?', '/syscfg/reboot')
    },
    softReboot: function () {
      this.rebootAction('确认重启软件?', '/syscfg/exec')
    },
    factory: async function () {
      try {
        await this.$confirm(
          '恢复出厂设置操作,将清除所有数据,并将IP与密码将会恢复至默认? - IP地址重启生效!!!',
          '警告',
          { type: 'warning', center: true }
        )
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
          return
        }

        if (this.passwdFormData.newPassword !== this.passwdFormData.confirmPassword) {
          this.$message.error('两次输入的新密码不一致!')
          return
        }

        try {
          await this.$http.post('/passwd', this.passwdFormData)
          this.$message.success('修改密码成功!请重新登录')
          window.sessionStorage.clear()
          this.$router.push('/login')
        } catch (e) {
          this.$message.warning('修改密码失败!')
        }
      })
    },
    resetLicenceKey: function () {
      this.$refs.licenceKeyRef.resetFields()
    },
    getWarrant: async function () {
      try {
        const result = await this.$http.get('/warrant')
        this.warrantFormData.hasWarrant = result.data.hasWarrant
        this.warrantFormData.expiryTime = result.data.expiryTime
        this.warrantFormData.warrant = result.data.warrant
      } catch (e) {
        // console.log(e)
      }
    },
    approve: async function () {
      this.$refs.licenceKeyRef.validate(async valid => {
        if (!valid) {
          this.$message.error('授权码输入不正确,请重新输入!')
          this.resetLicenceKey()
          return
        }
        this.$message.info('授权中...')
        try {
          await this.$http.post('/warrant', {}, {
            params: {
              licenceKey: this.warrantFormData.licenceKey
            }
          })
          this.$message.success('授权成功')
          this.resetLicenceKey()
        } catch (e) {
          this.$message.error('授权失败')
        }
        this.getWarrant()
      })
    },
    cancelApprove: async function () {
      if (!this.warrantFormData.hasWarrant) {
        return
      }
      try {
        await this.$confirm(
          '是否确定取消认证?',
          '警告',
          { type: 'warning', center: true }
        )
        try {
          await this.$http.delete('/warrant')
          this.getWarrant()
        } catch (e) {
          // console.log(e)
        }
      } catch (e) {
        this.$message.info('操作取消!')
      }
    },
    uploadExceed: function (file) {
      this.$message.info('当前限制选择1个文件!!!')
    },
    uploadChange: function (file) {
      const filename = file.name
      const fileExt = /[.]/.exec(filename)
        ? /[^.]+$/.exec(filename.toLowerCase()) : ''
      // 仅支持bz2压缩
      if (fileExt[0] !== 'bz2') {
        this.$message.error('文件类型只支持bz2,请重新选择')
        this.$refs.upload.clearFiles()
        return false
      }
      // 文件大小限制10M
      if (file.size > 10 * 1024 * 1024) {
        this.$message.error('文件大小限制10M,请重新选择')
        this.$refs.upload.clearFiles()
        return false
      }

      var upthis = this
      var fileRaw = file.raw
      var blobSlice = File.prototype.mozSlice ||
        File.prototype.webkitSlice ||
        File.prototype.slice
      var chunkSize = 2 * 1024 * 1024
      var chunks = Math.ceil(fileRaw.size / chunkSize)
      var currentChunk = 0
      var fileReader = new FileReader()
      var spark = new SparkMD5()

      this.exceedData.md5 = ''
      fileReader.onload = function (e) {
        spark.appendBinary(e.target.result)
        currentChunk++
        if (currentChunk < chunks) {
          loadNext()
        } else {
          // 获得计算后的md5
          upthis.exceedData.md5 = spark.end()
        }
      }

      function loadNext() {
        const start = currentChunk * chunkSize
        const end =
          start + chunkSize >= fileRaw.size ? fileRaw.size : start + chunkSize
        // 注意这里的fileRaw,即原生file
        fileReader.readAsBinaryString(blobSlice.call(fileRaw, start, end))
      }

      loadNext()
      return true
    },
    uploadBefore: function (file) {
      if (this.exceedData.md5 === '') {
        this.$message.error('内部错误,文件无效md5值!!!')
        return false
      }
      return true
    },
    uploadRemove: function () {
      this.exceedData.md5 = ''
    },
    uploadSuccess: function (response, file) {
      this.$refs.upload.clearFiles()
      this.$message.success('上传成功,开始更新固件')
      this.rebootProgress()
    },
    uploadError: function (rerr, file) {
      this.$message.error('上传失败,请重试')
    },
    uploadSubmit: function () {
      this.$refs.upload.submit()
    },
    rebootProgress: function () {
      this.upgradeRate = 0
      this.isUpload = true

      var _this = this
      var t = setInterval(rate, 1000)

      function rate() {
        _this.upgradeRate += Math.ceil(Math.random() * 5)
        if (_this.upgradeRate >= 100) {
          _this.upgradeRate = 100
          clearInterval(t)
          window.sessionStorage.clear()
          _this.$router.push('/login')
        }
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
