<script>
  import Complete from "@/views/Complete.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Wrapper",
    components: {
      Complete,
    },
  });
</script>

<template>
  <div class="content">
    <Complete />
  </div>
</template>

<style lang="scss" scoped>
  .content {
    width: 96%;
    max-width: 410px;
  }
</style>
