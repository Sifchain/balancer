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
  validKey: boolean;
  usdtAmount: string;
  rwnAmount: string;
  unhashedKey: string;
  slippagePercent: string;
  state: PurchaseState;
};

export const purchase = reactive({
  swapIn: true,
  validKey: false,
  usdtAmount: "",
  rwnAmount: "",
  unhashedKey: "",
  slippagePercent: "0.5",
  state: PurchaseState.Disabled,
}) as PurchaseStore;
