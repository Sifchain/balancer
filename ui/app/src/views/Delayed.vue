<template>
  <div class="container">
    <div>
      <p class="title">Token Sale & Betanet Launch:</p>
      <p class="text">Friday, February 19, 5:00 AM GMT</p>
      <p class="title">Token Sale End Date:</p>
      <p class="text">Friday, February 26, 6:00 AM GMT</p>
      <p class="text">Please check our  <a href="https://t.me/sifchain/46814" target="_blank" style="color: #272727">Telegram</a>  for the latest updates.</p>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Delayed",
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
  }
  .text {
    font-size: 16px;
    color: $c_gray_800;
    font-weight: normal;
    margin-bottom: 24px;
  }
</style>
