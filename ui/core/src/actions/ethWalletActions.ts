import {effect} from "@vue/reactivity";
import {ActionContext} from "..";
import B from "../entities/utils/B";
import { USDT, RWN } from "../constants";

export default ({
  api,
  store,
}: ActionContext<"EthereumService", "wallet" | "asset">) => {
  const ethereumState = api.EthereumService.getState();

  const actions = {
    async updateBalances(_?: string) {
      store.wallet.eth.balances = await api.EthereumService.getBalance();
    },
    async disconnectWallet() {
      await api.EthereumService.disconnect();
    },
    async connectToWallet() {
      await api.EthereumService.connect();
    },
    async swapExactAmountInCall(
      tokenAmountIn: number,
      minAmountOut: number
    ) {
      return await api.EthereumService.swapExactAmountInCall(B(tokenAmountIn, USDT.decimals), B(minAmountOut, RWN.decimals));
      },
    async swapExactAmountOutCall(
      maxAmountIn: number,
      tokenAmountOut: number
    ) {
      return await api.EthereumService.swapExactAmountOutCall(B(maxAmountIn, USDT.decimals), B(tokenAmountOut, RWN.decimals));
    },
    async swapExactAmountInSend(
      tokenAmountIn: number,
      minAmountOut: number
    ) {
      return await api.EthereumService.swapExactAmountInSend(B(tokenAmountIn, USDT.decimals), B(minAmountOut, RWN.decimals));
      },
    async swapExactAmountOutSend(
      maxAmountIn: number,
      tokenAmountOut: number
    ) {
      return await api.EthereumService.swapExactAmountOutSend(B(maxAmountIn, USDT.decimals), B(tokenAmountOut, RWN.decimals));
    },
  };

  effect(async () => {
    store.wallet.eth.isConnected = ethereumState.connected;
  });

  effect(async () => {
    store.wallet.eth.address = ethereumState.address;
  });

  effect(async () => {
    store.wallet.eth.balances = ethereumState.balances;
  });

  effect(async () => {
    ethereumState.log;
    await api.EthereumService.getBalance();
  });

  return actions;
};
