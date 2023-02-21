import { Button } from '../../Button'
import { ModalWrapper } from '../../ModalWrapper'
import {
	AccountDetailSvg,
	DowmloadSvg,
	ExpandSvg,
	PermissionsSvg,
	PlusSvg,
	SettingsSvg,
	SupportSvg,
} from '../../Svg'
import { SuccessCreateModalProps } from '../SuccessCreateModal'
import Background from '../../../services/Background'
import { PopupButton } from '../../PopupButton'
import { useNavigate } from 'react-router-dom'
import { routesPath } from '../../../../utils'
import { useMediaQuery } from '../../../../hooks'
import { useState } from 'react'
import { ConnectedSitesModal } from '../ConnectedSitesModal'
import { AccountDetailModal } from '../AccountDetailModal'
import { KeysModalType } from '../../MorePopupButton'
import { MoreModal } from '../MoreModal'
import { ExportKeyModal } from '../ExportKeyModal'

export const AccountModal: React.FC<SuccessCreateModalProps> = ({
	show,
	onClose,
}) => {
	const [isOpenConnectedSites, setIsOpenConnectedSites] =
		useState<boolean>(false)
	const [isOpenDetailPopup, setIsOpenDetailPopup] = useState<boolean>(false)
	const [keyModalType, setKeyModalType] = useState<KeysModalType>('')
	const [isOpenMorePopup, setIsOpenMorePopup] = useState<boolean>(false)

	const isDesktop = useMediaQuery()
	const navigate = useNavigate()

	const toggleMorePopup = (value: boolean) => () => setIsOpenMorePopup(value)

	const handleBlock = async () => {
		await Background.lock()
		onClose()
	}

	const handleSettings = () => {
		onClose()
		navigate(routesPath.SETTINGS)
	}

	const handleConnectedSites = () => {
		onClose()
		setIsOpenConnectedSites(true)
	}

	const toggleConnectedSitesPopup = (value: boolean) => () =>
		setIsOpenConnectedSites(value)

	const handleAccountDetail = () => {
		onClose()
		setIsOpenDetailPopup(true)
	}

	const toggleDetailPopup = (value: boolean) => () =>
		setIsOpenDetailPopup(value)

	const changeKeyModalType = (type: KeysModalType) => () => {
		setKeyModalType(type)
		onClose()
	}

	const handleBackExportPopup = () => {
		setIsOpenDetailPopup(true)
		setKeyModalType('')
	}

	const handleExpand = () => {
		Background.showTab(`${window.location.origin}/accounts.html`, 'accounts')
	}

	return (
		<>
			<ModalWrapper
				show={show}
				onClose={onClose}
				position={isDesktop ? 'top_right' : 'center'}
				className='py-[20px] px-[0px] w-[300px]'
			>
				<>
					<div className='flex flex-col pb-[24px] border-b-[1px] border-dark_grey'>
						{/* <PopupButton
              svg={<PlusSvg width="20" height="20" />}
              text="Create an account"
            />
            <PopupButton
              svg={<DowmloadSvg width="20" height="20" />}
              text="Import an account"
            /> */}
						{!isDesktop && (
							<PopupButton
								onClick={handleExpand}
								svg={<ExpandSvg />}
								text='Expand view'
							/>
						)}
						<PopupButton
							onClick={handleAccountDetail}
							svg={<AccountDetailSvg />}
							text='Account details'
						/>
						<PopupButton
							onClick={handleConnectedSites}
							svg={<PermissionsSvg />}
							text='Connected sites'
						/>
					</div>
					<div className='py-[24px] border-b-[1px] border-dark_grey'>
						<PopupButton svg={<SupportSvg />} text='Support' />
						<PopupButton
							svg={<SettingsSvg />}
							text='Settings'
							onClick={handleSettings}
						/>
					</div>
					<div className='w-[100%] px-[16px]'>
						<Button
							title='Block account'
							mode='gradient'
							onClick={handleBlock}
							className='ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] mt-[40px] '
						/>
					</div>
				</>
			</ModalWrapper>
			<ConnectedSitesModal
				show={isOpenConnectedSites}
				onClose={toggleConnectedSitesPopup(false)}
			/>
			<AccountDetailModal
				show={isOpenDetailPopup}
				onClose={toggleDetailPopup(false)}
				changeKeyModalType={changeKeyModalType}
			/>
			<MoreModal
				show={isOpenMorePopup}
				onClose={toggleMorePopup(false)}
				handleAccountDetail={handleAccountDetail}
				handleConnectedSites={handleConnectedSites}
			/>
			{keyModalType && (
				<ExportKeyModal
					type={keyModalType}
					show={Boolean(keyModalType)}
					onClose={changeKeyModalType('')}
					handleBack={handleBackExportPopup}
				/>
			)}
		</>
	)
}
