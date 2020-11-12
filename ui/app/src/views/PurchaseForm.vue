<script>
  import ActionButton from '../components/elements/ActionButton.vue';
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
      TokenForm,
    }
  }
</script>

<template>
  <div>
    <div class="purchase-form">
      <div class="purchase-form__body" v-bind:class="{ 'purchase-form__body-disabled': !store.wallet.isConnected }">
        <div>
          <div class="input-group mh-70" v-bind:class="{ 'input-group__disabled': !store.wallet.isConnected }">
            <div v-if="store.wallet.isConnected" class="d-flex fd-row j-between text--small">
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
                <div class="d-flex fd-row j-center">
                  <img src="../assets/usdt-symbol.png" class="icon-margin" height="18" width="18">
                  <p>USDT</p>
                </div>
              </div>
            </div>
          </div>

          <div class="input-group mh-70" v-bind:class="{ 'input-group__disabled': !store.wallet.isConnected }">
            <div v-if="store.wallet.isConnected" class="token-form text--small">
              <div class="token-form__input">
                <div class="sif-input__wrapper">
                  <label class="sif-input__label">Minimum Received</label>
                  <input :disabled="store.purchase.allowance <= 0 || !store.purchase.whitelisted" v-model="store.purchase.rwnAmount" class="sif-input" type="number" step="any" @input="getEstimate" @focus="store.purchase.swapIn = false">
                </div>
              </div>
              <div class="token-form__balance">
                <div class="d-flex fd-row j-center">
                  <img src="../assets/rwn-symbol.svg" class="icon-margin" height="18" width="18">
                  <p>RWN</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!store.wallet.validNetwork" class="error-section mh-93 d-flex j-center fd-col">
            <p class="text--small text--italic text--bold color-white">Connected Wallet is on a test network.</p>
          </div>

          <div v-if="store.wallet.validNetwork" class="price-section mh-23" v-bind:class="{ 'price-section__disabled': !store.wallet.isConnected }">
            <div v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" class="d-flex fd-row j-between text--small">
              <p>Price</p>
              <p>{{ getRwnPrice() }} USDT per RWN</p>
            </div>
          </div>
          <div v-if="store.wallet.validNetwork" class="slippage-section mh-70" v-bind:class="{ 'slippage-section__disabled': !store.wallet.isConnected }">
            <p v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" class="text--small">
              Slippage tolerance
            </p>
          </div>

          <div class="d-flex fd-row j-center">
            <p class="text--small text--italic text--normal" v-bind:class="{ 'text-disabled': !store.wallet.isConnected }">
              Please enter your 64-digit confirmation code
            </p>
            <img v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" src="../assets/circle-check.svg" class="icon-margin">
            <img v-else src="../assets/circle-x-disabled.svg" class="icon-margin">
          </div>

          <div class="input-group mh-30" v-bind:class="{ 'input-group__disabled': !store.wallet.isConnected }">
            <div v-if="store.wallet.isConnected && store.purchase.allowance > 0" class="token-form text--small">
              <div class="token-form__input">
                <div class="sif-input__wrapper">
                  <input v-model="store.purchase.unhashedKey" class="sif-input" type="text" @input="getEstimate">
                </div>
              </div>
            </div>
          </div>

          <div v-if="!store.wallet.isConnected" class="d-flex fd-row j-center">
            <p class="text--small">
              No wallet connected
            </p>
            <img src="../assets/circle-x.svg" class="icon-margin">
          </div>

          <ActionButton primary block v-if="!store.wallet.isConnected" @click="handleConnectClicked">
            Connect Wallet
          </ActionButton>

          <div v-if="store.wallet.isConnected" class="d-flex fd-row j-center">
            <p class="text--small">
              Connected to {{ getShortenedAddress() }}
            </p>
            <img src="../assets/circle-check.svg" class="icon-margin">
          </div>

          <ActionButton primary block v-if="store.wallet.isConnected && store.purchase.allowance <= 0 && store.purchase.whitelisted" @click="approveToken">
            Approve Token
          </ActionButton>

          <ActionButton primary block v-if="store.wallet.isConnected && store.purchase.allowance > 0 && store.purchase.whitelisted" @click="swapExactAmountIn">
            Purchase
          </ActionButton>
        </div>
      </div>
    </div>
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
    font-weight: normal;
    font-size: $fs_sm;
    color:$c_gray_900
  }
  .purchase-form {
    width: 410px;
    border-radius: $br_lg;
    overflow: hidden;
    border-color: $c_gray_150;
    border-width: 1px;
    border-style: solid;

    &__body {
      padding: 15px;
      background: $g_gray;
      color: $c_gray_700;
    }

    &__body-disabled {
      padding: 15px;
      background: $g_gray_disabled;
      color: $c_gray_700;
    }
  }
  .error-section {
    margin-bottom: 20px;
    padding: 4px 15px 15px 15px;
    border-radius: $br_sm;
    background: $c_red;
  }
  .input-group {
    margin-bottom: 20px;
    padding: 4px 15px 15px 15px;
    border-radius: $br_sm;
    border-color: $c_gray_150;
    border-width: 1px;
    border-style: solid;
    background: $g_gray;
    color: $c_gray_700;

    &__disabled {
      background: $g_gray_disabled;
    }
  }
  .price-section {
    padding: 4px 15px 15px 15px;
    border-top-left-radius: $br_sm;
    border-top-right-radius: $br_sm;
    border-color: $c_gray_150;
    border-width: 1px;
    border-style: solid;
    border-bottom-color: $c_transparent;
    background: $g_gray;
    color: $c_gray_700;

    &__disabled {
      background: $c_gray_25;
    }
  }
  .slippage-section {
    margin-bottom: 20px;
    padding: 4px 15px 15px 15px;
    border-bottom-left-radius: $br_sm;
    border-bottom-right-radius: $br_sm;
    border-color: $c_gray_150;
    border-width: 1px;
    border-style: solid;
    background: $g_gray;
    color: $c_gray_700;

    &__disabled {
      background: $g_gray_disabled;
    }
  }
</style>
