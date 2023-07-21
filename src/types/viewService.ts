export type BalancesReq = {
	address: { inner: string }
}

export type BalancesRes = {
	amount: { lo: number }
	asset: { inner: string }
}
