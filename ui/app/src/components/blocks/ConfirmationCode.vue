<template>
   <div class="token-form text--small">
      <div class="token-form__input">
        <TextInput :label="label" />
      </div>
    </div>
</template>

<script>
import SifButton from '../elements/ActionButton';
import NumericInput from '../elements/NumericInput';
import TextInput from "../elements/TextInput";

export default {
  props: {
    label: {
      type: String,
      default: ''
    },
  },

  components: {
    TextInput,
    SifButton,
    NumericInput,
  }
}
</script>

<style lang="scss">
.token-form {
  display: flex;

  &__input,
  &__balance {
    display: flex;
    justify-content: end;
    flex-direction: column;
  }

  &__balance {
    align-items: flex-end;
  }

  &__input {
    align-items: flex-start;
    flex-grow: 1;
    margin-right: 10px;
  }
}
</style>
