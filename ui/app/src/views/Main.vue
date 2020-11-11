<template>
  <main class="main">
    <slot></slot>
  </main>
</template>

<script>
export default {

}
</script>

<style lang="scss">
.main {
  width: 100vw;
  min-height: 100vh; // account for menu height
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: bottom center;
}
</style>
