import { useState } from 'react'
import { useAccountsSelector } from '../../../account'
import { Button, CheckBox, PlusSvg } from '../../components'
import { selectMessages, selectSelectedAccount } from '../../redux'
import Background from '../../services/Background'
import { DetailTxBeforeSend } from '../Send/DetailTxBeforeSend'

export const ActiveMessage = () => {
	const messages = useAccountsSelector(selectMessages)
	const account = useAccountsSelector(selectSelectedAccount)
	const [isChecked, setIsChecked] = useState<boolean>(false)

	const handleChangeCheck = (e: React.ChangeEvent<HTMLInputElement>) =>
		setIsChecked(e.target.checked)

	const handleCancel = async () => {
		Background.reject(messages.unapprovedMessages[0].id)
		if (window.location.pathname === '/notification.html') {
			await Background.closeNotificationWindow()
		}
	}

	const handleConfirm = async () => {
		await Background.approve(messages.unapprovedMessages[0].id)
		if (window.location.pathname === '/notification.html') {
			await Background.closeNotificationWindow()
		}
	}

	if (
		messages.unapprovedMessages[0] &&
		messages.unapprovedMessages[0].type === 'transaction'
	) {
		return (
			<DetailTxBeforeSend
				sendPlan={messages.unapprovedMessages[0].data}
				handleCancel={handleCancel}
				handleApprove={handleConfirm}
				messageId={messages.unapprovedMessages[0].id}
			/>
		)
	}

	return (
		<div className='w-[100%] h-[100vh] flex flex-col items-center justify-between py-[30px] px-[16px]'>
			<div className='w-[100%] flex flex-col items-center'>
				<p className='h1_ext mb-[16px]'>Connect with Penumbra</p>
				<p className='text_body_ext mb-[16px]'>Select accounts to use</p>
				<div className='w-[100%] flex items-center  px-[20px] py-[16px] border-[1px] border-solid border-dark_grey rounded-[15px]'>
					<CheckBox
						onChange={handleChangeCheck}
						checked={isChecked}
						// onKeyDown={handleKeyPressCheckBox}
					/>
					<div className='flex ml-[24px]'>
						<div className='flex flex-col justify-between ml-[8px]'>
							<p className='h2_ext'>{account.name}</p>
							<p className='h2_ext break-words w-[200px]'>{`(${account.shortAddressByIndex})`}</p>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col w-[100%]'>
				{/* <div className='w-[100%] flex justify-between'>
					<p className='text_body_ext'>Connect only to sites you trust</p>
					<Button
						mode='icon_transparent'
						title='More'
						iconLeft={<PlusSvg width='16' height='16' stroke='#FFFFFF' />}
						className='text-white text_button_ext'
					/>
				</div> */}
				<div className='w-[100%] flex mt-[40px]'>
					<Button
						mode='transparent'
						onClick={handleCancel}
						title='Cancel'
						className='mr-[8px]'
					/>
					<Button
						mode='gradient'
						onClick={handleConfirm}
						title='Confirm'
						className='ml-[8px]'
						disabled={!isChecked}
					/>
				</div>
			</div>
		</div>
	)
}
