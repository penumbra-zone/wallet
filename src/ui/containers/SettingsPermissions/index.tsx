import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAccountsSelector } from '../../../account'
import { useMediaQuery } from '../../../hooks'
import { Button, PermissionsModal } from '../../components'
import { selectOrigins } from '../../redux'
import Background from '../../services/Background'

export const SettingsPermissions = () => {
	const isDesktop = useMediaQuery()
	const { state } = useLocation()
	const origins = useAccountsSelector(selectOrigins)

	const [selectedSite, setSelectedSite] = useState<string>('')

	useEffect(() => {
		if (!state) return
		if (origins[state.siteName]) setSelectedSite(state.siteName)
	}, [state])

	const handleSelectSite = (name: string) => () => setSelectedSite(name)

	const handleRevoke = (origin: string) => async () =>
		await Background.deleteOrigin(origin)

	return (
		<>
			<div>
				<p
					className={`w-[100%] px-[16px] py-[24px] border-b-[1px] border-solid border-dark_grey ${
						isDesktop ? 'h2' : 'h1_ext'
					}`}
				>
					Permissions
				</p>
				<div className='h-[100%] mt-[16px]'>
					{Object.keys(origins).map(i => {
						return (
							<div
								className={`flex ext:flex-col tablet:flex-row tablet:items-center justify-between px-[16px] ext:py-[8px] tablet:py-[16px] ${
									isDesktop
										? 'border-b-[1px] border-solid border-dark_grey'
										: ''
								}`}
								key={i}
							>
								<div className='flex items-center justify-between ext:mb-[16px] tablet:mb-[0px]'>
									<div className='flex items-center'>
										<div className='ext:w-[20px] ext:h-[20px] tablet:w-[36px] tablet:h-[36px] li_gradient rounded-[50%] flex items-center justify-center'>
											<div className='ext:w-[19px] ext:h-[19px] tablet:w-[35px] tablet:h-[35px] bg-brown rounded-[50%] flex items-center justify-center'></div>
										</div>
										<p className={`${isDesktop ? 'h3' : 'h2_ext'} ml-[8px]`}>
											{i}
										</p>
									</div>
									{!isDesktop && <p className='text_numbers_s'>1 / 12</p>}
								</div>
								{isDesktop && <p className='text_numbers_s'>1 / 12</p>}
								<div className='flex'>
									<Button
										mode='transparent'
										onClick={handleRevoke(i)}
										title='Revoke'
										className='ext:[50%] tablet:w-[88px] mr-[8px] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] text_button_ext'
									/>
									<Button
										mode='gradient'
										onClick={handleSelectSite(i)}
										title='View'
										className='ext:[50%] tablet:w-[88px] ml-[8px] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px] text_button_ext'
									/>
								</div>
							</div>
						)
					})}
				</div>
			</div>
			{selectedSite && (
				<PermissionsModal
					show={Boolean(selectedSite)}
					onClose={handleSelectSite('')}
					permissions={origins[selectedSite]}
					selectedSite={selectedSite}
				/>
			)}
		</>
	)
}
