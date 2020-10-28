import {
  createStore,
  createApi,
  createActions,
  getWeb3Provider,
} from "../../../core";

const api = createApi({
  getWeb3Provider
});

const store = createStore();
const actions = createActions({ store, api });

export function useCore() {
  return {
    store,
    api,
    actions,
  };
}
