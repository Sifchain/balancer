import { reactive } from "@vue/reactivity";

export type PurchaseStore = {
  swapIn: boolean;
  usdtAmount: number;
  rwnAmount: number;
  usdtAllowance: number;
};

export const purchase = reactive({
  swapIn: true,
  usdtAmount: 100,
  rwnAmount: 0,
  usdtAllowance: 0,
}) as PurchaseStore;
