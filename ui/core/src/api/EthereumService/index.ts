import { reactive } from "@vue/reactivity";
import Web3 from "web3";
import { IWalletService } from "../IWalletService";
import JSBI from "jsbi";
import {
  getTokenContract,
  getUsdtBalance,
  getTokenData,
  isValidNetwork,
  getBalancerAbiArray,
  getWhitelistAbiArray
} from "./utils/ethereumUtils";
import { Balance } from "../../entities/Balance";

const MAX = Web3.utils.toTwosComplement(-1);

export function handleConnectToMetaMaskError(err: any) {
  const { code, message } = err;
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
  }
}

const initState = {
  whitelisted: true,
  validNetwork: true,
  connected: false,
  networkType: "private",
  balances: [],
  account: undefined,
  log: "unset",
  allowance: 0,
};

export class EthereumService implements IWalletService {
  private web3: Web3 | null = null;
  private blockSubscription: any;
  private logsSubscription: any;

  // This is shared reactive state
  private state: {
    whitelisted: boolean;
    validNetwork: boolean;
    connected: boolean;
    networkType: string;
    account?: string;
    balances: Balance[];
    log: string;
    allowance: number;
  };

  constructor() {
    this.state = reactive({ ...initState });
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    this.web3.givenProvider.on('accountsChanged',  () => {
      this.handleStateChange();
    });

    this.web3.givenProvider.on('chainChanged', () => {
      this.handleStateChange();
    });
  }

  getState() {
    return this.state;
  }

  async getBalances() {
    if (!this.web3 || !this.state.account) {
      throw new Error("There is not yet a connection to Ethereum.");
    }
    return [await getUsdtBalance(this.web3, this.state.account)];
  }

  async handleStateChange() {
    if (!this.web3) {
      this.state = reactive({ ...initState });
      this.removeWeb3Subscription();
      return;
    }

    this.state.networkType = await this.web3?.eth.net.getNetworkType();
    this.state.validNetwork = isValidNetwork(this.state.networkType);
    if (!this.state.validNetwork) {
      return;
    }

    this.state.account = await this.getCurrentAccount();
    this.state.connected = !!this.state.account;
    if (this.state.account) {
      this.state.balances = await this.getBalances();
      this.state.allowance = await this.getAllowance();
      this.state.whitelisted = await this.isWhitelisted();
      this.addWeb3Subscription();
    } else {
      this.state.balances = [];
      this.state.allowance = 0;
      this.state.whitelisted = false;
      this.removeWeb3Subscription();
    }
  }

  getAccount() {
    return this.state.account;
  }

  isConnected() {
    return this.state.connected;
  }

  async connect() {
    try {
      if (!this.web3) {
        throw new Error("There is not yet a connection to Ethereum.");
      }

      this.state.networkType = await this.web3.eth.net.getNetworkType();
      this.state.validNetwork = isValidNetwork(this.state.networkType);

      if (this.state.validNetwork) {
        await this.web3.givenProvider.request({ method: "eth_requestAccounts" });
      }
    } catch (err) {
      handleConnectToMetaMaskError(err);
      this.web3 = null;
      this.state = reactive({ ...initState });
    }
  }

  async disconnect() {
    await this.web3?.givenProvider.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {}
        }
      ]
    });
    this.removeWeb3Subscription();
    this.web3 = null;
    this.state = reactive({ ...initState });
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
        this.handleStateChange();
        console.log("logsSubscription", error, result);
      }
    );
  }

  removeWeb3Subscription() {
    this.blockSubscription?.unsubscribe();
    this.logsSubscription?.unsubscribe();
  }

  getBalancerContract() {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    const balancerAbiArray = getBalancerAbiArray(this.state.networkType);
    return new this.web3.eth.Contract(balancerAbiArray.abi, balancerAbiArray.address);
  }

  getWhitelistContract() {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    const whitelistAbiArray = getWhitelistAbiArray(this.state.networkType);
    return new this.web3.eth.Contract(whitelistAbiArray.abi, whitelistAbiArray.address);
  }

  async getCurrentAccount() {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    const accounts = await this.web3.eth.getAccounts();
    return accounts[0];
  }

  async getAllowance(): Promise<number> {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    return await getTokenContract(this.web3, getTokenData().usdtAddress).methods.allowance(this.state.account, getBalancerAbiArray(this.state.networkType).address).call({from: this.state.account});
  }

  async approveToken(): Promise<string> {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    const accountFrom = await this.getCurrentAccount();
    return getTokenContract(this.web3, getTokenData().usdtAddress).methods.approve(getBalancerAbiArray(this.state.networkType).address, MAX).send({from: accountFrom});
  }

  async swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<string> {
    const accountFrom = await this.getCurrentAccount();
    return this.getBalancerContract().methods.swapExactAmountIn(tokenAmountIn.toString(), minAmountOut.toString(), MAX, unhashedKey).send({from: accountFrom});
  }

  async swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<string> {
    const accountFrom = await this.getCurrentAccount();
    const res = await this.getBalancerContract().methods.swapExactAmountIn(tokenAmountIn.toString(), minAmountOut.toString(), MAX, unhashedKey).call({from: accountFrom});
    return res.tokenAmountOut;
  }

  async isWhitelisted(): Promise<boolean> {
    const accountFrom = await this.getCurrentAccount();
    return await this.getWhitelistContract().methods.isWhitelisted(accountFrom).call();
  }

  async isValidKey(unhashedKey: string): Promise<boolean> {
    const accountFrom = await this.getCurrentAccount();
    return await this.getWhitelistContract().methods.presentKey(accountFrom, unhashedKey).call();
  }

  static create(): IWalletService {
    return new EthereumService();
  }
}

export default EthereumService.create;
