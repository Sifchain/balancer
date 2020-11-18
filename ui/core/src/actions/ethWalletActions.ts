import {effect} from "@vue/reactivity";
import {ActionContext} from "..";
import B from "../entities/utils/B";

export default ({
  api,
  store,
}: ActionContext<"EthereumService", "wallet" | "purchase">) => {
  const ethereumState = api.EthereumService.getState();

  const actions = {
    async updateBalances(_?: string) {
      store.wallet.balances = await api.EthereumService.getBalances();
    },
    async connectToWallet() {
      await api.EthereumService.connect();
    },
    async disconnectWallet() {
      await api.EthereumService.disconnect();
    },
    async swapExactAmountInCall(
      tokenAmountIn: number,
      minAmountOut: number,
      unhashedKey: string
    ) {
      return await api.EthereumService.swapExactAmountInCall(B(tokenAmountIn, 6), B(minAmountOut, 18), unhashedKey);
    },
    // async swapExactAmountOutCall(
    //   maxAmountIn: number,
    //   tokenAmountOut: number,
    //   unhashedKey: string
    // ) {
    //   return await api.EthereumService.swapExactAmountOutCall(B(maxAmountIn, 6), B(tokenAmountOut, 18), unhashedKey);
    // },
    async swapExactAmountInSend(
      tokenAmountIn: number,
      minAmountOut: number,
      unhashedKey: string
    ) {
      return await api.EthereumService.swapExactAmountInSend(B(tokenAmountIn, 6), B(minAmountOut, 18), unhashedKey);
    },
    async approveToken() {
      return await api.EthereumService.approveToken();
    },
    async isWhitelisted() {
      return await api.EthereumService.isWhitelisted();
    },
    async isValidKey(unhashedKey: string) {
      return await api.EthereumService.isValidKey(unhashedKey);
    }
  };

  effect(async () => {
    store.wallet.connected = ethereumState.connected;
  });

  effect(async () => {
    store.wallet.validNetwork = ethereumState.validNetwork;
  });

  effect(async () => {
    store.wallet.account = ethereumState.account;
  });

  effect(async () => {
    store.wallet.balances = ethereumState.balances;
  });

  effect(async () => {
    store.wallet.allowance = ethereumState.allowance;
  });

  effect(async () => {
    store.wallet.whitelisted = ethereumState.whitelisted;
  });

  return actions;
};
