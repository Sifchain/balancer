<script>
  import ActionButton from '../components/elements/ActionButton.vue';
  import InputGroup from '../components/elements/InputGroup.vue';
  import SifApp from '../components/blocks/SifApp.vue';
  import TokenForm from '../components/blocks/TokenForm.vue';
  import ConfirmationCode from "@/components/blocks/ConfirmationCode";
  import { useCore } from "@/hooks/useCore";

  export default {
    name: "PurchaseForm",
    created() {
      this.initState();
    },
    methods: {
      async initState() {
        await useCore().api.EthereumService.handleStateChange();
      }
    },
    setup() {
      const { actions, store } = useCore();

      function getShortenedAddress() {
        return store.wallet.isConnected && store.wallet.account ? store.wallet.account.slice(0, 11) + "..." : "";
      }

      async function handleConnectClicked() {
        await actions.connectToWallet();
      }

      async function getRowanEstimate() {
        const estimate = await actions.swapExactAmountInCall(store.purchase.usdtAmount, 0, store.purchase.unhashedKey) / (10 ** 18);
        console.log("getRowanEstimate:", estimate);
        store.purchase.rwnAmount = estimate;
        store.purchase.whitelisted = true;
        return estimate
      }

      async function getUsdtEstimate() {
        const estimate = await actions.swapExactAmountOutCall(100000000000, store.purchase.rwnAmount, store.purchase.unhashedKey) / (10 ** 6);
        console.log("getUsdtEstimate:", estimate);
        store.purchase.usdtAmount = estimate;
        store.purchase.whitelisted = true;
        return estimate
      }

      async function getEstimate() {
        try {
          return store.purchase.swapIn ? await getRowanEstimate() : await getUsdtEstimate();
        } catch (e) {
          if (e.toString().includes("ERR_NOT_WHITELISTED/INVALID_KEY")) {
            store.purchase.whitelisted = false;
          }
        }
      }

      function getRwnPrice() {
        if (!store.purchase.usdtAmount || !store.purchase.rwnAmount) {
          return "0";
        }
        return (store.purchase.usdtAmount / store.purchase.rwnAmount).toFixed(2);
      }

      async function swapExactAmountIn() {
        if (store.purchase.whitelisted) {
          const hash = await actions.swapExactAmountInSend(store.purchase.usdtAmount, store.purchase.rwnAmount * 0.95, store.purchase.unhashedKey);
          console.log("swapExactAmountIn hash:", hash);
        }
      }

      async function approveToken() {
        const hash = await actions.approveToken();
        console.log("approveToken hash:", hash);
      }

      return {
        store,
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

<template>
  <div>
    <SifApp>
      <div>
        <InputGroup class="form-row">
          <div v-if="store.wallet.isConnected" class="flex-row-between text--small">
            <p>Contribution amount</p>
            <p v-if="store.wallet.balances && store.wallet.balances.length > 0">Balance: {{store.wallet.balances[0].toFixed(2)}}</p>
          </div>

          <div v-if="store.wallet.isConnected" class="token-form text--small">
            <div class="token-form__input">
              <div class="sif-input__wrapper">
                <input :disabled="store.purchase.allowance <= 0 || !store.purchase.whitelisted" v-model="store.purchase.usdtAmount" class="sif-input" type="number" step="any" @input="getEstimate" @focus="store.purchase.swapIn = true">
              </div>
            </div>
            <div class="token-form__balance">
              <div class="flex-row-center">
                <img src="../assets/usdt-symbol.png" class="form-row-image" height="18" width="18">
                <p>USDT</p>
              </div>
            </div>
          </div>
        </InputGroup>

        <InputGroup class="form-row">
          <div v-if="store.wallet.isConnected" class="token-form text--small">
            <div class="token-form__input">
              <div class="sif-input__wrapper">
                <label class="sif-input__label">Minimum Received</label>
                <input :disabled="store.purchase.allowance <= 0 || !store.purchase.whitelisted" v-model="store.purchase.rwnAmount" class="sif-input" type="number" step="any" @input="getEstimate" @focus="store.purchase.swapIn = false">
              </div>
            </div>
            <div class="token-form__balance">
              <div class="flex-row-center">
                <img src="../assets/rwn-symbol.svg" class="form-row-image" height="18" width="18">
                <p>RWN</p>
              </div>
            </div>
          </div>
        </InputGroup>

        <InputGroup class="form-row-large">
          <div v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" class="flex-row-between text--small">
            <p>Price</p>
            <p>{{ getRwnPrice() }} USDT per RWN</p>
          </div>
          <p v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" class="text--small" align="left">
            Slippage tolerance
          </p>
        </InputGroup>

        <div class="flex-row-center">
          <p class="text--small" v-bind:class="{ 'text-disabled': !store.wallet.isConnected }">
            Please enter your 64-digit confirmation code
          </p>
          <img v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" src="../assets/circle-check.svg" class="form-row-image">
        </div>

        <InputGroup class="form-row-small">
          <div v-if="store.wallet.isConnected && store.purchase.allowance > 0" class="token-form text--small">
            <div class="token-form__input">
              <div class="sif-input__wrapper">
                <input v-model="store.purchase.unhashedKey" class="sif-input" type="text" @input="getEstimate">
              </div>
            </div>
          </div>
        </InputGroup>

        <div v-if="!store.wallet.isConnected" class="flex-row-center">
          <p class="text--small">
            No wallet connected
          </p>
          <img src="../assets/circle-x.svg" class="form-row-image">
        </div>

        <ActionButton primary block v-if="!store.wallet.isConnected" @click="handleConnectClicked">
          Connect Wallet
        </ActionButton>

        <div v-if="store.wallet.isConnected" class="flex-row-center">
          <p class="text--small">
            Connected to {{ getShortenedAddress() }}
          </p>
          <img src="../assets/circle-check.svg" class="form-row-image">
        </div>

        <ActionButton primary block v-if="store.wallet.isConnected && store.purchase.allowance <= 0" @click="approveToken">
          Approve Token
        </ActionButton>

        <ActionButton primary block v-if="store.wallet.isConnected && store.purchase.allowance > 0" @click="swapExactAmountIn">
          Purchase
        </ActionButton>
      </div>
    </SifApp>
    <p class="kyc-help-text" v-if="!store.wallet.isConnected">
      Please note: This app is only for users that have already been approved to participate in the Sifchain Token Sale.
      If you have not been approved, you may apply <a href="https://sifchain.finance/" target="_blank" style="color: #000000">here</a>.
      Please remember to use the wallet address you provided us in your KYC information.
      Any transactions from unapproved wallet addresses will be rejected.
    </p>
  </div>
</template>

<style lang="scss">
  .text-disabled {
    color: $c_gray_400
  }
  .kyc-help-text {
    width: 410px;
    margin-top: 16px;
    padding: 8px;
    font-weight: lighter;
    font-size: $fs_sm;
    color:$c_gray_900
  }
  .form-row {
    min-height: 48px;
  }
  .form-row-small {
    min-height: 24px;
  }
  .form-row-large {
    min-height: 72px;
  }
  .flex-row-center {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .flex-row-between {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .form-row-image {
    margin-left: 8px;
    margin-right: 8px;
  }
</style>
