import { useState } from 'react'
import { ParsedActions, TransactionPlan } from '../../../types/transaction'
import Background from '../../services/Background'
import { Address } from './Address'
import { DetailTxBeforeSend } from './DetailTxBeforeSend'

export const Send = () => {
	const [search, setSearch] = useState<string>('')
	const [amount, setAmount] = useState<string>('')
	const [select, setSelect] = useState<string>('PNB')
	const [sendPlan, setSendPlan] = useState<{
		transactionPlan: TransactionPlan
		actions: ParsedActions[]
	} | null>(null)

	const handleNext = async () => {
		const sendPlan = await Background.getTransactionPlan(search, Number(amount))
		setSendPlan(sendPlan)
	}

	return (
		<div className='w-[100%]  flex flex-col items-center justify-center ext:py-[40px] tablet:py-[0px] tablet:mb-[20px]'>
			<div className='ext:w-[100%] laptop:w-[400px]'>
				{sendPlan ? (
					<DetailTxBeforeSend setSendPlan={setSendPlan} sendPlan={sendPlan} />
				) : (
					<Address
						search={search}
						select={select}
						amount={amount}
						setAmount={setAmount}
						setSearch={setSearch}
						setSelect={setSelect}
						handleNext={handleNext}
					/>
				)}
			</div>
		</div>
	)
}
