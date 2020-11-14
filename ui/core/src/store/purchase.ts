import { reactive } from "@vue/reactivity";

export enum PurchaseState {
  Disabled = 0,
  Enabled = 1,
  Pending = 1,
  Failed = 2,
  Completed
}

export type PurchaseStore = {
  swapIn: boolean;
  whitelisted: boolean;
  usdtAmount: number;
  rwnAmount: number;
  allowance: number;
  unhashedKey: string;
  slippagePercent: number;
  state: PurchaseState;
};

export const purchase = reactive({
  swapIn: true,
  whitelisted: false,
  usdtAmount: 0,
  rwnAmount: 0,
  allowance: 0,
  unhashedKey: "",
  slippagePercent: 0.5,
  state: PurchaseState.Disabled,
}) as PurchaseStore;
