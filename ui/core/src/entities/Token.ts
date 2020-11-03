import { ChainId } from "./ChainId";
import { Asset } from "./Asset";

export type Token = Asset & {
  chainId: ChainId;
  address: string;
};

export function createToken(
  decimals: number,
  symbol: string,
  name: string,
  chainId: ChainId,
  address: string
): Token {
  return {
    chainId,
    address,
    decimals,
    symbol,
    name,
  };
}
