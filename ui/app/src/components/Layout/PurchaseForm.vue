<template>
  <div>
    <SifApp>
      <div>
        <InputGroup>
          <div class="token-form text--small">
            <div class="token-form__input">
              <div class="sif-input__wrapper">
                <label class="sif-input__label">Contribution amount</label>
                <input v-model="inputAmountUSDT" class="sif-input" type="number">
              </div>
            </div>
            <div class="token-form__balance">
              <span>USDT</span>
            </div>
          </div>
        </InputGroup>

        <InputGroup>
          <TokenForm :amount="inputAmountRWN" label="Minimum received" token="RWN" />
        </InputGroup>

        <InputGroup v-if="walletConnected">
          <div>
            <p class="text--small" align="left">
              Price: {{ priceRwn }} USDT per RWN
            </p>
            <p class="text--small" align="left">
              Slippage tolerance
            </p>
          </div>
        </InputGroup>

        <p v-if="!walletConnected" class="text--small">
          No wallet connected 🅧
        </p>

        <ActionButton primary block v-if="walletConnected" @click="handleDisconnectClicked">
          Disconnect
        </ActionButton>

        <p v-if="walletConnected" class="text--small">
          Connected to {{ getShortenedAddress() }} ✅
        </p>

        <ActionButton primary block v-if="!walletConnected" @click="handleConnectClicked">
          Connect Wallet
        </ActionButton>

        <ActionButton primary block v-if="walletConnected" @click="swapExactAmountIn">
          Swap In
        </ActionButton>

        <ActionButton primary block v-if="walletConnected" @click="swapExactAmountOut">
          Swap Out
        </ActionButton>

        <InputGroup v-if="walletConnected">
          <ConfirmationCode label="Confirmation code" />
        </InputGroup>
      </div>
      <p v-if="!walletConnected">
        Please note: This app is only for users that have already been approved to participate in the Sifchain Token Sale.
        If you have not been approved, you may apply <a href="https://sifchain.finance/" target="_blank" style="color: #000000">here</a>.
        Please remember to use the wallet address you provided us in your KYC information.
        Any transactions from unapproved wallet addresses will be rejected.
      </p>
    </SifApp>

  </div>
</template>

<script>
  import ActionButton from '../Elements/ActionButton.vue';
  import InputGroup from '../Elements/InputGroup.vue';
  import SifApp from '../Blocks/SifApp.vue';
  import TokenForm from '../Blocks/TokenForm.vue';
  import { useCore } from "@/hooks/useCore";
  import { computed, ref } from "@vue/reactivity";
  import ConfirmationCode from "@/components/Blocks/ConfirmationCode";

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

      function getShortenedAddress() {
        return store.wallet.eth.isConnected ? store.wallet.eth.address.slice(0, 8) + "..." : "";
      }

      async function handleConnectClicked() {
        await actions.connectToWallet();
      }

      async function handleDisconnectClicked() {
        await actions.disconnectWallet();
      }

      async function getRowanEstimate() {
        return await actions.swapExactAmountIn(inputAmountUSDT.value, 10000000000000000000);
      }

      async function getUsdtEstimate() {
        return await actions.swapExactAmountOut(0, inputAmountRWN.value);
      }

      async function swapExactAmountIn() {
        const hash = await actions.swapExactAmountIn(inputAmountUSDT.value, await getRowanEstimate() * 0.95);
        console.log("swapExactAmountIn hash:", hash);

        // if (store.wallet.eth.balances.length > 0) {
        //   if (store.wallet.eth.balances[0].amount >= inputAmountUSDT.value * 10 ** 18) { // use 10**6 for USDT
        //     const hash = await actions.swapExactAmountIn(amountUSDT.value);
        //     console.log(hash);
        //   } else {
        //     // Low balance
        //     // TODO update UI
        //   }
        // }
      }

      async function swapExactAmountOut() {
        const hash = await actions.swapExactAmountOut(inputAmountUSDT.value, await getUsdtEstimate() * 1.05);
        console.log("swapExactAmountOut hash:", hash);

        // if (store.wallet.eth.balances.length > 0) {
        //   if (store.wallet.eth.balances[0].amount >= inputAmountUSDT.value * 10 ** 18) { // use 10**6 for USDT
        //     const hash = await actions.swapExactAmountOut(amountUSDT.value);
        //     console.log(hash);
        //   } else {
        //     // Low balance
        //     // TODO update UI
        //   }
        // }
      }

      return {
        store,
        handleDisconnectClicked,
        handleConnectClicked,
        swapExactAmountIn,
        swapExactAmountOut,
        getShortenedAddress,
        getRowanEstimate,
        getUsdtEstimate,
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
      ConfirmationCode,
      ActionButton,
      SifApp,
      InputGroup,
      TokenForm,
    }
  }
</script>

<style>

</style>
