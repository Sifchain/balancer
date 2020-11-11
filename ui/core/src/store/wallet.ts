import { reactive } from "@vue/reactivity";

export type WalletStore = {
  isConnected: boolean;
  account: string;
  balance: string;
};

export const wallet = reactive({
  isConnected: false,
  account: "",
  balance: "",
}) as WalletStore;
