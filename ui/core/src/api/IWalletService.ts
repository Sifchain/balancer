import { TxHash, TxParams, Address, Asset, Balance, Token } from "../entities";

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
  getBalance(address?: Address, asset?: Asset | Token): Promise<Balance[]>;
  setPhrase(phrase: string): Promise<Address>;
  purgeClient(): void;
};
