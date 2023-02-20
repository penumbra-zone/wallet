import { encode } from 'bech32-buffer'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionType, TransactionPlanType } from '../../../../types/transacrion'
import { getShortKey, routesPath } from '../../../../utils'
import { base64ToBytes } from '../../../../utils/base64'
import { Button, ChevronLeftIcon } from '../../../components'
import Background from '../../../services/Background'

type DetailTxBeforeSendProps = {
	recipient: string
	currency: string
	amount: string
	sendPlan: TransactionPlanType
	setSendPlan: Dispatch<SetStateAction<TransactionPlanType | null>>
}

export const DetailTxBeforeSend: React.FC<DetailTxBeforeSendProps> = ({
	amount,
	recipient,
	currency,
	sendPlan,
	setSendPlan,
}) => {
	const navigate = useNavigate()

	const [actions, setActions] = useState<
		{ key: string; amount: number; assetDenom: string }[]
	>([])

	const handleEdit = () => setSendPlan(null)

	const handleBack = async () => {
		await Background.sendTransaction(sendPlan)
		navigate(routesPath.HOME)
	}

	useEffect(() => {
		const parseActions = async () => {
			Promise.all(
				sendPlan.actions.map(async (i: ActionType) => {
					const key = Object.keys(i)[0]
					const value = Object.values(i)[0]

					const amount =
						Number(
							key === 'spend'
								? value.note.value.amount.lo
								: value.value.amount.lo
						) /
						10 ** 6
					const assetId =
						key === 'spend'
							? value.note.value.assetId.inner
							: value.value.assetId.inner
					const destAddress = key === 'spend' ? '' : value.destAddress.inner

					const encodeAssetId = encode(
						'passet',
						base64ToBytes(assetId),
						'bech32m'
					)
					const asset = await Background.getValueById('assets', encodeAssetId)
					const assetDenom = asset.denom.denom

					// const recipient = destAddress ? encode('qw', base64ToBytes(destAddress), 'bech32') : '';
					// console.log(recipient);

					return { key, amount, assetDenom }
				})
			).then(actions => setActions(actions))
		}

		parseActions()
	}, [sendPlan])

	return (
		<div className='w-[100%] flex flex-col items-start ext:py-[20px] tablet:py-[30px] bg-brown rounded-[15px] px-[16px]'>
			<Button
				mode='icon_transparent'
				onClick={handleEdit}
				title='Edit'
				iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
				className='mb-[24px]'
			/>
			<div className='w-[100%] max-h-[280px] overflow-y-scroll'>
				{actions.map((i, index) => (
					<div key={index} className='w-[100%] flex flex-col mt-[16px]'>
						<p className='h2 mb-[8px] capitalize'>{i.key}</p>
						<p className='py-[8px] px-[16px] bg-dark_grey rounded-[15px] text_numbers_s text-light_grey'>{`${i.amount} ${i.assetDenom}`}</p>
					</div>
				))}
			</div>
			<div className='w-[100%] flex pt-[24px]'>
				<Button
					mode='transparent'
					onClick={handleBack}
					title='Cancel'
					className='py-[7px] w-[50%] mr-[8px]'
				/>
				<Button
					mode='gradient'
					onClick={handleBack}
					title='Confirm'
					className='py-[7px] w-[50%] ml-[8px]'
				/>
			</div>
		</div>
	)
}
