import React, { useCallback } from 'react'
import { useAccountsSelector } from '../../../account'
import { useMediaQuery } from '../../../hooks'
import { kitcut } from '../../../utils'
import {
	selectCurNetwork,
	selectLastExistBlock,
	selectLastSavedBlock,
	selectNetworks,
} from '../../redux'
import { ProgressBar } from '../ProgressBar'

type NetworkSelectProps = {
	onClick: () => void
	className?: string
}

export function percentage(partialValue, totalValue) {
	if (!totalValue) return 0
	return Math.round((100 * partialValue) / totalValue)
}

export const NetworkSelect: React.FC<NetworkSelectProps> = ({
	className,
	onClick,
}) => {
	const isTablet = useMediaQuery('(min-width: 680px)')

	const networks = useAccountsSelector(selectNetworks)
	const currentNetwork = useAccountsSelector(selectCurNetwork)
	const currentNetworkName = useAccountsSelector(selectCurNetwork)
	const lastExistBlock = useAccountsSelector(selectLastExistBlock)
	const lastSavedBlock = useAccountsSelector(selectLastSavedBlock)

	const currrentNetwork = useCallback(() => {
		return networks.find(i => i.name === currentNetworkName)
	}, [networks, currentNetworkName])

	const percent = percentage(
		lastSavedBlock[currentNetwork] || 0,
		lastExistBlock[currentNetwork]
	)

	return (
		<div
			onClick={onClick}
			className={`ext:h-[36px] ext:w-[152px] tablet:h-[52px] tablet:w-[296px] ext:px-[10px] tablet:px-[21px] bg-brown rounded-[10px] border-[1px] border-solid border-dark_grey flex items-center cursor-pointer
      ${className}`}
		>
			{percent > 100 ? (
				<></>
			) : (
				<div className='ext:w-[25px] ext:h-[25px] tablet:w-[35px] tablet:h-[35px] ext:mr-[6px] tablet:mr-[16px] flex items-center'>
					<ProgressBar percent={percent} width={isTablet ? '35px' : '25px'} />
				</div>
			)}
			<p className='text_button'>
				{isTablet
					? currrentNetwork().chainId
					: kitcut(12, currrentNetwork().chainId)}
			</p>
		</div>
	)
}
