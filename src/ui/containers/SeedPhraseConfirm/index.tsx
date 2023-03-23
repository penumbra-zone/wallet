import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountsSelector, useAppDispatch } from '../../../accounts'
import { routesPath } from '../../../utils'
import {
	Button,
	ChevronLeftIcon,
	SelectInput,
	SuccessCreateModal,
} from '../../components'
import { createAccount, selectNewAccount } from '../../redux'
import { options } from '../ImportSeed'

type SeedPhraseConfirmProps = {}

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

export const SeedPhraseConfirm: React.FC<SeedPhraseConfirmProps> = ({}) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const [isShowModal, setIsShowModal] = useState<boolean>(false)

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
	}>(makeRandoms(24))

	const [isError, setIsError] = useState<{
		first: boolean
		second: boolean
		third: boolean
	}>({
		first: false,
		second: false,
		third: false,
	})

	const newAccount = useAccountsSelector(selectNewAccount)

	useEffect(() => {
		setIsError({
			first: words.first === newAccount.seed.split(' ')[random.r1],
			second: words.second === newAccount.seed.split(' ')[random.r2],
			third: words.third === newAccount.seed.split(' ')[random.r3],
		})
	}, [words])

	const handleBack = () => navigate(routesPath.SEED_PHRASE)
	const handleSubmit = async () => {
		await dispatch(createAccount(newAccount as any))
		setIsShowModal(true)
	}

	const handleChangeWords =
		(type: 'first' | 'second' | 'third') => (value: string) => {
			setWords(state => ({
				...state,
				[type]: value,
			}))
		}

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

	return (
		<div className='w-[100%] flex items-center justify-center'>
			<div className='w-[400px] flex items-center justify-center'>
				<div className='w-[100%] flex flex-col items-center justify-center'>
					<div className='self-start'>
						<Button
							mode='icon_transparent'
							onClick={handleBack}
							title='Back'
							iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
						/>
					</div>
					<p className='h1 mt-[40px]'>Confirm your recovery passphrase</p>
					<p className='text _body text-light-grey mt-[16px] mb-[24px]'>
						Please confirm the seed phrase by entering the correct word for each
						position
					</p>
					<div className='w-[100%] mb-[12px]'>
						<SelectInput
							options={options}
							fieldName='first'
							isError={words.first ? !isError.first : false}
							label={
								random.r1 + 1 < 10 ? `0${random.r1 + 1}` : String(random.r1 + 1)
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
								random.r2 + 1 < 10 ? `0${random.r2 + 1}` : String(random.r2 + 1)
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
								random.r3 + 1 < 10 ? `0${random.r3 + 1}` : String(random.r3 + 1)
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
	)
}
