<template>
  <div class="container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
  export default {};
</script>

<style lang="less" scoped>
  .container {
    background: #2b4b6b;
    height: 100%;

    .login_box {
      width: 400px;
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
    }

  }
</style>
