<template>
  <div class="home">
    <Timer v-if="showTimer" />
    <PurchaseForm v-else />
  </div>
</template>

<script lang="ts">
import PurchaseForm from "@/views/PurchaseForm.vue";
import Timer from "@/views/Timer.vue";

import { defineComponent } from "vue";

export default defineComponent({
  name: "HomePage",
  setup() {
    const tokenSaleStartDate = Date.UTC(2020, 10, 10, 0, 0, 0, 0); // Nov 10, 2020 to show purchase form while testing
    const showTimer = tokenSaleStartDate > Date.now();

    return {
      showTimer
    }
  },
  components: {
    PurchaseForm,
    Timer
  },
});
</script>
