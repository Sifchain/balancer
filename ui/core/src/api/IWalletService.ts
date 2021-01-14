import JSBI from "jsbi";
import { Balance } from "../entities/Balance";

export type IWalletService = {
  getState: () => {
    whitelisted: boolean;
    validNetwork: boolean;
    connected: boolean;
    networkType: string;
    account?: string;
    balances: Balance[];
    log: string;
    allowance: number;
  };
  isConnected(): boolean;
  getTransactionAmount(address: string, data: string): string | undefined;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<string>;
  swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<string>;
  approveToken(): Promise<string>;
  getAllowance(): Promise<number>;
  getBalances(): Promise<Balance[]>;
  getPoolBalances(): Promise<Balance[]>;
  isWhitelisted(): Promise<boolean>;
  isValidKey(unhashedKey: string): Promise<boolean>;
};
