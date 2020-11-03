import { reactive } from "@vue/reactivity";
import { wallet, WalletStore } from "./wallet";
import { asset, AssetStore } from "./asset";

export type Store = {
  wallet: WalletStore;
  asset: AssetStore;
};

export function createStore() {
  const state = reactive<Store>({
    wallet,
    asset,
  }) as Store;

  return state;
}

export type WithStore<T extends keyof Store = keyof Store> = {
  store: Pick<Store, T>;
};
