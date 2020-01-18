<template>
  <el-container class="home_container">
    <el-header class="home_header">
      <div>
        <img src="../assets/logo.png" alt="logo">
        <span>欢迎使用网关</span>
      </div>
      <el-button type="info" icon="el-icon-thumb" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'65px':'180px'" class="home_aside">
        <i class="el-icon-c-scale-to-original collapse_toggle" @click="toggleCollapse"/>
        <el-menu class="aside_menu" text-color="#fff" background-color="#545c64" active-text-color="#ffd04b"
                 router unique-opened :collapse-transition="false" :collapse="isCollapse" :default-active="activePath">
          <el-menu-item index="/sysinfo" @click="setNavState('/sysinfo')">
            <i class="el-icon-info"/><span slot="title">系统信息</span>
          </el-menu-item>
          <el-menu-item index="/netsetting" @click="setNavState('/netsetting')">
            <i class="el-icon-connection"/><span slot="title">网络设置</span></el-menu-item>
          <el-menu-item index="/portsetting" @click="setNavState('/portsetting')">
            <i class="el-icon-news"/><span slot="title">串口设置</span></el-menu-item>
          <!--  主站模式 start-->
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-menu"/><span>主站模式</span></template>
            <el-menu-item index="/modbus" @click="setNavState('/modbus')">
              <i class="el-icon-eleme"/><span>所有从站</span>
            </el-menu-item>
            <el-menu-item index="/modbus/ethernet" @click="setNavState('/modbus/ethernet')">
              <i class="el-icon-link"/><span>以太网</span>
            </el-menu-item>
            <el-menu-item v-for="port in ports" :key="port" :index="'/modbus/' + port"
                          @click="setNavState('/modbus/' + port)">
              <i class="el-icon-postcard"/><span>{{port}}</span>
            </el-menu-item>
          </el-submenu>
          <!--  主站模式 end-->
          <el-menu-item index="/slave" @click="setNavState('/slave')">
            <i class="el-icon-coin"/><span slot="title">从站模式</span></el-menu-item>
          <el-menu-item index="/syssetting" @click="setNavState('/syssetting')">
            <i class="el-icon-setting"/><span slot="title">系统设置</span></el-menu-item>
          <el-menu-item index="/syslog" @click="setNavState('/syslog')">
            <i class="el-icon-monitor"/><span slot="title">系统日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="home_main">
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data: function () {
    return {
      isCollapse: false,
      ports: [],
      activePath: ''
    }
  },
  methods: {
    toggleCollapse: function () {
      this.isCollapse = !this.isCollapse
    },
    logout: function () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getPortsList: async function () {
      try {
        const result = await this.$http.get('/usart/ports')
        this.ports = result.data.portList
      } catch (e) {
        console.log(e)
      }
    },
    setNavState(activePath) {
      console.log(activePath)
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getPortsList()
    this.activePath = window.sessionStorage.getItem('activePath')
    // 定义窗口变化通知事件
    var _this = this
    window.onresize = function () {
      _this.isCollapse = document.documentElement.clientWidth <= 768 ? true : _this.isCollapse
    }
  }
}
</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;
  }

  .home_header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #eee;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      > img {
        width: 60px;
        height: 60px;
      }

      > span {
        padding-left: 20px;
      }
    }
  }

  .home_aside {
    background-color: #545c64;

    .collapse_toggle {
      font-size: 24px;
      display: flex;
      justify-content: center;
      cursor: pointer;
    }

    .aside_menu {
      border-right: 0;
    }
  }

  .home_main {
    background-color: #fff;
  }
</style>
