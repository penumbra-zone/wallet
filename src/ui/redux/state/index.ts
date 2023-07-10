import { createSlice } from '@reduxjs/toolkit'
import { AccountsState } from '../../../account/rootReducer'

type Init = {
	isInitialized: boolean | undefined
	isLocked: boolean | undefined
}

const init: Init = {
	isInitialized: undefined,
	isLocked: undefined,
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
