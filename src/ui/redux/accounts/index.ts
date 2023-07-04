import { createSlice } from '@reduxjs/toolkit'
import { AccountsState } from '../../../account/rootReducer'
import { Contact } from '../../../controllers'
import Background from '../../services/Background'

type CreateAccountInput = {
	type: 'seed'
	name: string
	seed: string
	addressByIndex: string
	shortAddressByIndex: string
}

type Init = {
	selectedAccount: CreateAccountInput
	isRedirectToAccountPage: boolean
	balance: number
	contacts: Contact[]
}

const init: Init = {
	selectedAccount: {} as CreateAccountInput,
	isRedirectToAccountPage: true,
	balance: 0,
	contacts: [],
}

const accounts = createSlice({
	name: 'accounts',
	initialState: init,
	reducers: {
		setSelectedAccount: (state, action) => ({
			...state,
			selectedAccount: action.payload,
		}),
		setRedirectAccountPage: (state, action) => ({
			...state,
			isRedirectToAccountPage: action.payload,
		}),
		setBalance: (state, action) => ({
			...state,
			balance: action.payload,
		}),
		setContacts: (state, action) => ({
			...state,
			contacts: action.payload,
		}),
	},
})

export const accountsActions = accounts.actions

export default accounts.reducer
const { setSelectedAccount } = accountsActions

export function createAccount(account: CreateAccountInput) {
	return async dispatch => {
		const lastAccount = await Background.addWallet({
			...account,
		})

		dispatch(
			setSelectedAccount({
				type: lastAccount.type,
				name: lastAccount.name,
				addressByIndex: lastAccount.addressByIndex,
				shortAddressByIndex: lastAccount.shortAddressByIndex,
			})
		)

		await Background.selectAccount(lastAccount)
	}
}

export const selectSelectedAccount = (state: AccountsState) =>
	state.accounts.selectedAccount
export const selectRedirectToAccountPage = (state: AccountsState) =>
	state.accounts.isRedirectToAccountPage
export const selectBalance = (state: AccountsState) => state.accounts.balance
export const selectContacts = (state: AccountsState) => state.accounts.contacts
