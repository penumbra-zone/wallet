import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccountsSelector } from '../../../account'
import { routesPath } from '../../../utils'
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

type RootWrapperUiProps = {
	children: React.ReactNode
}

export const RootWrapperUi: React.FC<RootWrapperUiProps> = ({ children }) => {
	const { pathname } = useLocation()
	const navigate = useNavigate()
	const [isOpenNetworkPopup, setIsOpenNetworkPopup] = useState<boolean>(false)

	const selectedAccount = useAccountsSelector(selectSelectedAccount)
	const isRedirect = useAccountsSelector(selectRedirectToAccountPage)
	const state = useAccountsSelector(selectState)

	const isHeader = pathname === routesPath.HOME

	const handleToggleNetworkModal = (value: boolean) => () =>
		setIsOpenNetworkPopup(value)

	const gotoSettings = () => navigate(routesPath.SETTINGS)

	return (
		<>
			<div
				className={`w-[100%] min-h-[100vh] flex flex-col items-center overflow-y-hidden overflow-x-hidden ${
					pathname === '/active-message' ? '' : 'px-[40px]'
				}`}
			>
				<div className='w-[100%] flex flex-col'>
					{isHeader && (
						<div className='flex items-center justify-between mt-[20px]'>
							<Logo size='small' />
							{selectedAccount.addressByIndex &&
								isRedirect &&
								!state.isLocked && (
									<NetworkSelect onClick={handleToggleNetworkModal(true)} />
								)}
							{selectedAccount.addressByIndex &&
								isRedirect &&
								!state.isLocked && (
									<div className='cursor-pointer' onClick={gotoSettings}>
										<SettingsSvg width='16' height='16' />
									</div>
								)}
						</div>
					)}
					<div className={`w-[100%] flex min-h-[calc(100vh-90px)]`}>
						{children}
					</div>
				</div>
			</div>
			<NetworkModal
				show={isOpenNetworkPopup}
				onClose={handleToggleNetworkModal(false)}
			/>
		</>
	)
}
