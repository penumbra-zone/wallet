import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AccountsState } from '../../../accounts/rootReducer';
import { NetworkConfigItem, NetworkName } from '../../../controllers';
import { DEFAULT_LEGACY_CONFIG } from '../../../lib';

export type LastBlocks = {
  mainnet: number;
  testnet: number;
};

type Init = {
  currentNetwork: NetworkName;
  networks: (NetworkConfigItem & {
    name: string;
  })[];
  customCodes: Record<NetworkName, string | null | undefined>;
  customNodes: Record<NetworkName, string | null | undefined>;
  lastSavedBlock: LastBlocks;
  lastExistBlock?: number;
};

const init: Init = {
  currentNetwork: NetworkName.Testnet,
  networks: [],
  customCodes: {} as Record<NetworkName, string | null | undefined>,
  customNodes: {} as Record<NetworkName, string | null | undefined>,
  lastSavedBlock: {
    mainnet: 0,
    testnet: 0,
  },
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

export const networkActions = network.actions;

export default network.reducer;

const { setLastExistBlock } = networkActions;

export function getLastBlockHeight() {
  return async (dispatch) => {
    try {
      const { data } = await axios.get(
        'http://testnet.penumbra.zone:26657/abci_info'
      );

      dispatch(setLastExistBlock(+data.result.response.last_block_height));
    } catch (error) {}
  };
}

export const selectCurNetwork = (state: AccountsState) =>
  state.network.currentNetwork;
export const selectNetworks = (state: AccountsState) => state.network.networks;
export const selectCustomCodes = (state: AccountsState) =>
  state.network.customCodes;
export const selectCustomNodes = (state: AccountsState) =>
  state.network.customNodes;
export const selectLastSavedBlock = (state: AccountsState) =>
  state.network.lastSavedBlock;
export const selectLastExistBlock = (state: AccountsState) =>
  state.network.lastExistBlock;
