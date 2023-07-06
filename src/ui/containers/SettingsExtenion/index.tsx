import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { routesPath } from '../../../utils'
import { Button, ChevronLeftIcon, CloseSvg } from '../../components'
import Background from '../../services/Background'
import { useAccountsSelector } from '../../../account'
import { selectCurNetwork, selectLastSavedBlock } from '../../redux'

export const SettingsExtenion = () => {
	const navigate = useNavigate()
	const { pathname } = useLocation()
	const lastSavedBlock = useAccountsSelector(selectLastSavedBlock)
	const currentNetwork = useAccountsSelector(selectCurNetwork)

	const handleBack = () => navigate(routesPath.SETTINGS)

	const handleHome = () => navigate(routesPath.HOME)

	const handleBlock = async () => await Background.lock()

	return (
		<div className='min-h-[100vh] w-[100%] py-[20px]'>
			<div className='h-[100%] bg-brown rounded-[10px] pb-[28px] flex flex-col justify-between'>
				<div>
					{pathname === routesPath.SETTINGS ? (
						<div className='flex justify-center items-center border-b-[1px] border-dark_grey h-[54px] relative'>
							<span
								className='cursor-pointer absolute left-[20px]'
								onClick={handleHome}
							>
								<CloseSvg width='20' height='20' fill='white' />
							</span>
							<p className='h1'>Settings</p>
						</div>
					) : (
						<div className='flex items-center border-b-[1px] border-dark_grey h-[54px]'>
							<Button
								mode='icon_transparent'
								onClick={handleBack}
								title='Back'
								iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
								className='text-[12px] pl-[8px]'
							/>
						</div>
					)}

					<Outlet />
				</div>
				{pathname === routesPath.SETTINGS && (
					<div className='w-[100%] px-[16px]'>
						<Button
							title='Block account'
							mode='gradient'
							onClick={handleBlock}
							disabled={!lastSavedBlock[currentNetwork]}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
