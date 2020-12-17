<template>
  <main class="wrapper">
    <img class="header" src="../assets/header.svg">
    <slot></slot>
    <img class="footer" src="../assets/footer.png">
  </main>
</template>

<script>
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Main",
  });
</script>

<style lang="scss">
  .wrapper {
    width: 100%;
    min-height: 100%;
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
