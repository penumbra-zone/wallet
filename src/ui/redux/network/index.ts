import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';
import { NetworkConfigItem, NetworkName } from '../../../controllers';
import { DEFAULT_LEGACY_CONFIG } from '../../../lib';

type Init = {
  currentNetwork: NetworkName;
  networks: (NetworkConfigItem & {
    name: string;
  })[];
  customCodes: Record<NetworkName, string | null | undefined>;
  customNodes: Record<NetworkName, string | null | undefined>;
};

const init: Init = {
  currentNetwork: NetworkName.Testnet,
  networks: [],
  customCodes: {} as Record<NetworkName, string | null | undefined>,
  customNodes: {} as Record<NetworkName, string | null | undefined>,
};

const network = createSlice({
  name: 'network',
  initialState: init,
  reducers: {
    setCurrentNetwork: (state, action) => ({
      ...state,
      currentNetwork: action.payload,
    }),
    setNetworks: (state, action) => ({
      ...state,
      networks: action.payload,
    }),
    setCustomCodes: (state, action) => ({
      ...state,
      customCodes: action.payload,
    }),
    setCustomNodes: (state, action) => ({
      ...state,
      customNodes: action.payload,
    }),
  },
});

export const networkActions = network.actions;

export default network.reducer;

export const selectCurNetwork = (state: AccountsState) =>
  state.network.currentNetwork;
export const selectNetworks = (state: AccountsState) => state.network.networks;
export const selectCustomCodes = (state: AccountsState) =>
  state.network.customCodes;
export const selectCustomNodes = (state: AccountsState) =>
  state.network.customNodes;
