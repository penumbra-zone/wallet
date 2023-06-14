import Background from '../../../services/Background'
import { Button } from '../../Button'
import { ModalWrapper } from '../../ModalWrapper'
import { SuccessCreateModalProps } from '../SuccessCreateModal'

export const ConnectedSitesModal: React.FC<
	SuccessCreateModalProps & { selectedSite: string }
> = ({ show, selectedSite, onClose }) => {
	const handleConfirmRevoke = async () => {
		await Background.deleteOrigin(selectedSite)
		onClose()
	}

	return (
		<ModalWrapper
			show={show}
			onClose={onClose}
			position='center'
			className='py-[28px] px-[0px] w-[335px]'
		>
			<div className='w-[100%] flex flex-col'>
				<p className='border-b-[1px] border-solid border-dark_grey h1_ext pb-[16px] px-[16px]'>
					{`Delete ${selectedSite && selectedSite.replace(/^https?:\/\//i, '')}`}
				</p>
				<p className='mb-[16px] py-[24px] px-[16px] h2_ext text-center '>
					Are you sure you want to turn it off? You may lose access to site
					features.
				</p>
				<>
					<div className='w-[100%] flex px-[16px]'>
						<Button
							mode='transparent'
							onClick={onClose}
							title='Cancel'
							className='w-[50%] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] text_button_ext mr-[8px]'
						/>
						<Button
							mode='gradient'
							onClick={handleConfirmRevoke}
							title='Revoke'
							className='w-[50%] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] text_button_ext ml-[8px]'
						/>
					</div>
				</>
			</div>
		</ModalWrapper>
	)
}
