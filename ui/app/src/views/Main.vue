<template>
  <main class="main">
    <img class="header" src="../assets/header-welcome.svg">
    <slot></slot>
    <img class="footer" src="../assets/footer-small.png">
  </main>
</template>

<script>
export default {

}
</script>

<style lang="scss">
  .main {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: bottom center;
  }
  .header {
    width: 100%;
    height: 130px;
    margin-top: 64px;
    margin-bottom: 32px;
  }
  .footer {
    width: 100%;
    margin-top: 96px;
  }
</style>
