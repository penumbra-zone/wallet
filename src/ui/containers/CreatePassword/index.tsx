import Background from '../../services/Background'
import { CreatePasswordForm } from '../../components'

type CreatePasswordProps = {}

export const CreatePassword: React.FC<CreatePasswordProps> = ({}) => {
	const handleSubmitPassword = (password: string) => async () =>
		Background.initVault(password)

	return (
		<div className='w-[100%] flex items-center justify-center'>
			<div className='w-[400px] flex items-center justify-center'>
				<div className='w-[100%] flex flex-col items-center justify-center'>
					<p className='h1 mt-[40px] mb-[24px]'>Create password</p>
					<CreatePasswordForm
						buttonTitle='Create'
						onClick={handleSubmitPassword}
					/>
				</div>
			</div>
		</div>
	)
}
