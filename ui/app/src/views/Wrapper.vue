<template>
  <div class="content">
    <Timer />
  </div>
</template>

<script>
  import PurchaseForm from "@/views/PurchaseForm.vue";
  import Complete from "@/views/Complete.vue";
  import Timer from "@/views/Timer.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Wrapper",
    setup() {
      const tokenSaleStartDate = Date.UTC(2021, 1, 3, 0, 0, 0, 0); // Feb 3, 2021
      const tokenSaleEndDate = Date.UTC(2021, 1, 10, 0, 0, 0, 0); // Feb 10, 2021
      const showTimer = tokenSaleStartDate > Date.now();
      const showComplete = tokenSaleEndDate < Date.now();

      return {
        showTimer,
        showComplete
      }
    },
    components: {
      PurchaseForm,
      Timer,
      Complete
    },
  });
</script>

<style lang="scss" scoped>
  .content {
    width: 96%;
    max-width: 410px;
  }
</style>
