<template>
  <div>
    <Main>
      <div>
<!--        <div id="nav">-->
<!--          <router-link to="/">Connect Wallet</router-link> |-->
<!--          <router-link to="/purchase">Purchase Rowan</router-link>-->
<!--        </div>-->
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

    setup() {
      const { actions } = useCore();
      onMounted(async () => {
      });
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
