import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Contact } from '../../../../controllers'
import { useMediaQuery } from '../../../../hooks'
import toast from 'react-hot-toast'
import Background from '../../../services/Background'
import { Button, CopySvg, Input } from '../../../components'
import {
	AddressValidatorsType,
	getShortName,
	validateAddress,
} from '../../../../utils'

type DetailContactCardProps = {
	contact: Contact
	handleCancel: () => void
	setSelectedContact: Dispatch<SetStateAction<Contact | null>>
}

export const DetailContactCard: React.FC<DetailContactCardProps> = ({
	contact,
	handleCancel,
	setSelectedContact,
}) => {
	const isDesktop = useMediaQuery()
	const [isEdit, setIsEdit] = useState<boolean>(false)
	const [values, setValues] = useState<Contact>(contact)
	const [isValidate, setIsValidate] = useState<AddressValidatorsType>(
		{} as AddressValidatorsType
	)
	const [helperText, setHelperText] = useState<{
		name: string
		address: string
	}>({ name: '', address: '' })

	useEffect(() => {
		setValues(contact)
	}, [contact])

	const handleEdit = () => setIsEdit(true)

	const copyToClipboard = () => {
		navigator.clipboard.writeText(contact.address)
		toast.success('Success copied!', {
			position: 'top-right',
		})
	}

	const handleChangeValues =
		(type: 'name' | 'address' | 'note') =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setIsValidate({} as AddressValidatorsType)
			setHelperText({ name: '', address: '' })
			setValues(state => ({
				...state,
				[type]: event.target.value,
			}))
		}

	const handleCancelBtn = () => setIsEdit(false)

	const handleDelete = () => {
		Background.removeContact(contact.address)
		handleCancel()
		setSelectedContact(null)
		setIsEdit(false)
	}

	const handleSave = async () => {
		const validators = validateAddress(values.address)

		if (Object.values(validators).includes(false)) {
			setIsValidate(state => ({
				...state,
				...validators,
			}))
			setHelperText(state => ({
				...state,
				address: Object.values(validators).includes(false)
					? 'Invalid address'
					: '',
			}))

			return
		}
		try {
			await Background.updateContact(values, contact.address)
			handleCancel()
			setSelectedContact(null)
			setIsEdit(false)
		} catch (error) {
			const typeError =
				error.message === 'Contact with this name exist' ? 'name' : 'address'
			setIsValidate(state => ({
				...state,
				uniqueName: typeError === 'name',
				uniqueAddress: typeError === 'address',
			}))
			setHelperText(state => ({
				...state,
				[typeError]: error.message,
			}))
		}
	}

	return (
		<div className='py-[24px] w-[100%] flex flex-col px-[16px]'>
			<div className='flex items-center justify-between mb-[16px]'>
				<div className='ext:w-[40px] ext:h-[40px] tablet:w-[52px] tablet:h-[52px] li_gradient rounded-[50%] flex items-center justify-center'>
					<div className='ext:w-[39px] ext:h-[39px] tablet:w-[51px] tablet:h-[51px] bg-brown rounded-[50%] flex items-center justify-center'></div>
				</div>
				{isEdit && (
					<Button
						title='Delete'
						mode='gradient'
						onClick={handleDelete}
						className='w-[152px] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px]'
					/>
				)}
			</div>
			{!isEdit ? (
				<p className={`mb-[24px] ${isDesktop ? 'h3' : 'h2_ext'}`}>
					{getShortName(contact.name)}
				</p>
			) : (
				<Input
					labelClassName={`${isDesktop ? 'h3' : 'h2_ext'} pb-[16px]`}
					label='User name'
					value={values.name}
					helperText={helperText.name || 'Invalid address'}
					isError={
						helperText.name ? Object.values(isValidate).includes(false) : false
					}
					onChange={handleChangeValues('name')}
				/>
			)}
			{!isEdit && (
				<Button
					title='Edit'
					mode='gradient'
					onClick={handleEdit}
					className='tablet:w-[100%] mb-[24px]'
				/>
			)}
			{!isEdit ? (
				<div className='flex flex-col mb-[24px]'>
					<p className='text_body mb-[16px]'>Penumbra's address</p>
					<div className='flex items-center py-[8px] ext:px-[16px] tablet:px-[10px] bg-dark_grey rounded-[15px]'>
						<p className='break-all text_body mr-[10px]'>{contact.address}</p>
						<span
							className=' cursor-pointer svg_hover'
							onClick={copyToClipboard}
							role='button'
							tabIndex={0}
						>
							<CopySvg width='20' height='20' fill='#524B4B' />
						</span>
					</div>
				</div>
			) : (
				<Input
					labelClassName={`${isDesktop ? 'h3' : 'h2_ext'} pb-[16px]`}
					label="Penumbra's address"
					value={values.address}
					onChange={handleChangeValues('address')}
					isError={
						helperText.address
							? Object.values(isValidate).includes(false)
							: false
					}
					helperText={helperText.address || 'Invalid address'}
				/>
			)}

			{isEdit && (
				<div className='w-[100%] flex'>
					<Button
						mode='transparent'
						onClick={handleCancelBtn}
						title='Cancel'
						className='w-[50%] mr-[8px]'
					/>
					<Button
						mode='gradient'
						onClick={handleSave}
						title='Save'
						className='w-[50%] ml-[8px]'
						disabled={
							!(
								values.address &&
								values.name &&
								!Object.values(isValidate).includes(false)
							)
						}
					/>
				</div>
			)}
		</div>
	)
}
