import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAccountsSelector, useAppDispatch } from '../../../account'
import { routesPath } from '../../../utils'
import { getSeedPhrase } from '../../../utils/getSeedPhrase'
import { Button, ChevronLeftIcon } from '../../components'
import { localStateActions, selectNewAccount } from '../../redux'

type SeedPhraseProps = {}

export const SeedPhrase: React.FC<SeedPhraseProps> = ({}) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const newAccount = useAccountsSelector(selectNewAccount)

	const handleNext = () => navigate(routesPath.CONFIRM_SEED_PHRASE)
	const handleBack = () => navigate(routesPath.SEED_PHRASE_RULES)

	useEffect(() => {
		const seed = getSeedPhrase()
		dispatch(
			localStateActions.setNewAccount({
				seed,
				type: 'seed',
			})
		)
	}, [])

	if (!newAccount.seed) return <></>

	const copyToClipboard = () => {
		navigator.clipboard.writeText(newAccount.seed)
		toast.success('Success copied!', {
			position: 'top-right',
		})
	}

	return (
		<div className='w-[100%] flex items-center justify-center'>
			<div className='flex flex-col items-center justify-center'>
				<div className='self-start'>
					<Button
						mode='icon_transparent'
						onClick={handleBack}
						title='Back'
						iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
					/>
				</div>
				<p className='h1 self-start mt-[24px] mb-[16px]'>Recovery passphrase</p>
				<p className='text_body text-light_grey self-start'>
					Your recovery passphrase arises to back up and restore your
					accumulation.
				</p>
				<p className='text_body text-light_grey self-start mt-[8px] mb-[24px]'>
					WARNING: Never share your recovery passphrase. Anyone who has it can
					take your token forever.
				</p>
				<div className='bg-brown px-[30px] pt-[34px] pb-[26px] rounded-[15px] flex flex-wrap'>
					{newAccount.seed.split(' ').map((i, index) => {
						return (
							<div key={index} className='flex-[0_0_25%] flex mb-[8px]'>
								<p className='mr-[6px] text_body light_grey'>
									#{index + 1 < 10 ? `0${index + 1}` : index + 1}
								</p>
								<p className='text_body'>{i}</p>
							</div>
						)
					})}
				</div>
				<p className='text_body light_grey mt-[12px] mb-[40px] self-start'>
					Make sure you write down the seed phrase
				</p>
				<div className='w-[100%] flex mb-[30px]'>
					<div className='w-[40%] mr-[16px]'>
						<Button mode='transparent' onClick={copyToClipboard} title='Copy' />
					</div>
					<div className='w-[60%]'>
						<Button mode='gradient' onClick={handleNext} title='Next' />
					</div>
				</div>
			</div>
		</div>
	)
}
