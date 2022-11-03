import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';
import Background from '../../services/Background';
import axios from 'axios';

type CreateAccountInput = {
  type: 'seed';
  name: string;
  seed: string;
  addressByIndex: string;
};

type Init = {
  selectedAccount: CreateAccountInput;
  isRedirectToAccountPage: boolean;
  lastSavedBlock: number;
  lastExistBlock?: number;
};

const init: Init = {
  selectedAccount: {} as CreateAccountInput,
  isRedirectToAccountPage: true,
  lastSavedBlock: 1,
};

const accounts = createSlice({
  name: 'accounts',
  initialState: init,
  reducers: {
    setSelectedAccount: (state, action) => ({
      ...state,
      selectedAccount: action.payload,
    }),
    setRedirectAccountPage: (state, action) => ({
      ...state,
      isRedirectToAccountPage: action.payload,
    }),
    setLastSavedBlock: (state, action) => ({
      ...state,
      lastSavedBlock: action.payload,
    }),
    setLastExistBlock: (state, action) => ({
      ...state,
      lastExistBlock: action.payload,
    }),
  },
});

export const accountsActions = accounts.actions;

export default accounts.reducer;
const { setSelectedAccount, setLastExistBlock } = accountsActions;

export function createAccount(account: CreateAccountInput) {
  return async (dispatch) => {
    const lastAccount = await Background.addWallet({
      ...account,
    });

    dispatch(setSelectedAccount(lastAccount));
    await Background.selectAccount(lastAccount);
  };
}

export function getLastBlockHeight() {
  return async (dispatch) => {
    try {
      const { data } = await axios.get(
        'http://testnet.penumbra.zone:26657/abci_info'
      );

      dispatch(setLastExistBlock(+data.result.response.last_block_height));
    } catch (error) {
      // console.log('getLastBlockHeight:', error);
    }
  };
}

export const selectSelectedAccount = (state: AccountsState) =>
  state.accounts.selectedAccount;
export const selectRedirectToAccountPage = (state: AccountsState) =>
  state.accounts.isRedirectToAccountPage;
export const selectLastSavedBlock = (state: AccountsState) =>
  state.accounts.lastSavedBlock;
export const selectLastExistBlock = (state: AccountsState) =>
  state.accounts.lastExistBlock;
