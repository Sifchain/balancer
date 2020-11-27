<template>
  <div>
    <Main>
      <router-view />
    </Main>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import Main from './views/Main.vue';

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

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

  a {
    font-weight: bold;
  }

</style>
