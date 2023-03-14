import { useEffect, useState } from 'react'
import { useAccountsSelector, useAppDispatch } from '../../../accounts'
import {
	accountsActions,
	selectBalance,
	selectLastExistBlock,
	selectLastSavedBlock,
} from '../../redux'
import Background from '../../services/Background'

type BalanceProps = {
	className?: string
}

export const Balance: React.FC<BalanceProps> = ({ className }) => {
	const balance = useAccountsSelector(selectBalance)

	return (
		<p className={className}>
			{Number(Object.values(balance)[0] / 10**6).toLocaleString('en-US')} PNB
		</p>
	)
}
