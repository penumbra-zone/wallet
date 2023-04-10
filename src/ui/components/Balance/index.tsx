import { useAccountsSelector } from '../../../account'
import { selectBalance } from '../../redux'

type BalanceProps = {
	className?: string
}

export const Balance: React.FC<BalanceProps> = ({ className }) => {
	const balance = useAccountsSelector(selectBalance)

	return (
		<p className={className}>
			{Number(Number(Object.values(balance)[0] || 0) / 10 ** 6).toLocaleString(
				'en-US'
			)}{' '}
			PNB
		</p>
	)
}
