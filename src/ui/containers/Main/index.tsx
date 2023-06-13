import toast from 'react-hot-toast'
import { useAccountsSelector } from '../../../account'
import {
	CopySvg,
	DeleteSvg,
	DotsSvg,
	EditSvg,
	HttpSvg,
	Input,
	SearchSvg,
} from '../../components'
import { selectOrigins, selectSelectedAccount, selectState } from '../../redux'
import { useState } from 'react'
import Background from '../../services/Background'
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
	console.log({ selectedSite })

	if (state.isLocked) return <></>

	if (!selectedAccount.addressByIndex) return <></>

	const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
		// const filtered = networks.filter(v => {
		// 	return (
		// 		v.name
		// 			.toString()
		// 			.toLowerCase()
		// 			.indexOf(event.target.value.toLowerCase()) > -1
		// 	)
		// })

		// setFilteredNetworks(filtered)
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(selectedAccount.addressByIndex)
		toast.success('Success copied!', {
			position: 'top-right',
		})
	}

	const handleSelectSite =
		(site: string | null) => (e: React.MouseEvent<HTMLElement>) => {
			e.stopPropagation()
			setSelectedSite(site)
		}

	const handleDelete = (site: string) => (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation()
		// setSelectedSite(site)
	}
	const handleEdit = (site: string) => () =>
		navigate(routesPath.SETTINGS_PERMISSIONS, {
			state: { siteName: site },
		})

	return (
		<div
			className='w-[100%] ext:pt-[50px] ext:pb-[24px]'
			onClick={() => setSelectedSite(null)}
		>
			<div className='flex flex-col items-center justify-center bg-brown rounded-[15px] ext:px-[26px] ext:py-[12px] ext:mb-[24px]'>
				<p className='h1 ext:pb-[8px]'>{selectedAccount.name}</p>
				<div className='flex items-center text_body text-light_grey break-all text-center'>
					{selectedAccount.addressByIndex}
					<span
						className='ml-[10px] cursor-pointer svg_hover'
						onClick={copyToClipboard}
						role='button'
						tabIndex={0}
					>
						<CopySvg fill='#524B4B' width='16' height='16' />
					</span>
				</div>
			</div>
			<p className='h1 ext:mb-[8px]'>Connected sites</p>
			<Input
				placeholder='Search dApp...'
				value={search}
				onChange={handleChangeSearch}
				helperText='No matching results found.'
				leftSvg={
					<span className='ml-[24px] mr-[9px]'>
						<SearchSvg />
					</span>
				}
				className='w-[100%]'
				// isError={search && !Boolean(filteredNetworks.length)}
			/>
			<div className='flex flex-col bg-brown rounded-[15px] min-h-[160px] w-[100%] pb-[12px]'>
				{Object.keys(origins).map(i => {
					return (
						<div
							className='flex items-center justify-between w-[100%] ext:py-[16px] ext:pl-[12px] ext:pr-[16px] border-b-[1px] border-dark_grey'
							key={i}
						>
							<div className='flex items-center'>
								<HttpSvg />
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
									<DotsSvg width='24' height='24' />
								</span>
								<ul
									className={`${
										selectedSite === i ? 'block' : 'hidden'
									} absolute right-[20px] bottom-[0px] w-[200px] bg-black rounded-[15px]`}
								>
									<li className=''>
										<div
											className='px-[18px] py-[12px]  flex items-center hover:bg-light_brown'
											onClick={handleDelete(i)}
										>
											<DeleteSvg />
											<p className='text_button ml-[16px]'>Delete</p>
										</div>
									</li>
									<li className=''>
										<div
											className='px-[18px] py-[12px] rounded-b-[15px] flex items-center hover:bg-light_brown'
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
				{/* <p className='text_body ext:px-[44px] text-center'>
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
				</p> */}
			</div>
		</div>
	)
}
