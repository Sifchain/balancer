<template>
  <div>
    <SifApp>
      <div>
        <InputGroup>
          <div class="currency-form text--small">
            <div class="currency-form__input">
              <div class="sif-input__wrapper">
                <label class="sif-input__label">Contribution amount</label>
                <input v-model="inputAmountUSDT" class="sif-input" type="number">
              </div>
            </div>
            <div class="currency-form__balance">
              <span>USDT</span>
            </div>
          </div>
        </InputGroup>

        <InputGroup>
          <CurrencyForm :amount="inputAmountRWN" label="Minimum received" token="RWN" />
        </InputGroup>

        <InputGroup v-if="walletConnected">
          <div>
            <p class="text--small" align="left">
              Price: {{ priceRwn }} USDT
            </p>
            <p class="text--small" align="left">
              Minimum received: {{ amountRWN }}
            </p>
          </div>
        </InputGroup>

        <p v-if="!walletConnected" class="text--small">
          No wallet connected
        </p>

        <p v-if="walletConnected" class="text--small">
          {{ store.wallet.eth.address }}
        </p>

        <button v-if="walletConnected" @click="handleDisconnectClicked">
          Disconnect
        </button>

        <ActionButton primary block v-if="!walletConnected" @click="handleConnectClicked">
          Connect Wallet
        </ActionButton>

        <ActionButton primary block v-if="walletConnected" @click="transfer">
          Purchase
        </ActionButton>
      </div>
    </SifApp>

  </div>
</template>

<script>
  import ActionButton from '../Elements/ActionButton.vue';
  import InputGroup from '../Elements/InputGroup.vue';
  import SifApp from '../Blocks/SifApp.vue';
  import CurrencyForm from '../Blocks/CurrencyForm.vue';
  import { useCore } from "@/hooks/useCore";
  import { computed, ref } from "@vue/reactivity";

  export default {
    name: "PurchaseForm",
    setup() {
      const { api, actions, store } = useCore();
      const walletConnected = computed(() => store.wallet.eth.isConnected);
      const inputAmountUSDT = ref(100);
      const inputAmountRWN = ref(0);
      const amountUSDT = computed(() => getUsdtEstimate());
      const amountRWN = computed(() => getRowanEstimate());
      const priceRwn = ref(0.03);
      const priceImpact = ref(0.02);
      const providerFee = ref(0.0005);

      async function handleConnectClicked() {
        await actions.connectToWallet();
      }

      async function handleDisconnectClicked() {
        await actions.disconnectWallet();
      }

      function getRowanEstimate() {
        return inputAmountUSDT.value / priceRwn.value;
      }

      function getUsdtEstimate() {
        return inputAmountRWN.value * priceRwn.value;
      }

      async function transfer() {
        if (store.wallet.eth.balances.length > 0) {
          if (store.wallet.eth.balances[0].amount >= inputAmountUSDT.value * 10 ** 18) { // use 10**6 for USDT
            const hash = await actions.transferEthWallet(inputAmountUSDT.value, "0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e");
            console.log(hash);
          } else {
            // Low balance
            // TODO update UI
          }
        }
      }

      async function swapExactAmountIn() {
        if (store.wallet.eth.balances.length > 0) {
          if (store.wallet.eth.balances[0].amount >= inputAmountUSDT.value * 10 ** 18) { // use 10**6 for USDT
            const hash = await actions.swapExactAmountIn(amountUSDT.value);
            console.log(hash);
          } else {
            // Low balance
            // TODO update UI
          }
        }
        console.log(hash);
      }

      async function swapExactAmountOut() {
        if (store.wallet.eth.balances.length > 0) {
          if (store.wallet.eth.balances[0].amount >= inputAmountUSDT.value * 10 ** 18) { // use 10**6 for USDT
            const hash = await actions.swapExactAmountOut(amountUSDT.value);
            console.log(hash);
          } else {
            // Low balance
            // TODO update UI
          }
        }
        console.log(hash);
      }

      return {
        store,
        handleDisconnectClicked,
        handleConnectClicked,
        transfer,
        swapExactAmountIn,
        swapExactAmountOut,
        amountUSDT,
        amountRWN,
        inputAmountUSDT,
        inputAmountRWN,
        priceRwn,
        priceImpact,
        providerFee,
        walletConnected,
      };
    },
    components: {
      ActionButton,
      SifApp,
      InputGroup,
      CurrencyForm,
    }
  }
</script>

<style>

</style>
