<template>
  <el-container class="home_container">
    <el-header class="home_header">
      <div>
        <img src="../assets/logo.png" alt="logo">
        <span>欢迎使用网关</span>
      </div>
      <el-button type="info">登出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'65px':'180px'" class="home_aside">
        <i class="el-icon-c-scale-to-original collapse_toggle" @click="toggleCollapse"/>
        <el-menu class="aside_menu" text-color="#fff" background-color="#545c64" active-text-color="#ffd04b"
                 :collapse-transition="false" :collapse="isCollapse">
          <el-menu-item index="1">
            <i class="el-icon-info"/>
            <span slot="title">系统信息</span>
          </el-menu-item>
          <el-menu-item index="2">
            <i class="el-icon-connection"/>
            <span slot="title">网络设置</span>
          </el-menu-item>
          <el-menu-item index="3">
            <i class="el-icon-news"/>
            <span slot="title">串口设置</span>
          </el-menu-item>
          <el-submenu index="4">
            <template slot="title">
              <i class="el-icon-menu"/>
              <span>主站模式</span>
            </template>
            <el-menu-item index="4-1">所有从站</el-menu-item>
            <el-menu-item index="4-2">以太网</el-menu-item>
            <el-menu-item index="4-3">Port1</el-menu-item>
            <el-menu-item index="4-4">Port2</el-menu-item>
            <el-menu-item index="4-5">Port3</el-menu-item>
            <el-menu-item index="4-6">Port4</el-menu-item>
          </el-submenu>
          <el-menu-item index="6">
            <i class="el-icon-coin"/>
            <span slot="title">从站模式</span>
          </el-menu-item>
          <el-menu-item index="7">
            <i class="el-icon-setting"/>
            <span slot="title">系统设置</span>
          </el-menu-item>
          <el-menu-item index="8">
            <i class="el-icon-monitor"/>
            <span slot="title">系统日志</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="home_main">Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data: function () {
    return {
      isCollapse: false
    }
  },
  methods: {
    toggleCollapse: function () {
      this.isCollapse = !this.isCollapse
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
