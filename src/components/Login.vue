<template>
  <div class="container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <el-form ref="loginFormRef" :model="loginFromData" :rules="loginFromRules" label-width="60px" class="form_box">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginFromData.username" placeholder="请输入账号" disabled prefix-icon="el-icon-user-solid">
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginFromData.password" placeholder="请输入密码" show-password prefix-icon="el-icon-lock">
          </el-input>
        </el-form-item>
        <el-form-item class="for_btns">
          <el-button type="primary" round @click="login">登录</el-button>
          <el-button type="info" round @click="resetLoginInfo">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
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
          return
        }

        const ret = await this.$http.post('/login', this.loginFromData)
        console.log(ret)
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    background: #2b4b6b;
    height: 100%;

    .login_box {
      width: 450px;
      height: 300px;
      background: #fffff7;
      border-radius: 10px;
      // 定位
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
        top: 0;
        transform: translate(-50%, -50%);

        img {
          width: 100%;
          height: 100%;
          background: #eee;
          border-radius: 50%;
        }
      }

      .form_box {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;

        .for_btns {
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
</style>
