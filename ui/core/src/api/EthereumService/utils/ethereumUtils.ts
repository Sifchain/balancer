import JSBI from "jsbi";
import Web3 from "web3";
import {
  IpcProvider,
  provider,
  TransactionReceipt,
  WebsocketProvider,
} from "web3-core";
// @ts-ignore
import {Contract} from 'web3-eth-contract';
// @ts-ignore
import { AbiItem } from "web3-utils";
import { USDT } from "../../../constants";
import { ChainId, createToken, Address, Asset, Balance, Token } from "../../../entities";

const erc20TokenAbi: AbiItem[] = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  // transfer
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "spender",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    type: "function",
  }
];

export function isValidNetwork(networkType: string): boolean {
  return networkType === "private" // use "main" for production, "private" or "ropsten" for testing
}

export function isToken(value?: Asset | Token): value is Token {
  return value ? Object.keys(value).includes("address") : false;
}

// @ts-ignore
export function getTokenContract(web3: Web3, asset: Token): Contract {
  return new web3.eth.Contract(erc20TokenAbi, asset.address);
}

export async function getTokenBalance(
  web3: Web3,
  address: Address,
  asset: Token
) {
  const contract = getTokenContract(web3, asset);
  const tokenBalance = await contract.methods.balanceOf(address).call();
  return Balance.create(asset, tokenBalance);
}

export function isEventEmittingProvider(
  provider?: provider
): provider is WebsocketProvider | IpcProvider {
  if (!provider || typeof provider === "string") return false;
  return typeof (provider as any).on === "function";
}

// Transfer token or ether
export async function transferAsset(
  web3: Web3,
  fromAddress: Address,
  toAddress: Address,
  amount: JSBI,
  asset?: Asset
) {
  if (isToken(asset)) {
    return await transferToken(web3, fromAddress, toAddress, amount, asset);
  }

  return await transferEther(web3, fromAddress, toAddress, amount);
}

// Transfer token
export async function transferToken(
  web3: Web3,
  fromAddress: Address,
  toAddress: Address,
  amount: JSBI,
  asset: Token
) {
  const contract = getTokenContract(web3, asset);
  return new Promise<string>((resolve, reject) => {
    let hash: string;
    let receipt: boolean;

    function resolvePromise() {
      if (receipt && hash) resolve(hash);
    }

    contract.methods
      .transfer(toAddress, JSBI.toNumber(amount))
      .send({ from: fromAddress })
      .on("transactionHash", (_hash: string) => {
        hash = _hash;
        resolvePromise();
      })
      .on("receipt", (_receipt: boolean) => {
        receipt = _receipt;
        resolvePromise();
      })
      .on("error", (err: any) => {
        reject(err);
      });
  });
}

// Transfer ether
export async function transferEther(
  web3: Web3,
  fromAddress: Address,
  toAddress: Address,
  amount: JSBI
) {
  return new Promise<string>((resolve, reject) => {
    let hash: string;
    let receipt: TransactionReceipt;

    function resolvePromise() {
      if (receipt && hash) resolve(hash);
    }

    web3.eth
      .sendTransaction({
        from: fromAddress,
        to: toAddress,
        value: amount.toString(),
      })
      .on("transactionHash", (_hash: string) => {
        hash = _hash;
        resolvePromise();
      })
      .on("receipt", (_receipt) => {
        receipt = _receipt;
        resolvePromise();
      })
      .on("error", (err: any) => {
        reject(err);
      });
  });
}

export async function getEthereumBalance(web3: Web3, address: Address) {
  const ethBalance = await web3.eth.getBalance(address);
  return Balance.create(USDT, ethBalance);
}

export async function getSupportedTokens(): Promise<Token[]> {
  // Return the tokens parsed as assets
  // TODO: to import .env from the root folder (dotenv or from manual parsing anyhow)
  return [
    createToken(18, "RWN", "eRowan", ChainId.ETHEREUM, '0x0290FB167208Af455bB137780163b7B7a9a10C16'),
    createToken(6, "USDT", "USDT Stablecoin", ChainId.ETHEREUM, '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7'),
  ];
}
