type ValueType = {
	amount: {
		lo: string
	}
	assetId: {
		inner: string
	}
}

type OutputActionType = {
	output: {
		value: ValueType
		destAddress: {
			inner: string
		}
		rseed: string
		valueBlinding: string
	}
}

type SpendActionType = {
	spend: {
		note: {
			value: ValueType
		}
		rseed: string
		address: {
			inner: string
		}
	}
	position: string
	randomizer: string
	valueBlinding: string
}

export type ActionType = SpendActionType | OutputActionType

export type TransactionPlanType = {
	chainId: string
	cluePlans: {
		address: {
			inner: string
		}
		rseed: string
	}[]
	memoPlan: { key: string }
	fee: {
		amount: ValueType
	}
	actions: ActionType[]
}
