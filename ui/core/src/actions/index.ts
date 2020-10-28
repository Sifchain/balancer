import { Api, WithApi } from "../api";
import { Store, WithStore } from "../store";
import ethWalletActions from "./ethWalletActions";

export type ActionContext<
  T extends keyof Api = keyof Api,
  S extends keyof Store = keyof Store
> = WithApi<T> & WithStore<S>;

export function createActions(context: ActionContext) {
  return {
    ...ethWalletActions(context),
  };
}

export type Actions = ReturnType<typeof createActions>;
