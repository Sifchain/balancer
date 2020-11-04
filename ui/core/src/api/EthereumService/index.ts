import { reactive } from "@vue/reactivity";
import Web3 from "web3";
import { provider, WebsocketProvider } from "web3-core";
import { IWalletService } from "../IWalletService";
import { TxHash, Asset, Balance, Token } from "../../entities";
import JSBI from "jsbi";
import {
  getEthereumBalance,
  getTokenBalance,
  isEventEmittingProvider,
  isToken,
  isValidNetwork,
  getSupportedTokens
} from "./utils/ethereumUtils";

type Address = string;
type Balances = Balance[];

const MAX = Web3.utils.toTwosComplement(-1);
//const unhashedKey = "TooFast-Secure-Key--Random34&*(#*$&R#*O(I($";
const unhashedKey = "SecretString2";
const hashedKey = "0xc175ed99c4057b2c8ff2bb95576411f681a351686896be6112e7065daa7f4f91";

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

const initState = {
  connected: false,
  accounts: [],
  balances: [],
  address: "",
  log: "unset",
};

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
  };

  constructor(getWeb3Provider: () => Promise<provider>) {
    this.state = reactive({ ...initState });

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

  private async updateData() {
    if (!this.web3) {
      this.state.connected = false;
      this.state.accounts = [];
      this.state.address = "";
      this.state.balances = [];
      return;
    }
    this.state.connected = !!this.web3;
    this.state.accounts = (await this.web3.eth.getAccounts()) ?? [];
    [this.state.address] = this.state.accounts;
    this.state.balances = await this.getBalance();
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

      // const accounts = await this.web3.eth.getAccounts();
      // await this.getRowanContract().methods.approve("0xC89Ce4735882C9F0f0FE26686c53074E09B0D550", MAX).send({from: accounts[0]});

      // Let's test for Metamask
      if (isMetaMaskProvider(this.provider)) {
        if (this.provider.request) {
          // If Metamask lets try and connect
          await this.provider.request({ method: "eth_requestAccounts" });
        }
      }

      this.addWeb3Subscription();
      await this.updateData();
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
    this.web3 = null;
    await this.updateData();

    if (isMetaMaskProvider(this.provider)) {
      if (this.provider.request) {
        await this.provider.request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {}
            }
          ]
        });
      }
    }
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

  async swapExactAmountIn(tokenAmountIn: JSBI, minAmountOut: JSBI): Promise<TxHash> {
    let ret = await this.getBalancerContract().methods.swapExactAmountIn(tokenAmountIn.toString(), minAmountOut.toString(), MAX, unhashedKey).call();
    return ret.tokenAmountOut;
  }

  async swapExactAmountOut(maxAmountIn: JSBI, tokenAmountOut: JSBI): Promise<TxHash> {
    let ret = await this.getBalancerContract().methods.swapExactAmountOut(maxAmountIn.toString(), tokenAmountOut.toString(), MAX, unhashedKey).call();
    return ret.tokenAmountIn;
  }

  static create({
    getWeb3Provider
  }: EthereumServiceContext): IWalletService {
    return new EthereumService(getWeb3Provider);
  }
}

export default EthereumService.create;
