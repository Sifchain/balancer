import { reactive } from "@vue/reactivity";
import { Balance } from "../entities/Balance";

export type WalletStore = {
  isConnected: boolean;
  account: string;
  balances: Balance[];
};

export const wallet = reactive({
  isConnected: false,
  account: "",
  balances: [],
}) as WalletStore;
