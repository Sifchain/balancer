import Web3 from "web3";
import {
  IpcProvider,
  provider,
  WebsocketProvider,
} from "web3-core";
// @ts-ignore
import {Contract} from 'web3-eth-contract';
// @ts-ignore
import { AbiItem } from "web3-utils";
import { USDT } from "../../../constants";
import { ChainId, createToken, Address, Asset, Balance, Token } from "../../../entities";

export const erc20TokenAbi: AbiItem[] = [
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
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
];

export function isValidNetwork(networkType: string): boolean {
  return networkType === "private" // TODO use "main" for production, "private" or "ropsten" for testing
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

export async function getEthereumBalance(web3: Web3, address: Address) {
  const ethBalance = await web3.eth.getBalance(address);
  return Balance.create(USDT, ethBalance);
}

export async function getSupportedTokens(): Promise<Token[]> {
  const tokenData = require("../../../../../../TokenData.json");
  return [
    createToken(18, "RWN", "eRowan", ChainId.ETHEREUM, tokenData.rowanAddress),
    createToken(6, "USDT", "USDT Stablecoin", ChainId.ETHEREUM, tokenData.usdtAddress),
  ];
}
