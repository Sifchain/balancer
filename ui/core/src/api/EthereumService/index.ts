import { reactive } from "@vue/reactivity";
import Web3 from "web3";
import { provider, WebsocketProvider } from "web3-core";
import { IWalletService } from "../IWalletService";
import { TxHash, TxParams, Asset, Balance, Token } from "../../entities";
import {
  getEthereumBalance,
  getTokenBalance,
  isEventEmittingProvider,
  isToken,
  transferAsset,
  isValidNetwork,
} from "./utils/ethereumUtils";

type Address = string;
type Balances = Balance[];

export type EthereumServiceContext = {
  getWeb3Provider: () => Promise<provider>;
};

type MetaMaskProvider = WebsocketProvider & {
  request?: (a: any) => Promise<void>;
  isConnected(): boolean;
};

function isMetaMaskProvider(provider?: provider): provider is MetaMaskProvider {
  return typeof (provider as any).request === "function";
}

export function handleConnectToMetaMaskError(err: any) {
  const { code, message } = err;
  // TODO show popup dialog
  if (code) {
    if (code === -32002) {
      // Permissions request already pending; please wait.
      console.log(message);
    } else if (code === 4001) {
      // User rejected the request.
      console.log(message);
    }
  } else {
    if (err.toString().contains("Invalid network.")) {
      // Invalid network.
    } else {
      // Provider not loaded.
    }
    console.log(err.toString());
  }
}

export class EthereumService implements IWalletService {
  private web3: Web3 | null = null;
  private blockSubscription: any;
  private provider: provider | undefined;

  // This is shared reactive state
  private state: {
    connected: boolean;
    address: Address;
    accounts: Address[];
    balances: Balance[];
    log: string;
  } = reactive({
    connected: false,
    accounts: [],
    balances: [],
    address: "",
    log: "unset",
  });

  constructor(getWeb3Provider: () => Promise<provider>) {
    getWeb3Provider().then((provider) => {
      if (isEventEmittingProvider(provider)) {
        provider.on("connect", () => {
          this.state.connected = true;
        });
        provider.on("disconnect", () => {
          this.state.connected = false;
        });
      }
      this.provider = provider;
    });
  }

  getState() {
    return this.state;
  }

  private async updateAccounts() {
    if (!this.web3) return;
    this.state.accounts = (await this.web3?.eth.getAccounts()) ?? [];
  }

  getAddress(): Address {
    return this.state.address;
  }

  isConnected() {
    return this.state.connected;
  }

  async connect() {
    try {
      if (!this.provider)
        throw new Error("Cannot connect because provider is not yet loaded!");

      this.web3 = new Web3(this.provider);
      const networkType = await this.web3.eth.net.getNetworkType();

      if (!isValidNetwork(networkType)) {
        throw new Error("Invalid network.");
        // TODO: show error popup
      }
      await this.updateAccounts();

      [this.state.address] = this.state.accounts;

      // Let's test for Metamask
      if (isMetaMaskProvider(this.provider)) {
        if (this.provider.request) {
          // If metamask lets try and connect
          await this.provider.request({ method: "eth_requestAccounts" });
        }
      }
      this.state.connected = true;

      this.addWeb3Subscription();
    } catch (err) {
      handleConnectToMetaMaskError(err);
      this.web3 = null;
    }
  }

  addWeb3Subscription() {
    this.blockSubscription = this.web3?.eth.subscribe(
      "newBlockHeaders",
      (error, result) => {
        this.state.log = result?.hash ?? "null";
      }
    );
  }

  removeWeb3Subscription() {
    this.blockSubscription?.unsubscribe();
  }

  async disconnect() {
    this.removeWeb3Subscription();
    this.state.connected = false;
    this.web3 = null;
  }

  async getBalance(
    address?: Address,
    asset?: Asset | Token
  ): Promise<Balances> {
    const addr = address || this.getAddress();

    if (!this.web3 || !addr) return [];
    const web3 = this.web3;

    if (asset) {
      if (!isToken(asset)) {
        // Asset must be eth
        const ethBalance = await getEthereumBalance(web3, addr);
        return [ethBalance];
      }

      // Asset must be ERC-20
      const tokenBalance = await getTokenBalance(web3, addr, asset);
      return [tokenBalance];
    }

    // No address no asset get everything
    const balances = await Promise.all([
      getEthereumBalance(web3, addr),
    ]);

    this.state.balances = balances;
    return balances;
  }

  async transfer(params: TxParams): Promise<TxHash> {
    if (!this.web3) {
      throw new Error(
        "Cannot do transfer because there is not yet a connection to Ethereum."
      );
    }

    const { amount, recipient, asset } = params;
    const from = this.getAddress();

    if (!from) {
      throw new Error(
        "Transaction attempted but 'from' address cannot be determined!"
      );
    }

    return await transferAsset(this.web3, from, recipient, amount, asset);
  }

  static create({
    getWeb3Provider
  }: EthereumServiceContext): IWalletService {
    return new EthereumService(getWeb3Provider);
  }
}

export default EthereumService.create;
