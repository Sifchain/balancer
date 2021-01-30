<script>
  import { useCore } from "@/hooks/useCore";

  export default {
    name: "PriceData",
    created() {
      this.initState();
    },
    methods: {
      async initState() {
        await useCore().api.EthereumService.handleStateChange();
        await useCore().actions.getSpotPrice();
      }
    },
    setup() {
      const { store } = useCore();
      return {
        store,
      };
    },
    components: {}
  };
</script>

<template>
  <div class="container">
    <div>
      <p class="title">Current rowan price is {{ store.purchase.rowanPrice }} USDT</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 360px;
    padding: 24px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("../assets/timer-background.svg");
  }
  .title {
    font-size: 14px;
    color: $c_gray_900;
    font-weight: bold;
  }
</style>
