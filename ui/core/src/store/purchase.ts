import { reactive } from "@vue/reactivity";

export enum PurchaseState {
  Disabled = 0,
  Enabled = 1,
  Pending = 2,
  Failed = 3,
  Reverted = 4,
  Completed = 5,
  OutOfGas = 6,
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
  gasPriceLimit: string;
  rowanPoolBalance: string;
  rowanPrice: number;
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
  gasPriceLimit: "400",
  rowanPoolBalance: "",
  rowanPrice: 1
}) as PurchaseStore;
