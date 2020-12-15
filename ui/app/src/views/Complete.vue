<template>
  <div class="container">
    <div>
      <p class="title">The Sifchain Token Sale is now complete.</p>
      <p class="text"><a href="https://sifchain.finance/" target="_blank" style="color: #272727">Return to Home</a></p>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Complete",
  });
</script>

<style lang="scss" scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 392px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("../assets/timer-background.svg");
  }
  .title {
    font-size: 18px;
    color: $c_gray_900;
    font-weight: bold;
    font-style: italic;
    font-family: serif;
    margin-bottom: 32px;
  }
  .text {
      font-size: 16px;
      color: $c_gray_900;
      font-weight: normal;
      font-style: italic;
      font-family: serif;
  }
</style>
