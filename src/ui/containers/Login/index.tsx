import { useState } from 'react'
import { Button, Input } from '../../components'
import Background from '../../services/Background'
import { useAccountsSelector } from '../../../account'
import { selectMessages } from '../../redux'
import { useNavigate } from 'react-router-dom'
import { routesPath } from '../../../utils'
import { useMediaQuery } from '../../../hooks'

type LoginProps = {}

export const Login: React.FC<LoginProps> = ({}) => {
	const navigate = useNavigate()
	const isDesktop = useMediaQuery()

	const [password, setPassword] = useState<string>('')
	const [isError, setIsError] = useState<boolean>(false)
	const messages = useAccountsSelector(selectMessages)

	const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value)
		setIsError(false)
	}

	const handleSubmitPassword = async () => {
		try {
			await Background.unlock(password)

			if (
				!messages.unapprovedMessages.length &&
				window.location.pathname === '/notification.html'
			) {
				await Background.closeNotificationWindow()
			}
		} catch {
			setIsError(true)
		}
	}

	const handleKeyDown = async event => {
		if (event.key === 'Enter') {
			try {
				await Background.unlock(password)

				if (
					!messages.unapprovedMessages.length &&
					window.location.pathname === '/notification.html'
				) {
					await Background.closeNotificationWindow()
				}
			} catch {
				setIsError(true)
			}
		}
	}

	const gotoForgotPassword = () => navigate(routesPath.FORGOT_PASSWORD)

	const handleOpentTab = () => {
		Background.showTab(
			`${window.location.origin}/accounts.html#${routesPath.FORGOT_PASSWORD}`,
			'forgot-password'
		)
		navigate('/', { replace: true })
	}

	return (
		<div className='w-[100%] h-[calc(100vh-160px)] flex items-center justify-center'>
			<div className='ext:w-[100%] tablet:w-[400px] ext:px-[16px] tablet:px-[0px] flex flex-col items-center justify-center'>
				<p className='h1'>Welcome back!</p>
				<p className='text_body text-light_grey ext:mb-[24px] tablet:mb-[40px] mt-[8px]'>
					A decentralized network awaits
				</p>
				<Input
					label='Password'
					placeholder='Password'
					isError={isError}
					helperText='Incorrect password'
					value={password}
					onChange={handleChangePassword}
					customType='password'
					className='w-[100%] mb-[16px]'
					onKeyDown={handleKeyDown}
				/>
				<Button
					title='Unlock'
					mode='gradient'
					onClick={handleSubmitPassword}
					disabled={!password}
					className='w-[100%] ext:mb-[16px] tablet:mb-[24px]'
				/>
				<p
					className='text_button text-light_grey cursor-pointer hover:text-white'
					onClick={isDesktop ? gotoForgotPassword : handleOpentTab}
				>
					Forgot Password?
				</p>
				<div className='flex items-center text_body mt-[16px] text-light_grey'>
					<p>
						Need help? Contact{' '}
						<span>
							<a
								className='text-green underline cursor-pointer hover:text-light_grey'
								target='_blank'
								href='https://guide.penumbra.zone/main/extension.html'
							>
								Penumbra Support
							</a>
						</span>
					</p>
				</div>
			</div>
		</div>
	)
}
