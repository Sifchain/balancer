<script>
  import { useCore } from "@/hooks/useCore";
  import { PurchaseState } from "ui-core/src/store/purchase";

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
      const { actions, api, store } = useCore();

      function getShortenedAddress() {
        return store.wallet.connected && store.wallet.account ? store.wallet.account.slice(0, 11) + "..." : "";
      }

      async function handleConnectClicked() {
        store.wallet.connected ? await actions.disconnectWallet() : await actions.connectToWallet();
      }

      async function validateKey() {
        store.purchase.validKey = await actions.validateKey(store.purchase.unhashedKey);
      }

      async function getRowanEstimate() {
        if (store.purchase.usdtAmount.length > 0) {
          store.purchase.usdtAmount = parseFloat(store.purchase.usdtAmount).toString();
          const estimate = await actions.swapExactAmountInCall(parseFloat(store.purchase.usdtAmount) * inSlippageCoefficient(), 0, store.purchase.unhashedKey) / (10 ** 18);
          store.purchase.rwnAmount = estimate.toString();
          store.purchase.state = PurchaseState.Enabled;
        } else {
          store.purchase.state = PurchaseState.Disabled;
        }
      }

      async function getEstimate() {
        try {
          await getPurchaseError();
          await getRowanEstimate();
        } catch (e) {
          store.purchase.state = PurchaseState.Disabled;
        }
      }

      function getRwnPrice() {
        if (store.purchase.state === PurchaseState.Disabled) {
          return "0";
        }
        return (store.purchase.usdtAmount / store.purchase.rwnAmount).toFixed(3);
      }

      function setSlippageAndEstimate(slippage) {
        store.purchase.slippagePercent = slippage;
        getEstimate()
      }

      function inSlippageCoefficient() {
        return 1 - parseFloat(store.purchase.slippagePercent) / 100;
      }

      async function getPurchaseError() {
        try {
          const balances = await actions.getPoolBalances();
          if (balances.length !== 2) {
            store.purchase.error = undefined;
          } else {
            const usdtBalance = balances[0];
            const rwnBalance = balances[1];
            const maxUsdt = parseFloat(usdtBalance.toExact()) / 2;
            const maxRwn = parseFloat(rwnBalance.toExact()) / 10;

            if (store.wallet.balances && store.wallet.balances.length > 0 && parseFloat(store.wallet.balances[0].toExact()) < parseFloat(store.purchase.usdtAmount)) {
              store.purchase.error = "Insufficient balance";
            } else if (parseFloat(store.purchase.usdtAmount) > maxUsdt) {
              store.purchase.error = `Maximum contribution amount is ${maxUsdt} USDT`;
            } else if (parseFloat(store.purchase.rwnAmount) > maxRwn) {
              store.purchase.error = `Maximum contribution amount is ${maxRwn} RWN`;
            } else {
              store.purchase.error = undefined;
            }
          }
        } catch (e) {
          store.purchase.error = undefined;
        }
      }

      function tryAgain() {
        store.purchase.state = PurchaseState.Disabled;
        store.purchase.usdtAmount = "0";
        store.purchase.rwnAmount = "0";
      }

      async function swapExactAmountIn() {
        if (store.purchase.validKey && store.wallet.validNetwork) {
          const timer = window.setInterval(() => {
            if (store.purchase.state === PurchaseState.Pending) {
              if (store.purchase.progress >= 350) {
                store.purchase.progress = 0;
              } else {
                store.purchase.progress += 10;
              }
            }
          }, 50);
          try {
            store.purchase.state = PurchaseState.Pending;
            const tx = await actions.swapExactAmountInSend(parseFloat(store.purchase.usdtAmount), parseFloat(store.purchase.rwnAmount) * inSlippageCoefficient(), store.purchase.unhashedKey);
            const { transactionHash } = tx;
            store.purchase.txHash = transactionHash;
            store.purchase.state = PurchaseState.Completed;
            await api.EthereumService.handleStateChange();
          } catch (e) {
            store.purchase.state = PurchaseState.Failed;
          }
          window.clearInterval(timer);
        }
      }

      async function approveToken() {
        try {
          store.purchase.approving = true;
          await actions.approveToken();
          store.purchase.approving = false;
        } catch (e) {
          store.purchase.approving = false;
        }
        await api.EthereumService.handleStateChange();
      }

      return {
        store,
        PurchaseState,
        handleConnectClicked,
        swapExactAmountIn,
        getShortenedAddress,
        getEstimate,
        approveToken,
        getRwnPrice,
        tryAgain,
        setSlippageAndEstimate,
        validateKey,
      };
    },
    components: {}
  }
</script>

<template>
  <div>
    <div class="purchase-form">
      <div v-if="store.purchase.state === PurchaseState.Disabled || store.purchase.state === PurchaseState.Enabled" class="purchase-form__body" v-bind:class="{ 'purchase-form__body-disabled': !store.wallet.connected }">
        <div>

          <div class="d-flex fd-row j-center">
            <p class="text--small text--italic text--normal color-text mb-4" v-bind:class="{ 'text-disabled': !store.wallet.connected }">
              Please enter your 64-digit confirmation code
            </p>
            <img v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" src="../assets/circle-check.svg" class="mr-8 ml-8 mb-4">
            <img v-else src="../assets/circle-x-disabled.svg" class="mr-8 ml-8 mb-4">
          </div>

          <div class="confirmation-code mh-30 mb-20" v-bind:class="{ 'confirmation-code__disabled': !store.wallet.connected }">
            <div v-if="store.wallet.connected" class="token-form text--small">
              <input
                      placeholder="confirmation code"
                      :disabled="store.wallet.allowance <= 0 || store.purchase.validKey"
                      v-model="store.purchase.unhashedKey"
                      class="sif-input text-tiny"
                      type="text"
                      @input="validateKey"
              >
            </div>
          </div>

          <div class="input-group mh-70 mb-4" v-bind:class="{ 'input-group__disabled mb-20': !store.wallet.connected }">
            <div v-if="store.wallet.connected" class="d-flex fd-row j-between text--small">
              <p class="text--normal text--italic">
                Contribution Amount
              </p>
              <p class="text--normal text--italic" v-if="store.wallet.balances && store.wallet.balances.length > 0">Balance: {{store.wallet.balances[0].toFixed(2)}}</p>
            </div>
            <div v-if="store.wallet.connected" class="token-form text--small">
              <div class="token-form__input">
                <div class="sif-input__wrapper">
                  <input
                          class="sif-input"
                          type="number"
                          step="any"
                          min="0"
                          lang="en"
                          placeholder="0"
                          :disabled="store.wallet.allowance <= 0 || !store.purchase.validKey"
                          v-model="store.purchase.usdtAmount"
                          @input="getEstimate"
                  >
                </div>
              </div>
              <div class="token-form__balance">
                <div class="d-flex fd-row j-center align-center">
                  <img src="../assets/usdt-symbol.png" class="mr-8 ml-8" height="18" width="18">
                  <p class="text--medium text--bold color-text">USDT</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="store.wallet.connected">
            <img v-if="store.wallet.allowance > 0 && store.purchase.validKey" src="../assets/arrow-gold.svg">
            <img v-else src="../assets/arrow-grey.svg">
          </div>

          <div class="input-group mh-70 mb-20" v-bind:class="{ 'input-group__disabled': !store.wallet.connected }">
            <div v-if="store.wallet.connected" class="token-form text--small">
              <div class="token-form__input">
                <div class="sif-input__wrapper">
                  <label class="text--normal text--italic">
                    Minimum Received
                  </label>
                  <input
                          class="sif-input"
                          type="number"
                          step="any"
                          min="0"
                          lang="en"
                          placeholder="0"
                          :disabled="true"
                          v-model="store.purchase.rwnAmount"
                          @input="getEstimate"
                  >
                </div>
              </div>
              <div class="token-form__balance">
                <div class="d-flex fd-row j-center align-center">
                  <img src="../assets/rwn-symbol.svg" class="ml-8 mr-8" height="18" width="18">
                  <p class="text--medium text--bold color-text">RWN</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!store.wallet.validNetwork" class="error-section mh-93 d-flex j-center fd-col">
            <p class="text--small text--italic text--bold color-white">Connected Wallet is on a test network.</p>
          </div>

          <div v-if="store.wallet.validNetwork && store.wallet.connected && !store.wallet.whitelisted" class="error-section mh-93 d-flex j-center fd-col">
            <p class="text--small text--italic text--bold color-white">
              Connected Wallet has not passed KYC/AML process. Please connect a wallet that has passed KYC/AML. To get on the complete the KYC/AML process, please go <a href=" https://sifchain.finance/token-sale-info" target="_blank" style="color: #FFF">here</a>.
            </p>
          </div>

          <div v-if="(!store.wallet.connected && store.wallet.validNetwork) || (store.wallet.validNetwork && store.wallet.whitelisted)" class="price-section mh-23" v-bind:class="{ 'price-section__disabled': !store.wallet.connected }">
            <div v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="d-flex fd-row j-between">
              <p class="text--small text--italic text--normal">
                Price
              </p>
              <div class="d-flex fd-row j-center align-center">
                <p class="text--small text--italic text--bold">
                  {{ getRwnPrice() }} USDT per RWN
                </p>
                <img src="../assets/arrows-grey.svg" class="ml-8" height="9" width="10">
              </div>
            </div>
          </div>
          <div v-if="(!store.wallet.connected && store.wallet.validNetwork) || (store.wallet.validNetwork && store.wallet.whitelisted)" class="slippage-section mh-70" v-bind:class="{ 'slippage-section__disabled': !store.wallet.connected }">
            <p v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="text--small text--italic text--normal" align="left">
              Slippage tolerance
            </p>
            <div v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="d-flex fd-row j-start">
              <div class="slippage-item" v-bind:class="{ 'slippage-item__selected': store.purchase.slippagePercent === '0.1' }" @click="setSlippageAndEstimate('0.1')">
                <p class="text--standard text--normal text--regular">
                  0.1%
                </p>
              </div>
              <div class="slippage-item" v-bind:class="{ 'slippage-item__selected': store.purchase.slippagePercent === '0.5' }"  @click="setSlippageAndEstimate('0.5')">
                <p class="text--standard text--normal text--regular">
                  0.5%
                </p>
              </div>
              <div class="slippage-item" v-bind:class="{ 'slippage-item__selected': store.purchase.slippagePercent === '1.0' }" @click="setSlippageAndEstimate('1.0')">
                <p class="text--standard text--normal text--regular">
                  1.0%
                </p>
              </div>
              <div class="sif-input__wrapper custom-slippage-input-container">
                <input
                        v-model="store.purchase.slippagePercent"
                        class="sif-input num_percent"
                        type="number"
                        step="any"
                        min="0"
                        @input="getEstimate"
                >
                <span>%</span>
              </div>
            </div>
          </div>

          <div v-if="!store.wallet.connected || !store.wallet.whitelisted" class="d-flex fd-row j-center mb-4">
            <p class="text--small">
              No wallet connected
            </p>
            <img src="../assets/circle-x.svg" class="mr-8 ml-8">
          </div>

          <button class="btn" v-if="!store.wallet.connected || !store.wallet.whitelisted" @click="handleConnectClicked">
            Connect Wallet
          </button>

          <div v-if="store.wallet.connected && store.wallet.whitelisted" class="d-flex fd-row j-center mb-4">
            <p class="text--small color-text">
              Connected to {{ getShortenedAddress() }}
            </p>
            <img src="../assets/circle-check.svg" class="mr-8 ml-8">
          </div>

          <button class="btn" v-if="store.wallet.connected && store.wallet.whitelisted && store.wallet.allowance <= 0" v-bind:class="{ 'btn__disabled': store.purchase.approving }" @click="approveToken">
            {{ store.purchase.approving ? "Approving..." : "Approve Token" }}
          </button>

          <button class="btn" v-if="store.wallet.connected && store.wallet.allowance > 0" v-bind:class="{ 'btn__disabled': store.purchase.state === PurchaseState.Disabled || !store.purchase.validKey }" @click="swapExactAmountIn">
            Purchase
          </button>

          <div class="purchase-error-message" v-if="store.purchase.state === PurchaseState.Disabled && store.purchase.error !== undefined">
            <p>
              {{store.purchase.error}}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="purchase-form__transaction" v-bind:class="{ 'purchase-form__transaction__failed': store.purchase.state === PurchaseState.Failed, 'purchase-form__transaction__completed': store.purchase.state === PurchaseState.Completed }">
        <div v-if="store.purchase.state === PurchaseState.Pending">
          <div class="purchase-form__transaction__loading">
            <img src="../assets/transaction-waiting.svg" :style="`transform: rotate(${store.purchase.progress}deg);`">
          </div>
          <div class="purchase-form__transaction__title">
            <p>Waiting For Confirmation</p>
          </div>
          <div class="purchase-form__transaction__text mb-8">
            <p>Swapping <span class="purchase-form__transaction__span">{{ store.purchase.rwnAmount }} RWN</span> for <span class="purchase-form__transaction__span">{{ store.purchase.usdtAmount }} USDT</span></p>
          </div>
          <div class="purchase-form__transaction__hint">
            <p>Confirm transaction in your wallet</p>
          </div>
        </div>
        <div v-if="store.purchase.state === PurchaseState.Failed">
          <div class="purchase-form__transaction__loading">
            <img src="../assets/transaction-failed.svg">
          </div>
          <div class="purchase-form__transaction__title-failed">
            <p>Transaction Failed.</p>
          </div>
          <div class="purchase-form__transaction__text mb-8">
            <p>Transaction has not been confirmed in the wallet.</p>
          </div>
          <div class="purchase-form__transaction__hint">
            <p>Please try again.</p>
          </div>
          <div class="purchase-form__transaction__retry" @click="tryAgain">
            <p>Try again</p>
          </div>
        </div>
        <div v-if="store.purchase.state === PurchaseState.Completed">
          <div class="purchase-form__transaction__close" @click="tryAgain">
            <img src="../assets/close.svg">
          </div>
          <div class="purchase-form__transaction__loading">
            <img src="../assets/transaction-approved.svg">
          </div>
          <div class="purchase-form__transaction__title-completed">
            <p>Transaction submitted</p>
          </div>
          <div class="purchase-form__transaction__text mb-8">
            <p>Purchased <span class="purchase-form__transaction__span">{{ store.purchase.rwnAmount }} RWN</span> for <span class="purchase-form__transaction__span">{{ store.purchase.usdtAmount }} USDT</span></p>
          </div>
          <div class="purchase-form__transaction__hint">
            <p>Thank You for participating in our Token Sale.</p>
          </div>
          <div class="purchase-form__transaction__check">
<!--            TODO: change to https://etherscan.io/tx/ before mainnet -->
            <p>Check transaction on <a v-bind:href="'https://ropsten.etherscan.io/tx/' + store.purchase.txHash" target="_blank" style="color: #000000">Blockexplorer</a></p>
          </div>
        </div>
      </div>
    </div>
    <p class="kyc-help-text" v-if="!store.wallet.connected || !store.wallet.whitelisted">
      Please note: This app is only for users that have already been approved to participate in the Sifchain Token Sale.
      If you have not been approved, you may apply <a href="https://tokensale.sifchain.finance" target="_blank" style="color: #000000">here</a>.
      Please remember to use the wallet address you provided us in your KYC information.
      Any transactions from unapproved wallet addresses will be rejected.
    </p>
  </div>
</template>

<style lang="scss">
  .text-disabled {
    color: $c_gray_400 !important;
  }
  .kyc-help-text {
    margin-top: 16px;
    padding: 8px;
    font-weight: normal;
    font-size: $fs_sm;
    color:$c_text
  }
  .purchase-form {
    border-radius: $br_lg;
    overflow: hidden;
    border-color: $c_gray_150;
    border-width: 1px;
    border-style: solid;

    &__transaction {
      position: relative;
      height: 370px;
      padding: 15px;
      background: $c_gray_50;
      color: $c_gray_700;

      &__failed {
        border-radius: $br_lg;
        border-color: $c_red;
        border-width: 1px;
        border-style: solid;
      }

      &__close {
        position: absolute;
        top: 16px;
        right: 16px;

        &:hover {
          cursor: pointer;
        }
      }

      &__completed {
        border-radius: $br_lg;
        border-color: $c_light_green;
        border-width: 1px;
        border-style: solid;
      }

      &__loading {
        margin-top: 80px;
        margin-bottom: 16px;
      }

      &__title {
        color: $c_gold;
        font-style: italic;
        font-weight: bold;
        font-size: 16px;
      }

      &__title-failed {
        color: $c_red;
        font-style: italic;
        font-weight: bold;
        font-size: 16px;
      }

      &__title-completed {
        color: $c_light_green;
        font-style: italic;
        font-weight: bold;
        font-size: 16px;
      }

      &__text {
        font-style: italic;
        font-weight: normal;
        font-size: 16px;
        color: $c_text;
      }

      &__span {
        font-style: italic;
        font-weight: bold;
        font-size: 16px;
        color: $c_text;
      }

      &__hint {
        font-style: italic;
        font-weight: normal;
        font-size: 12px;
        color: $c_text;
      }

      &__retry {
        margin-top: 60px;
        font-style: italic;
        font-weight: bold;
        font-size: 12px;
        color: $c_text;
        text-decoration: underline;

        &:hover {
          cursor: pointer;
        }
      }

      &__check {
        margin-top: 60px;
        font-style: italic;
        font-weight: normal;
        font-size: 12px;
        color: $c_text;
      }
    }

    &__body {
      padding: 15px;
      background: $g_gray;
      color: $c_gray_700;
    }

    &__body-disabled {
      padding: 15px;
      background: $c_gray_50;
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
    padding: 0 15px 0 15px;
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
  .confirmation-code {
    margin-bottom: 20px;
    padding: 0;
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
  .slippage-item {
    height: 30px;
    width: 55px;
    padding: 8px;
    margin: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: $br_sm;
    border-color: $c_gray_400;
    border-width: 1px;
    border-style: solid;
    background: $c_white;
    color: $c_text;

    &:hover {
      cursor: pointer;
    }

    &__selected {
      background: $c_gold;
      color: $c_white;
      border: none;
    }
  }
  .price-section {
    padding: 0 15px 0 15px;
    border-top-left-radius: $br_sm;
    border-top-right-radius: $br_sm;
    border-color: $c_gray_150;
    border-width: 1px;
    border-style: solid;
    border-bottom-color: $c_gray_25;
    background: $g_gray_disabled;
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
    border-top-color: $c_gray_100;
    border-width: 1px;
    border-style: solid;
    background: $g_gray_light;
    color: $c_gray_700;

    &__disabled {
      background: $g_gray_disabled;
    }
  }
  .sif-input {
    &__wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }

    height: 30px;
    width: 100%;
    padding: 0 8px;
    border-radius: $br_sm;
    border: none;
    font-size: 15px;
    font-weight: normal;
    font-style: normal;
    color: $c_text;

    &:focus {
      outline: none;
      border-color: $c_gold;
      border-width: 1px;
      border-style: solid;
    }
  }
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
  .btn {
    @include resetButton;
    position: relative;
    display: inline-block;
    height: 30px;
    width: 100%;
    padding: 0 15px;
    overflow: hidden;
    font: inherit;
    font-size: $fs_md;
    line-height: $lh_btn;
    text-transform: uppercase;
    border-radius: $br_sm;
    transform: perspective(1px) translateZ(0);
    cursor: pointer;
    color: white;
    background: $c_gold;

    &::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: $g_gold;
      z-index: -1;
      opacity: 0;
      transition: opacity $trans_fast;
    }

    &:hover::before {
      opacity: 1;
    }

    &__disabled {
      cursor: default;
      pointer-events: none;
      background: $c_gray_400;
      color: $c_white;

      &::before {
        background: transparent;
      }
    }
  }
  .mb-20 {
    margin-bottom: 20px !important;
  }
  .custom-slippage-input-container { position:relative; }
  .custom-slippage-input-container span {
    position: absolute;
    right: 4px;
    top: 9px;
    font-weight: normal;
    font-style: normal;
    color: $c_text;
  }
  .num_percent {
    margin: 5px;
    text-align: right;
    padding-right: 22px;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    color: $c_text;
  }
  .purchase-error-message {
    margin: 5px;
    color: $c_red;
    font-size: $fs_sm;
  }
</style>
