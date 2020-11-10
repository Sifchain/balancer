import {effect} from "@vue/reactivity";
import {ActionContext} from "..";
import B from "../entities/utils/B";
import { USDT, RWN } from "../constants";

export default ({
  api,
  store,
}: ActionContext<"EthereumService", "wallet" | "purchase">) => {
  const ethereumState = api.EthereumService.getState();

  const actions = {
    async updateBalances(_?: string) {
      store.wallet.balances = await api.EthereumService.getBalance();
    },
    async disconnectWallet() {
      await api.EthereumService.disconnect();
    },
    async connectToWallet() {
      await api.EthereumService.connect();
    },
    async swapExactAmountInCall(
      tokenAmountIn: number,
      minAmountOut: number,
      unhashedKey: string
    ) {
      return await api.EthereumService.swapExactAmountInCall(B(tokenAmountIn, USDT.decimals), B(minAmountOut, RWN.decimals), unhashedKey);
    },
    async swapExactAmountOutCall(
      maxAmountIn: number,
      tokenAmountOut: number,
      unhashedKey: string
    ) {
      return await api.EthereumService.swapExactAmountOutCall(B(maxAmountIn, USDT.decimals), B(tokenAmountOut, RWN.decimals), unhashedKey);
    },
    async swapExactAmountInSend(
      tokenAmountIn: number,
      minAmountOut: number,
      unhashedKey: string
    ) {
      return await api.EthereumService.swapExactAmountInSend(B(tokenAmountIn, USDT.decimals), B(minAmountOut, RWN.decimals), unhashedKey);
    },
    async approveToken() {
      return await api.EthereumService.approveToken();
    },
  };

  console.log("ethWalletActions");

  effect(async () => {
    console.log("ethWalletActions effect", ethereumState);
    store.wallet.isConnected = ethereumState.connected;
  });

  effect(async () => {
    store.wallet.account = ethereumState.account;
  });

  effect(async () => {
    store.wallet.balances = ethereumState.balances;
  });

  effect(async () => {
    store.purchase.usdtAllowance = ethereumState.allowance;
  });

  effect(async () => {
    ethereumState.log;
    await api.EthereumService.getBalance();
  });

  return actions;
};
