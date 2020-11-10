import { reactive } from "@vue/reactivity";
import Web3 from "web3";
import { IWalletService } from "../IWalletService";
import { TxHash, Asset, Balance, Token } from "../../entities";
import JSBI from "jsbi";
import {
  erc20TokenAbi,
  getEthereumBalance,
  getSupportedTokens,
  getTokenBalance,
  isToken,
  isValidNetwork
} from "./utils/ethereumUtils";

type Balances = Balance[];
const MAX = Web3.utils.toTwosComplement(-1);

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
  balances: [],
  account: "",
  log: "unset",
  allowance: 0,
};

export class EthereumService implements IWalletService {
  private web3: Web3 | null = null;
  private networkType: string | undefined;
  private blockSubscription: any;
  private logsSubscription: any;

  // This is shared reactive state
  private readonly state: {
    connected: boolean;
    account: string;
    balances: Balance[];
    log: string;
    allowance: number;
  };

  constructor() {
    this.state = reactive({ ...initState });
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    this.web3.givenProvider.on("connect", async () => {
      this.networkType = await this.web3?.eth.net.getNetworkType();
      await this.updateData();
    });

    this.addWeb3Subscription();
  }

  getState() {
    return this.state;
  }

  async updateData() {
    if (!this.web3) {
      this.state.connected = false;
      this.state.account = "";
      this.state.balances = [];
      this.state.allowance = 0;
      return;
    }
    this.state.connected = !!this.web3;
    this.state.account = await this.getCurrentAccount();
    this.state.balances = await this.getBalance();
    this.state.allowance = await this.getAllowance();
  }

  getAccount(): string {
    return this.state.account;
  }

  isConnected() {
    return this.state.connected;
  }

  async connect() {
    try {
      this.networkType = await this.web3?.eth.net.getNetworkType();

      if (!this.networkType || !isValidNetwork(this.networkType)) {
        throw new Error("Invalid network.");
        // TODO: show error popup
      }

      await getSupportedTokens();

      await this.web3?.givenProvider.request({ method: "eth_requestAccounts" });

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
    await this.updateData();
  }

  async getBalance(
    address?: string,
    asset?: Asset | Token
  ): Promise<Balances> {
    const addr = address || this.getAccount();

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

  getBalancerAbiArray() {
    const networkType = this.networkType === "private" ? "development" : this.networkType === "main" ? "mainnet" : this.networkType;
    return require("../../../../../BalancerABI."+networkType+".json");
  }

  getBalancerContract() {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    const balancerAbiArray = this.getBalancerAbiArray();
    return new this.web3.eth.Contract(balancerAbiArray.abi, balancerAbiArray.address);
  }

  getTokenData() {
    return require("../../../../../TokenData.json");
  }

  getERC20TokenContract(address: any) {
    if (!this.web3) {
      throw new Error(
        "There is not yet a connection to Ethereum."
      );
    }
    return new this.web3.eth.Contract(erc20TokenAbi, address);
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
    const accountFrom = await this.getCurrentAccount();
    return await this.getERC20TokenContract(this.getTokenData().usdtAddress).methods.allowance(accountFrom, this.getBalancerAbiArray().address).call({from: accountFrom});
  }

  async approveToken(): Promise<TxHash> {
    const accountFrom = await this.getCurrentAccount();
    return this.getERC20TokenContract(this.getTokenData().usdtAddress).methods.approve(this.getBalancerAbiArray().address, MAX).send({from: accountFrom});
  }

  async swapExactAmountInSend(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<TxHash> {
    const accountFrom = await this.getCurrentAccount();
    return this.getBalancerContract().methods.swapExactAmountIn(tokenAmountIn.toString(), minAmountOut.toString(), MAX, unhashedKey).send({from: accountFrom});
  }

  async swapExactAmountInCall(tokenAmountIn: JSBI, minAmountOut: JSBI, unhashedKey: string): Promise<TxHash> {
    const accountFrom = await this.getCurrentAccount();
    let ret = await this.getBalancerContract().methods.swapExactAmountIn(tokenAmountIn.toString(), minAmountOut.toString(), MAX, unhashedKey).call({from: accountFrom});
    return ret.tokenAmountOut;
  }

  async swapExactAmountOutCall(maxAmountIn: JSBI, tokenAmountOut: JSBI, unhashedKey: string): Promise<TxHash> {
    const accountFrom = await this.getCurrentAccount();
    let ret = await this.getBalancerContract().methods.swapExactAmountOut(maxAmountIn.toString(), tokenAmountOut.toString(), MAX, unhashedKey).call({from: accountFrom});
    return ret.tokenAmountIn;
  }

  static create(): IWalletService {
    return new EthereumService();
  }
}

export default EthereumService.create;
