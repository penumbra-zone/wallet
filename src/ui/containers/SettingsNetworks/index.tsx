import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountsSelector } from '../../../accounts'
import { useMediaQuery } from '../../../hooks'
import { routesPath } from '../../../utils'
import {
	Button,
	DoneSvg,
	Input,
	ResetWalletModal,
	SearchSvg,
} from '../../components'
import {
	NetworkType,
	selectCurNetwork,
	selectCustomGRPC,
	selectNetworks,
} from '../../redux'
import Background from '../../services/Background'

export const SettingsNetworks = () => {
	const isDesktop = useMediaQuery()
	const navigate = useNavigate()
	const networks = useAccountsSelector(selectNetworks)
	const customGRPC = useAccountsSelector(selectCustomGRPC)
	const currentNetwork = useAccountsSelector(selectCurNetwork)

	const [inputsValues, setInputsValues] = useState<{
		chainId: string
		grpc: string
	}>({
		chainId: '',
		grpc: '',
	})
	const [selected, setSelected] = useState<NetworkType>(networks[0])
	const [search, setSearch] = useState<string>('')
	const [filteredNetworks, setFilteredNetworks] =
		useState<NetworkType[]>(networks)
	const [isOpenSubmit, setIsOpenSubmit] = useState<boolean>(false)

	useEffect(() => {
		setInputsValues({
			chainId: selected.chainId,
			grpc: customGRPC[selected.name] || selected.grpc,
		})
	}, [selected, networks, customGRPC])

	const toggleShowSubmitModal = (value: boolean) => () => setIsOpenSubmit(value)

	const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
		const filtered = networks.filter(v => {
			return (
				v.name
					.toString()
					.toLowerCase()
					.indexOf(event.target.value.toLowerCase()) > -1
			)
		})

		setFilteredNetworks(filtered)
	}

	const handleSelect = (value: NetworkType) => () => setSelected(value)

	const handleChange =
		(type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
			setInputsValues(state => ({
				...state,
				[type]: event.target.value,
			}))
		}

	const handleCancel = () =>
		setInputsValues({
			chainId: selected.chainId,
			grpc: customGRPC[selected.name] || selected.grpc,
		})

	const handleSave = async () => {
		const grpc = customGRPC[selected.name] || selected.grpc
		if (grpc !== inputsValues.grpc) {
			await Background.setCustomGRPC(inputsValues.grpc, selected.name)
		}
		if (selected.chainId !== inputsValues.chainId) {
		}
		toggleShowSubmitModal(false)()
	}

	const isDisabled = useMemo(() => {
		const grpc = customGRPC[selected.name] || selected.grpc

		return (
			grpc === inputsValues.grpc && selected.chainId === inputsValues.chainId
		)
	}, [selected, inputsValues, customGRPC])

	const handleOpentTab = () => {
		Background.showTab(
			`${window.location.origin}/accounts.html#${routesPath.SETTINGS_NETWORKS}`,
			'settings/networks'
		)
		navigate('/', { replace: true })
	}

	return (
		<>
			<div className='ext:h-[calc(100%-100px)] tablet:h-[100%]'>
				<p
					className={`flex items-center w-[100%] px-[16px] h-[74px] border-b-[1px] border-solid border-dark_grey ${
						isDesktop ? 'h2' : 'h1_ext'
					}`}
				>
					Networks
				</p>
				<div className='w-[100%] ext:h-[100%] tablet:h-[calc(100%-74px)] flex'>
					<div className='ext:w-[100%] flex rounded-[15px]'>
						<div className='ext:w-[100%] tablet:w-[55%]  flex flex-col justify-between pt-[24px]'>
							<div>
								<Input
									placeholder='Search a previously added...'
									value={search}
									onChange={handleChangeSearch}
									helperText='No matching results found.'
									leftSvg={
										<span className='ml-[24px] mr-[9px]'>
											<SearchSvg />
										</span>
									}
									className='w-[100%] px-[16px]'
									isError={!Boolean(filteredNetworks.length)}
								/>
								{filteredNetworks.map((i, index) => (
									<div
										key={index}
										className={`w-[100] flex items-center px-[16px] text_ext cursor-pointer hover:bg-dark_grey py-[12px] ${
											selected.chainId === i.chainId ? 'bg-dark_grey' : ''
										}`}
										onClick={handleSelect(i)}
									>
										<span className='pr-[18px]'>
											{currentNetwork === i.name && (
												<DoneSvg width='18' height='18' />
											)}
										</span>
										<p>{i.chainId}</p>
									</div>
								))}
							</div>
							{!isDesktop && (
								<Button
									title='Add network'
									mode='gradient'
									onClick={handleOpentTab}
									className='w-[calc(100%-32px)] py-[7px] mx-[16px] mb-[24px]'
								/>
							)}
						</div>
						{isDesktop && (
							<div className='w-[45%] flex flex-col pt-[24px] px-[16px] border-l-[1px] border-solid border-dark_grey '>
								<Input
									label='Network name'
									value={inputsValues.chainId}
									onChange={handleChange('name')}
								/>
								<Input
									label='New GRPC URL'
									value={inputsValues.grpc}
									onChange={handleChange('grpc')}
									className='py-[24px]'
								/>
								<div className='flex mt-[20px] mb-[20px]'>
									<Button
										title='Cancel'
										mode='transparent'
										onClick={handleCancel}
										className='w-[100%] py-[7px] mr-[4px]'
										disabled={isDisabled}
									/>
									<Button
										title='Save'
										mode='gradient'
										onClick={toggleShowSubmitModal(true)}
										className='w-[100%] py-[7px] ml-[4px]'
										disabled={isDisabled}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			<ResetWalletModal
				show={isOpenSubmit}
				onClose={toggleShowSubmitModal(false)}
				handleConfirm={handleSave}
				title='Do you really want to change network? All view service data will be deleted and re-synchronized.'
				warnings="YOUR PRIVATE KEYS WON'T BE LOST!"
			/>
		</>
	)
}
