import { reactive } from "@vue/reactivity";
import { wallet, WalletStore } from "./wallet";
import { purchase, PurchaseStore } from "./purchase";

export type Store = {
  wallet: WalletStore;
  purchase: PurchaseStore;
};

export function createStore() {
  return reactive<Store>({
    wallet,
    purchase,
  }) as Store;
}

export type WithStore<T extends keyof Store = keyof Store> = {
  store: Pick<Store, T>;
};
