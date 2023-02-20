import { useNavigate } from 'react-router-dom'
import { routesPath } from '../../../utils'
import { Balance } from '../Balance'
import { ChevronLeftIcon } from '../Svg'

export const AssetsList = () => {
	const navigate = useNavigate()
	const handleBalancedetail = (currencyName: string) => () =>
		navigate(routesPath.BALANCE_DETAIL.replace(':name', currencyName))
	return (
		<div
			onClick={handleBalancedetail('pnb')}
			role='button'
			tabIndex={0}
			className='flex items-center justify-between py-[20px] pl-[22px] pr-[30px] border-y-[1px] border-solid border-dark_grey cursor-pointer hover:bg-dark_grey '
		>
			<div className='flex items-center'>
				<div className="relative w-[51px] h-[51px] bg-brown rounded-[50%] li_gradient text_body before:content-['PNB'] before:absolute before:top-[0.5px] before:left-[0.5px] before:w-[calc(100%-1px)] before:h-[calc(100%-1px)] before:bg-brown before:rounded-[50%] before:flex before:items-center before:justify-center"></div>
				<Balance className='pl-[16px] text_numbers' />
			</div>
			<div className='rotate-180'>
				<ChevronLeftIcon />
			</div>
		</div>
	)
}
