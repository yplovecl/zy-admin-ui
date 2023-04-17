<template>
  <div class="app-container home">
    <div>
      <img :src="logoImg" class="logo"/>
      <h2>欢迎登陆Blazer数字地震仪安卓系统后台管理端</h2>
    </div>
  </div>
</template>

<script setup name="Index">
import logoImg from '@/assets/logo/logo1.png'

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  flex-wrap: wrap;

  > div {
    margin-top: 10%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .logo {
      width: 250px;
    }

    h2 {
      margin-top: 20px;
      font-size: 26px;
      font-weight: 100;
    }
  }
}
</style>

