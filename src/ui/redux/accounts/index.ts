import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';
import Background from '../../services/Background';

type CreateAccountInput = {
  type: 'seed';
  name: string;
  seed: string;
  addressByIndex: string
};

type Init = {
  selectedAccount: CreateAccountInput;
  isRedirectToAccountPage: boolean;
};

const init: Init = {
  selectedAccount: {} as CreateAccountInput,
  isRedirectToAccountPage: true,
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
  },
});

export const accountsActions = accounts.actions;

export default accounts.reducer;
const { setSelectedAccount } = accountsActions;

export function createAccount(account: CreateAccountInput) {
  return async (dispatch) => {
    const lastAccount = await Background.addWallet({
      ...account,
    });

    dispatch(setSelectedAccount(lastAccount));
    await Background.selectAccount(lastAccount);
  };
}

export const selectSelectedAccount = (state: AccountsState) =>
  state.accounts.selectedAccount;
export const selectRedirectToAccountPage = (state: AccountsState) =>
  state.accounts.isRedirectToAccountPage;
