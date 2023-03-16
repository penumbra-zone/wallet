import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ParsedActions,
	TransactionPlanType,
	TransactionResponseType,
} from '../../../../types/transaction'
import { getShortKey, routesPath } from '../../../../utils'
import { Button, ChevronLeftIcon, ModalWrapper } from '../../../components'
import Background from '../../../services/Background'
import toast from 'react-hot-toast'
import loader from '../../../../assets/gif/loader.gif'

type DetailTxBeforeSendProps = {
	sendPlan: {
		transactionPlan: TransactionPlanType
		actions: ParsedActions[]
	}
	setSendPlan?: Dispatch<
		SetStateAction<{
			transactionPlan: TransactionPlanType
			actions: ParsedActions[]
		} | null>
	>
	handleCancel?: () => Promise<void>
}

export const DetailTxBeforeSend: React.FC<DetailTxBeforeSendProps> = ({
	sendPlan,
	setSendPlan,
	handleCancel,
}) => {
	const [txResponse, setTxResponse] = useState<null | TransactionResponseType>(
		null
	)
	const [loading, setLoading] = useState<boolean>(false)
	const navigate = useNavigate()

	useEffect(() => {
		if (!txResponse) return

		let interval
		if (txResponse.result.code === 0) {
			interval = setInterval(async () => {
				const hash = txResponse.result.hash.toLowerCase()

				const tx = await Background.getValueById('tx', hash)
				if (tx) {
					setLoading(false)
					navigate(routesPath.HOME)
					await Background.deleteAllMessages()
				}
			}, 500)
		} else {
			toast.error(txResponse.result.log, {
				position: 'top-right',
			})
			setLoading(false)
			
		}

		return () => clearInterval(interval)
	}, [txResponse])

	const handleEdit = () => {
		if (handleCancel) handleCancel()
		else setSendPlan(null)
	}

	const handleConfirm = async () => {
		setLoading(true)
		const txResponse = await Background.sendTransaction(
			sendPlan.transactionPlan
		)
		setTxResponse(txResponse)
	}

	return (
		<>
			<div className='w-[100%] flex flex-col items-start ext:py-[20px] tablet:py-[30px] bg-brown rounded-[15px] px-[16px]'>
				{setSendPlan && (
					<Button
						mode='icon_transparent'
						onClick={handleEdit}
						title='Edit'
						iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
						className='mb-[24px]'
					/>
				)}
				<div className='w-[100%] max-h-[280px] overflow-y-scroll'>
					{sendPlan.actions.map((i, index) => {
						let text
						if (i.type === 'send') {
							text = `${i.amount} ${i.asset} to ${getShortKey(i.destAddress)}`
						} else {
							text = `${i.amount} ${i.asset}`
						}
						return (
							<div key={index} className='w-[100%] flex flex-col mt-[16px]'>
								<p className='h2 mb-[8px] capitalize'>{i.type}</p>
								<p className='py-[8px] px-[16px] bg-dark_grey rounded-[15px] text_numbers_s text-light_grey'>
									{text}
								</p>
							</div>
						)
					})}
				</div>
				<div className='w-[100%] flex pt-[24px]'>
					<Button
						mode='transparent'
						onClick={handleEdit}
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
			<ModalWrapper show={loading} className='bg-transparent'>
				<img src={loader} alt='Loader' className='w-[400px] h-[200px]' />
			</ModalWrapper>
		</>
	)
}
