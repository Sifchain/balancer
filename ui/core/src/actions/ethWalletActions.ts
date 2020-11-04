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
      await actions.updateBalances();
    },
    async swapExactAmountIn(
      tokenAmountIn: number,
      minAmountOut: number
    ) {
      return await api.EthereumService.swapExactAmountIn(B(tokenAmountIn, USDT.decimals), B(minAmountOut, RWN.decimals));
      },
    async swapExactAmountOut(
      maxAmountIn: number,
      tokenAmountOut: number
    ) {
      return await api.EthereumService.swapExactAmountOut(B(maxAmountIn, USDT.decimals), B(tokenAmountOut, RWN.decimals));
    },
  };

  effect(async () => {
    store.wallet.eth.isConnected = api.EthereumService.getState().connected;
    await actions.updateBalances();
  });

  effect(async () => {
    api.EthereumService.isConnected();
    await actions.updateBalances();
  });

  effect(async () => {
    store.wallet.eth.address = ethereumState.address;
    await actions.updateBalances();
  });

  effect(async () => {
    api.EthereumService.getState().log;
    await actions.updateBalances();
  });

  return actions;
};
