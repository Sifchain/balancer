import { reactive } from "@vue/reactivity";

export enum PurchaseState {
  Disabled = 0,
  Enabled = 1,
  Pending = 2,
  Failed = 3,
  Reverted = 4,
  Completed = 5,
}

export type PurchaseStore = {
  validKey: boolean;
  usdtAmount: string;
  rwnAmount: string;
  unhashedKey: string;
  slippagePercent: string;
  state: PurchaseState;
  progress: number;
  error?: string;
  txHash: string;
  txAmount?: string;
  approving: boolean;
  showMinReceivedTooltip: boolean;
  showSlippageToleranceTooltip: boolean;
  rowanPrice: string;
};

export const purchase = reactive({
  validKey: false,
  usdtAmount: "",
  rwnAmount: "",
  unhashedKey: "",
  slippagePercent: "1.0",
  state: PurchaseState.Disabled,
  progress: 0,
  error: undefined,
  txHash: "",
  txAmount: undefined,
  approving: false,
  showMinReceivedTooltip: false,
  showSlippageToleranceTooltip: false,
  rowanPrice: ""
}) as PurchaseStore;
