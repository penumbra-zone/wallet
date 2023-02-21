import { Button } from '../../Button'
import { ModalWrapper } from '../../ModalWrapper'
import { CloseInElipseSvg } from '../../Svg'
import { SuccessCreateModalProps } from '../SuccessCreateModal'

type ResetWalletNodalProps = {
	title: string
	warnings?: string
	handleConfirm: () => Promise<void>
}

export const ResetWalletModal: React.FC<
	SuccessCreateModalProps & ResetWalletNodalProps
> = ({ show, title, warnings, handleConfirm, onClose }) => {
	return (
		<ModalWrapper
			show={show}
			onClose={onClose}
			position='center'
			className='w-[296px] pt-[28px] pb-[31px] px-[0px]'
		>
			<div className='w-[100%] flex flex-col items-center'>
				<div className='w-[100%] flex flex-col items-center border-b-[1px] border-solid border-dark_grey'>
					<CloseInElipseSvg width='44' height='44' stroke='#870606' />
					<p className='h1_ext mt-[16px] pb-[12px]'>Are you sure?</p>
				</div>
				<div className='w-[100%] flex flex-col items-center px-[16px]'>
					<p className='text-center text_ext pt-[16px]'>{title}</p>
					<p className='text-center h2 pt-[16px]'>{warnings}</p>
					<div className='w-[100%] flex mt-[70px]'>
						<Button
							mode='transparent'
							onClick={onClose}
							title='Cancel'
							className='ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] w-[50%] mr-[8px]'
						/>
						<Button
							mode='gradient'
							onClick={handleConfirm}
							title='Confirm'
							className='ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] w-[50%] ml-[8px]'
						/>
					</div>
				</div>
			</div>
		</ModalWrapper>
	)
}
