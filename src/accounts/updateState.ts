import { stateActions } from '../ui/redux';
import { AccountsStore } from './store';

export function createUpdateState(store: AccountsStore) {
  return (state) => {
    const currentState = store.getState();

    if (
      !currentState.state ||
      state.initialized !== currentState.state.initialized ||
      state.locked !== currentState.state.locked
    ) {
      store.dispatch(
        stateActions.setAppState({
          initialized: state.initialized,
          locked: state.locked,
        })
      );
    }
  };
}
