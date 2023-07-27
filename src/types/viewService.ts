export type BalanceByAddressReq = {
	address: { inner: string }
}

export type BalanceByAddressRes = {
	amount: { lo: number }
	asset: { inner: string }
}
