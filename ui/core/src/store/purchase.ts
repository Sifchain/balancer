import { reactive } from "@vue/reactivity";

export enum PurchaseState {
  Disabled = 0,
  Enabled = 1,
  Pending = 2,
  Failed = 3,
  Completed = 4,
}

export type PurchaseStore = {
  swapIn: boolean;
  whitelisted: boolean;
  usdtAmount: string;
  rwnAmount: string;
  allowance: number;
  unhashedKey: string;
  slippagePercent: string;
  state: PurchaseState;
};

export const purchase = reactive({
  swapIn: true,
  whitelisted: false,
  usdtAmount: "",
  rwnAmount: "",
  allowance: 0,
  unhashedKey: "",
  slippagePercent: "0.5",
  state: PurchaseState.Disabled,
}) as PurchaseStore;
