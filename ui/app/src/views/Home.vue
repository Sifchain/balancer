<template>
  <div class="home">
    <PurchaseForm />
  </div>
</template>

<script lang="ts">
import PurchaseForm from "@/components/Layout/PurchaseForm.vue";

import { defineComponent } from "vue";

export default defineComponent({
  name: "HomePage",
  components: {
    PurchaseForm,
  },
});
</script>
