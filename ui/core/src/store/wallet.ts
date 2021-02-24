import { reactive } from "@vue/reactivity";
import { Balance } from "../entities/Balance";

export type WalletStore = {
  connected: boolean;
  validNetwork: boolean;
  account?: string;
  allowance: number;
  balances: Balance[];
};

export const wallet = reactive({
  connected: false,
  validNetwork: true,
  account: undefined,
  allowance: 0,
  balances: [],
}) as WalletStore;
