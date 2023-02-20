import { createSlice } from '@reduxjs/toolkit'
import { AccountsState } from '../../../accounts/rootReducer'
import { NetworkConfigItem, NetworkName } from '../../../controllers'

export type LastBlocks = {
	mainnet: number
	testnet: number
}

export type NetworkType = NetworkConfigItem & {
	name: NetworkName
}

type Init = {
	currentNetwork: NetworkName
	networks: NetworkType[]
	customGRPC: Record<NetworkName, string | null | undefined>
	lastSavedBlock: LastBlocks
	lastExistBlock: LastBlocks
}

const init: Init = {
	currentNetwork: NetworkName.Testnet,
	networks: [],
	customGRPC: {} as Record<NetworkName, string | null | undefined>,
	lastSavedBlock: {
		mainnet: 0,
		testnet: 0,
	},
	lastExistBlock: {
		mainnet: 0,
		testnet: 0,
	},
}

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
		setCustomGRPC: (state, action) => ({
			...state,
			customGRPC: action.payload,
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
})

export const networkActions = network.actions

export default network.reducer

export const selectCurNetwork = (state: AccountsState) =>
	state.network.currentNetwork
export const selectNetworks = (state: AccountsState) => state.network.networks
export const selectCustomGRPC = (state: AccountsState) =>
	state.network.customGRPC
export const selectLastSavedBlock = (state: AccountsState) =>
	state.network.lastSavedBlock
export const selectLastExistBlock = (state: AccountsState) =>
	state.network.lastExistBlock
