import React, { useState } from 'react'
import Background from '../../../services/Background'
import { Button } from '../../Button'
import { Input } from '../../Input'
import { ModalWrapper } from '../../ModalWrapper'
import { CopySvg, InformationOutlineSvg, SaveSvg } from '../../Svg'
import { SuccessCreateModalProps } from '../SuccessCreateModal'
import toast from 'react-hot-toast'

export const ExportSeedPhraseModal: React.FC<SuccessCreateModalProps> = ({
	show,
	onClose,
}) => {
	const [password, setPassword] = useState<string>('')
	const [isError, setIsError] = useState<boolean>(false)
	const [seed, setSeed] = useState<string>('')

	const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value)
		setIsError(false)
	}

	const handleConfirm = async () => {
		try {
			const seedPhrase = await Background.getAccountSeed(password)
			setSeed(seedPhrase)
			setPassword('')
		} catch (e) {
			setIsError(true)
		}
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(seed)
		toast.success('Success copied!', {
			position: 'top-right',
		})
	}

	const handleCloseAndCleanKey = () => {
		onClose()
		setSeed('')
	}

	return (
		<ModalWrapper
			show={show}
			onClose={handleCloseAndCleanKey}
			position='center'
			className='px-[16px] w-[335px]'
		>
			<div className='flex flex-col'>
				<p className='h1_ext mb-[12px]'>Recovery passphrase</p>
				<p className='text_body text-light_grey mb-[24px]'>
					If you change browser or switch to another computer, you will need
					this recovery passphrase to access your accounts.
				</p>
				<div className='flex items-center border-[1px] border-solid border-red rounded-[10px] py-[14px] px-[17px] mb-[16px]'>
					<InformationOutlineSvg fill='#870606' height='20' width='20' />
					<p className='w-[95%] pl-[10px]'>
						Don’t share this phrase with anyone.
					</p>
				</div>
				{!seed ? (
					<Input
						label={<p className='text_body'>Password</p>}
						isError={isError}
						value={password}
						onChange={handleChangePassword}
						customType='password'
					/>
				) : (
					<div className='flex flex-col'>
						<p className='text_body mb-[12px]'>Recovery secret phrase</p>
						<div className='bg-brown flex flex-wrap border-[1px] border-solid border-dark_grey p-[15px] rounded-[10px]'>
							{seed.split(' ').map((i, index) => {
								return (
									<div key={index} className='flex-[0_0_33%] flex mb-[5px]'>
										<p className='text_body light_grey px-[2px]'>
											#{index + 1 < 10 ? `0${index + 1}` : index + 1}
										</p>
										<p className='text_body'>{i}</p>
									</div>
								)
							})}
							<div className='flex w-[100%]'>
								<Button
									mode='icon_transparent'
									onClick={copyToClipboard}
									title='Copy'
									iconLeft={
										<span className='mr-[16px] flex items-center'>
											<CopySvg width='20' height='20' fill='#524B4B' />
										</span>
									}
									className='text-white w-[50%]'
								/>
								<Button
									mode='icon_transparent'
									onClick={copyToClipboard}
									title='CSV'
									iconLeft={
										<span className='mr-[16px] flex items-center'>
											<SaveSvg width='20' height='20' fill='#524B4B' />
										</span>
									}
									className='text-white w-[50%]'
								/>
							</div>
						</div>
					</div>
				)}
				{!seed && (
					<div className='flex mt-[40px]'>
						<Button
							mode='transparent'
							onClick={handleCloseAndCleanKey}
							title='Cancel'
							className='w-[50%] mr-[8px]'
						/>
						<Button
							mode='gradient'
							onClick={handleConfirm}
							title='Confirm'
							disabled={!password}
							className='w-[50%] ml-[8px]'
						/>
					</div>
				)}
			</div>
		</ModalWrapper>
	)
}
