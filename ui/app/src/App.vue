<template>
  <div>
    <Main>
      <div>
        <router-view />
      </div>
    </Main>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted } from "vue";
  import { useCore } from "./hooks/useCore";
  import Main from './components/Layout/Main.vue';

  export default defineComponent({
    name: "App",
    components: {
      Main,
    },
  });
</script>

<style lang="scss">
  #app {
    font: italic normal bold 14px/22px $f_default;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
  }

  a {
    font-weight: bold;
  }

</style>
