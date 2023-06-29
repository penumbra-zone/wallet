import { Dispatch, SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountsSelector } from '../../../../account'
import { Contact } from '../../../../controllers'
import { useMediaQuery } from '../../../../hooks'
import {
	AddressValidatorsType,
	routesPath,
	setOnlyNumberInput,
	validateAddress,
} from '../../../../utils'
import {
	Balance,
	Button,
	CloseSvg,
	ContactsList,
	CreateContactModal,
	DoneSvg,
	Input,
	PlusSvg,
	SearchSvg,
	SelectInput,
} from '../../../components'
import { selectBalance, selectContacts } from '../../../redux'

type AddressProps = {
	search: string
	select: string
	amount: string
	setAmount: Dispatch<SetStateAction<string>>
	setSearch: Dispatch<SetStateAction<string>>
	setSelect: Dispatch<SetStateAction<string>>
	handleNext: () => Promise<void>
}

export const Address: React.FC<AddressProps> = ({
	search,
	select,
	amount,
	setAmount,
	setSearch,
	setSelect,
	handleNext,
}) => {
	const navigate = useNavigate()
	const isDesktop = useMediaQuery()
	const balance = useAccountsSelector(selectBalance)
	const contacts = useAccountsSelector(selectContacts)

	const [isValidate, setIsValidate] = useState<AddressValidatorsType>(
		{} as AddressValidatorsType
	)
	const [isShowModal, setIsShowModal] = useState<boolean>(false)

	const handleBack = () => navigate(routesPath.HOME)

	const options = Object.values(balance).map(i => ({
		value: 'PNB',
		label: (
			<div className='flex flex-col'>
				<p className='text_numbers'>PNB</p>
				<div className='flex items-center'>
					<p className='text_body text-light_grey'>Balance:</p>
					<Balance className='text_numbers_s text-light_grey ml-[16px]' />
				</div>
			</div>
		),
	}))

	const handleMax = () => setAmount(String(Number(Object.values(balance)[0])))

	const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
		const validators = validateAddress(event.target.value)
		setIsValidate(state => ({
			...state,
			...validators,
		}))
		if (!event.target.value) setIsValidate({} as AddressValidatorsType)
	}

	const handleChangeSelect = (value: string) => {
		setSelect(value)
	}

	const handleChangeAmout = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value, notShow, valueFloat } = setOnlyNumberInput(
			event.target.value
		)
		if (isNaN(valueFloat) || notShow) return
		setAmount(value)
	}

	const list = contacts.reduce((result, item: Contact) => {
		let letter = item.name[0].toUpperCase()
		if (!result[letter]) {
			result[letter] = []
		}

		result[letter].push(item)
		return result
	}, {})

	const handleSelectContact = (contact: Contact) => () =>
		setSearch(contact.address)

	const handleClearSelect = () => {
		setSearch('')
		setAmount('')
		setSelect('PNB')
	}

	const handleCloseModal = () => setIsShowModal(false)

	const handleOpenModal = () => setIsShowModal(true)

	return (
		<>
			<div className='w-[100%] flex justify-center items-center mb-[8px]'>
				<p className='h1 ml-[auto]'>Send to address</p>
				<span
					className='ml-[auto] svg_hover cursor-pointer'
					onClick={handleBack}
					role='button'
					tabIndex={0}
				>
					<CloseSvg
						width={isDesktop ? '24' : '16'}
						height={isDesktop ? '24' : '16'}
						fill='#E0E0E0'
					/>
				</span>
			</div>
			{!Object.values(isValidate).includes(false) && search ? (
				<div className='flex items-center p-[16px] bg-brown rounded-[10px] mb-[16px]'>
					<div className='ext:mr-[8px] tablet:mr-[10px]'>
						<DoneSvg width='24' height='24' />
					</div>
					<div className='flex flex-col'>
						<p className='break-all h2'>
							{contacts.find(i => i.address === search)
								? contacts.find(i => i.address === search).name
								: ''}
						</p>
						<p className='break-all text_body text-light_grey'>{search}</p>
					</div>
					<div
						className='ext:ml-[16px] tablet:ml-[10px] cursor-pointer'
						onClick={handleClearSelect}
					>
						<CloseSvg width='24' height='24' fill='#E0E0E0' />
					</div>
				</div>
			) : (
				<Input
					placeholder='Search, address...'
					value={search}
					isError={Object.values(isValidate).includes(false)}
					onChange={handleChangeSearch}
					leftSvg={
						<span className='ml-[24px] mr-[9px]'>
							<SearchSvg />
						</span>
					}
					helperText='Invalid recipient address'
					className='w-[100%]'
				/>
			)}
			<div className={`bg-brown rounded-[10px] w-[100%]`}>
				{!Object.values(isValidate).includes(false) && search ? (
					<div className='h-[100%] flex flex-col justify-between px-[16px] py-[24px]'>
						{!contacts.find(i => i.address === search) ? (
							<div
								className='flex justify-between items-center bg-dark_grey py-[8px] px-[16px] rounded-[10px] mb-[24px] cursor-pointer'
								onClick={handleOpenModal}
							>
								<p className='text_body'>
									New address found! Click here to add this address to your
									address book.
								</p>
								<div>
									<PlusSvg width='20' height='20' stroke='#524B4B' />
								</div>
							</div>
						) : (
							<></>
						)}
						<div className='flex flex-col max-h-[180px] overflow-y-scroll'>
							<SelectInput
								labelClassName={`${
									isDesktop ? 'h3' : 'h2_ext'
								} text-light_grey mb-[16px]`}
								label='Assets :'
								options={options}
								handleChange={handleChangeSelect}
								initialValue={select}
							/>
							<Input
								labelClassName={`${
									isDesktop ? 'h3' : 'h2_ext'
								} text-light_grey mb-[16px]`}
								label='Total :'
								value={amount}
								isError={balance < Number(amount)}
								onChange={handleChangeAmout}
								className='mt-[24px]'
								helperText={'You do not have enough token'}
								rightElement={
									<div
										className='flex items-center bg-dark_grey h-[50px] px-[25px] rounded-r-[10px] text_button_ext cursor-pointer'
										onClick={handleMax}
									>
										Max
									</div>
								}
							/>
						</div>
						<div className='w-[100%] flex pt-[8px]'>
							<Button
								mode='transparent'
								onClick={handleBack}
								title='Cancel'
								className='w-[50%] mr-[8px]'
							/>
							<Button
								mode='gradient'
								onClick={handleNext}
								title='Next'
								className='w-[50%] ml-[8px]'
								disabled={!Number(amount) || balance < Number(amount)}
							/>
						</div>
					</div>
				) : (
					<div className='min-h-[320px] w-[100%]'>
						{contacts.length ? (
							<ContactsList list={list} handleSelect={handleSelectContact} />
						) : (
							<></>
						)}
					</div>
				)}
			</div>
			<CreateContactModal
				show={isShowModal}
				onClose={handleCloseModal}
				address={search}
			/>
		</>
	)
}
