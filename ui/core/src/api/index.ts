// Everything here represents services that are effectively remote data storage
import EthereumService  from "./EthereumService";

export type Api = ReturnType<typeof createApi>;

export type WithApi<T extends keyof Api = keyof Api> = {
  api: Pick<Api, T>;
};
export function createApi() {
  return {
    EthereumService: EthereumService(),
  };
}
