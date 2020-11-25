<template>
  <main class="wrapper">
    <img class="header" src="../assets/header.svg">
    <div class="content">
      <Timer v-if="showTimer" />
      <PurchaseForm v-else />
    </div>
    <img class="footer" src="../assets/footer.png">
  </main>
</template>

<script>
  import PurchaseForm from "@/views/PurchaseForm.vue";
  import Timer from "@/views/Timer.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Main",
    setup() {
      // TODO: change to Dec 10, 2020 before going to mainnet
      const tokenSaleStartDate = Date.UTC(2020, 10, 10, 0, 0, 0, 0); // Nov 10, 2020 to show purchase form while testing
      const showTimer = tokenSaleStartDate > Date.now();

      return {
        showTimer
      }
    },
    components: {
      PurchaseForm,
      Timer
    },
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
  .content {
    width: 96%;
    max-width: 410px;
  }
  .footer {
    width: 100%;
    margin-top: 96px;
  }
</style>
