import { combineReducers } from '@reduxjs/toolkit';
import localState from '../ui/redux/localState';
import state from '../ui/redux/state';
import currentNetwork from '../ui/redux/currentNetwork';

export const rootReducer = combineReducers({
  localState,
  state,
  currentNetwork,
});

export type AccountsState = ReturnType<typeof rootReducer>;
