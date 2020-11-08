<template>
  <div>
    <SifApp>
      <div>
        <InputGroup v-if="store.wallet.eth.isConnected">
          <div class="token-form text--small">
            <div class="token-form__input">
              <div class="sif-input__wrapper">
                <label class="sif-input__label">Contribution amount</label>
                <input v-model="store.purchase.usdtAmount" class="sif-input" type="number" @input="getEstimate" @focus="store.purchase.swapIn = true">
              </div>
            </div>
            <div class="token-form__balance">
              <span>USDT</span>
            </div>
          </div>
        </InputGroup>

        <InputGroup v-if="store.wallet.eth.isConnected">
          <div class="token-form text--small">
            <div class="token-form__input">
              <div class="sif-input__wrapper">
                <label class="sif-input__label">Contribution amount</label>
                <input v-model="store.purchase.rwnAmount" class="sif-input" type="number" @input="getEstimate" @focus="store.purchase.swapIn = false">
              </div>
            </div>
            <div class="token-form__balance">
              <span>RWN</span>
            </div>
          </div>
        </InputGroup>

        <InputGroup v-if="store.wallet.eth.isConnected">
          <div>
            <p class="text--small" align="left">
              Price: {{ getRwnPrice() }} USDT per RWN
            </p>
            <p class="text--small" align="left">
              Slippage tolerance
            </p>
          </div>
        </InputGroup>

        <p v-if="!store.wallet.eth.isConnected" class="text--small">
          No wallet connected 🅧
        </p>

        <ActionButton primary block v-if="store.wallet.eth.isConnected" @click="handleDisconnectClicked">
          Disconnect
        </ActionButton>

        <p v-if="store.wallet.eth.isConnected" class="text--small">
          Connected to {{ getShortenedAddress() }} ✅
        </p>

        <ActionButton primary block v-if="!store.wallet.eth.isConnected" @click="handleConnectClicked">
          Connect Wallet
        </ActionButton>

        <ActionButton primary block v-if="store.wallet.eth.isConnected && store.purchase.usdtAllowance <= 0" @click="approveToken">
          Approve Token
        </ActionButton>

        <ActionButton primary block v-if="store.wallet.eth.isConnected && store.purchase.usdtAllowance > 0" @click="swapExactAmountIn">
          Purchase
        </ActionButton>

        <InputGroup v-if="store.wallet.eth.isConnected && store.purchase.usdtAllowance <= 0">
          <ConfirmationCode label="Confirmation code" />
        </InputGroup>
      </div>
      <p v-if="!store.wallet.eth.isConnected">
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
        const estimate = await actions.swapExactAmountInCall(store.purchase.usdtAmount, 0) / (10 ** 18);
        console.log("getRowanEstimate:", estimate);
        store.purchase.rwnAmount = estimate;
        return estimate
      }

      async function getUsdtEstimate() {
        const estimate = await actions.swapExactAmountOutCall(100000000000, store.purchase.rwnAmount) / (10 ** 6);
        console.log("getUsdtEstimate:", estimate);
        store.purchase.usdtAmount = estimate;
        return estimate
      }

      async function getEstimate() {
        return store.purchase.swapIn ? await getRowanEstimate() : await getUsdtEstimate();
      }

      function getRwnPrice() {
        return (store.purchase.usdtAmount / store.purchase.rwnAmount).toFixed(2);
      }

      async function swapExactAmountIn() {
        const hash = await actions.swapExactAmountInSend(store.purchase.usdtAmount, store.purchase.rwnAmount * 0.95);
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

      async function approveToken() {
        const hash = await actions.approveToken();
        console.log("approveToken hash:", hash);
      }

      return {
        store,
        handleDisconnectClicked,
        handleConnectClicked,
        swapExactAmountIn,
        getShortenedAddress,
        getEstimate,
        approveToken,
        getRwnPrice,
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
