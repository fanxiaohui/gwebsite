<template>
  <div class="container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <el-form ref="loginFormRef" :model="loginFromData" :rules="loginFromRules"
               label-width="60px" class="form_input">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginFromData.username" placeholder="请输入账号"
                    disabled prefix-icon="el-icon-user-solid"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginFromData.password" placeholder="请输入密码"
                    show-password prefix-icon="el-icon-lock"
                    @keyup.enter.native="login"/>
        </el-form-item>
        <el-form-item class="form_btns">
          <el-button type="primary" round @click="login">登录</el-button>
          <el-button type="info" round @click="resetLoginInfo">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginFromData: {
        username: 'admin',
        password: ''
      },
      loginFromRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginInfo: function () {
      this.$refs.loginFormRef.resetFields()
    },
    login: function () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('输入不正确,请重新输入!')
          this.resetLoginInfo()
          return
        }
        try {
          const result = await this.$http.post('/login', this.loginFromData)
          window.sessionStorage.setItem('token', result.data.token)
          this.$message.success('登录成功!')
          this.$router.push('/home')
        } catch (e) {
          this.$message.error('登录失败!')
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    background: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background: #fffff7;
    border-radius: 10px;
    // 定位到中间
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      width: 150px;
      height: 150px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 15px;
      // 定位
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);

      > img {
        width: 100%;
        height: 100%;
        background: #eee;
        border-radius: 50%;
      }
    }

    .form_input {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 30px;
      box-sizing: border-box;

      .form_btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

</style>
