import { createSlice } from '@reduxjs/toolkit'
import { AccountsState } from '../../../accounts/rootReducer'
import { PermissionType } from '../../../controllers'
import { MessageStoreItem } from '../../../messages/types'

type Init = {
	messages: MessageStoreItem[]
	unapprovedMessages: MessageStoreItem[]
	origins: Record<string, PermissionType[]>
}

const init: Init = {
	messages: [],
	unapprovedMessages: [],
	origins: {},
}

const messageNotification = createSlice({
	name: 'messageNotification',
	initialState: init,
	reducers: {
		setMessages: (state, action) => ({
			...state,
			...action.payload,
		}),
		setOrigins: (state, action) => ({
			...state,
			origins: action.payload,
		}),
	},
})

export const messageNotificationActions = messageNotification.actions

export default messageNotification.reducer

export const selectMessages = (state: AccountsState) =>
	state.messageNotification
export const selectOrigins = (state: AccountsState) =>
	state.messageNotification.origins
