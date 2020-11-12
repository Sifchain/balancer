import { reactive } from "@vue/reactivity";

export type PurchaseStore = {
  swapIn: boolean;
  whitelisted: boolean;
  usdtAmount: number;
  rwnAmount: number;
  allowance: number;
  unhashedKey: string;
};

export const purchase = reactive({
  swapIn: true,
  whitelisted: false,
  usdtAmount: 1,
  rwnAmount: 0,
  allowance: 0,
  unhashedKey: ""
}) as PurchaseStore;
