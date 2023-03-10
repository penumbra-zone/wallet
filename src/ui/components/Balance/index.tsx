import { useEffect, useState } from 'react'
import { useAccountsSelector, useAppDispatch } from '../../../accounts'
import {
	accountsActions,
	selectLastExistBlock,
	selectLastSavedBlock,
} from '../../redux'
import Background from '../../services/Background'

type BalanceProps = {
	className?: string
}

export const Balance: React.FC<BalanceProps> = ({ className }) => {
	const [balance, setBalance] = useState<number>(0)
	const lastSavedBlock = useAccountsSelector(selectLastSavedBlock)
	const lastExistBlock = useAccountsSelector(selectLastExistBlock)

	const dispatch = useAppDispatch()

	

	useEffect(() => {
		if (lastSavedBlock.testnet !== lastExistBlock.testnet) return

		// getBalances()
	}, [lastExistBlock, lastSavedBlock])
	return <p className={className}>{balance.toLocaleString('en-US')} PNB</p>
}
