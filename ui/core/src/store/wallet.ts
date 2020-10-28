import { reactive } from "@vue/reactivity";

import { Address, Balance } from "../entities";

export type WalletStore = {
  eth: {
    isConnected: boolean;
    address: Address;
    balances: Balance[];
  };
};

export const wallet = reactive({
  eth: {
    isConnected: false,
    address: "",
    balances: [],
  },
}) as WalletStore;
