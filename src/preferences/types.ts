export type WalletAccount = {
	name: string
	addressByIndex: string
} & ({ type: 'seed' })

export type PreferencesAccount = WalletAccount & {
	lastUsed?: number
}
