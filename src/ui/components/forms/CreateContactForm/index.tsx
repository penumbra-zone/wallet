import React, { useState } from 'react'
import { Contact } from '../../../../controllers'
import { useMediaQuery } from '../../../../hooks'
import { AddressValidatorsType, validateAddress } from '../../../../utils'
import Background from '../../../services/Background'
import { Button } from '../../Button'
import { Input } from '../../Input'

type CreateContactFormProps = {
	handleCancel: () => void
}

export const CreateContactForm: React.FC<CreateContactFormProps> = ({
	handleCancel,
}) => {
	const isDesktop = useMediaQuery()
	const [values, setValues] = useState<Contact>({
		name: '',
		address: '',
	})

	const [isValidate, setIsValidate] = useState<AddressValidatorsType>(
		{} as AddressValidatorsType
	)
	const [helperText, setHelperText] = useState<{
		name: string
		address: string
	}>({ name: '', address: '' })

	const handleChangeValues =
		(type: 'name' | 'address') =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setIsValidate({} as AddressValidatorsType)
			setHelperText({ name: '', address: '' })
			setValues(state => ({
				...state,
				[type]: event.target.value,
			}))
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
			await Background.setContact(values)
			handleCancel()
		} catch (error) {
			const typeError =
				error.message === 'Contact with this name exist' ? 'name' : 'address'
			setHelperText(state => ({
				...state,
				[typeError]: error.message,
			}))
			setIsValidate(state => ({
				...state,
				uniqueName: typeError === 'name',
				uniqueAddress: typeError === 'address',
			}))
		}
	}

	return (
		<div className='w-[100%] px-[16px] ext:pt-[24px] ext:pb-[32px] tablet:py-[24px] flex flex-col justify-between'>
			<div className='flex flex-col'>
				<Input
					labelClassName={`${isDesktop ? 'h3' : 'h2_ext'}`}
					label='User name'
					value={values.name}
					onChange={handleChangeValues('name')}
					isError={
						helperText.name ? Object.values(isValidate).includes(false) : false
					}
					helperText={helperText.name || 'Invalid address'}
				/>
				<Input
					labelClassName={`${isDesktop ? 'h3' : 'h2_ext'}`}
					label="
              Penumbra's address"
					isError={
						helperText.address
							? Object.values(isValidate).includes(false)
							: false
					}
					helperText={helperText.address || 'Invalid address'}
					value={values.address}
					onChange={handleChangeValues('address')}
				/>
			</div>
			<div className='w-[100%] flex'>
				<Button
					mode='transparent'
					onClick={handleCancel}
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
		</div>
	)
}
