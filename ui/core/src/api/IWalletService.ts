import { TxHash, Address, Asset, Balance, Token } from "../entities";
import JSBI from "jsbi";

export type IWalletService = {
  getState: () => {
    account: string;
    connected: boolean;
    balances: Balance[];
    log: string;
    allowance: number;
  };
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<TxHash>;
  swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<TxHash>;
  swapExactAmountOutCall(maxAmountIn: JSBI, tokenAmountOut: JSBI, unhashedKey: string): Promise<TxHash>;
  approveToken(): Promise<TxHash>;
  getAllowance(): Promise<number>;
  getBalance(address?: Address, asset?: Asset | Token): Promise<Balance[]>;
};
