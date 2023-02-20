import { useState } from 'react'
import { Button, Input } from '../../components'
import Background from '../../services/Background'

type LoginProps = {}

export const Login: React.FC<LoginProps> = ({}) => {
	const [password, setPassword] = useState<string>('')
	const [isError, setIsError] = useState<boolean>(false)

	const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value)
		setIsError(false)
	}

	const handleSubmitPassword = async () => {
		try {
			await Background.unlock(password)
		} catch {
			setIsError(true)
		}
	}

	const handleKeyDown = async event => {
		if (event.key === 'Enter') {
			try {
				await Background.unlock(password)
			} catch {
				setIsError(true)
			}
		}
	}

	return (
		<div className='w-[100%] flex items-center justify-center'>
			<div className='w-[400px] ext:py-[20px] tablet:py-[0px] ext:px-[16px] tablet:px-[0px] ext:bg-brown tablet:bg-transparent rounded-[15px] flex flex-col items-center justify-center'>
				<p className='h1'>Welcome back!</p>
				<p className='text_body text-light_grey mb-[40px] ext:mt-[12px] tablet:mt-[16px]'>
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
					className='w-[100%] mb-[24px]'
					onKeyDown={handleKeyDown}
				/>
				<Button
					title='Unlock'
					mode='gradient'
					onClick={handleSubmitPassword}
					disabled={!password}
					className='w-[100%] mb-[60px]'
				/>
				<p className='text_body text-light_grey'>
					Need help? Contact Penumbra support
				</p>
			</div>
		</div>
	)
}
