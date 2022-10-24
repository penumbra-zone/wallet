import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';
import { NetworkName } from '../../../controllers';


const init: NetworkName = NetworkName.Testnet;

const currentNetwork = createSlice({
  name: 'currentNetwork',
  initialState: init,
  reducers: {
    setCurrentNetwork: (_, action) => action.payload,
  },
});

export const currentNetworkActions = currentNetwork.actions;

export default currentNetwork.reducer;

export const selectCurrentNetwork = (state: AccountsState) =>
  state.currentNetwork;
