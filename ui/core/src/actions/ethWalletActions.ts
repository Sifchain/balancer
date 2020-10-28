import {effect} from "@vue/reactivity";
import {Asset} from "../entities";
import {ActionContext} from "..";
import B from "../entities/utils/B";
import { ETH } from "../constants";

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
    async transferEthWallet(
      amount: number,
      recipient: string,
      asset: Asset = ETH
    ) {
      return await api.EthereumService.transfer({
        amount: B(amount, asset.decimals),
        recipient,
        asset,
      });
    },
    async swapExactAmountIn(
      maxAmountIn: number,
      tokenAmountOut: number,
      maxPrice: number
    ) {
      // TODO
    },
    async swapExactAmountOut(
      tokenAmountIn: number,
      minAmountOut: number,
      maxPrice: number
    ) {
      // TODO
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
    api.EthereumService.getState().log;
    await actions.updateBalances();
  });

  return actions;
};
