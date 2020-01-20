<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{tabPath()}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'master',
  data: function () {
    return {}
  },
  props: ['portName'],
  methods: {
    tabPath: function () {
      return this.portName === 'Any' ? '所有从站' : (this.portName === 'Ethernet' ? '以太网' : this.portName)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
