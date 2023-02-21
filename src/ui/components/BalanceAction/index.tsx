import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '../../../hooks'
import { routesPath } from '../../../utils'
import Background from '../../services/Background'
import { Balance } from '../Balance'
import { Button } from '../Button'
import { ArrowUpRightSvg, CachedSvg, DowmloadSvg } from '../Svg'

export const BalanceAction = () => {
	const isDesktop = useMediaQuery()
	const navigate = useNavigate()

	const handleStake = () => {
		if (isDesktop) return navigate(routesPath.VALIDATORS)
		Background.showTab(
			`${window.location.origin}/accounts.html#${routesPath.VALIDATORS}`,
			'validators'
		)
		navigate('/', { replace: true })
	}

	const handleNavigate = (url: string) => () => navigate(url)
	return (
		<div className='w-[100%] flex flex-col items-center'>
			<div className="relative ext:w-[40px] ext:h-[40px] tablet:w-[51px] tablet:h-[51px] bg-brown rounded-[50%] li_gradient text_body before:content-['PNB'] before:absolute before:top-[0.5px] before:left-[0.5px] before:w-[calc(100%-1px)] before:h-[calc(100%-1px)] before:bg-brown before:rounded-[50%] before:flex before:items-center before:justify-center"></div>
			<Balance className='pt-[16px] pb-[24px] text_numbers' />
			<div className='flex ext:gap-x-[30px]  tablet:gap-x-[69px] ext:mb-[24px] tablet:mb-[40px]'>
				<div className='flex flex-col items-center'>
					<Button
						mode='gradient'
						title={
							<div className='flex items-center justify-center'>
								<DowmloadSvg />
							</div>
						}
						className='rounded-[50%] w-[51px]  ext:pt-[14px] tablet:pt-[14px]  ext:pb-[14px] tablet:pb-[14px]'
					/>
					<p className='text_button pt-[8px]'>Receive</p>
				</div>
				<div className='flex flex-col items-center'>
					<Button
						mode='gradient'
						onClick={handleNavigate(routesPath.SEND)}
						title={
							<div className='flex items-center justify-center'>
								<ArrowUpRightSvg />
							</div>
						}
						className='rounded-[50%] w-[51px] ext:pt-[14px] tablet:pt-[14px]  ext:pb-[14px] tablet:pb-[14px]'
					/>
					<p className='text_button pt-[8px]'>Send</p>
				</div>
				<div className='flex flex-col items-center'>
					<Button
						mode='gradient'
						title={
							<div className='flex items-center justify-center'>
								<CachedSvg />
							</div>
						}
						className='rounded-[50%] w-[51px]  ext:pt-[14px] tablet:pt-[14px] ext:pb-[14px] tablet:pb-[14px]'
					/>
					<p className='text_button pt-[8px]'>Exchange</p>
				</div>
			</div>
			<div className='w-[100%] flex items-center justify-between ext:py-[15.5px] tablet:py-[13.5px] px-[18px] border-y-[1px] border-solid border-dark_grey'>
				<div className='flex flex-col'>
					<p className='text_button mb-[4px]'>Stake</p>
					{/* <p className="text_body text-light_grey">Earn to 21% per year</p> */}
				</div>
				<Button
					mode='transparent'
					onClick={handleStake}
					title='Stake'
					className='w-[119px] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px]'
					disabled
				/>
			</div>
		</div>
	)
}
