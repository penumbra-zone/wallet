import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../account'
import { routesPath } from '../../../utils'
import { getSeedPhrase } from '../../../utils/getSeedPhrase'
import {
	Button,
	ChevronLeftIcon,
	SelectInput,
	SuccessCreateModal,
} from '../../components'
import { createAccount } from '../../redux'
import { options } from '../ImportSeed'

type SeedPhraseProps = {}
function makeRandoms(notThis) {
	const randoms = [...Array(24).keys()]

	// faster way to remove an array item when you don't care about array order
	function removeArrayItem(i) {
		const val = randoms.pop()
		if (i < randoms.length) {
			randoms[i] = val
		}
	}

	function makeRandom() {
		const rand = randoms[Math.floor(Math.random() * randoms.length)]
		removeArrayItem(rand)
		return rand
	}

	// remove the notThis item from the array
	if (notThis < randoms.length) {
		removeArrayItem(notThis)
	}
	const randomArr = [makeRandom(), makeRandom(), makeRandom()].sort(
		(a, b) => a - b
	)

	return { r1: randomArr[0], r2: randomArr[1], r3: randomArr[2] }
}

export const SeedPhrase: React.FC<SeedPhraseProps> = ({}) => {
	const navigate = useNavigate()
	const dispatch = useAppDispatch()

	const [isConfirmPage, setIsConfirmPage] = useState<boolean>(false)
	const [isShowModal, setIsShowModal] = useState<boolean>(false)
	const [seed, setSeed] = useState<string>('')
	const [words, setWords] = useState<{
		first: string
		second: string
		third: string
	}>({
		first: '',
		second: '',
		third: '',
	})
	const [random, setRandom] = useState<{
		r1: number
		r2: number
		r3: number
	} | null>(null)
	const [isError, setIsError] = useState<{
		first: boolean
		second: boolean
		third: boolean
	}>({
		first: false,
		second: false,
		third: false,
	})

	useEffect(() => {
		const seed = getSeedPhrase()
		setSeed(seed)
		setRandom(makeRandoms(24))
	}, [])

	useEffect(() => {
		if (!seed) return
		setIsError({
			first: words.first === seed.split(' ')[random.r1],
			second: words.second === seed.split(' ')[random.r2],
			third: words.third === seed.split(' ')[random.r3],
		})
	}, [words, seed])

	if (!seed) return <></>

	const copyToClipboard = () => {
		navigator.clipboard.writeText(seed)
		toast.success('Success copied!', {
			position: 'top-right',
		})
	}
	const handleNext = () => setIsConfirmPage(true)
	const handleBack = () => navigate(routesPath.SEED_PHRASE_RULES)
	const handleBackConfirm = () => setIsConfirmPage(false)

	const onInputChange =
		(type: 'first' | 'second' | 'third') => (value: string) => {
			const typedValue = options.find(i => i.value === value)

			if (!typedValue) return
			setWords(state => ({
				...state,
				[type]: typedValue.value,
			}))
		}

	const handleCloseModal = () => setIsShowModal(false)

	const handleChangeWords =
		(type: 'first' | 'second' | 'third') => (value: string) => {
			setWords(state => ({
				...state,
				[type]: value,
			}))
		}

	const handleSubmit = async () => {
		await dispatch(
			createAccount({
				seed,
				type: 'seed',
				name: 'Wallet 1',
			} as any)
		)
		setIsShowModal(true)
	}

	return (
		<>
			{!isConfirmPage ? (
				<div className='w-[100%] flex items-center justify-center'>
					<div className='w-[500px] flex flex-col items-center justify-center'>
						<div className='self-start'>
							<Button
								mode='icon_transparent'
								onClick={handleBack}
								title='Back'
								iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
							/>
						</div>
						<p className='h1 self-start mt-[24px] mb-[16px]'>
							Recovery passphrase
						</p>
						<p className='text_body text-light_grey self-start'>
							Your recovery passphrase arises to back up and restore your
							accumulation.
						</p>
						<p className='text_body text-light_grey self-start mt-[8px] mb-[24px]'>
							WARNING: Never share your recovery passphrase. Anyone who has it
							can take your token forever.
						</p>
						<div className='bg-brown px-[30px] pt-[34px] pb-[26px] rounded-[10px] flex flex-wrap'>
							{seed.split(' ').map((i, index) => {
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
								<Button
									mode='transparent'
									onClick={copyToClipboard}
									title='Copy'
								/>
							</div>
							<div className='w-[60%]'>
								<Button mode='gradient' onClick={handleNext} title='Next' />
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className='w-[100%] flex items-center justify-center'>
					<div className='w-[400px] flex items-center justify-center'>
						<div className='w-[100%] flex flex-col items-center justify-center'>
							<div className='self-start'>
								<Button
									mode='icon_transparent'
									onClick={handleBackConfirm}
									title='Back'
									iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
								/>
							</div>
							<p className='h1 mt-[40px]'>Confirm your recovery passphrase</p>
							<p className='text _body text-light-grey mt-[16px] mb-[24px]'>
								Please confirm the seed phrase by entering the correct word for
								each position
							</p>
							<div className='w-[100%] mb-[12px]'>
								<SelectInput
									options={options}
									fieldName='first'
									isError={words.first ? !isError.first : false}
									label={
										random.r1 + 1 < 10
											? `0${random.r1 + 1}`
											: String(random.r1 + 1)
									}
									handleChange={handleChangeWords('first')}
									onInputChange={onInputChange('first')}
									initialValue={words['first']}
								/>
							</div>
							<div className='w-[100%] mb-[12px]'>
								<SelectInput
									options={options}
									fieldName='second'
									isError={words.second ? !isError.second : false}
									label={
										random.r2 + 1 < 10
											? `0${random.r2 + 1}`
											: String(random.r2 + 1)
									}
									handleChange={handleChangeWords('second')}
									onInputChange={onInputChange('second')}
									initialValue={words['second']}
								/>
							</div>
							<div className='w-[100%]'>
								<SelectInput
									options={options}
									fieldName='third'
									isError={words.third ? !isError.third : false}
									label={
										random.r3 + 1 < 10
											? `0${random.r3 + 1}`
											: String(random.r3 + 1)
									}
									handleChange={handleChangeWords('third')}
									onInputChange={onInputChange('third')}
									initialValue={words['third']}
								/>
							</div>
							<div className='w-[100%] mb-[10px] mt-[40px]'>
								<Button
									title='Confirm'
									mode='gradient'
									disabled={Object.values(isError).includes(false)}
									onClick={handleSubmit}
								/>
							</div>
						</div>
					</div>
					<SuccessCreateModal show={isShowModal} onClose={handleCloseModal} />
				</div>
			)}
		</>
	)
}
