import { Dispatch, SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	ParsedActions,
	TransactionPlanType,
} from '../../../../types/transaction'
import { getShortKey, routesPath } from '../../../../utils'
import { Button, ChevronLeftIcon } from '../../../components'
import Background from '../../../services/Background'

type DetailTxBeforeSendProps = {
	sendPlan: {
		transactionPlan: TransactionPlanType
		actions: ParsedActions[]
	}
	setSendPlan: Dispatch<
		SetStateAction<{
			transactionPlan: TransactionPlanType
			actions: ParsedActions[]
		} | null>
	>
}

export const DetailTxBeforeSend: React.FC<DetailTxBeforeSendProps> = ({
	sendPlan,
	setSendPlan,
}) => {
	const navigate = useNavigate()

	const handleEdit = () => setSendPlan(null)

	const handleBack = async () => {
		await Background.sendTransaction(sendPlan.transactionPlan)
		navigate(routesPath.HOME)
	}

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
				{sendPlan.actions.map((i, index) => {
					let text;
					if(i.type === 'send'){
						text = `${i.amount} ${i.asset} to ${getShortKey(i.recipient)}`
					}
					else {
						text = `${i.amount} ${i.asset}`
					}
					return (
						<div key={index} className='w-[100%] flex flex-col mt-[16px]'>
							<p className='h2 mb-[8px] capitalize'>{i.type}</p>
							<p className='py-[8px] px-[16px] bg-dark_grey rounded-[15px] text_numbers_s text-light_grey'>{text}</p>
						</div>
					)
				})}
			</div>
			<div className='w-[100%] flex pt-[24px]'>
				<Button
					mode='transparent'
					onClick={handleBack}
					title='Cancel'
					className='ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] w-[50%] mr-[8px]'
				/>
				<Button
					mode='gradient'
					onClick={handleBack}
					title='Confirm'
					className='ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] w-[50%] ml-[8px]'
				/>
			</div>
		</div>
	)
}
