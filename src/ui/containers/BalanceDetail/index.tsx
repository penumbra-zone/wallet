import { useNavigate, useParams } from 'react-router-dom'
import { useAccountsSelector } from '../../../account'
import { routesPath } from '../../../utils'
import {
	ActivityList,
	BalanceAction,
	Button,
	ChevronLeftIcon,
} from '../../components'
import { selectNewAccount } from '../../redux'

export const BalanceDetail = () => {
	const { name } = useParams()
	const navigate = useNavigate()
	const handleBack = () => navigate(routesPath.HOME)
	const account = useAccountsSelector(selectNewAccount)

	return (
		<div className='w-[100%] mt-[20px] mb-[20px] '>
			<div className='flex flex-col items-center bg-brown rounded-[15px] relative ext:pb-[28px] tablet:pb-[40px]'>
				<Button
					mode='icon_transparent'
					onClick={handleBack}
					title={`${account.name} / ${name.toUpperCase()} `}
					iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
					className='self-start ext:mt-[20px] ext:ml-[8px] tablet:mt-[24px] tablet:ml-[16px]'
				/>
				<div className='w-[100%] ext:mt-[25px] tablet:mt-[27px] mb-[40px]'>
					<BalanceAction />
				</div>
				<ActivityList />
			</div>
		</div>
	)
}
