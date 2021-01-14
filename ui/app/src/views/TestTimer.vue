<template>
  <div class="content">
    <Timer />
  </div>
</template>

<script>
  import Timer from "@/views/Timer.vue";
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "TestTimer",
    components: {
      Timer
    },
  });
</script>

<style lang="scss" scoped>
  .content {
    width: 96%;
    max-width: 410px;
  }
</style>
