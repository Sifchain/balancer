import { reactive } from "@vue/reactivity";
import { wallet, WalletStore } from "./wallet";
import { asset, AssetStore } from "./asset";
import { purchase, PurchaseStore } from "./purchase";

export type Store = {
  wallet: WalletStore;
  asset: AssetStore;
  purchase: PurchaseStore;
};

export function createStore() {
  return reactive<Store>({
    wallet,
    asset,
    purchase,
  }) as Store;
}

export type WithStore<T extends keyof Store = keyof Store> = {
  store: Pick<Store, T>;
};
