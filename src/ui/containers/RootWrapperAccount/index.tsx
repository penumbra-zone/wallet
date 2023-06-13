import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccountsSelector } from '../../../account'
import {
	AccountModal,
	Logo,
	NetworkModal,
	NetworkSelect,
	SettingsSvg,
	UserLogo,
} from '../../components'
import {
	selectRedirectToAccountPage,
	selectSelectedAccount,
	selectState,
} from '../../redux'
import { routesPath } from '../../../utils'

type RootWrapperAccountProps = {
	children: React.ReactNode
}

export const RootWrapperAccount: React.FC<RootWrapperAccountProps> = ({
	children,
}) => {
	const [isOpenAccountPopup, setIsOpenAccountPopup] = useState<boolean>(false)
	const [isOpenNetworkPopup, setIsOpenNetworkPopup] = useState<boolean>(false)

	const { pathname } = useLocation()
	const navigate = useNavigate()

	const selectedAccount = useAccountsSelector(selectSelectedAccount)
	const isRedirect = useAccountsSelector(selectRedirectToAccountPage)
	const state = useAccountsSelector(selectState)

	const isHeader = pathname !== '/welcome'

	const handleToggleAccountModal = (value: boolean) => () =>
		setIsOpenAccountPopup(value)

	const handleToggleNetworkModal = (value: boolean) => () =>
		setIsOpenNetworkPopup(value)

	const gotoSettings = () => navigate(routesPath.SETTINGS)

	return (
		<>
			<div className='w-[100%] min-h-[100vh] flex flex-col items-center ext:px-[40px] laptop:px-[312px]'>
				<div className='w-[100%] flex flex-col'>
					<div className='flex items-center justify-between'>
						{isHeader && (
							<div className='self-start mt-[20px]'>
								<Logo size='medium' className='-ml-[16px]' />
							</div>
						)}
						{selectedAccount.addressByIndex &&
							isRedirect &&
							!state.isLocked && (
								<div className='flex items-center gap-x-[54px]'>
									<NetworkSelect onClick={handleToggleNetworkModal(true)} />
									<div className='cursor-pointer' onClick={gotoSettings}>
										<SettingsSvg width='24' height='24' />
									</div>
								</div>
							)}
					</div>
					<div
						className={`w-[100%] flex ${
							!isHeader ? 'min-h-[100vh]' : 'min-h-[calc(100vh-131px)]'
						}`}
					>
						{children}
					</div>
				</div>
			</div>
			<AccountModal
				show={isOpenAccountPopup}
				onClose={handleToggleAccountModal(false)}
			/>
			<NetworkModal
				show={isOpenNetworkPopup}
				onClose={handleToggleNetworkModal(false)}
			/>
		</>
	)
}
