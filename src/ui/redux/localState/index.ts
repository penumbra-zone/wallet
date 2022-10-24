import { createSlice } from '@reduxjs/toolkit';
import { AccountsStore } from '../../../accounts';
import { AccountsState } from '../../../accounts/rootReducer';

type Init = {
  loading: boolean;
  newAccount: {
    seed: '';
    type: 'seed';
  };
};

const init: Init = {
  loading: false,
  newAccount: {
    seed: '',
    type: 'seed',
  },
};

const localState = createSlice({
  name: 'localState',
  initialState: init,
  reducers: {
    setLoading: (state, action) => ({
      ...state,
      invoice: action.payload,
    }),
  },
});

export const localStateActions = localState.actions;

export default localState.reducer;
const { setLoading } = localStateActions;

export const changeLoading =
  (loading: boolean) => async (dispatch: AccountsStore['dispatch']) => {
    setLoading(loading);
  };

export const selectLoading = (state: AccountsState) => state.localState.loading;
