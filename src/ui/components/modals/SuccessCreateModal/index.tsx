import { useAppDispatch } from '../../../../account'
import { accountsActions } from '../../../redux'
import { Button } from '../../Button'
import { Logo } from '../../Logo'
import { ModalWrapper } from '../../ModalWrapper'

export type SuccessCreateModalProps = {
	show: boolean
	onClose: () => void
}

export const SuccessCreateModal: React.FC<SuccessCreateModalProps> = ({
	show,
	onClose,
}) => {
	const dispatch = useAppDispatch()

	const handleCloseAndDone = () => {
		dispatch(accountsActions.setRedirectAccountPage(true))
		onClose()
	}

	return (
		<ModalWrapper show={show} onClose={handleCloseAndDone}>
			<div className='flex flex-col items-center'>
				<Logo size='small_tabs' />
				<p className='h2 mt-[24px] mb-[8px]'>Congratulations!</p>
				<p className='text_body mb-[40px]'>
					You passed the test. Keep your passphrase safe!
				</p>
				<div className='w-[100%]'>
					<Button title='Done' mode='gradient' onClick={handleCloseAndDone} />
				</div>
			</div>
		</ModalWrapper>
	)
}
