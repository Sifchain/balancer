<template>
  <div class="content">
    <Delayed />
  </div>
</template>

<script>
  import Delayed from "@/views/Delayed.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Wrapper",
    setup() {},
    components: {
      Delayed
    },
  });
</script>

<style lang="scss" scoped>
  .content {
    width: 96%;
    max-width: 410px;
  }
</style>
