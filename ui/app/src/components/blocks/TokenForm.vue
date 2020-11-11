<template>
   <div class="token-form text--small">
      <div class="token-form__input">
        <NumericInput :amount="amount" :label="label" />
      </div>
      <div class="token-form__balance">
        <span>{{ token }}</span>
      </div>
    </div>
</template>

<script>
import SifButton from '../Elements/ActionButton';
import NumericInput from '../Elements/NumericInput';

export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    token: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      default: 0
    }
  },

  components: {
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
