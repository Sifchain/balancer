import { ChainId, createCoin, createToken } from "../entities";

export const ETH = createCoin("ETH", 18, "Ethereum", ChainId.ETHEREUM);

export const USDT = createToken(
  "USDT",
  6,
  "Tether USD",
  ChainId.ETHEREUM,
  "0xdac17f958d2ee523a2206206994597c13d831ec7" // USDT contract address on mainnet
);

export const RWN = createToken(
  "eRWN",
  18,
  "eRowan",
  ChainId.ETHEREUM,
  "0xdac17f958d2ee523a2206206994597c13d831ec7" // RWN contract address on mainnet TODO - replace with real one
);
