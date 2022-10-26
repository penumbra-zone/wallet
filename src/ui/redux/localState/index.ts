import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';

type Init = {
  loading: boolean;
  newAccount: {
    seed: string;
    type: 'seed';
    name: string;
  };
};

const init: Init = {
  loading: false,
  newAccount: {
    seed: '',
    type: 'seed',
    name: 'Wallet 1',
  },
};

const localState = createSlice({
  name: 'localState',
  initialState: init,
  reducers: {
    setNewAccount: (state, action) => ({
      ...state,
      newAccount: {
        ...state.newAccount,
        ...action.payload,
      },
    }),
  },
});

export const localStateActions = localState.actions;

export default localState.reducer;

export const selectNewAccount = (state: AccountsState) =>
  state.localState.newAccount;
