import toast from 'react-hot-toast'
import { useAccountsSelector } from '../../../account'
import {
	ConnectedSitesModal,
	CopySvg,
	DeleteSvg,
	DotsSvg,
	EditSvg,
	HttpSvg,
	HttpsSvg,
	Input,
	SearchSvg,
} from '../../components'
import { selectOrigins, selectSelectedAccount, selectState } from '../../redux'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routesPath } from '../../../utils'

type MainProps = {}

export const Main: React.FC<MainProps> = () => {
	const navigate = useNavigate()
	const selectedAccount = useAccountsSelector(selectSelectedAccount)
	const state = useAccountsSelector(selectState)
	const origins = useAccountsSelector(selectOrigins)
	const [search, setSearch] = useState<string>('')
	const [selectedSite, setSelectedSite] = useState<null | string>(null)
	const [isDeleteApproveModal, setDeleteApproveModal] = useState<boolean>(false)
	const [filteredSites, setFilteredSites] = useState<string[]>([])

	useEffect(() => {
		const sites = Object.keys(origins)
		if (!sites.length) return setFilteredSites([])
		setFilteredSites(sites)
	}, [origins])

	if (state.isLocked) return <></>

	if (!selectedAccount.addressByIndex) return <></>

	const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
		const sites = Object.keys(origins)
		const filtered = sites.filter(v => {
			return (
				v
					.replace(/^https?:\/\//i, '')
					.toString()
					.toLowerCase()
					.indexOf(event.target.value.toLowerCase()) > -1
			)
		})

		setFilteredSites(filtered)
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(selectedAccount.addressByIndex)
		toast.success('Successfully copied', {
			position: 'top-center',
			icon: '👏',
			style: {
				borderRadius: '15px',
				background: '#141212',
				color: '#fff',
			},
		})
	}

	const handleSelectSite =
		(site: string | null) => (e: React.MouseEvent<HTMLElement>) => {
			e.stopPropagation()
			setSelectedSite(site)
		}

	const handleDelete = (site: string) => (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation()
		setDeleteApproveModal(true)
	}

	const handleEdit = (site: string) => () =>
		navigate(routesPath.SETTINGS_PERMISSIONS, {
			state: { siteName: site },
		})

	const handleCloseModal = () => {
		setDeleteApproveModal(false)
		setSelectedSite(null)
	}

	return (
		<>
			<div
				className='w-[100%] ext:pt-[40px] tablet:pt-[24px] pb-[24px]'
				onClick={() => setSelectedSite(null)}
			>
				<div className='flex flex-col items-center justify-center bg-brown rounded-[10px] ext:px-[22px] ext:py-[12px] tablet:px-[116px] tablet:py-[40px] ext:mb-[24px] tablet:mb-[40px] gap-y-[8px]'>
					<p className='h1'>{selectedAccount.name}</p>
					<div className='flex items-center text_body text-light_grey break-all text-center gap-x-[16px]'>
						{selectedAccount.addressByIndex}
						<span
							className='cursor-pointer svg_hover'
							onClick={copyToClipboard}
							role='button'
							tabIndex={0}
						>
							<CopySvg
								fill='#524B4B'
								className='ext:w-[16px] ext:h-[16px] tablet:w-[20px] tablet:h-[20px]'
							/>
						</span>
					</div>
				</div>
				<div className='flex ext:flex-col tablet:flex-row tablet:items-center tablet:justify-between mb-[24px] ext:gap-y-[8px] tablet:gap-y-[0px]'>
					<p className='h2'>Connected sites</p>
					<Input
						placeholder='Search...'
						value={search}
						onChange={handleChangeSearch}
						leftSvg={
							<span className='ml-[24px] mr-[9px]'>
								<SearchSvg />
							</span>
						}
						className='ext:w-[100%] tablet:w-[400px]'
					/>
				</div>
				<div
					className={`flex flex-col ${
						filteredSites.length ? '' : 'items-center justify-center'
					} bg-brown rounded-[10px] min-h-[160px] w-[100%] pb-[12px]`}
				>
					{!filteredSites.length && !search ? (
						<p className='text_body ext:px-[44px] text-center'>
							You can start your travels through the penumbra ecosystem with a
							canonical one dApp{' '}
							<span>
								<a
									className='text-[#00FFDF] underline cursor-pointer'
									href='https://app.testnet.penumbra.zone'
									target='_blank'
								>
									https://app.testnet.penumbra.zone
								</a>
							</span>
						</p>
					) : !filteredSites.length && search ? (
						<>
							<p className='text_body ext:px-[44px] text-center break-all px-[40px]'>
								{`No result "${search}"`}
							</p>
						</>
					) : (
						<>
							{filteredSites.map(i => {
								return (
									<div
										className='flex items-center justify-between w-[100%] ext:py-[16px] ext:pl-[12px] ext:pr-[16px] border-b-[1px] border-dark_grey'
										key={i}
									>
										<div className='flex items-center'>
											{i.includes('https') ? (
												<HttpsSvg className='ext:w-[16px] ext:h-[16px] tablet:w-[24px] tablet:h-[24px]' />
											) : (
												<HttpSvg className='ext:w-[16px] ext:h-[16px] tablet:w-[24px] tablet:h-[24px]' />
											)}
											<a
												className='text_body text-light_grey break-all cursor-pointer ext:ml-[6px]'
												href={i}
												target='_blank'
											>
												{i.replace(/^https?:\/\//i, '')}
											</a>
										</div>
										<div className='cursor-pointer inline-block relative'>
											<span onClick={handleSelectSite(i)}>
												<DotsSvg width='24' height='24' className='rotate-90' />
											</span>
											<ul
												className={`${
													selectedSite === i ? 'block' : 'hidden'
												} absolute right-[20px] bottom-[0px] w-[200px] bg-black rounded-[10px]`}
											>
												<li className=''>
													<div
														className='px-[18px] py-[12px] rounded-t-[10px] flex items-center hover:bg-light_brown border-b-[1px] border-dark_grey'
														onClick={handleDelete(i)}
													>
														<DeleteSvg />
														<p className='text_button ml-[16px]'>Delete</p>
													</div>
												</li>
												<li className=''>
													<div
														className='px-[18px] py-[12px] rounded-b-[10px] flex items-center hover:bg-light_brown'
														onClick={handleEdit(i)}
													>
														<EditSvg />
														<p className='text_button ml-[16px]'>Edit</p>
													</div>
												</li>
											</ul>
										</div>
									</div>
								)
							})}
						</>
					)}
				</div>
			</div>
			<ConnectedSitesModal
				show={isDeleteApproveModal}
				onClose={handleCloseModal}
				selectedSite={selectedSite}
			/>
		</>
	)
}
