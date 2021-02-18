<script>
  import PurchaseForm from "@/views/PurchaseForm.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Wrapper",
    components: {
      PurchaseForm,
    },
  });
</script>

<template>
  <div class="content">
    <PurchaseForm />
  </div>
</template>

<style lang="scss" scoped>
  .content {
    width: 96%;
    max-width: 410px;
  }
</style>
