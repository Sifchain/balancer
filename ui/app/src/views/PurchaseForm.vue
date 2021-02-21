<script>
  import { useCore } from "@/hooks/useCore";
  import { PurchaseState } from "ui-core/src/store/purchase";
  import Tooltip from "@/components/Tooltip.vue";

  export default {
    name: "PurchaseForm",
    components: {
      Tooltip
    },
    async created() {
      const { api, store } = useCore();
      await this.initState(api);
      await this.getRowanPoolBalance(api, store);
      await this.getGasPriceLimit(api, store);
      gtag('event', 'page_view', {
        page_title: 'Purchase Form',
        page_location: 'https://purchase.sifchain.finance',
        page_path: '/',
        send_to: 'G-FJ83DRKTY3'
      })
    },
    methods: {
      async initState(api) {
        await api.EthereumService.handleStateChange();
      },
      async getRowanPoolBalance(api, store) {
        const balances = await api.EthereumService.getPoolBalances();
        if (balances.length === 2) {
          const rwnBalance = balances[1];
          store.purchase.rowanPoolBalance = rwnBalance.toFixed(0);
        }
      },
      async getGasPriceLimit(api, store) {
        store.purchase.gasPriceLimit = (parseInt(await api.EthereumService.getGasPriceLimit()) / 1000000000).toFixed(0);
      }
    },
    setup() {
      const { actions, api, store } = useCore();

      function getShortenedAddress() {
        store.wallet.connected && store.wallet.account ?
                store.wallet.account.slice(0, 7)
                + "..." +
                store.wallet.account.slice(store.wallet.account.length - 5)
                : "";
      }

      async function handleConnectClicked() {
        store.wallet.connected ? await actions.disconnectWallet() : await actions.connectToWallet();
        gtag('event', 'click_connect_wallet', {
          'event_label': 'Click Connect Wallet'
        });
      }

      async function validateKey() {
        store.purchase.validKey = await actions.validateKey(store.purchase.unhashedKey);
        if (store.purchase.validKey) {
          gtag('event', 'enter_valid_code', {
            'event_label': 'Enter Valid Code'
          });
        }
      }

      function isNumeric(s) {
        return (s - 0) == s && (''+s).trim().length > 0;
      }

      function formatNumberString(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      }

      function validateSlippage() {
        try {
          if (!isNumeric(store.purchase.slippagePercent) || parseFloat(store.purchase.slippagePercent) > 99.0) {
            store.purchase.state = PurchaseState.Disabled;
          } else if (parseFloat(store.purchase.slippagePercent) < 0) {
            store.purchase.slippagePercent = store.purchase.slippagePercent.substring(1);
          } else if (store.purchase.slippagePercent.length > 4) {
            store.purchase.slippagePercent = store.purchase.slippagePercent.substring(0, store.purchase.slippagePercent.length - 2);
          } else {
            store.purchase.state = PurchaseState.Enabled;
          }
        } catch (e) {
          store.purchase.state = PurchaseState.Disabled;
        }
      }

      function validateUsdtAmount() {
        try {
          if (!isNumeric(store.purchase.usdtAmount)) {
            store.purchase.usdtAmount = "0";
          } else if (parseFloat(store.purchase.usdtAmount) < 0) {
            store.purchase.usdtAmount = store.purchase.usdtAmount.substring(1);
          }
        } catch (e) {
          store.purchase.slippagePercent = "0";
        }
      }

      async function getRowanEstimate() {
        if (parseInt(store.purchase.usdtAmount) > 0) {
          store.purchase.usdtAmount = parseFloat(store.purchase.usdtAmount).toString();
          const estimate = await actions.swapExactAmountInCall(parseFloat(store.purchase.usdtAmount), 0, store.purchase.unhashedKey) / (10 ** 18);
          store.purchase.rowanPrice = store.purchase.usdtAmount / estimate;
          store.purchase.rwnAmount = (inSlippageCoefficient() * estimate).toString();
        } else {
          store.purchase.state = PurchaseState.Disabled;
        }
      }

      async function getEstimate() {
        if (store.wallet.balances && store.wallet.balances.length > 0
                && parseFloat(store.wallet.balances[0].toExact()) < parseFloat(store.purchase.usdtAmount)) {
          store.purchase.error = "Insufficient balance";
          store.purchase.state = PurchaseState.Disabled;
        } else {
          try {
            validateUsdtAmount();
            validateSlippage();
            await getRowanEstimate();
            store.purchase.error = undefined;
          } catch (e) {
            store.purchase.state = PurchaseState.Disabled;
            store.purchase.rowanPrice = store.purchase.usdtAmount / ((1 - (2625000 / (2625000 + parseInt(store.purchase.usdtAmount)))) * store.purchase.rowanPoolBalance);
            if (e.toString().includes("ERR_MAX_OUT_RATIO")) {
              const maxUsdt = getLimit(50);
              store.purchase.error = `Maximum contribution amount is ${formatNumberString(maxUsdt)} USDT`;
              store.purchase.rwnAmount = store.purchase.usdtAmount / store.purchase.rowanPrice + "";
            }
          }
        }
      }

      function getLimit(denum) {
        return (2625000 * (1 / denum) / (1 - (1 / denum))).toFixed(0);
      }

      function setSlippageAndEstimate(slippage) {
        store.purchase.slippagePercent = slippage;
        getEstimate()
      }

      function inSlippageCoefficient() {
        let numericSlippage = parseFloat(store.purchase.slippagePercent);
        if (isNaN(numericSlippage)) {
          numericSlippage = 0;
        }
        return 1 - (numericSlippage / 100);
      }

      function tryAgain() {
        store.purchase.state = PurchaseState.Disabled;
        store.purchase.usdtAmount = "0";
        store.purchase.rwnAmount = "0";
        gtag('event', 'click_try_again', {
          'event_label': 'Click Try Again'
        });
      }

      async function getRwnPoolBalance() {
        const balances = await api.EthereumService.getPoolBalances();
        if (balances.length === 2) {
          const rwnBalance = balances[1];
          store.purchase.rowanPoolBalance = rwnBalance.toFixed(0);
        }
      }

      async function swapExactAmountIn() {
        gtag('event', 'click_purchase', {
          'event_label': 'Click Purchase'
        });
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
            const tx = await actions.swapExactAmountInSend(parseFloat(store.purchase.usdtAmount), (parseFloat(store.purchase.rwnAmount) * inSlippageCoefficient()) - 0.000000000001, store.purchase.unhashedKey);
            const { transactionHash, events } = tx;
            const tokenOut = events["LOG_SWAP"]["returnValues"]["tokenOut"];
            const tokenAmountOut = events["LOG_SWAP"]["returnValues"]["tokenAmountOut"];
            const amount = api.EthereumService.getTransactionAmount(tokenOut, tokenAmountOut);
            if (amount) {
              store.purchase.txAmount = amount;
            } else {
              store.purchase.txAmount = store.purchase.rwnAmount;
            }
            store.purchase.txHash = transactionHash;
            store.purchase.state = PurchaseState.Completed;
            await api.EthereumService.handleStateChange();
            await getRwnPoolBalance();
            gtag('event', 'purchase_successful', {
              'event_label': 'Purchase Successful'
            });
          } catch (e) {
            console.log("ERROR: ", e);
            if (e.toString().includes("Transaction has been reverted by the EVM")) {
              store.purchase.state = PurchaseState.Reverted;
              gtag('event', 'purchase_failed', {
                'event_label': 'Purchase Failed'
              });
            } else if (e.message && e.message.toString().includes("ERR_GAS_PRICE_LIMIT_EXCEEDED")) {
              store.purchase.state = PurchaseState.OutOfGas;
              gtag('event', 'purchase_failed', {
                'event_label': 'Purchase Failed'
              });
            } else {
              store.purchase.state = PurchaseState.Failed;
              gtag('event', 'purchase_canceled', {
                'event_label': 'Purchase Canceled'
              });
            }
          }
          window.clearInterval(timer);
        }
      }

      async function approveToken() {
        gtag('event', 'click_approve', {
          'event_label': 'Click Approve'
        });
        try {
          store.purchase.approving = true;
          await actions.approveToken();
          store.purchase.approving = false;
          gtag('event', 'approve_successful', {
            'event_label': 'Approve Successful'
          });
        } catch (e) {
          store.purchase.approving = false;
          gtag('event', 'approve_failed', {
            'event_label': 'Approve Failed'
          });
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
        tryAgain,
        setSlippageAndEstimate,
        validateKey,
        getLimit,
        formatNumberString
      };
    }
  }
</script>

<template>
  <div>
    <p class="browser-notice">
      We are currently only supporting this page on desktop in the Chrome browser.
    </p>
    <div class="purchase-form">
      <div v-if="store.purchase.state === PurchaseState.Disabled || store.purchase.state === PurchaseState.Enabled" class="purchase-form__body" v-bind:class="{ 'purchase-form__body-disabled': !store.wallet.connected }">
        <div>

          <div v-if="store.wallet.connected" class="d-flex fd-row j-start">
            <p v-if="!store.purchase.validKey" class="text--small text--italic text--normal color-text mb-4">
              Please enter your 64-digit contribution code
            </p>
            <p v-if="store.purchase.validKey" class="text--small text--italic text--normal color-text mb-4">
              Contribution code is valid
            </p>
            <img v-if="store.purchase.validKey" src="../assets/circle-check.svg" class="mr-4 ml-4 mb-4">
          </div>

          <div class="confirmation-code mh-30 mb-20" v-bind:class="{ 'confirmation-code__disabled': !store.wallet.connected }">
            <div v-if="store.wallet.connected" class="token-form text--small">
              <input
                placeholder="contribution code"
                :disabled="store.purchase.validKey"
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
                <div class="d-flex fd-row j-center align-center mw-82">
                  <img src="../assets/usdt-symbol.png" class="mr-4 mb-3" height="18" width="18">
                  <p class="text--medium text--bold color-text mb-3">USDT</p>
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
                  <div class="dropdown__wrapper">
                    <div class="d-flex fd-row">
                      <p class="text--normal text--italic">
                        Minimum Received
                      </p>
                      <Tooltip message="Minimum amount of erowan you will receive for your USDT, if this amount cannot be met, the transaction will not complete.">
                        <img src="../assets/info-grey.svg" class="mr-4 ml-4 mt-2 mb-2">
                      </Tooltip>
                    </div>
                  </div>
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
                <div class="d-flex fd-row j-center align-center mw-82">
                  <img src="../assets/rwn-symbol.svg" class="ml-4 mr-4 mb-3" height="18" width="18">
                  <p class="text--medium text--bold color-text mb-3">erowan</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!store.wallet.validNetwork" class="error-section mh-93 d-flex j-center fd-col">
            <p class="text--small text--italic text--bold color-white">Connected Wallet is on a test network.</p>
          </div>

          <div v-if="(!store.wallet.connected && store.wallet.validNetwork) || (store.wallet.validNetwork && store.purchase.validKey)" class="price-section mh-23" v-bind:class="{ 'price-section__disabled': !store.wallet.connected }">
            <div v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="d-flex fd-row j-between">
              <p class="text--small text--italic text--normal">
                Price
              </p>
              <div class="d-flex fd-row j-center align-center">
                <p class="text--small text--italic text--bold">
                  {{ store.purchase.rowanPrice.toFixed(3) }} USDT per erowan
                </p>
                <img src="../assets/arrows-grey.svg" class="ml-8" height="9" width="10">
              </div>
            </div>
          </div>
          <div v-if="(!store.wallet.connected && store.wallet.validNetwork) || (store.wallet.validNetwork && store.purchase.validKey)" class="slippage-section mh-70" v-bind:class="{ 'slippage-section__disabled': !store.wallet.connected }">
            <div v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="d-flex fd-row">
              <p class="text--small text--italic text--normal" align="left">
                Slippage tolerance
              </p>
              <Tooltip message="Affects the minimum amount of erowan you are guaranteed to receive. Higher tolerance means your transaction is more likely to be processed after submitted, but you might not receive as much erowan as a lower tolerance. If your transaction fails, try setting a higher tolerance.">
                <img src="../assets/info-grey.svg" class="mr-4 ml-4 mt-2">
              </Tooltip>
            </div>
            <div v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="d-flex fd-row j-start">
              <div class="slippage-item" v-bind:class="{ 'slippage-item__selected': store.purchase.slippagePercent === '0.5' || store.purchase.slippagePercent === '.5' }" @click="setSlippageAndEstimate('0.5')">
                <p class="text--standard text--normal text--regular">
                  0.5%
                </p>
              </div>
              <div class="slippage-item" v-bind:class="{ 'slippage-item__selected': store.purchase.slippagePercent === '1.0' || store.purchase.slippagePercent === '1' }"  @click="setSlippageAndEstimate('1.0')">
                <p class="text--standard text--normal text--regular">
                  1.0%
                </p>
              </div>
              <div class="slippage-item" v-bind:class="{ 'slippage-item__selected': store.purchase.slippagePercent === '2.0' || store.purchase.slippagePercent === '2' }" @click="setSlippageAndEstimate('2.0')">
                <p class="text--standard text--normal text--regular">
                  2.0%
                </p>
              </div>
              <div class="sif-input__wrapper custom-slippage-input-container" @click="$event.target.select()">
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

          <div v-if="!store.wallet.connected" class="d-flex fd-row j-center mb-4">
            <p class="text--small">
              No wallet connected
            </p>
          </div>

          <button class="btn" v-if="!store.wallet.connected" @click="handleConnectClicked">
            Connect Wallet
          </button>

          <div v-if="store.wallet.connected" class="d-flex fd-row j-center mb-4">
            <p class="text--small color-text">
              Connected to {{ getShortenedAddress() }}
            </p>
            <img src="../assets/circle-check.svg" class="mr-8 ml-8">
          </div>

          <button class="btn" v-if="store.wallet.connected && store.wallet.allowance <= 0" v-bind:class="{ 'btn__disabled': store.purchase.approving || !store.purchase.validKey }" @click="approveToken">
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
      <div v-else class="purchase-form__transaction" v-bind:class="{ 'purchase-form__transaction__failed': store.purchase.state === PurchaseState.Failed || store.purchase.state === PurchaseState.Reverted, 'purchase-form__transaction__completed': store.purchase.state === PurchaseState.Completed }">
        <div v-if="store.purchase.state === PurchaseState.Pending">
          <div class="purchase-form__transaction__loading">
            <img src="../assets/transaction-waiting.svg" :style="`transform: rotate(${store.purchase.progress}deg);`">
          </div>
          <div class="purchase-form__transaction__title">
            <p>Waiting For Confirmation</p>
          </div>
          <div class="purchase-form__transaction__text mb-8">
            <p>Swapping <span class="purchase-form__transaction__span">{{ store.purchase.rwnAmount }} erowan</span> for <span class="purchase-form__transaction__span">{{ store.purchase.usdtAmount }} USDT</span></p>
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
        <div v-if="store.purchase.state === PurchaseState.Reverted">
          <div class="purchase-form__transaction__loading">
            <img src="../assets/transaction-failed.svg">
          </div>
          <div class="purchase-form__transaction__title-failed">
            <p>Transaction Failed.</p>
          </div>
          <div class="purchase-form__transaction__text mb-8">
            <p>Transaction has been reverted.</p>
          </div>
          <div class="purchase-form__transaction__hint">
            <p>Please try to increase slippage tolerance and set the gas price below {{ store.purchase.gasPriceLimit }} gwei.</p>
          </div>
          <div class="purchase-form__transaction__retry" @click="tryAgain">
            <p>Try again</p>
          </div>
        </div>
        <div v-if="store.purchase.state === PurchaseState.OutOfGas">
          <div class="purchase-form__transaction__loading">
            <img src="../assets/transaction-failed.svg">
          </div>
          <div class="purchase-form__transaction__title-failed">
            <p>Transaction Failed.</p>
          </div>
          <div class="purchase-form__transaction__text mb-8">
            <p>Gas price limit exceeded.</p>
          </div>
          <div class="purchase-form__transaction__hint">
            <p>Please set the transaction gas price below {{ store.purchase.gasPriceLimit }} gwei.</p>
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
            <p>Purchased <span class="purchase-form__transaction__span">{{ store.purchase.txAmount }} erowan</span> for <span class="purchase-form__transaction__span">{{ store.purchase.usdtAmount }} USDT</span></p>
          </div>
          <div class="purchase-form__transaction__hint">
            <p>Thank You for participating in our Token Sale.</p>
          </div>
          <div class="purchase-form__transaction__check">
            <p>Check transaction on <a v-bind:href="'https://etherscan.io/tx/' + store.purchase.txHash" target="_blank" style="color: #000000">Blockexplorer</a></p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.wallet.connected && store.wallet.allowance > 0 && store.purchase.validKey" class="details">
      <div class="details-row">
       <span>
         Gas Price Limit
         <Tooltip message="This is the highest gas price that you will be able to send in your transaction. Please do not exceed this amount.">
           <img src="../assets/info-grey.svg" class="mr-4 ml-4 mt-2">
         </Tooltip>
       </span>

        <span>{{ store.purchase.gasPriceLimit }} gwei</span>
      </div>

      <div class="details-row">
        <span>
          Max Recommended (0.5% of the pool)
          <Tooltip message="This is the most USDT we recommend spending in a single transaction due to high slippage.">
            <img src="../assets/info-grey.svg" class="mr-4 ml-4 mt-2">
          </Tooltip>
        </span>

        <span>{{ formatNumberString(getLimit(200)) }} USDT</span>
      </div>

      <div class="details-row">
        <span>
            Max Possible (2% of the pool)
          <Tooltip message="This is the max USDT you can spend in a single transaction. You may make multiple transactions exceeding this amount.">
            <img src="../assets/info-grey.svg" class="mr-4 ml-4 mt-2">
          </Tooltip>
        </span>

        <span>{{ formatNumberString(getLimit(50)) }} USDT</span>
      </div>

      <div class="details-row">
        <div>
          <span>
            Tokens currently available
            <Tooltip message="364,000 tokens are added to the pool every hour (network conditions permitting) until an hour before the end of the sale.">
              <img src="../assets/info-grey.svg" class="mr-4 ml-4 mt-2">
            </Tooltip>
          </span>
        </div>

        <span>{{ formatNumberString(store.purchase.rowanPoolBalance) }} erowan</span>
      </div>
    </div>

    <p class="kyc-help-text">
      Please note: This app is only for users that have already been approved to participate in the Sifchain Token Sale. Please remember to use the wallet address you provided us in your KYC information. Your contribution code was sent to your registered email address.
      For instructions on how to use this page, go <a href="https://medium.com/sifchain-finance/token-sale-purchasing-tutorial-73f9bf0f0796" target="_blank" style="color: #000000">here</a>.
      Still have questions? Contact <a href="mailto: token-sale@sifchain.finance" style="color: #000000">token-sale@sifchain.finance</a> from your registered email address.
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
  .dropdown {
    &__wrapper {
      display: inline-block;
      position: relative;
    }

    position: absolute;
    font-size: 11px;
    min-width: 220px;
    bottom: 18px;
    left: 24px;
    padding: 1px;
    background: white;
    border-radius: $br_md;
    border-bottom-left-radius: 0;
    box-shadow: $bs_dropdown;

    &__inner {
      border-radius: $br_md;
      border-bottom-left-radius: 0;
      border: $divider;
      padding: 1rem;
    }
  }
  .dropdown_left {
    left: 118px;
  }
  .browser-notice {
    margin-top: 10px;
    padding: 20px 0 5px 0;
    font-weight: normal;
    font-size: $fs_tiny;
    color:$c_text
  }
  .details {
    margin-top: 16px;
    border: 1.2px solid $c_gold;
    padding: 16px 24px 16px 24px;
    border-radius: $br_lg;
    background: $g_gray_lighter;

    &-row {
      display: flex;
      justify-content: space-between;
      color: $c_gray_700;
      font-size: 12px;
      font-style: italic;

      .tooltip {
        display: inline-block;
      }
      span:last-child {
        text-align: right;
        color: $c_gray_900;
        font-weight: 700;
        font-size: 13px;

        span {
          color: $c_gray_900;
          font-weight: 700;
        }
      }

      span:first-child {
        color: $c_gray_700;
        font-weight: 400;
        text-align: left;
      }
    }
  }
</style>
