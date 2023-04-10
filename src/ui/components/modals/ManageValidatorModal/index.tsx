import { useState } from 'react'
import { useAccountsSelector } from '../../../../account'
import { AllValidatorsTableDataType } from '../../../containers'
import { selectBalance } from '../../../redux'
import { Balance } from '../../Balance'
import { Button } from '../../Button'
import { Input } from '../../Input'
import { ModalWrapper } from '../../ModalWrapper'
import { ChevronLeftIcon, WebsiteSvg } from '../../Svg'
import { SuccessCreateModalProps } from '../SuccessCreateModal'

type DataProps = {
	data: AllValidatorsTableDataType
}

export const ManageValidatorModal = ({
	show,
	onClose,
	data,
}: DataProps & SuccessCreateModalProps): JSX.Element => {
	const balance = useAccountsSelector(selectBalance)
	const [showDelegeta, setShowDelegeta] = useState<boolean>(false)
	const [redelegateStep, setRedelegateStep] = useState<0 | 1 | 2>(0)
	const [amount, setAmount] = useState<string>('')

	const toggleDelegeta = () => setShowDelegeta(state => !state)

	const handleClose = () => {
		setAmount('')
		setShowDelegeta(false)
		onClose()
	}

	const handleDelegate = () => {
		if (!showDelegeta) {
			toggleDelegeta()
			return
		}
		handleClose()
	}

	const handleChangeDelegate = (event: React.ChangeEvent<HTMLInputElement>) =>
		setAmount(event.target.value)

	const handleMax = () => setAmount(String(balance))

	return (
		<ModalWrapper
			show={show}
			onClose={handleClose}
			position='center'
			className='px-[20px] w-[608px] relative pb-[12px]'
		>
			<>
				{showDelegeta && (
					<Button
						mode='icon_transparent'
						onClick={toggleDelegeta}
						title='Back'
						iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
						className='text_button_ext absolute'
					/>
				)}
				<div className='flex flex-col pt-[71px]'>
					<div className='flex items-center mb-[16px]'>
						<p className='h1_ext mr-[10px]'>{data.name}</p>
						{data.website && (
							<a
								href={data.website}
								target='_blank'
								className='flex items-center cursor-pointer svg_hover text-light_grey hover:text-white'
							>
								<WebsiteSvg />
								<p className='ml-[4px] link_website'>Website</p>
							</a>
						)}
					</div>
					<div className='flex items-center h2_ext text-light_grey mb-[24px]'>
						<p className='mr-[12px]'>Commission {data.commission}%</p>
						<p className='pl-[12px] border-l-[2px] border-solid border-light_brown'>
							APR {data.arp}%
						</p>
					</div>
					{!showDelegeta && data.description && (
						<p className='h2_ext text-light_grey mb-[24px]'>
							{data.description}
						</p>
					)}
					<div className='flex gap-x-[16px]'>
						<div className='w-[100%] flex flex-col bg-dark_grey rounded-[15px] pt-[24px] pb-[40px] px-[20px]'>
							<p className='h2_ext text-light_grey'>Your Delegation</p>
							<p className='mt-[14px] mb-[16px] text_numbers_ext text-white'>
								0 PNB
							</p>
							<p className='text_numbers_ext text-light_grey'>$ -</p>
						</div>
						{showDelegeta && (
							<div className='w-[100%] flex flex-col bg-dark_grey rounded-[15px] py-[24px] px-[20px]'>
								<p className='h2_ext text-light_grey'>Available to Delegate</p>
								<Balance className='mt-[14px] mb-[16px] text_numbers_ext text-white' />
								<p className='text_numbers_ext text-light_grey'>$ -</p>
							</div>
						)}
					</div>
					{showDelegeta && (
						<div className='flex flex-col bg-dark_grey rounded-[15px] pt-[24px] pb-[16px] px-[20px] mt-[24px]'>
							<Input
								label={
									<p className='h2_ext text-light_grey'>Amount to Delegate</p>
								}
								value={amount}
								onChange={handleChangeDelegate}
								rightElement={
									<div
										className='flex items-center bg-dark_grey h-[50px] px-[25px] rounded-r-[15px] text_button_ext cursor-pointer'
										onClick={handleMax}
									>
										Max
									</div>
								}
							/>
							<p className='text_numbers_ext text-light_grey mt-[8px]'>$ -</p>
						</div>
					)}
					<div className='w-[100%] flex justify-end mt-[24px]'>
						{!showDelegeta && (
							<Button
								mode='transparent'
								title='Redelegate'
								className='w-[120px] tablet:py-[9px]'
							/>
						)}
						<Button
							mode='gradient'
							onClick={handleDelegate}
							title='Delegate'
							className='w-[120px] ml-[16px] tablet:py-[9px]'
						/>
					</div>
				</div>
			</>
		</ModalWrapper>
	)
}
