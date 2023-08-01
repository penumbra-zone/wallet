import React from 'react'
import { HttpsSvg } from '../Svg'

type ActionCellProps = {
	title: string
	children?: React.ReactNode
	isEncrypted?: boolean
}

export const ActionCell: React.FC<ActionCellProps> = ({
	title,
	isEncrypted,
	children,
}) => {
	return (
		<div className='w-[100%] flex flex-col '>
			{isEncrypted ? (
				<div className='flex items-center gap-x-[8px]'>
					<HttpsSvg />
					<p className='text-light_brown'>{`${title} (Encrypted)`}</p>
				</div>
			) : (
				<>
					<p className='h2 mb-[8px] capitalize'>{title}</p>
					<div className='text_numbers_s py-[8px] px-[16px] bg-dark_grey rounded-[10px] text-light_grey break-words min-h-[44px] flex items-center'>
						<div>{children}</div>
					</div>
				</>
			)}
		</div>
	)
}
