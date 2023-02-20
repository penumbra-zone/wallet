import { combineReducers } from '@reduxjs/toolkit'
import localState from '../ui/redux/localState'
import state from '../ui/redux/state'
import network from '../ui/redux/network'
import accounts from '../ui/redux/accounts'
import messageNotification from '../ui/redux/messageNotification'
import settings from '../ui/redux/settings'

export const rootReducer = combineReducers({
	localState,
	state,
	network,
	accounts,
	messageNotification,
	settings,
})

export type AccountsState = ReturnType<typeof rootReducer>
