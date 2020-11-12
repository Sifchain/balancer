import { reactive } from "@vue/reactivity";
import { Balance } from "../entities/Balance";

export type WalletStore = {
  isConnected: boolean;
  validNetwork: boolean;
  account?: string;
  balances: Balance[];
};

export const wallet = reactive({
  isConnected: false,
  validNetwork: false,
  account: undefined,
  balances: [],
}) as WalletStore;
