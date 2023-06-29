import React, { useState } from 'react'
import { PasswordValidatorsType, validatePassword } from '../../../../utils'
import { Button } from '../../Button'
import { CheckBox } from '../../CheckBox'
import { Input } from '../../Input'
import { PasswordRules } from '../../PasswordRules'

type CreatePasswordFormProps = {
	buttonTitle: string
	onClick: (password: string) => () => Promise<void>
}

export const CreatePasswordForm: React.FC<CreatePasswordFormProps> = ({
	buttonTitle,
	onClick,
}) => {
	const [password, setPassword] = useState<{
		newPass: string
		confirmPass: string
	}>({
		newPass: '',
		confirmPass: '',
	})
	const [isValidate, setIsValidate] = useState<PasswordValidatorsType>(
		{} as PasswordValidatorsType
	)
	const [isChecked, setIsChecked] = useState<{
		terms: boolean
		privacy: boolean
	}>({
		terms: false,
		privacy: false,
	})

	const handleChangePassword =
		(type: 'newPass' | 'confirmPass') =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setPassword(state => ({
				...state,
				[type]: event.target.value,
			}))
			if (type === 'newPass') {
				const validators = validatePassword(event.target.value)
				setIsValidate(state => ({
					...state,
					...validators,
				}))
			}
		}

	const handleChangeCheck =
		(type: 'terms' | 'privacy') => (e: React.ChangeEvent<HTMLInputElement>) =>
			setIsChecked(s => ({
				...s,
				[type]: e.target.checked,
			}))

	// const handleKeyPressCheckBox = (e: React.KeyboardEvent<HTMLInputElement>) => {
	//   if (e.key === 'Enter') {
	//     setIsChecked((state) => !state);
	//   }
	// };

	return (
		<>
			<div className='w-[100%] mb-[24px]'>
				<Input
					label='New Password'
					placeholder='Password'
					isError={Object.values(isValidate).includes(false)}
					value={password.newPass}
					onChange={handleChangePassword('newPass')}
					customType='password'
				/>
			</div>
			<div className='w-[100%] mb-[40px]'>
				<Input
					label='Confirm password'
					placeholder='Confirm password'
					value={password.confirmPass}
					onChange={handleChangePassword('confirmPass')}
					isError={
						password.confirmPass
							? password.confirmPass !== password.newPass
							: false
					}
					customType='password'
				/>
			</div>
			<PasswordRules password={password.newPass} validates={isValidate} />
			<div className='self-start mb-[40px]  mt-[16px]'>
				<CheckBox
					label={
						<div className='flex items-center'>
							<p>
								I have read and agree with the{' '}
								<span>
									<a
										className='text-green underline cursor-pointer hover:text-light_grey'
										target='_blank'
										href='https://privacy.penumbra.zpoken.io/'
									>
										Privacy policy
									</a>
								</span>
							</p>
						</div>
					}
					onChange={handleChangeCheck('privacy')}
					checked={isChecked.privacy}
					// onKeyDown={handleKeyPressCheckBox}
				/>
			</div>
			<div className='w-[100%] mb-[30px]'>
				<Button
					title={buttonTitle}
					mode='gradient'
					disabled={
						!(
							Boolean(Object.values(isValidate).length) &&
							!Object.values(isValidate).includes(false) &&
							password.confirmPass === password.newPass &&
							isChecked.privacy
						)
					}
					onClick={onClick(password.newPass)}
				/>
			</div>
		</>
	)
}
