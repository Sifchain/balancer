import { ChainId } from "./ChainId";
import { Asset } from "./Asset";

export type Token = Asset & {
  chainId: ChainId;
  address: string;
};
