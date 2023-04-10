import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { AccountsState, rootReducer } from './rootReducer'

export function createAccountsStore() {
	return configureStore({
		reducer: rootReducer,
	})
}

export const useAccountsSelector: TypedUseSelectorHook<AccountsState> =
	useSelector

export type AccountsStore = ReturnType<typeof createAccountsStore>

export const useAppDispatch = () => useDispatch<AccountsStore['dispatch']>()
