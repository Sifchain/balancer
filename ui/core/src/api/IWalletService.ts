import { TxHash, Address, Asset, Balance, Token } from "../entities";
import JSBI from "jsbi";

export type IWalletService = {
  getState: () => {
    address: Address;
    accounts: Address[];
    connected: boolean;
    balances: Balance[];
    log: string;
    allowance: number;
    initialUsdtAmount: number;
    initialRwnEstimate: number;
  };
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI): Promise<TxHash>;
  swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI): Promise<TxHash>;
  swapExactAmountOutCall(maxAmountIn: JSBI, tokenAmountOut: JSBI): Promise<TxHash>;
  approveToken(): Promise<TxHash>;
  getAllowance(): Promise<number>;
  getBalance(address?: Address, asset?: Asset | Token): Promise<Balance[]>;
};
