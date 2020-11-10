import { reactive } from "@vue/reactivity";

export type PurchaseStore = {
  swapIn: boolean;
  usdtAmount: number;
  rwnAmount: number;
  usdtAllowance: number;
  unhashedKey: string;
};

export const purchase = reactive({
  swapIn: true,
  usdtAmount: 100,
  rwnAmount: 0,
  usdtAllowance: 0,
  unhashedKey: ""
}) as PurchaseStore;
