<template>
  <div class="content">
    <Timer v-if="showTimer" />
    <PurchaseForm v-if="!showTimer && !showComplete" />
    <Complete v-if="showComplete" />
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
      // TODO: change to Dec 10 and Dec 17, 2020 before going to mainnet
      const tokenSaleStartDate = Date.UTC(2020, 10, 10, 0, 0, 0, 0); // Nov 10, 2020 to show purchase form while testing
      const tokenSaleEndDate = Date.UTC(2020, 11, 17, 0, 0, 0, 0); // Nov 10, 2020 to show purchase form while testing
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
