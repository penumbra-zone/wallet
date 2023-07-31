import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import loader from '../../../../assets/gif/loader.gif'
import { TRANSACTION_TABLE_NAME } from '../../../../lib'
import {
	ParsedActions,
	TransactionMessageData,
	TransactionPlan,
} from '../../../../types/transaction'
import { getShortKey, routesPath } from '../../../../utils'
import { Button, ModalWrapper } from '../../../components'
import Background from '../../../services/Background'
import { TransactionResponse } from '../../../../messages/types'
import Worker from './fibo.worker.js'
import { bytesToBase64 } from '../../../../utils/base64'

const worker = new Worker()

type DetailTxBeforeSendProps = {
	sendPlan: TransactionMessageData
	messageId: string
	setSendPlan?: Dispatch<
		SetStateAction<{
			transactionPlan: TransactionPlan
			actions: ParsedActions[]
		} | null>
	>
	handleCancel?: () => Promise<void>
	handleApprove?: () => Promise<void>
}

export const DetailTxBeforeSend: React.FC<DetailTxBeforeSendProps> = ({
	sendPlan,
	setSendPlan,
	handleCancel,
	handleApprove,
	messageId,
}) => {
	const [txResponse, setTxResponse] = useState<null | TransactionResponse>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const navigate = useNavigate()

	useEffect(() => {
		worker.onmessage = async message => {
			if (message) {
				const txResponse = await Background.broadcastTx(
					bytesToBase64(message.data)
				)

				await Background.approve(messageId, txResponse)

				if (window.location.pathname === '/notification.html') {
					await Background.closeNotificationWindow()
				}

				setTxResponse(txResponse)
			}
		}
	})

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
		else setSendPlan(null)
	}

	const handleConfirm = async () => {
		setLoading(true)

		const fvk = await Background.getAccountFullViewingKey('1qazXsw@')
		const spendingKey = await Background.getAccountSpendingKey('1qazXsw@')
		const loadStoredTree = await Background.loadStoredTree()

		const hashes = loadStoredTree.hashes.map(hash => {
			return {
				...hash,
				hash: new Uint8Array(Object.values(hash.hash)),
			}
		})

		worker.postMessage({
			fvk,
			spendingKey,
			sendPlan: sendPlan.transactionPlan,
			loadStoredTree: { ...loadStoredTree, hashes },
		})
	}

	return (
		<>
			<div className='w-[100%] min-h-[100vh] flex justify-center items-center px-[40px] py-[24px]'>
				<div className='w-[100%] min-h-[calc(100vh-48px)] flex flex-col justify-between bg-brown rounded-[10px] p-[16px]'>
					<div className='flex flex-col gap-y-[16px]'>
						{sendPlan.actions.map((i, index) => {
							let text
							if (i.type === 'send') {
								text = `${i.amount} ${i.asset} to ${getShortKey(i.destAddress)}`
							} else {
								text = `${i.amount} ${i.asset}`
							}
							return (
								<div key={index} className='w-[100%] flex flex-col'>
									<p className='h2 mb-[8px] capitalize'>{i.type}</p>
									<p className='py-[8px] px-[16px] bg-dark_grey rounded-[10px] text_numbers_s text-light_grey break-all'>
										{text}
									</p>
								</div>
							)
						})}
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
