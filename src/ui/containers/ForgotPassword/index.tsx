import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../account'
import { routesPath } from '../../../utils'
import {
	Button,
	ChevronLeftIcon,
	CreatePasswordForm,
	InformationOutlineSvg,
	SelectInput,
	SuccessCreateModal,
} from '../../components'
import { accountsActions, createAccount, localStateActions } from '../../redux'
import { options } from '../ImportSeed'
import Background from '../../services/Background'
const bip39 = require('bip39')

type ForgotPasswordProps = {}

const selects = [...Array(24).keys()]

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const [seed, setSeed] = useState({})

	const [isValidMnemonic, setIsValidMnemonic] = useState<boolean>(true)
	const [isShowModal, setIsShowModal] = useState<boolean>(false)

	// //logic to show popup after create
	useEffect(() => {
		dispatch(accountsActions.setRedirectAccountPage(false))
		return () => {
			dispatch(accountsActions.setRedirectAccountPage(true))
		}
	}, [])

	const handleBack = () => navigate(routesPath.LOGIN)

	const handleChange = (index: number) => (value: string) => {
		setSeed(state => ({
			...state,
			[index + 1]: value,
		}))
	}

	const onInputChange = (index: number) => (value: string) => {
		if (value.trim().split(' ').length > 1) {
			value
				.trim()
				.split(' ')
				.forEach((i, index) => {
					setSeed(state => ({
						...state,
						[index + 1]: i,
					}))
				})
			return
		}
		const typedValue = options.find(i => i.value === value)
		if (!typedValue) return

		setSeed(state => ({
			...state,
			[index + 1]: typedValue.value,
		}))
	}

	const handleSubmit = (password: string) => async () => {
		const seedStr = Object.values(seed).join(' ')
		const isValidate = bip39.validateMnemonic(seedStr)

		setIsValidMnemonic(isValidate)

		if (Object.values(seed).length !== 24) {
			setIsValidMnemonic(false)
		}
		if (!isValidate || Object.values(seed).length !== 24) return
		await Background.deleteVault()
		await Background.initVault(password)

		await dispatch(
			localStateActions.setNewAccount({
				seed: seedStr,
				type: 'seed',
			})
		)

		await dispatch(
			createAccount({
				seed: seedStr,
				type: 'seed',
				name: 'Wallet 1',
				addressByIndex: '',
				shortAddressByIndex: '',
			})
		)

		setIsShowModal(true)
	}
	// const handleCloseModal = () => {
	// 	setIsShowModal(false)
	// 	// navigate(routesPath.HOME)
	// 	dispatch(accountsActions.setRedirectAccountPage(true))
	// }
	const handleCloseModal = () => setIsShowModal(false)

	return (
		<>
			<div className='w-[100%] flex items-center justify-center mt-[24px] mb-[40px]'>
				<div className='flex flex-col justify-center'>
					<div>
						<Button
							mode='icon_transparent'
							onClick={handleBack}
							title='Back'
							iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
						/>
					</div>
					<p className='h1 mt-[24px] mb-[16px]'>Reset wallet</p>
					<p className='text_body text-light_grey mb-[16px] w-[calc(75%-16px)]'>
						Penumbra does not keep a copy of your password. If you’re having
						trouble unlocking your account, you will need to reset your wallet.
						You can do this by providing the Secret Recovery Phrase you used
						when you set up your wallet.
					</p>
					<p className='text_body text-light_grey mb-[16px] w-[calc(75%-16px)]'>
						This action will delete your current wallet and Secret Recovery
						Phrase from this device, along with the list of accounts you’ve
						curated. After resetting with a Secret Recovery Phrase, you’ll see a
						list of accounts based on the Secret Recovery Phrase you use to
						reset. This new list will automatically include accounts that have a
						balance. You’ll also be able to re-add any other accounts created
						previously. Custom accounts that you’ve imported will need to be
						re-added, and any custom tokens you’ve added to an account will need
						to be re-added as well. Make sure you’re using the correct Secret
						Recovery Phrase before proceeding. You will not be able to undo
						this.
					</p>
					<div className='flex items-center gap-x-[16px] px-[12px] py-[14px] bg-brown rounded-[10px] mb-[40px]'>
						<InformationOutlineSvg height='16' width='16' />
						<p className='text_body'>
							You can paste your entire recovery passphrase into any field
						</p>
					</div>
					<div className='flex flex-wrap gap-y-[8px] gap-x-[16px]'>
						{selects.map(i => (
							<div className='flex-[0_0_calc(25%-16px)]' key={i}>
								<SelectInput
									options={options}
									fieldName={String(i)}
									label={`#${i + 1 < 10 ? `0${i + 1}` : i + 1}`}
									handleChange={handleChange(i)}
									onInputChange={onInputChange(i)}
									initialValue={seed[i + 1]}
								/>
							</div>
						))}
					</div>
					{!isValidMnemonic && (
						<div className='flex items-center bg-brown py-[23px] pl-[14px] w-[calc(50%-16px)] rounded-[10px] border-[1px] border-solid border-red mt-[20px]'>
							<InformationOutlineSvg fill='#870606' />
							<p className='pl-[18px] text_body'>
								Invalid recovery passphrase.
							</p>
						</div>
					)}
					<div className='mt-[24px] w-[400px]'>
						<CreatePasswordForm buttonTitle='Reset' onClick={handleSubmit} />
					</div>
				</div>
			</div>
			<SuccessCreateModal show={isShowModal} onClose={handleCloseModal} />
		</>
	)
}
