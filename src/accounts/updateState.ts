import { equals } from 'ramda';
import { accountsActions, networkActions, stateActions } from '../ui/redux';
import {
  BackgroundGetStateResult,
  BackgroundUiApi,
} from '../ui/services/Background';
import { AccountsStore } from './store';

function getParam<S, D>(param: S, defaultParam: D) {
  if (param) {
    return param;
  }

  return param === null ? defaultParam : undefined;
}

type UpdateStateInput = Partial<
  BackgroundGetStateResult & {
    networks: Awaited<ReturnType<BackgroundUiApi['getNetworks']>>;
  }
>;

export function createUpdateState(store: AccountsStore) {
  return (state: UpdateStateInput) => {
    const currentState = store.getState();
    const dispatch = store.dispatch;

    if (state.lastSavedBlock) {
      if (
        currentState.accounts.lastSavedBlock -
          +currentState.accounts.lastExistBlock >=
        0
      ) {
        dispatch(accountsActions.setLastExistBlock(state.lastSavedBlock));
      }
      dispatch(accountsActions.setLastSavedBlock(state.lastSavedBlock));
    }

    if (state.networks && state.networks.length) {
      dispatch(networkActions.setNetworks(state.networks));
    }

    const customNodes = getParam(state.customNodes, {});
    if (customNodes && !equals(currentState.network.customNodes, customNodes)) {
      dispatch(networkActions.setCustomNodes(customNodes));
    }

    const customCodes = getParam(state.customCodes, {});
    if (customCodes && !equals(currentState.network.customCodes, customCodes)) {
      dispatch(networkActions.setCustomCodes(customCodes));
    }

    const currentNetwork = getParam(state.currentNetwork, '');
    if (
      currentNetwork &&
      currentNetwork !== currentState.network.currentNetwork
    ) {
      dispatch(networkActions.setCurrentNetwork(currentNetwork));
    }
    const selectedAccount = getParam(state.selectedAccount, {});
    if (
      selectedAccount &&
      !equals(selectedAccount, currentState.accounts.selectedAccount)
    ) {
      dispatch(accountsActions.setSelectedAccount(selectedAccount));
    }
    if (
      !currentState.state ||
      state.isInitialized !== currentState.state.isInitialized ||
      state.isLocked !== currentState.state.isLocked
    ) {
      dispatch(
        stateActions.setAppState({
          isInitialized: state.isInitialized || false,
          isLocked: state.isLocked || false,
        })
      );
    }
  };
}
