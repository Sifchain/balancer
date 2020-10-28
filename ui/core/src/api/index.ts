// Everything here represents services that are effectively remote data storage
export * from "./EthereumService/utils/getWeb3Provider";

import EthereumService, { EthereumServiceContext } from "./EthereumService";

export type Api = ReturnType<typeof createApi>;

export type WithApi<T extends keyof Api = keyof Api> = {
  api: Pick<Api, T>;
};

type ApiContext = EthereumServiceContext; // add contexts from other APIs

export function createApi(context: ApiContext) {
  return {
    EthereumService: EthereumService(context),
  };
}
