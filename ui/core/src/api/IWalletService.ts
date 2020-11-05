import { TxHash, Address, Asset, Balance, Token } from "../entities";
import JSBI from "jsbi";

export type IWalletService = {
  getState: () => {
    address: Address;
    accounts: Address[];
    connected: boolean;
    balances: Balance[];
    log: string;
  };
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI): Promise<TxHash>;
  swapExactAmountOutSend(maxAmountIn: JSBI, tokenAmountOut: JSBI): Promise<TxHash>;
  swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI): Promise<TxHash>;
  swapExactAmountOutCall(maxAmountIn: JSBI, tokenAmountOut: JSBI): Promise<TxHash>;
  getBalance(address?: Address, asset?: Asset | Token): Promise<Balance[]>;
};
