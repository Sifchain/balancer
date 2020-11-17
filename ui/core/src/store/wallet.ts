import { reactive } from "@vue/reactivity";
import { Balance } from "../entities/Balance";

export type WalletStore = {
  whitelisted: boolean;
  connected: boolean;
  validNetwork: boolean;
  account?: string;
  allowance: number;
  balances: Balance[];
};

export const wallet = reactive({
  whitelisted: true,
  validKey: false,
  connected: false,
  validNetwork: true,
  account: undefined,
  allowance: 0,
  balances: [],
}) as WalletStore;
