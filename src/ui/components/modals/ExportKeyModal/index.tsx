import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAccountsSelector } from '../../../../account'
import { selectSelectedAccount } from '../../../redux'
import Background from '../../../services/Background'
import { Button } from '../../Button'
import { Input } from '../../Input'
import { ModalWrapper } from '../../ModalWrapper'
import { InformationOutlineSvg } from '../../Svg'

import { SuccessCreateModalProps } from '../SuccessCreateModal'
import { KeysModalType } from '../../../containers'

type ExportKeyModalProps = {
	type: KeysModalType
}

export const ExportKeyModal: React.FC<
	SuccessCreateModalProps & ExportKeyModalProps
> = ({ show, onClose, type }) => {
	const selectedAccount = useAccountsSelector(selectSelectedAccount)

	const [password, setPassword] = useState<string>('')
	const [isError, setIsError] = useState<boolean>(false)
	const [key, setKey] = useState<string>('')

	const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value)
		setIsError(false)
	}

	const handleConfirm = async () => {
		try {
			const key =
				type === 'full_viewing_key'
					? await Background.getAccountFullViewingKey(password)
					: await Background.getAccountSpendingKey(password)
			setKey(key)
			setPassword('')
		} catch (e) {
			setIsError(true)
			console.error(e)
		}
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(key)
		toast.success('Success copied!', {
			position: 'top-right',
		})
	}

	const handleCloseAndCleanKey = () => {
		onClose()
		setKey('')
	}

	return (
		<ModalWrapper
			show={show}
			onClose={handleCloseAndCleanKey}
			position='center'
			className='pt-[12px] pb-[30px] px-[0px] w-[335px]'
		>
			<div>
				{/* <div className='flex flex-col items-center border-b-[1px] border-solid border-dark_grey pb-[16px] px-[16px]'>
					<UserLogo />
					<p className='h2 my-[12px]'>{selectedAccount.name}</p>
					<p className='w-[100%] text-center text_body text-light_grey border-[1px] border-solid border-dark_grey rounded-[10px] py-[10px]'>
						{selectedAccount.addressByIndex.slice(0, 35)}...
					</p>
				</div> */}
				<div className='flex flex-col items-center pt-[12px] px-[16px]'>
					<p className='h3 mb-[12px]'>
						{type === 'full_viewing_key'
							? 'Show Full Viewing Key'
							: 'Show Spending key'}
					</p>
					<div className='w-[100%] mb-[12px]'>
						{!key ? (
							<Input
								label={<p className='text_body'>Password</p>}
								isError={isError}
								value={password}
								onChange={handleChangePassword}
								customType='password'
							/>
						) : (
							<div>
								<p className='text_body pb-[8px]'>
									{`This is your ${
										type === 'full_viewing_key'
											? 'Full Viewing Key'
											: 'Spending key'
									} (click yo copy)`}
								</p>

								<p
									role='button'
									tabIndex={0}
									className='break-words text_ext text-red py-[8px] px-[19px] border-[1px] border-solid border-dark_grey rounded-[10px] cursor-pointer'
									onClick={copyToClipboard}
								>
									{key}
								</p>
							</div>
						)}
					</div>
					<div className='flex items-center border-[1px] border-solid border-red rounded-[10px] p-[11px] mb-[40px]'>
						<InformationOutlineSvg fill='#870606' height='20' width='20' />
						<p className='w-[95%] text_body pl-[18px]'>
							Warning: never reveal this key. Anyone with your keys can steal
							any assets held in your account.
						</p>
					</div>
					<div className='w-[100%] flex mb-[30px]'>
						{!key ? (
							<>
								<div className='w-[50%] mr-[8px]'>
									<Button mode='transparent' onClick={onClose} title='Cancel' />
								</div>
								<div className='w-[50%] ml-[8px]'>
									<Button
										mode='gradient'
										onClick={handleConfirm}
										title='Confirm'
										disabled={!password}
									/>
								</div>
							</>
						) : (
							<Button
								mode='gradient'
								onClick={handleCloseAndCleanKey}
								title='Done'
							/>
						)}
					</div>
				</div>
			</div>
		</ModalWrapper>
	)
}
