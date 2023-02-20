import { createSlice } from '@reduxjs/toolkit'
import { AccountsState } from '../../../accounts/rootReducer'

type Init = {
	isInitialized: boolean | undefined
	isLocked: boolean
}

const init: Init = {
	isInitialized: false,
	isLocked: false,
}

const state = createSlice({
	name: 'localState',
	initialState: init,
	reducers: {
		setAppState: (state, action) => ({
			...state,
			...action.payload,
		}),
	},
})

export const stateActions = state.actions

export default state.reducer
const {} = stateActions

export const selectState = (s: AccountsState) => s.state
