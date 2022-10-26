import { createSlice } from '@reduxjs/toolkit';
import { AccountsStore } from '../../../accounts';
import { AccountsState } from '../../../accounts/rootReducer';
import Background from '../../services/Background';

type CreateAccountInput = {
  type: 'seed';
  name: string;
  seed: string;
};

type Init = {
  selectedAccount: CreateAccountInput;
};

const init: Init = {
  selectedAccount: {} as CreateAccountInput,
};

const accounts = createSlice({
  name: 'accounts',
  initialState: init,
  reducers: {
    setSelectedAccount: (state, action) => ({
      ...state,
      selectedAccount: action.payload,
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
