import { useEffect, useState } from 'react'
import { useAccountsSelector } from '../../../account'
import { useMediaQuery } from '../../../hooks'
import { Button, Input, ResetWalletModal } from '../../components'
import { selectIdleInterval } from '../../redux'
import Background from '../../services/Background'

export const SettingsAdvanced = () => {
	const idleInterval = useAccountsSelector(selectIdleInterval)
	const isDesktop = useMediaQuery()
	const [isOpenResetWallet, setIsOpenResetWallet] = useState<boolean>(false)
	const [timer, setTimer] = useState<string>('')

	useEffect(() => {
		const intervalInMinutes = !idleInterval
			? idleInterval
			: idleInterval / 60 / 1000

		setTimer(String(intervalInMinutes))
	}, [idleInterval])

	const handleChangeTimer = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(event.target.value)
		if (isNaN(value)) return
		setTimer(value.toFixed(0))
	}

	const toggleShowResetWalletModal = (value: boolean) => () =>
		setIsOpenResetWallet(value)

	const handleConfirm = async () => {
		await Background.resetWallet()
		toggleShowResetWalletModal(false)()
	}

	const handleSaveTimer = async () => {
		if (+timer > 10080) return
		await Background.setIdleInterval(+timer)
	}
	return (
		<>
			<div>
				<p
					className={`w-[100%] px-[16px] py-[24px] border-b-[1px] border-solid border-dark_grey ${
						isDesktop ? 'h2' : 'h1_ext'
					}`}
				>
					Advanced
				</p>
				<div className='tablet:px-[16px] h-[100%] mt-[24px]'>
					<div className='w-[100%] flex flex-col ext:px-[16px] tablet:px-[0px]'>
						<div className='flex flex-col'>
							<p className='h3'>Auto-lock timer (minutes)</p>
							<p className='ext:w-[100%] tablet:w-[280px] text_body text-light_grey mt-[8px] mb-[16px]'>
								Set the inactivity time in the coming days before Penumbra is
								blocked.
							</p>
							<Input
								value={timer}
								onChange={handleChangeTimer}
								className='ext:w-[100%] tablet:w-[280px]'
								helperText='Lock time is too great'
								isError={+timer > 10080}
								rightElement={
									<div
										className='flex items-center bg-dark_grey h-[50px] px-[25px] rounded-r-[15px] text_button_ext cursor-pointer'
										onClick={handleSaveTimer}
									>
										Save
									</div>
								}
							/>
						</div>
						<div className='flex flex-col'>
							<p className='h3 mb-[16px]'>Clear cache</p>
							<Button
								title='Clear cache'
								mode='gradient'
								onClick={toggleShowResetWalletModal(true)}
								className='ext:w-[100%] tablet:w-[280px] '
							/>
						</div>
					</div>
				</div>
			</div>
			<ResetWalletModal
				show={isOpenResetWallet}
				onClose={toggleShowResetWalletModal(false)}
				handleConfirm={handleConfirm}
				title='Do you really want to clear cache? All view service data will be deleted and re-synchronized.'
				warnings="YOUR PRIVATE KEYS WON'T BE LOST!"
			/>
		</>
	)
}
