import JSBI from "jsbi";

export type IWalletService = {
  getState: () => {
    account: string;
    connected: boolean;
    balance: string;
    log: string;
    allowance: number;
  };
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<string>;
  swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<string>;
  swapExactAmountOutCall(maxAmountIn: JSBI, tokenAmountOut: JSBI, unhashedKey: string): Promise<string>;
  approveToken(): Promise<string>;
  getAllowance(): Promise<number>;
  getBalance(): Promise<string>;
};
