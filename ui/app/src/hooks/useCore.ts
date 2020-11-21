import {
  createStore,
  createApi,
  createActions,
} from "../../../core";

const api = createApi();
const store = createStore();
const actions = createActions({ store, api });

export function useCore() {
  return {
    store,
    api,
    actions,
  };
}
