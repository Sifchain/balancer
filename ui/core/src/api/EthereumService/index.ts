import { reactive } from "@vue/reactivity";
import Web3 from "web3";
import { provider, WebsocketProvider } from "web3-core";
import { IWalletService } from "../IWalletService";
import { TxHash, Asset, Balance, Token } from "../../entities";
import {
  getEthereumBalance,
  getTokenBalance,
  isEventEmittingProvider,
  isToken,
  isValidNetwork,
  getSupportedTokens
} from "./utils/ethereumUtils";

const MAX = Web3.utils.toTwosComplement(-1);
//const helpers = require("../helpers/whitelistHelper");
const unhashedKey = `TooFast-Secure-Key--Random34&*(#*$&R#*O(I($`
//const hashedKey = helpers.hash(unhashedKey)

import JSBI from "jsbi";

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
    console.log(err.toString());
    // if (err.toString().contains("Invalid network.")) {
    //   // Invalid network.
    // } else {
    //   // Provider not loaded.
    // }
  }
}

export class EthereumService implements IWalletService {
  private web3: Web3 | null = null;
  private networkType: string | null = null;
  private blockSubscription: any;
  private logsSubscription: any;

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
      this.networkType = await this.web3.eth.net.getNetworkType();

      if (!isValidNetwork(this.networkType)) {
        throw new Error("Invalid network.");
        // TODO: show error popup
      }

      await getSupportedTokens();

      await this.updateAccounts();

      [this.state.address] = this.state.accounts;

      // Let's test for Metamask
      if (isMetaMaskProvider(this.provider)) {
        if (this.provider.request) {
          // If Metamask lets try and connect
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
    this.logsSubscription = this.web3?.eth.subscribe(
      "logs",
      {},
      (error, result) => {
        console.log("logsSubscription", error, result);
      }
    );
  }

  removeWeb3Subscription() {
    this.blockSubscription?.unsubscribe();
    this.logsSubscription?.unsubscribe();
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

  getBalancerContract() {
    if (!this.web3) {
      throw new Error(
        "Cannot do swap because there is not yet a connection to Ethereum."
      );
    }
    const networkType = this.networkType == "private" ? "development" : this.networkType;
    const balancerAbiArray = require("../../../../../BalancerABI."+networkType+".json");
    return new this.web3.eth.Contract(balancerAbiArray.abi, balancerAbiArray.address);
  }

  async swapExactAmountIn(amount: JSBI, minAmountOut: JSBI): Promise<TxHash> {
    let ret = await this.getBalancerContract().methods.swapExactAmountIn(amount.toString(10), minAmountOut.toString(10), MAX, unhashedKey).call();
    return ret.tokenAmountOut;
  }

  async swapExactAmountOut(maxAmountIn: JSBI, tokenAmountOut: JSBI): Promise<TxHash> {
    let ret =  await this.getBalancerContract().methods.swapExactAmountOut(maxAmountIn.toString(10), tokenAmountOut.toString(10), MAX, unhashedKey).call();
    return ret.tokenAmountIn;
  }

  static create({
    getWeb3Provider
  }: EthereumServiceContext): IWalletService {
    return new EthereumService(getWeb3Provider);
  }
}

export default EthereumService.create;
