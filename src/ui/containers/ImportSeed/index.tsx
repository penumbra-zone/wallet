import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../account'
import { getWordListOprions, routesPath } from '../../../utils'
import {
	Button,
	ChevronLeftIcon,
	InformationOutlineSvg,
	SelectInput,
	SuccessCreateModal,
} from '../../components'
import { accountsActions, createAccount, localStateActions } from '../../redux'
const bip39 = require('bip39')

type ImportSeedProps = {}

export const options = getWordListOprions()

const selects = [...Array(24).keys()]

export const ImportSeed: React.FC<ImportSeedProps> = ({}) => {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()

	const [seed, setSeed] = useState({
		// 1: 'under',
		// 2: 'magnet',
		// 3: 'father',
		// 4: 'section',
		// 5: 'sibling',
		// 6: 'wide',
		// 7: 'canoe',
		// 8: 'baby',
		// 9: 'cruel',
		// 10: 'will',
		// 11: 'mammal',
		// 12: 'dignity',
		// 13: 'apart',
		// 14: 'pilot',
		// 15: 'special',
		// 16: 'car',
		// 17: 'describe',
		// 18: 'table',
		// 19: 'ship',
		// 20: 'mail',
		// 21: 'amateur',
		// 22: 'wash',
		// 23: 'act',
		// 24: 'end',
	})

	const [isValidMnemonic, setIsValidMnemonic] = useState<boolean>(true)
	const [isShowModal, setIsShowModal] = useState<boolean>(false)

	//logic to show popup after create
	useEffect(() => {
		dispatch(accountsActions.setRedirectAccountPage(false))
	}, [])

	const handleBack = () => navigate(routesPath.SELECT_ACTION)

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

	const handleSubmit = async () => {
		const seedStr = Object.values(seed).join(' ')
		const isValidate = bip39.validateMnemonic(seedStr)

		setIsValidMnemonic(isValidate)

		if (Object.values(seed).length !== 24) {
			setIsValidMnemonic(false)
		}
		if (!isValidate || Object.values(seed).length !== 24) return
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
					<p className='h1 mt-[40px] mb-[16px]'>
						Import wallet with recovery passphrase
					</p>
					<p className='text _body text-light_grey mb-[24px] w-[calc(75%-16px)]'>
						Only the first account in this wallet is automatically loaded. To
						add additional accounts, after completing this process, click on the
						drop-down menu and then select «Create Account».
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
							<p className='pl-[18px] text _body'>
								Invalid recovery passphrase.
							</p>
						</div>
					)}

					<div className='w-[100%] mt-[70px] flex items-center justify-center'>
						<Button
							title='Import'
							mode='gradient'
							onClick={handleSubmit}
							className='w-[400px]'
						/>
					</div>
				</div>
			</div>
			<SuccessCreateModal show={isShowModal} onClose={handleCloseModal} />
		</>
	)
}
