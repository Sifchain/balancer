import Web3 from "web3";
import { Contract } from 'web3-eth-contract';
import { AbiItem } from "web3-utils";
import { Balance } from "../../../entities/Balance";

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
  const network = networkType === "private" ? "development" : networkType === "main" ? "mainnet" : networkType;
  return network === getTokenSaleData().network
}

export function getTokenContract(web3: Web3, address: string): Contract {
  return new web3.eth.Contract(erc20TokenAbi, address);
}

export function getTokenSaleData() {
  return require("../../../../../../TokenSaleData.json");
}

export function getBalancerAbiArray(networkType: string) {
  const network = networkType === "private" ? "development" : networkType === "main" ? "mainnet" : networkType;
  return require("../../../../../../BalancerABI."+network+".json");
}

export function getWhitelistAbiArray(networkType: string) {
  const network = networkType === "private" ? "development" : networkType === "main" ? "mainnet" : networkType;
  return require("../../../../../../WhitelistABI."+network+".json");
}

export async function getUsdtBalance(web3: Web3, address: string) {
  const contract = getTokenContract(web3, getTokenSaleData().usdtAddress);
  const tokenAmount = await contract.methods.balanceOf(address).call();
  return Balance.create(6, tokenAmount);
}
