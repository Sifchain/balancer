import { TxHash, TxParams, Address, Asset, Balance, Token } from "../entities";
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
  transfer(params: TxParams): Promise<TxHash>;
  swapExactAmountIn(amount: JSBI): Promise<TxHash>;
  swapExactAmountOut(amount: JSBI): Promise<TxHash>;
  getBalance(address?: Address, asset?: Asset | Token): Promise<Balance[]>;
};
