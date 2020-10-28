import { ChainId, createCoin, createToken } from "../entities";

export const ETH = createCoin("ETH", 18, "Ethereum", ChainId.ETHEREUM);

export const USDT = createToken(
  6,
  "USDT",
  "Tether USD",
  ChainId.ETHEREUM,
  "0xdac17f958d2ee523a2206206994597c13d831ec7" // USDT contract address on mainnet
);

export const RWN = createToken(
  18,
  "RWN",
  "eRowan",
  ChainId.ETHEREUM,
  "0xdAC17F958D2ee523a2206206994597C13D831ec7" // RWN contract address on mainnet TODO - replace with real one
);
