import { combineReducers } from '@reduxjs/toolkit';
import localState from '../ui/redux/localState';
import state from '../ui/redux/state';
import network from '../ui/redux/network';
import accounts from '../ui/redux/accounts';

export const rootReducer = combineReducers({
  localState,
  state,
  network,
  accounts,
});

export type AccountsState = ReturnType<typeof rootReducer>;
