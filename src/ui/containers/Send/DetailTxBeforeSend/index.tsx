import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import loader from '../../../../assets/gif/loader.gif'
import { TRANSACTION_TABLE_NAME } from '../../../../lib'
import { routesPath } from '../../../../utils'
import { Button, ModalWrapper } from '../../../components'
import Background from '../../../services/Background'
import { TransactionResponse } from '../../../../messages/types'
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import { ActionView } from '../../../components/ActionView'
import { ActionCell } from '../../../components/ActionCell'

type DetailTxBeforeSendProps = {
	transactionPlan: TransactionPlan
	messageId: string
	handleCancel?: () => Promise<void>
	handleApprove?: () => Promise<void>
}

export const DetailTxBeforeSend: React.FC<DetailTxBeforeSendProps> = ({
	transactionPlan,

	handleCancel,
	handleApprove,
	messageId,
}) => {
	const [txResponse, setTxResponse] = useState<null | TransactionResponse>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const navigate = useNavigate()

	useEffect(() => {
		if (!txResponse) return

		let interval
		if (txResponse.result.code === 0) {
			interval = setInterval(async () => {
				const hash = txResponse.result.hash.toLowerCase()

				const tx = await Background.getValueById(TRANSACTION_TABLE_NAME, hash)
				if (tx) {
					setLoading(false)
					navigate(routesPath.HOME)
				}
			}, 500)
		} else {
			toast.error(txResponse.result.log, {
				position: 'top-right',
			})
			setLoading(false)
		}
		handleApprove && handleApprove()

		return () => clearInterval(interval)
	}, [txResponse])

	const handleEdit = () => {
		if (handleCancel) handleCancel()
	}

	const handleConfirm = async () => {
		setLoading(true)
		const txResponse = await Background.sendTransaction(transactionPlan)
		await Background.approve(messageId, txResponse)
		if (window.location.pathname === '/notification.html') {
			await Background.closeNotificationWindow()
		}
		setTxResponse(txResponse)
	}

	return (
		<>
			<div className='w-[100%] min-h-[100vh] flex justify-center items-center px-[40px] py-[24px]'>
				<div className='w-[100%] min-h-[calc(100vh-48px)] flex flex-col justify-between bg-brown rounded-[10px] p-[16px]'>
					<div className='flex flex-col gap-y-[16px]'>
						{transactionPlan.actions.map((action, index) => (
							<ActionView key={index} action={action} />
						))}
						{transactionPlan.memoPlan.plaintext.text && (
							<ActionCell title='Memo'>
								{transactionPlan.memoPlan.plaintext.text}
							</ActionCell>
						)}
					</div>
					<div className='w-[100%] flex gap-x-[16px] mt-[24px]'>
						<Button
							mode='transparent'
							onClick={handleEdit}
							title='Cancel'
							className='w-[50%]'
						/>
						<Button
							mode='gradient'
							onClick={handleConfirm}
							title='Confirm'
							className='w-[50%]'
						/>
					</div>
				</div>
			</div>
			<ModalWrapper show={loading} className='bg-transparent'>
				<img src={loader} alt='Loader' className='w-[400px] h-[200px]' />
			</ModalWrapper>
		</>
	)
}
