import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountsSelector } from '../../../../account'
import { useMediaQuery } from '../../../../hooks'
import { routesPath } from '../../../../utils'
import {
	selectCurNetwork,
	selectLastExistBlock,
	selectLastSavedBlock,
	selectNetworks,
} from '../../../redux'
import { Button } from '../../Button'
import { ModalWrapper } from '../../ModalWrapper'
import { percentage } from '../../NetworkSelect'
import { PopupButton } from '../../PopupButton'
import { ProgressBar } from '../../ProgressBar'
import { SuccessCreateModalProps } from '../SuccessCreateModal'

export const NetworkModal: React.FC<SuccessCreateModalProps> = ({
	show,
	onClose,
}) => {
	const isDesktop = useMediaQuery()
	const navigate = useNavigate()
	const networks = useAccountsSelector(selectNetworks)
	const lastExistBlock = useAccountsSelector(selectLastExistBlock)
	const lastSavedBlock = useAccountsSelector(selectLastSavedBlock)
	const currentNetwork = useAccountsSelector(selectCurNetwork)

	const percent = percentage(
		lastSavedBlock[currentNetwork],
		lastExistBlock[currentNetwork]
	)

	const handleChange = () => {
		onClose()
		navigate(routesPath.SETTINGS_NETWORKS)
	}
	return (
		<ModalWrapper
			show={show}
			onClose={onClose}
			position={isDesktop ? 'top_right' : 'center'}
			className={`py-[20px] px-[0px] w-[296px] ${isDesktop && 'mr-[106px]'}`}
		>
			<div className='flex flex-col'>
				<p className='h1_ext px-[18px] pb-[24px] border-b-[1px] border-solid border-dark_grey text-center'>
					Networks
				</p>
				<div className='pt-[24px]'>
					{networks.map(i => (
						<Fragment key={i.name}>
							<PopupButton
								svg={
									<div className='w-[20px] h-[20px]'>
										<ProgressBar percent={percent} width='20px' />
									</div>
								}
								rightChild={
									<p className='text-light_grey text-[10px] pl-[8px]'>
										{lastSavedBlock[i.name]}/{lastExistBlock[i.name]}
									</p>
								}
								text={i.chainId}
							/>
						</Fragment>
					))}

					<div className='w-[100%] mt-[40px] px-[16px]'>
						<Button
							title='Change'
							mode='gradient'
							onClick={handleChange}
							className='ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px]'
						/>
					</div>
				</div>
			</div>
		</ModalWrapper>
	)
}
